import { Controller, Post, Body, Headers, Logger, HttpCode } from '@nestjs/common';
import { InboundEmailService } from './inbound-email.service';

interface ResendInboundEmail {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  reply_to?: string;
  message_id?: string;
  in_reply_to?: string;
  references?: string;
  headers?: Record<string, string>;
  attachments?: Array<{
    filename: string;
    content_type: string;
    content: string; // base64 encoded
  }>;
}

@Controller('webhooks/email')
export class InboundEmailController {
  private readonly logger = new Logger(InboundEmailController.name);

  constructor(private readonly inboundEmailService: InboundEmailService) {}

  @Post('inbound')
  @HttpCode(200)
  async handleInboundEmail(
    @Body() payload: ResendInboundEmail,
    @Headers('x-resend-signature') signature: string,
  ) {
    this.logger.log(`Received inbound email from: ${payload.from} to: ${payload.to}`);
    this.logger.log(`Subject: ${payload.subject}`);
    
    try {
      const result = await this.inboundEmailService.processInboundEmail(payload);
      return { success: true, emailId: result.id };
    } catch (error) {
      this.logger.error(`Failed to process inbound email: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @Post('status')
  @HttpCode(200)
  async handleEmailStatus(
    @Body() payload: any,
  ) {
    this.logger.log(`Email status webhook: ${JSON.stringify(payload)}`);
    
    // Handle delivery status updates (delivered, opened, bounced, etc.)
    if (payload.type && payload.data) {
      await this.inboundEmailService.updateEmailStatus(
        payload.data.email_id,
        payload.type,
        payload.data,
      );
    }
    
    return { success: true };
  }
}
