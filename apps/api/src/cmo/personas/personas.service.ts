import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { defaultPersonaSeed } from './default-persona';

export interface PersonaTestResult {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  revisedContent?: string;
}

@Injectable()
export class PersonasService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.persona.findMany({
      where: { tenantId },
      include: {
        _count: { select: { contacts: true } },
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string, tenantId: string) {
    const persona = await this.prisma.persona.findFirst({
      where: { id, tenantId },
      include: {
        _count: { select: { contacts: true } },
      },
    });
    if (!persona) {
      throw new NotFoundException('Persona not found');
    }
    return persona;
  }

  async create(
    tenantId: string,
    data: {
      name: string;
      avatar?: string;
      tagline?: string;
      demographics?: any;
      psychographics?: any;
      behaviors?: any;
      painPoints?: string[];
      goals?: string[];
      preferredChannels?: string[];
      brandAffinities?: string[];
      interview?: string;
      isDefault?: boolean;
    },
  ) {
    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await this.prisma.persona.updateMany({
        where: { tenantId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.persona.create({
      data: {
        tenantId,
        name: data.name,
        avatar: data.avatar,
        tagline: data.tagline,
        demographics: data.demographics || {},
        psychographics: data.psychographics || {},
        behaviors: data.behaviors || {},
        painPoints: data.painPoints || [],
        goals: data.goals || [],
        preferredChannels: data.preferredChannels || [],
        brandAffinities: data.brandAffinities || [],
        interview: data.interview,
        isDefault: data.isDefault || false,
      },
    });
  }

  async update(
    id: string,
    tenantId: string,
    data: {
      name?: string;
      avatar?: string;
      tagline?: string;
      demographics?: any;
      psychographics?: any;
      behaviors?: any;
      painPoints?: string[];
      goals?: string[];
      preferredChannels?: string[];
      brandAffinities?: string[];
      interview?: string;
      isDefault?: boolean;
    },
  ) {
    const persona = await this.prisma.persona.findFirst({
      where: { id, tenantId },
    });
    if (!persona) {
      throw new NotFoundException('Persona not found');
    }

    // If setting as default, unset others
    if (data.isDefault) {
      await this.prisma.persona.updateMany({
        where: { tenantId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.persona.update({
      where: { id },
      data: {
        name: data.name,
        avatar: data.avatar,
        tagline: data.tagline,
        demographics: data.demographics,
        psychographics: data.psychographics,
        behaviors: data.behaviors,
        painPoints: data.painPoints,
        goals: data.goals,
        preferredChannels: data.preferredChannels,
        brandAffinities: data.brandAffinities,
        interview: data.interview,
        isDefault: data.isDefault,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    const persona = await this.prisma.persona.findFirst({
      where: { id, tenantId },
    });
    if (!persona) {
      throw new NotFoundException('Persona not found');
    }

    // Unlink contacts from this persona
    await this.prisma.contact.updateMany({
      where: { personaId: id },
      data: { personaId: null },
    });

    await this.prisma.persona.delete({ where: { id } });
    return { success: true, message: 'Persona deleted successfully' };
  }

  async getDefault(tenantId: string) {
    return this.prisma.persona.findFirst({
      where: { tenantId, isDefault: true },
    });
  }

  async seedDefaultPersona(tenantId: string) {
    const existing = await this.prisma.persona.findFirst({
      where: { tenantId, isDefault: true },
    });
    if (!existing) {
      return this.create(tenantId, defaultPersonaSeed);
    }
    return existing;
  }

  async testContent(
    tenantId: string,
    personaId: string,
    content: string,
    contentType: 'email' | 'ad' | 'social' | 'landing_page',
  ): Promise<PersonaTestResult> {
    const persona = await this.findOne(personaId, tenantId);

    const systemPrompt = this.buildTestPrompt(persona, contentType);

    try {
      const result = await this.callClaudeAPI(systemPrompt, content);
      return result;
    } catch (error) {
      console.error('Error testing content against persona:', error);
      return {
        score: 0,
        summary: 'Unable to analyze content. Please try again.',
        strengths: [],
        weaknesses: [],
        suggestions: ['Ensure the content is not empty and try again.'],
      };
    }
  }

  private buildTestPrompt(persona: any, contentType: string): string {
    const contentTypeLabels: Record<string, string> = {
      email: 'Email',
      ad: 'Advertisement',
      social: 'Social Media Post',
      landing_page: 'Landing Page Copy',
    };

    return `You are an expert marketing analyst evaluating content for resonance with a specific customer persona.

PERSONA PROFILE:
Name: ${persona.name}
Tagline: ${persona.tagline || 'N/A'}
Demographics: ${JSON.stringify(persona.demographics || {}, null, 2)}
Psychographics: ${JSON.stringify(persona.psychographics || {}, null, 2)}
Behaviors: ${JSON.stringify(persona.behaviors || {}, null, 2)}
Pain Points: ${(persona.painPoints || []).join(', ') || 'N/A'}
Goals: ${(persona.goals || []).join(', ') || 'N/A'}
Preferred Channels: ${(persona.preferredChannels || []).join(', ') || 'N/A'}
Brand Affinities: ${(persona.brandAffinities || []).join(', ') || 'N/A'}
${persona.interview ? `\nPersona Interview/Story:\n${persona.interview}` : ''}

You will analyze ${contentTypeLabels[contentType] || 'Marketing Content'} from this persona's perspective.

Evaluate how well the content would resonate with this persona. Consider:
- Does it address their pain points?
- Does it align with their goals?
- Is the tone and language appropriate for them?
- Would it appeal to their values and psychographics?
- Is it delivered through or appropriate for their preferred channels?

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "score": <number 1-10, where 10 is perfect resonance>,
  "summary": "<one sentence summary of how well this resonates>",
  "strengths": ["<what works well>", "<another strength>"],
  "weaknesses": ["<what doesn't resonate>", "<another weakness>"],
  "suggestions": ["<specific actionable improvement>", "<another suggestion>"]
}`;
  }

  private async callClaudeAPI(
    systemPrompt: string,
    userMessage: string,
  ): Promise<PersonaTestResult> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

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
        messages: [
          {
            role: 'user',
            content: `Analyze this content:\n\n${userMessage}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      throw new Error('Claude API request failed');
    }

    const data = await response.json();
    const text = data.content[0].text;

    // Parse JSON response, handling potential markdown code blocks
    let jsonStr = text;
    if (text.includes('```')) {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        jsonStr = match[1].trim();
      }
    }

    return JSON.parse(jsonStr);
  }
}
