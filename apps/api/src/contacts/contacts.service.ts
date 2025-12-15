import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  // Get all contacts for a tenant (with search, filters, pagination)
  async findAll(tenantId: string, query: any) {
    const { search, tags, page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: any = { tenantId };

    // Search filter
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ];
    }


    // Tags filter (if you have tags - skip for now)
    // if (tags) {
    //   where.tags = { hasSome: tags.split(',') };
    // }

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          deals: true // Include related deals
        }
      }),
      this.prisma.contact.count({ where })
    ]);

    return {
      data: contacts,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    };
  }

  // Get single contact by ID (with tenant check)
  async findOne(id: string, tenantId: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, tenantId },
      include: {
        deals: true,
        // activities: true, // Add when Activity model exists
        // forms: true // Add when Form model exists
      }
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return contact;
  }

  // Create new contact
  async create(data: any, tenantId: string) {
    return this.prisma.contact.create({
      data: {
        ...data,
        tenantId
      }
    });
  }

  // Update contact
  async update(id: string, data: any, tenantId: string) {
    // Verify contact belongs to tenant
    await this.findOne(id, tenantId);

    return this.prisma.contact.update({
      where: { id },
      data
    });
  }

  // Delete contact
  async delete(id: string, tenantId: string) {
    // Verify contact belongs to tenant
    await this.findOne(id, tenantId);

    return this.prisma.contact.delete({
      where: { id }
    });
  }

  // Bulk import contacts
  async bulkImport(contacts: any[], tenantId: string) {
    const created = [];
    const errors = [];

    for (const contact of contacts) {
      try {
        const newContact = await this.create(contact, tenantId);
        created.push(newContact);
      } catch (error) {
        errors.push({ contact, error: error.message });
      }
    }

    return { created, errors };
  }
}
