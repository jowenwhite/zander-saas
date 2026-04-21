import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { EmailService, SendEmailDto, ResendWebhookPayload } from './email.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Public } from '../../auth/jwt-auth.decorator';

@Controller('email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async sendEmail(@Body() dto: SendEmailDto) {
    const result = await this.emailService.sendEmail(dto);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('send-template')
  async sendTemplateEmail(
    @Body() body: {
      to: string;
      subject: string;
      templateContent: string;
      variables?: Record<string, string>;
    }
  ) {
    const result = await this.emailService.sendTemplateEmail(
      body.to,
      body.subject,
      body.templateContent,
      body.variables || {}
    );
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('test')
  async sendTestEmail(@Body() body: { to: string }) {
    const result = await this.emailService.sendTestEmail(body.to);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getStatus() {
    const configured = !!process.env.RESEND_API_KEY;
    return {
      configured,
      provider: 'resend',
      message: configured
        ? 'Email service is configured and ready'
        : 'RESEND_API_KEY not configured'
    };
  }

  /**
   * POST /integrations/email/webhook
   * Resend webhook handler - processes email events
   * Uses Svix for signature verification
   */
  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
    @Body() payload: ResendWebhookPayload,
  ): Promise<{ received: boolean; message?: string }> {
    this.logger.log(`Received Resend webhook: ${payload.type}`);

    // Get raw body for signature verification
    const rawBody = req.rawBody?.toString() || JSON.stringify(payload);

    // Verify signature
    const isValid = this.emailService.verifyWebhookSignature(rawBody, {
      'svix-id': svixId || '',
      'svix-timestamp': svixTimestamp || '',
      'svix-signature': svixSignature || '',
    });

    if (!isValid) {
      this.logger.warn('Webhook signature verification failed');
      return { received: false, message: 'Invalid signature' };
    }

    // Process the webhook event
    const result = await this.emailService.processWebhookEvent(payload);

    return {
      received: true,
      message: result.message,
    };
  }
}
