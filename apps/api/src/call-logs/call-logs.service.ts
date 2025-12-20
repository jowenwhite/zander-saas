import { Injectable } from '@nestjs/common';
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

  async generateSummary(tenantId: string, id: string, transcript: string) {
    // First save the transcript
    await this.prisma.callLog.updateMany({
      where: { id, tenantId },
      data: { transcription: transcript },
    });

    // Get call details for context
    const callLog = await this.prisma.callLog.findFirst({
      where: { id, tenantId },
      include: { contact: true },
    });

    if (!callLog) {
      throw new Error('Call log not found');
    }

    const contactName = callLog.contact 
      ? `${callLog.contact.firstName} ${callLog.contact.lastName}`
      : 'Unknown Contact';

    const systemPrompt = `You are an AI assistant that summarizes business calls and meetings. 
Generate a structured summary of the following call/meeting transcript.

Call Details:
- Contact: ${contactName}
- Type: ${callLog.type}
- Duration: ${callLog.duration ? Math.round(callLog.duration / 60) + ' minutes' : 'Unknown'}
- Date: ${callLog.createdAt.toLocaleDateString()}

Provide your response in this exact format:

## Key Topics Discussed
- [bullet points of main topics]

## Action Items
- [bullet points with owner if mentioned]

## Decisions Made
- [bullet points or "None discussed"]

## Follow-up Required
[Yes/No] - [details if yes]

## Sentiment
[Positive/Neutral/Concerns Raised] - [brief explanation]`;

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
          messages: [{ role: 'user', content: `Please summarize this call transcript:\n\n${transcript}` }],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Claude API error:', error);
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      const aiSummary = data.content[0].text;

      // Save the summary
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
}
