import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { getOwnershipFilter, canAccessRecord } from '../common/utils/ownership-filter.util';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  // Get all contacts for a tenant (with search, filters, pagination)
  // HIGH-3: Added userId and userRole for ownership-based filtering
  async findAll(tenantId: string, query: any, userId?: string, userRole?: string) {
    const { search, tags, page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    // HIGH-3: Build ownership filter based on user role
    const ownershipWhere = userId && userRole
      ? getOwnershipFilter(
          { tenantId, userId, userRole },
          { ownerField: 'ownerId', assignedField: 'assignedToId' }
        )
      : { tenantId };

    const where: any = { ...ownershipWhere };

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

  // Get single contact by ID (with tenant and ownership check)
  // HIGH-3: Added userId and userRole for ownership-based access control
  async findOne(id: string, tenantId: string, userId?: string, userRole?: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, tenantId },
      include: {
        deals: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      }
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    // HIGH-3: Check if user can access this contact
    if (userId && userRole) {
      const hasAccess = canAccessRecord(
        contact,
        { tenantId, userId, userRole },
        { ownerField: 'ownerId', assignedField: 'assignedToId' }
      );
      if (!hasAccess) {
        throw new ForbiddenException('You do not have permission to access this contact');
      }
    }

    return contact;
  }

  // Create new contact
  // HIGH-3: Added userId to set owner on creation
  async create(data: any, tenantId: string, userId?: string) {
    return this.prisma.contact.create({
      data: {
        ...data,
        tenantId,
        // HIGH-3: Set owner and assignee to creator by default
        ownerId: data.ownerId || userId,
        assignedToId: data.assignedToId || userId,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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
