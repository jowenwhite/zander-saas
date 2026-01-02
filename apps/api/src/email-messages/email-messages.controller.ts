import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request, Logger } from '@nestjs/common';
import { EmailMessagesService } from './email-messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('email-messages')
export class EmailMessagesController {
  private readonly logger = new Logger(EmailMessagesController.name);

  constructor(private readonly emailMessagesService: EmailMessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async sendEmail(
    @Request() req,
    @Body() body: {
      contactId?: string;
      dealId?: string;
      to: string;
      subject: string;
      body: string;
      htmlBody?: string;
      inReplyTo?: string;
      threadId?: string;
    },
  ) {
    const tenantId = req.user.tenantId;
    return this.emailMessagesService.sendAndStore({
      tenantId,
      contactId: body.contactId,
      dealId: body.dealId,
      to: body.to,
      subject: body.subject,
      body: body.body,
      htmlBody: body.htmlBody,
      inReplyTo: body.inReplyTo,
      threadId: body.threadId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Request() req,
    @Query('contactId') contactId?: string,
    @Query('dealId') dealId?: string,
    @Query('limit') limit?: string,
    @Query('tenantIds') tenantIds?: string,
  ) {
    // SuperAdmin can query multiple tenants
    if (req.user.isSuperAdmin && tenantIds) {
      const tenantIdArray = tenantIds.split(',');
      return this.emailMessagesService.findAllMultiTenant(tenantIdArray, {
        contactId,
        dealId,
        limit: limit ? parseInt(limit, 10) : undefined,
      });
    }
    const tenantId = req.user.tenantId;
    return this.emailMessagesService.findAll(tenantId, {
      contactId,
      dealId,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('thread/:threadId')
  async findByThread(@Request() req, @Param('threadId') threadId: string) {
    const tenantId = req.user.tenantId;
    return this.emailMessagesService.findByThread(tenantId, threadId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const tenantId = req.user.tenantId;
    return this.emailMessagesService.getUnreadCount(tenantId);
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.emailMessagesService.findOne(tenantId, id);
  }

  

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  async markAsRead(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.emailMessagesService.markAsRead(tenantId, id);
  }

  
  @UseGuards(JwtAuthGuard)
  @Patch(':id/archive')
  async archiveEmail(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.emailMessagesService.archiveEmail(tenantId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/delete')
  async deleteEmail(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.emailMessagesService.deleteEmail(tenantId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('mark-all-read')
  async markAllAsRead(@Request() req) {
    const tenantId = req.user.tenantId;
    return this.emailMessagesService.markAllAsRead(tenantId);
  }

// Resend Inbound Webhook - no auth required (webhook from Resend)
  @Post('inbound-webhook')
  async handleInboundWebhook(@Body() payload: any) {
    this.logger.log('Received inbound email webhook');
    this.logger.debug(JSON.stringify(payload, null, 2));

    try {
      // Resend inbound webhook payload structure
      const emailData = {
        from: payload.from || payload.envelope?.from,
        to: payload.to || payload.envelope?.to,
        subject: payload.subject,
        text: payload.text || payload.plain,
        html: payload.html,
        messageId: payload.messageId || payload.message_id,
        inReplyTo: payload.inReplyTo || payload.in_reply_to,
      };

      const result = await this.emailMessagesService.processInboundEmail(emailData);
      
      return { success: true, emailId: result?.id };
    } catch (error) {
      this.logger.error(`Failed to process inbound email: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // Resend Event Webhook (delivery, open, click tracking)
  @Post('event-webhook')
  async handleEventWebhook(@Body() payload: any) {
    this.logger.log(`Received email event: ${payload.type}`);

    try {
      if (payload.type === 'email.delivered') {
        const email = await this.emailMessagesService.findOne(payload.data?.email_id, payload.data?.email_id);
        if (email) {
          await this.emailMessagesService.updateStatus(email.id, 'delivered');
        }
      } else if (payload.type === 'email.opened') {
        // Find by messageId and update
        this.logger.log(`Email opened: ${payload.data?.email_id}`);
      }

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to process email event: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
