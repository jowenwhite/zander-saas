import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { EmailService, SendEmailDto } from './email.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('email')
@UseGuards(JwtAuthGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendEmail(@Body() dto: SendEmailDto) {
    const result = await this.emailService.sendEmail(dto);
    return result;
  }

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

  @Post('test')
  async sendTestEmail(@Body() body: { to: string }) {
    const result = await this.emailService.sendTestEmail(body.to);
    return result;
  }

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
}
