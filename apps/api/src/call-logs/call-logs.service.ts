import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CallLogsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: {
    contactId?: string;
    dealId?: string;
    userId?: string;
    type: string;
    direction: string;
    fromNumber?: string;
    toNumber?: string;
    platform?: string;
    meetingUrl?: string;
    meetingId?: string;
    duration?: number;
    outcome?: string;
    status?: string;
    scriptId?: string;
    notes?: string;
    recordingUrl?: string;
    transcription?: string;
    aiSummary?: string;
    voicemailTemplateId?: string;
    scheduledAt?: Date;
    startedAt?: Date;
    endedAt?: Date;
  }) {
    return this.prisma.callLog.create({
      data: {
        tenantId,
        ...data,
      },
      include: {
        contact: true,
      },
    });
  }

  async findAll(tenantId: string, filters?: {
    type?: string;
    direction?: string;
    contactId?: string;
    status?: string;
  }) {
    const where: any = { tenantId };
    if (filters?.type) where.type = filters.type;
    if (filters?.direction) where.direction = filters.direction;
    if (filters?.contactId) where.contactId = filters.contactId;
    if (filters?.status) where.status = filters.status;
    return this.prisma.callLog.findMany({
      where,
      include: {
        contact: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllMultiTenant(tenantIds: string[], filters?: {
    type?: string;
    direction?: string;
    contactId?: string;
    status?: string;
  }) {
    const where: any = { tenantId: { in: tenantIds } };
    if (filters?.type) where.type = filters.type;
    if (filters?.direction) where.direction = filters.direction;
    if (filters?.contactId) where.contactId = filters.contactId;
    if (filters?.status) where.status = filters.status;

    return this.prisma.callLog.findMany({
      where,
      include: {
        contact: true,
        tenant: {
          select: { id: true, companyName: true, subdomain: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.callLog.findFirst({
      where: { id, tenantId },
      include: {
        contact: true,
      },
    });
  }

  async findByContact(tenantId: string, contactId: string) {
    return this.prisma.callLog.findMany({
      where: { tenantId, contactId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(tenantId: string, id: string, data: {
    duration?: number;
    outcome?: string;
    status?: string;
    notes?: string;
    recordingUrl?: string;
    transcription?: string;
    aiSummary?: string;
    startedAt?: Date;
    endedAt?: Date;
  }) {
    return this.prisma.callLog.updateMany({
      where: { id, tenantId },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.callLog.deleteMany({
      where: { id, tenantId },
    });
  }

  async transcribeRecording(tenantId: string, id: string) {
    const callLog = await this.prisma.callLog.findFirst({
      where: { id, tenantId },
    });
    if (!callLog) {
      throw new Error('Call log not found');
    }
    if (!callLog.recordingUrl) {
      throw new Error('No recording URL available for this call');
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }
    try {
      const audioResponse = await fetch(callLog.recordingUrl);
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
      await this.prisma.callLog.updateMany({
        where: { id, tenantId },
        data: { transcription: transcription },
      });
      return {
        transcription: transcription,
        callLogId: id,
      };
    } catch (error) {
      console.error('Error transcribing recording:', error);
      throw error;
    }
  }

  async generateSummary(tenantId: string, id: string, transcript: string) {
    await this.prisma.callLog.updateMany({
      where: { id, tenantId },
      data: { transcription: transcript },
    });
    const callLog = await this.prisma.callLog.findFirst({
      where: { id, tenantId },
      include: { contact: true },
    });
    if (!callLog) {
      throw new Error('Call log not found');
    }
    const contactName = callLog.contact
      ? callLog.contact.firstName + ' ' + callLog.contact.lastName
      : 'Unknown Contact';
    const systemPrompt = 'You are an AI assistant that summarizes business calls and meetings.\nGenerate a structured summary of the following call/meeting transcript.\nCall Details:\n- Contact: ' + contactName + '\n- Type: ' + callLog.type + '\n- Duration: ' + (callLog.duration ? Math.round(callLog.duration / 60) + ' minutes' : 'Unknown') + '\n- Date: ' + callLog.createdAt.toLocaleDateString() + '\n\nProvide your response in this exact format:\n\n## Key Topics Discussed\n- [bullet points of main topics]\n\n## Action Items\n- [bullet points with owner if mentioned]\n\n## Decisions Made\n- [bullet points or \"None discussed\"]\n\n## Follow-up Required\n[Yes/No] - [details if yes]\n\n## Sentiment\n[Positive/Neutral/Concerns Raised] - [brief explanation]';
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: 'Please summarize this call transcript:\n\n' + transcript }],
        }),
      });
      if (!response.ok) {
        const error = await response.text();
        console.error('Claude API error:', error);
        throw new Error('Failed to generate summary');
      }
      const data = await response.json();
      const aiSummary = data.content[0].text;
      await this.prisma.callLog.updateMany({
        where: { id, tenantId },
        data: { aiSummary },
      });
      return {
        transcription: transcript,
        aiSummary,
      };
    } catch (error) {
      console.error('Error generating summary:', error);
      throw error;
    }
  }

  async shareSummary(tenantId: string, id: string, recipients: string[]) {
    const callLog = await this.prisma.callLog.findFirst({
      where: { id, tenantId },
      include: { contact: true },
    });
    if (!callLog) {
      throw new Error('Call log not found');
    }
    if (!callLog.aiSummary) {
      throw new Error('No AI summary available to share');
    }
    const contactName = callLog.contact
      ? callLog.contact.firstName + ' ' + callLog.contact.lastName
      : 'Unknown Contact';
    const callDate = callLog.createdAt.toLocaleDateString();
    const callDuration = callLog.duration ? Math.round(callLog.duration / 60) + ' minutes' : 'Unknown';
    const subject = 'Call Summary: ' + contactName + ' - ' + callDate;
    const htmlBody = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
      '<div style="background: linear-gradient(135deg, #0C2340 0%, #1a3a5c 100%); padding: 20px; border-radius: 8px 8px 0 0;">' +
      '<h1 style="color: white; margin: 0; font-size: 24px;">Call Summary</h1>' +
      '<p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">Generated by Zander AI</p>' +
      '</div>' +
      '<div style="background: #f8f9fa; padding: 20px; border: 1px solid #ddd;">' +
      '<table style="width: 100%; border-collapse: collapse;">' +
      '<tr><td style="padding: 8px 0; color: #666;"><strong>Contact:</strong></td><td>' + contactName + '</td></tr>' +
      '<tr><td style="padding: 8px 0; color: #666;"><strong>Date:</strong></td><td>' + callDate + '</td></tr>' +
      '<tr><td style="padding: 8px 0; color: #666;"><strong>Duration:</strong></td><td>' + callDuration + '</td></tr>' +
      '<tr><td style="padding: 8px 0; color: #666;"><strong>Type:</strong></td><td>' + callLog.type + '</td></tr>' +
      '</table>' +
      '</div>' +
      '<div style="background: white; padding: 20px; border: 1px solid #ddd; border-top: none;">' +
      '<h2 style="color: #0C2340; font-size: 18px; margin-top: 0;">AI Summary</h2>' +
      '<div style="background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%); padding: 15px; border-radius: 8px; white-space: pre-wrap; line-height: 1.6;">' +
      callLog.aiSummary +
      '</div>' +
      '</div>' +
      '<div style="background: #0C2340; padding: 15px; border-radius: 0 0 8px 8px; text-align: center;">' +
      '<p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 12px;">Sent via Zander - AI-Powered Business Operations</p>' +
      '</div>' +
      '</div>';
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }
    const results = [];
    for (const recipient of recipients) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + resendApiKey,
          },
          body: JSON.stringify({
            from: 'Zander <notifications@mcfapp.com>',
            to: recipient,
            subject: subject,
            html: htmlBody,
          }),
        });
        if (response.ok) {
          results.push({ recipient, success: true });
        } else {
          const err = await response.text();
          console.error('Failed to send to ' + recipient + ':', err);
          results.push({ recipient, success: false, error: err });
        }
      } catch (err) {
        console.error('Error sending to ' + recipient + ':', err);
        results.push({ recipient, success: false, error: String(err) });
      }
    }
    return { success: true, results };
  }
}
