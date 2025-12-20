import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as Twilio from 'twilio';

@Injectable()
export class SmsMessagesService {
  private readonly logger = new Logger(SmsMessagesService.name);
  private twilioClient: Twilio.Twilio | null = null;

  constructor(private prisma: PrismaService) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (accountSid && authToken && accountSid !== 'your_account_sid_here') {
      this.twilioClient = Twilio.default(accountSid, authToken);
      this.logger.log('Twilio client initialized');
    } else {
      this.logger.warn('Twilio credentials not configured');
    }
  }

  async sendSms(params: {
    tenantId: string;
    to: string;
    body: string;
    contactId?: string;
    dealId?: string;
  }) {
    const { tenantId, to, body, contactId, dealId } = params;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!this.twilioClient) {
      throw new Error('Twilio not configured');
    }

    try {
      const message = await this.twilioClient.messages.create({
        body,
        from: fromNumber,
        to,
      });

      this.logger.log('SMS sent: ' + message.sid);

      const smsMessage = await this.prisma.smsMessage.create({
        data: {
          tenantId,
          contactId,
          dealId,
          direction: 'outbound',
          fromNumber,
          toNumber: to,
          body,
          messageSid: message.sid,
          status: message.status,
          sentAt: new Date(),
        },
      });

      return { success: true, messageId: smsMessage.id, sid: message.sid };
    } catch (error) {
      this.logger.error('Failed to send SMS: ' + error.message);
      throw error;
    }
  }

  async findAll(tenantId: string, filters?: {
    contactId?: string;
    direction?: string;
    limit?: number;
  }) {
    const { contactId, direction, limit = 50 } = filters || {};

    return this.prisma.smsMessage.findMany({
      where: {
        tenantId,
        ...(contactId && { contactId }),
        ...(direction && { direction }),
      },
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
      },
      orderBy: { sentAt: 'desc' },
      take: limit,
    });
  }

  async findOne(id: string, tenantId: string) {
    return this.prisma.smsMessage.findFirst({
      where: { id, tenantId },
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
      },
    });
  }

  async findByContact(contactId: string, tenantId: string) {
    return this.prisma.smsMessage.findMany({
      where: { contactId, tenantId },
      orderBy: { sentAt: 'desc' },
    });
  }

  async handleInboundWebhook(webhookData: {
    From: string;
    To: string;
    Body: string;
    MessageSid: string;
    AccountSid: string;
  }) {
    const { From, To, Body, MessageSid } = webhookData;

    this.logger.log('Inbound SMS from ' + From + ': ' + Body.substring(0, 50) + '...');

    const contact = await this.prisma.contact.findFirst({
      where: {
        phone: {
          contains: From.replace('+1', '').replace('+', ''),
        },
      },
    });

    if (contact) {
      const smsMessage = await this.prisma.smsMessage.create({
        data: {
          tenantId: contact.tenantId,
          contactId: contact.id,
          direction: 'inbound',
          fromNumber: From,
          toNumber: To,
          body: Body,
          messageSid: MessageSid,
          status: 'received',
          sentAt: new Date(),
        },
      });

      return { success: true, messageId: smsMessage.id, matched: true };
    }

    this.logger.warn('No contact found for phone: ' + From);
    return { success: true, matched: false };
  }

  async handleStatusWebhook(webhookData: {
    MessageSid: string;
    MessageStatus: string;
  }) {
    const { MessageSid, MessageStatus } = webhookData;

    this.logger.log('SMS status update: ' + MessageSid + ' -> ' + MessageStatus);

    const updated = await this.prisma.smsMessage.updateMany({
      where: { messageSid: MessageSid },
      data: {
        status: MessageStatus,
        ...(MessageStatus === 'delivered' && { deliveredAt: new Date() }),
      },
    });

    return { success: true, updated: updated.count };
  }
}
