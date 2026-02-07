import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EmailService } from '../integrations/email/email.service';
import { getOwnershipFilter } from '../common/utils/ownership-filter.util';

export interface CreateEmailMessageDto {
  tenantId: string;
  contactId?: string;
  dealId?: string;
  direction: 'inbound' | 'outbound';
  fromAddress: string;
  toAddress: string;
  subject: string;
  body: string;
  htmlBody?: string;
  messageId?: string;
  inReplyTo?: string;
  threadId?: string;
  status?: string;
  sentAt?: Date;
  userId?: string; // HIGH-3: Track who sent outbound emails
}

export interface SendAndStoreEmailDto {
  tenantId: string;
  contactId?: string;
  dealId?: string;
  to: string;
  subject: string;
  body: string;
  htmlBody?: string;
  from?: string;
  inReplyTo?: string;
  threadId?: string;
  userId?: string; // HIGH-3: Track who sent the email
}

@Injectable()
export class EmailMessagesService {
  private readonly logger = new Logger(EmailMessagesService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(dto: CreateEmailMessageDto) {
    return this.prisma.emailMessage.create({
      data: {
        tenantId: dto.tenantId,
        contactId: dto.contactId,
        dealId: dto.dealId,
        userId: dto.userId, // HIGH-3: Track sender for outbound emails
        direction: dto.direction,
        fromAddress: dto.fromAddress,
        toAddress: dto.toAddress,
        subject: dto.subject,
        body: dto.body,
        htmlBody: dto.htmlBody,
        messageId: dto.messageId,
        inReplyTo: dto.inReplyTo,
        threadId: dto.threadId || dto.inReplyTo || undefined,
        status: dto.status || 'sent',
        sentAt: dto.sentAt || new Date(),
      },
    });
  }

  async sendAndStore(dto: SendAndStoreEmailDto) {
    // Send via Resend
    const result = await this.emailService.sendEmail({
      to: dto.to,
      subject: dto.subject,
      html: dto.htmlBody || dto.body,
      text: dto.body,
      from: dto.from,
    });

    if (!result.success) {
      this.logger.error(`Failed to send email: ${result.error}`);
      throw new Error(result.error);
    }

    // Store in database
    const emailMessage = await this.create({
      tenantId: dto.tenantId,
      contactId: dto.contactId,
      dealId: dto.dealId,
      userId: dto.userId, // HIGH-3: Track who sent the email
      direction: 'outbound',
      fromAddress: dto.from || 'noreply@mcfapp.com',
      toAddress: dto.to,
      subject: dto.subject,
      body: dto.body,
      htmlBody: dto.htmlBody,
      messageId: result.messageId,
      inReplyTo: dto.inReplyTo,
      threadId: dto.threadId,
      status: 'sent',
      sentAt: new Date(),
    });

    this.logger.log(`Email sent and stored: ${emailMessage.id}`);
    return emailMessage;
  }

  // HIGH-3: Added userId and userRole for ownership-based filtering
  async findAll(tenantId: string, options?: {
    contactId?: string;
    dealId?: string;
    limit?: number;
    userId?: string;
    userRole?: string;
  }) {
    // HIGH-3: Build ownership filter based on user role
    // Note: For emails, members see only their sent emails (outbound with userId match)
    // Inbound emails are visible to all (they don't have userId)
    const ownershipWhere = options?.userId && options?.userRole
      ? getOwnershipFilter(
          { tenantId, userId: options.userId, userRole: options.userRole },
          { ownerField: 'userId' }
        )
      : { tenantId };

    // For members, they can see: their outbound OR any inbound
    const adminRoles = ['admin', 'owner'];
    const isMember = options?.userRole && !adminRoles.includes(options.userRole.toLowerCase());

    const whereClause = isMember && options?.userId
      ? {
          ...ownershipWhere,
          isDeleted: false,
          isArchived: false,
          ...(options?.contactId && { contactId: options.contactId }),
          ...(options?.dealId && { dealId: options.dealId }),
          // Members can see: their outbound OR any inbound
          OR: [
            { userId: options.userId },  // Their outbound emails
            { direction: 'inbound' },     // All inbound emails (they don't have userId)
          ],
        }
      : {
          tenantId,
          isDeleted: false,
          isArchived: false,
          ...(options?.contactId && { contactId: options.contactId }),
          ...(options?.dealId && { dealId: options.dealId }),
        };

    return this.prisma.emailMessage.findMany({
      where: whereClause,
      orderBy: { sentAt: 'desc' },
      take: options?.limit || 50,
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async findAllMultiTenant(tenantIds: string[], options?: { contactId?: string; dealId?: string; limit?: number }) {
    return this.prisma.emailMessage.findMany({
      where: {
        tenantId: { in: tenantIds },
        isDeleted: false,
        isArchived: false,
        ...(options?.contactId && { contactId: options.contactId }),
        ...(options?.dealId && { dealId: options.dealId }),
      },
      orderBy: { sentAt: "desc" },
      take: options?.limit || 100,
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        tenant: {
          select: { id: true, companyName: true, subdomain: true },
        },
      },
    });
  }

  async findByThread(tenantId: string, threadId: string) {
    return this.prisma.emailMessage.findMany({
      where: { tenantId, threadId },
      orderBy: { sentAt: 'asc' },
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.emailMessage.findFirst({
      where: { id, tenantId },
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async processInboundEmail(payload: {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
    messageId?: string;
    inReplyTo?: string;
  }) {
    this.logger.log(`Processing inbound email from ${payload.from}`);

    // Find tenant by matching the to address domain or contact email
    const contact = await this.prisma.contact.findFirst({
      where: { email: payload.from.toLowerCase() },
    });

    if (!contact) {
      this.logger.warn(`No contact found for inbound email from ${payload.from}`);
      // Still store it but without contact association
    }

    const tenantId = contact?.tenantId;
    if (!tenantId) {
      this.logger.warn('Could not determine tenant for inbound email');
      return null;
    }

    // Determine threadId from inReplyTo
    let threadId = payload.inReplyTo;
    if (payload.inReplyTo) {
      const parentEmail = await this.prisma.emailMessage.findFirst({
        where: { messageId: payload.inReplyTo },
      });
      if (parentEmail?.threadId) {
        threadId = parentEmail.threadId;
      }
    }

    const emailMessage = await this.create({
      tenantId,
      contactId: contact?.id,
      direction: 'inbound',
      fromAddress: payload.from,
      toAddress: payload.to,
      subject: payload.subject,
      body: payload.text || '',
      htmlBody: payload.html,
      messageId: payload.messageId,
      inReplyTo: payload.inReplyTo,
      threadId,
      status: 'received',
      sentAt: new Date(),
    });

    this.logger.log(`Inbound email stored: ${emailMessage.id}`);
    return emailMessage;
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.emailMessage.update({
      where: { id },
      data: { status, ...(status === 'opened' && { openedAt: new Date() }) },
    });
  }

  async getUnreadCount(tenantId: string) {
    const count = await this.prisma.emailMessage.count({
      where: {
        tenantId,
        direction: 'inbound',
        isDeleted: false,
        isArchived: false,
        isRead: false,
      },
    });
    return { unreadCount: count };
  }

  async markAsRead(tenantId: string, id: string) {
    return this.prisma.emailMessage.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAsUnread(tenantId: string, id: string) {
    return this.prisma.emailMessage.update({
      where: { id },
      data: { isRead: false },
    });
  }

  async archiveEmail(tenantId: string, id: string) {
    return this.prisma.emailMessage.update({
      where: { id, tenantId },
      data: { isArchived: true },
    });
  }

  async deleteEmail(tenantId: string, id: string) {
    return this.prisma.emailMessage.update({
      where: { id, tenantId },
      data: { isDeleted: true },
    });
  }

  async markAllAsRead(tenantId: string) {
    return this.prisma.emailMessage.updateMany({
      where: { tenantId, direction: 'inbound', isRead: false },
      data: { isRead: true },
    });
  }
}
