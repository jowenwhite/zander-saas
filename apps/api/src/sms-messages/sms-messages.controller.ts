import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SmsMessagesService } from './sms-messages.service';

@Controller('sms-messages')
export class SmsMessagesController {
  constructor(private readonly smsMessagesService: SmsMessagesService) {}

  @Post('send')
  @UseGuards(JwtAuthGuard)
  async sendSms(
    @Request() req,
    @Body() body: { to: string; body: string; contactId?: string; dealId?: string },
  ) {
    return this.smsMessagesService.sendSms({
      tenantId: req.user.tenantId,
      to: body.to,
      body: body.body,
      contactId: body.contactId,
      dealId: body.dealId,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Request() req,
    @Query('contactId') contactId?: string,
    @Query('direction') direction?: string,
    @Query('limit') limit?: string,
  ) {
    return this.smsMessagesService.findAll(req.user.tenantId, {
      contactId,
      direction,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Request() req, @Param('id') id: string) {
    return this.smsMessagesService.findOne(id, req.user.tenantId);
  }

  @Get('contact/:contactId')
  @UseGuards(JwtAuthGuard)
  async findByContact(@Request() req, @Param('contactId') contactId: string) {
    return this.smsMessagesService.findByContact(contactId, req.user.tenantId);
  }

  // Twilio webhooks - no auth required
  @Post('inbound-webhook')
  async handleInbound(@Body() body: any) {
    return this.smsMessagesService.handleInboundWebhook(body);
  }

  @Post('status-webhook')
  async handleStatus(@Body() body: any) {
    return this.smsMessagesService.handleStatusWebhook(body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Request() req, @Param('id') id: string) {
    await this.smsMessagesService.delete(id, req.user.tenantId);
    return { success: true };
  }
}