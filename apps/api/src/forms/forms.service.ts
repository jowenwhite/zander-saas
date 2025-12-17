import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.form.findMany({
      where: { tenantId },
      include: {
        _count: { select: { submissions: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const form = await this.prisma.form.findFirst({
      where: { id, tenantId },
      include: {
        _count: { select: { submissions: true } }
      },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    return form;
  }

  async create(tenantId: string, data: {
    name: string;
    description?: string;
    fields?: any[];
    settings?: any;
  }) {
    return this.prisma.form.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description,
        fields: data.fields || [],
        settings: data.settings || {},
        status: 'draft',
      },
    });
  }

  async update(id: string, tenantId: string, data: {
    name?: string;
    description?: string;
    fields?: any[];
    settings?: any;
    status?: string;
  }) {
    const form = await this.prisma.form.findFirst({
      where: { id, tenantId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    return this.prisma.form.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    const form = await this.prisma.form.findFirst({
      where: { id, tenantId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    // Delete submissions first
    await this.prisma.formSubmission.deleteMany({
      where: { formId: id },
    });

    await this.prisma.form.delete({
      where: { id },
    });

    return { success: true, message: 'Form deleted successfully' };
  }

  // Form Submissions
  async getSubmissions(formId: string, tenantId: string) {
    const form = await this.prisma.form.findFirst({
      where: { id: formId, tenantId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    return this.prisma.formSubmission.findMany({
      where: { formId },
      include: { contact: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSubmission(formId: string, data: any, tenantId?: string) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    // Optionally create a contact from submission
    let contactId: string | undefined;
    if (data.email && form.tenantId) {
      const existingContact = await this.prisma.contact.findFirst({
        where: { email: data.email, tenantId: form.tenantId },
      });

      if (existingContact) {
        contactId = existingContact.id;
      } else if (data.firstName || data.lastName) {
        const newContact = await this.prisma.contact.create({
          data: {
            tenantId: form.tenantId,
            email: data.email,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            phone: data.phone,
            source: 'form',
            notes: `Submitted via form: ${form.name}`,
          },
        });
        contactId = newContact.id;
      }
    }

    return this.prisma.formSubmission.create({
      data: {
        formId,
        data,
        contactId,
      },
    });
  }
}
