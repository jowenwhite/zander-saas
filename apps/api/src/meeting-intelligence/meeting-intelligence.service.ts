import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../common/s3/s3.service';
import OpenAI from 'openai';
import { AssemblyAI } from 'assemblyai';
import { wrapEmailContent } from '../shared/email-signature';
import {
  MeetingSummary,
  SpeakerSegment,
  TranscriptionResult,
} from './meeting-intelligence.dto';

@Injectable()
export class MeetingIntelligenceService {
  private readonly logger = new Logger(MeetingIntelligenceService.name);
  private assemblyAIClient: AssemblyAI | null = null;

  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
    private configService: ConfigService,
  ) {
    // Initialize AssemblyAI if key is available
    const assemblyKey = this.configService.get<string>('ASSEMBLYAI_API_KEY');
    if (assemblyKey) {
      this.assemblyAIClient = new AssemblyAI({ apiKey: assemblyKey });
      this.logger.log('AssemblyAI client initialized');
    } else {
      this.logger.log('AssemblyAI not configured - will use Whisper for transcription');
    }
  }

  /**
   * Create a meeting record with uploaded file
   */
  async createFromUpload(
    tenantId: string,
    userId: string,
    file: Express.Multer.File,
    metadata: {
      title: string;
      platform?: string;
      attendees?: any[];
      engagementId?: string;
      leadId?: string;
      contactId?: string;
      scheduledAt?: Date;
      calendarEventId?: string;
    },
  ) {
    // Upload to S3
    const uploadResult = await this.s3Service.uploadFile(
      tenantId,
      'meetings',
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    // Determine format from mimetype
    const formatMap: Record<string, string> = {
      'audio/mpeg': 'mp3',
      'audio/mp3': 'mp3',
      'audio/wav': 'wav',
      'audio/x-wav': 'wav',
      'audio/m4a': 'm4a',
      'audio/x-m4a': 'm4a',
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'audio/webm': 'webm',
    };

    const meeting = await this.prisma.meetingRecord.create({
      data: {
        tenantId,
        title: metadata.title,
        source: 'upload',
        platform: metadata.platform || null,
        attendees: metadata.attendees || null,
        engagementId: metadata.engagementId || null,
        leadId: metadata.leadId || null,
        contactId: metadata.contactId || null,
        scheduledAt: metadata.scheduledAt || null,
        calendarEventId: metadata.calendarEventId || null,
        recordingUrl: uploadResult.url,
        recordingKey: uploadResult.key,
        recordingFormat: formatMap[file.mimetype] || 'unknown',
        recordingSizeBytes: file.size,
        transcriptStatus: 'processing',
        summaryStatus: 'none',
        createdById: userId,
      },
    });

    // Trigger async processing (don't await)
    this.processRecordingAsync(meeting.id).catch((err) => {
      this.logger.error(`Failed to process meeting ${meeting.id}:`, err);
    });

    return meeting;
  }

  /**
   * Create a meeting record from a URL (Twilio, external link)
   */
  async createFromUrl(
    tenantId: string,
    userId: string,
    data: {
      recordingUrl: string;
      title: string;
      source: string;
      platform?: string;
      attendees?: any[];
      engagementId?: string;
      leadId?: string;
      contactId?: string;
    },
  ) {
    // Download the file
    const response = await fetch(data.recordingUrl);
    if (!response.ok) {
      throw new BadRequestException('Failed to download recording from URL');
    }

    const contentType = response.headers.get('content-type') || 'audio/mpeg';
    const buffer = Buffer.from(await response.arrayBuffer());

    // Upload to S3
    const uploadResult = await this.s3Service.uploadFile(
      tenantId,
      'meetings',
      buffer,
      `recording-${Date.now()}.mp3`,
      contentType,
    );

    const meeting = await this.prisma.meetingRecord.create({
      data: {
        tenantId,
        title: data.title,
        source: data.source,
        platform: data.platform || null,
        attendees: data.attendees || null,
        engagementId: data.engagementId || null,
        leadId: data.leadId || null,
        contactId: data.contactId || null,
        recordingUrl: uploadResult.url,
        recordingKey: uploadResult.key,
        recordingFormat: 'mp3',
        recordingSizeBytes: buffer.length,
        transcriptStatus: 'processing',
        summaryStatus: 'none',
        createdById: userId,
      },
    });

    // Trigger async processing
    this.processRecordingAsync(meeting.id).catch((err) => {
      this.logger.error(`Failed to process meeting ${meeting.id}:`, err);
    });

    return meeting;
  }

  /**
   * Main processing pipeline - async, doesn't block
   */
  private async processRecordingAsync(meetingId: string) {
    try {
      await this.processRecording(meetingId);
    } catch (error) {
      this.logger.error(`Processing failed for meeting ${meetingId}:`, error);
    }
  }

  /**
   * Process a meeting recording: transcribe + summarize
   */
  async processRecording(meetingId: string) {
    const meeting = await this.prisma.meetingRecord.findUnique({
      where: { id: meetingId },
      include: {
        engagement: true,
        lead: true,
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    if (!meeting.recordingUrl) {
      throw new BadRequestException('No recording URL available');
    }

    this.logger.log(`Processing meeting: ${meeting.title} (${meetingId})`);

    // Step 1: Update status
    await this.prisma.meetingRecord.update({
      where: { id: meetingId },
      data: { transcriptStatus: 'processing' },
    });

    // Step 2: Transcribe
    let transcription: TranscriptionResult;
    try {
      if (this.assemblyAIClient) {
        transcription = await this.transcribeWithAssemblyAI(meeting.recordingUrl);
      } else {
        transcription = await this.transcribeWithWhisper(meeting.recordingUrl);
      }

      await this.prisma.meetingRecord.update({
        where: { id: meetingId },
        data: {
          transcriptText: transcription.text,
          transcriptSpeakers: (transcription.speakers || []) as any,
          transcriptProvider: transcription.provider,
          transcriptStatus: 'completed',
          summaryStatus: 'processing',
        },
      });
    } catch (error) {
      this.logger.error('Transcription failed:', error);
      await this.prisma.meetingRecord.update({
        where: { id: meetingId },
        data: {
          transcriptStatus: 'failed',
          transcriptError: error.message || 'Transcription failed',
        },
      });
      throw error;
    }

    // Step 3: Generate summary
    try {
      const context = {
        engagementName: meeting.engagement?.packageType,
        attendees: meeting.attendees as any[],
        leadName: meeting.lead?.name,
      };

      const summary = await this.generateMeetingSummary(transcription.text, context);

      await this.prisma.meetingRecord.update({
        where: { id: meetingId },
        data: {
          summaryText: summary.topicsSummary,
          summaryJson: summary as any,
          summaryStatus: 'completed',
          processedAt: new Date(),
        },
      });

      this.logger.log(`Meeting processed successfully: ${meetingId}`);
    } catch (error) {
      this.logger.error('Summary generation failed:', error);
      await this.prisma.meetingRecord.update({
        where: { id: meetingId },
        data: {
          summaryStatus: 'failed',
        },
      });
      throw error;
    }
  }

  /**
   * Transcribe using OpenAI Whisper
   */
  async transcribeWithWhisper(audioUrl: string): Promise<TranscriptionResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Download audio
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error('Failed to download recording');
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    const audioFile = new File([audioBlob], 'recording.mp3', { type: 'audio/mpeg' });

    const openai = new OpenAI({ apiKey });
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'text',
    });

    return {
      text: transcription as unknown as string,
      provider: 'whisper',
    };
  }

  /**
   * Transcribe using AssemblyAI with speaker diarization
   */
  async transcribeWithAssemblyAI(audioUrl: string): Promise<TranscriptionResult> {
    if (!this.assemblyAIClient) {
      throw new Error('AssemblyAI not configured');
    }

    const transcript = await this.assemblyAIClient.transcripts.transcribe({
      audio_url: audioUrl,
      speaker_labels: true,
    });

    if (transcript.status === 'error') {
      throw new Error(transcript.error || 'AssemblyAI transcription failed');
    }

    // Convert to our speaker segment format
    const speakers: SpeakerSegment[] = [];
    if (transcript.utterances) {
      for (const utterance of transcript.utterances) {
        speakers.push({
          speaker: utterance.speaker,
          start: utterance.start,
          end: utterance.end,
          text: utterance.text,
        });
      }
    }

    return {
      text: transcript.text || '',
      speakers,
      provider: 'assemblyai',
    };
  }

  /**
   * Generate structured meeting summary using Claude
   */
  async generateMeetingSummary(
    transcript: string,
    context?: { engagementName?: string; attendees?: any[]; leadName?: string },
  ): Promise<MeetingSummary> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const attendeeList = context?.attendees
      ? context.attendees.map((a: any) => a.name || a.email).join(', ')
      : 'Unknown';

    const systemPrompt = `You are an expert meeting analyst for a business consulting firm. Generate a comprehensive structured summary of the meeting transcript.

Context:
- Engagement: ${context?.engagementName || 'General meeting'}
- Lead/Client: ${context?.leadName || 'Unknown'}
- Attendees: ${attendeeList}

Analyze the transcript and return a JSON object with this exact structure:
{
  "keyDecisions": [{"decision": "string", "context": "string"}],
  "actionItems": [{"item": "string", "owner": "string", "dueDate": "string"}],
  "followUps": [{"item": "string", "responsible": "string", "timeframe": "string"}],
  "clientConcerns": [{"concern": "string", "severity": "low|medium|high", "response": "string"}],
  "nextSteps": [{"step": "string", "owner": "string", "timeline": "string"}],
  "topicsSummary": "2-3 paragraph narrative summary of the meeting",
  "meetingEffectiveness": "Brief assessment of meeting productivity and outcomes"
}

Be thorough but concise. Extract actual names and specific details from the transcript when possible.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Please analyze this meeting transcript and provide a structured summary:\n\n${transcript}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error('Claude API error:', error);
      throw new Error('Failed to generate summary');
    }

    const data = await response.json();
    const responseText = data.content[0].text;

    // Parse JSON from response
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
                        responseText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
      return JSON.parse(jsonStr);
    } catch (e) {
      this.logger.error('Failed to parse summary JSON:', e);
      // Return a basic structure if parsing fails
      return {
        keyDecisions: [],
        actionItems: [],
        followUps: [],
        clientConcerns: [],
        nextSteps: [],
        topicsSummary: responseText,
        meetingEffectiveness: 'Summary generated but structured parsing failed',
      };
    }
  }

  /**
   * Email meeting summary to recipients
   */
  async emailMeetingSummary(
    tenantId: string,
    meetingId: string,
    recipients: { name: string; email: string }[],
  ) {
    const meeting = await this.prisma.meetingRecord.findFirst({
      where: { id: meetingId, tenantId },
      include: { engagement: true },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    if (!meeting.summaryText && !meeting.summaryJson) {
      throw new BadRequestException('No summary available to share');
    }

    const summary = meeting.summaryJson as unknown as MeetingSummary | null;
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const meetingDate = meeting.scheduledAt
      ? new Date(meeting.scheduledAt).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date(meeting.createdAt).toLocaleDateString();

    // Build action items HTML
    const actionItemsHtml = summary?.actionItems?.length
      ? summary.actionItems
          .map(
            (a) =>
              `<li style="margin-bottom: 8px;"><strong>${a.item}</strong>${a.owner ? ` — ${a.owner}` : ''}${a.dueDate ? ` (Due: ${a.dueDate})` : ''}</li>`,
          )
          .join('')
      : '<li>No specific action items identified</li>';

    // Build next steps HTML
    const nextStepsHtml = summary?.nextSteps?.length
      ? summary.nextSteps
          .map(
            (s) =>
              `<li style="margin-bottom: 8px;"><strong>${s.step}</strong>${s.owner ? ` — ${s.owner}` : ''}${s.timeline ? ` (${s.timeline})` : ''}</li>`,
          )
          .join('')
      : '<li>No specific next steps identified</li>';

    const bodyContent = `
      <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 700; margin: 30px 0 10px;">
        Meeting Summary
      </h1>
      <p style="color: #00CFEB; font-size: 18px; margin: 0 0 20px;">
        ${meeting.title}
      </p>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(0, 207, 235, 0.05); border: 1px solid rgba(0, 207, 235, 0.2); border-radius: 8px; margin-bottom: 20px;">
        <tr>
          <td style="padding: 16px;">
            <p style="color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; margin: 0 0 4px;">Date</p>
            <p style="color: #FFFFFF; font-size: 16px; margin: 0;">${meetingDate}</p>
          </td>
          <td style="padding: 16px;">
            <p style="color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; margin: 0 0 4px;">Duration</p>
            <p style="color: #FFFFFF; font-size: 16px; margin: 0;">${meeting.durationMinutes ? `${meeting.durationMinutes} min` : 'N/A'}</p>
          </td>
          <td style="padding: 16px;">
            <p style="color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; margin: 0 0 4px;">Platform</p>
            <p style="color: #FFFFFF; font-size: 16px; margin: 0;">${meeting.platform || 'N/A'}</p>
          </td>
        </tr>
      </table>

      <h2 style="color: #00CFEB; font-size: 16px; margin: 24px 0 12px;">Summary</h2>
      <p style="color: rgba(255,255,255,0.9); line-height: 1.6; margin: 0 0 20px;">
        ${meeting.summaryText || summary?.topicsSummary || 'Summary not available'}
      </p>

      <h2 style="color: #00CFEB; font-size: 16px; margin: 24px 0 12px;">Action Items</h2>
      <ul style="color: rgba(255,255,255,0.9); line-height: 1.6; margin: 0 0 20px; padding-left: 20px;">
        ${actionItemsHtml}
      </ul>

      <h2 style="color: #00CFEB; font-size: 16px; margin: 24px 0 12px;">Next Steps</h2>
      <ul style="color: rgba(255,255,255,0.9); line-height: 1.6; margin: 0 0 20px; padding-left: 20px;">
        ${nextStepsHtml}
      </ul>

      <p style="color: rgba(255,255,255,0.5); font-size: 13px; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
        Full transcript and details available in your <a href="https://app.zanderos.com" style="color: #00CFEB;">Zander portal</a>
      </p>
    `;

    const html = wrapEmailContent(bodyContent);
    const results: { recipient: string; success: boolean; error?: string }[] = [];

    for (const recipient of recipients) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'Zander <notifications@zanderos.com>',
            to: recipient.email,
            subject: `Meeting Summary: ${meeting.title}`,
            html,
          }),
        });

        if (response.ok) {
          results.push({ recipient: recipient.email, success: true });
        } else {
          const err = await response.text();
          this.logger.error(`Failed to send to ${recipient.email}:`, err);
          results.push({ recipient: recipient.email, success: false, error: err });
        }
      } catch (err) {
        this.logger.error(`Error sending to ${recipient.email}:`, err);
        results.push({
          recipient: recipient.email,
          success: false,
          error: String(err),
        });
      }
    }

    // Update meeting record
    await this.prisma.meetingRecord.update({
      where: { id: meetingId },
      data: { summaryEmailedAt: new Date() },
    });

    return { success: true, results };
  }

  /**
   * List meetings for a tenant
   */
  async findAll(
    tenantId: string,
    filters?: {
      engagementId?: string;
      leadId?: string;
      dateFrom?: string;
      dateTo?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const where: any = { tenantId };

    if (filters?.engagementId) where.engagementId = filters.engagementId;
    if (filters?.leadId) where.leadId = filters.leadId;
    if (filters?.dateFrom || filters?.dateTo) {
      where.scheduledAt = {};
      if (filters.dateFrom) where.scheduledAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.scheduledAt.lte = new Date(filters.dateTo);
    }

    const [meetings, total] = await Promise.all([
      this.prisma.meetingRecord.findMany({
        where,
        include: {
          engagement: { select: { id: true, packageType: true } },
          lead: { select: { id: true, name: true, company: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      this.prisma.meetingRecord.count({ where }),
    ]);

    return { meetings, total };
  }

  /**
   * Get a single meeting by ID
   */
  async findOne(tenantId: string, id: string) {
    const meeting = await this.prisma.meetingRecord.findFirst({
      where: { id, tenantId },
      include: {
        engagement: true,
        lead: true,
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    return meeting;
  }

  /**
   * Get just the summary (lighter payload)
   */
  async getSummary(tenantId: string, id: string) {
    const meeting = await this.prisma.meetingRecord.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        durationMinutes: true,
        platform: true,
        attendees: true,
        summaryText: true,
        summaryJson: true,
        summaryStatus: true,
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    return meeting;
  }

  /**
   * Update meeting metadata
   */
  async update(
    tenantId: string,
    id: string,
    data: {
      title?: string;
      attendees?: any[];
      engagementId?: string;
      leadId?: string;
      contactId?: string;
      platform?: string;
    },
  ) {
    const meeting = await this.prisma.meetingRecord.findFirst({
      where: { id, tenantId },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    return this.prisma.meetingRecord.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a meeting and its S3 recording
   */
  async remove(tenantId: string, id: string) {
    const meeting = await this.prisma.meetingRecord.findFirst({
      where: { id, tenantId },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    // Delete from S3 if key exists
    if (meeting.recordingKey) {
      try {
        await this.s3Service.deleteFile(meeting.recordingKey);
      } catch (err) {
        this.logger.error('Failed to delete recording from S3:', err);
      }
    }

    return this.prisma.meetingRecord.delete({ where: { id } });
  }
}
