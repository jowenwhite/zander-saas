import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { generateEmailHtml } from './html-generator';
import { prebuiltTemplates, PrebuiltTemplate } from './prebuilt-templates';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  // List all templates for tenant
  async findAll(
    tenantId: string,
    options?: { category?: string; status?: string },
  ) {
    const where: any = { tenantId, type: 'email' };

    if (options?.category) {
      where.category = options.category;
    }
    if (options?.status) {
      where.status = options.status;
    }

    return this.prisma.emailTemplate.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  }

  // Get single template
  async findOne(id: string, tenantId: string) {
    const template = await this.prisma.emailTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  // Create template
  async create(
    tenantId: string,
    data: {
      name: string;
      subject?: string;
      body?: any;
      category?: string;
      status?: string;
    },
  ) {
    // Default body structure if not provided
    const defaultBody = {
      version: '1.0',
      settings: {
        backgroundColor: '#f4f4f4',
        contentWidth: 600,
        fontFamily: 'Arial, sans-serif',
        defaultTextColor: '#333333',
      },
      blocks: [],
    };

    return this.prisma.emailTemplate.create({
      data: {
        tenantId,
        name: data.name,
        subject: data.subject || '',
        body: data.body ? JSON.stringify(data.body) : JSON.stringify(defaultBody),
        type: 'email',
        category: data.category || 'general',
        status: data.status || 'draft',
      },
    });
  }

  // Update template
  async update(
    id: string,
    tenantId: string,
    data: {
      name?: string;
      subject?: string;
      body?: any;
      category?: string;
      status?: string;
    },
  ) {
    const template = await this.prisma.emailTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.body !== undefined) updateData.body = JSON.stringify(data.body);
    if (data.category !== undefined) updateData.category = data.category;
    if (data.status !== undefined) updateData.status = data.status;

    return this.prisma.emailTemplate.update({
      where: { id },
      data: updateData,
    });
  }

  // Delete template
  async remove(id: string, tenantId: string) {
    const template = await this.prisma.emailTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    await this.prisma.emailTemplate.delete({ where: { id } });
    return { success: true, message: 'Template deleted successfully' };
  }

  // Duplicate template
  async duplicate(id: string, tenantId: string) {
    const template = await this.prisma.emailTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return this.prisma.emailTemplate.create({
      data: {
        tenantId,
        name: `${template.name} (Copy)`,
        subject: template.subject,
        body: template.body,
        type: template.type,
        category: template.category,
        status: 'draft',
      },
    });
  }

  // Get pre-built templates
  getPrebuiltTemplates(): PrebuiltTemplate[] {
    return prebuiltTemplates;
  }

  // Create template from pre-built
  async createFromPrebuilt(tenantId: string, prebuiltId: string, customName?: string) {
    const prebuilt = prebuiltTemplates.find((t) => t.id === prebuiltId);
    if (!prebuilt) {
      throw new NotFoundException('Pre-built template not found');
    }

    return this.prisma.emailTemplate.create({
      data: {
        tenantId,
        name: customName || prebuilt.name,
        subject: prebuilt.subject,
        body: JSON.stringify(prebuilt.body),
        type: 'email',
        category: prebuilt.category,
        status: 'draft',
      },
    });
  }

  // Export template as HTML
  async exportHtml(id: string, tenantId: string) {
    const template = await this.findOne(id, tenantId);

    let body: any;
    try {
      body = typeof template.body === 'string' ? JSON.parse(template.body) : template.body;
    } catch {
      body = { version: '1.0', settings: {}, blocks: [] };
    }

    const html = generateEmailHtml(body, template.subject || '');

    return {
      html,
      subject: template.subject,
    };
  }

  // Send test email (placeholder - integrate with EmailService)
  async sendTestEmail(id: string, tenantId: string, email: string) {
    const { html, subject } = await this.exportHtml(id, tenantId);

    // TODO: Integrate with EmailService to actually send
    // For now, return the HTML for preview
    return {
      success: true,
      message: `Test email would be sent to ${email}`,
      subject,
      html,
    };
  }
}
