import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CallLogsService } from './call-logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('call-logs')
@UseGuards(JwtAuthGuard)
export class CallLogsController {
  constructor(private readonly callLogsService: CallLogsService) {}

  @Post()
  async create(@Request() req, @Body() body: {
    contactId?: string;
    dealId?: string;
    type: string;
    direction: string;
    fromNumber?: string;
    toNumber?: string;
    platform?: string;
    meetingUrl?: string;
    meetingId?: string;
    duration?: number;
    outcome?: string;
    status?: string;
    scriptId?: string;
    notes?: string;
    recordingUrl?: string;
    transcription?: string;
    aiSummary?: string;
    voicemailTemplateId?: string;
    scheduledAt?: string;
    startedAt?: string;
    endedAt?: string;
  }) {
    const callLog = await this.callLogsService.create(req.user.tenantId, {
      ...body,
      userId: req.user.id,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      startedAt: body.startedAt ? new Date(body.startedAt) : undefined,
      endedAt: body.endedAt ? new Date(body.endedAt) : undefined,
    });
    return callLog;
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('type') type?: string,
    @Query('direction') direction?: string,
    @Query('contactId') contactId?: string,
    @Query('status') status?: string,
    @Query('tenantIds') tenantIds?: string,
  ) {
    // SuperAdmin can query multiple tenants
    if (req.user.isSuperAdmin && tenantIds) {
      const tenantIdArray = tenantIds.split(',');
      return this.callLogsService.findAllMultiTenant(tenantIdArray, {
        type,
        direction,
        contactId,
        status,
      });
    }
    return this.callLogsService.findAll(req.user.tenantId, {
      type,
      direction,
      contactId,
      status,
    });
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.callLogsService.findOne(req.user.tenantId, id);
  }

  @Get('contact/:contactId')
  async findByContact(@Request() req, @Param('contactId') contactId: string) {
    return this.callLogsService.findByContact(req.user.tenantId, contactId);
  }

  @Patch(':id')
  async update(@Request() req, @Param('id') id: string, @Body() body: {
    duration?: number;
    outcome?: string;
    status?: string;
    notes?: string;
    recordingUrl?: string;
    transcription?: string;
    aiSummary?: string;
    startedAt?: string;
    endedAt?: string;
  }) {
    await this.callLogsService.update(req.user.tenantId, id, {
      ...body,
      startedAt: body.startedAt ? new Date(body.startedAt) : undefined,
      endedAt: body.endedAt ? new Date(body.endedAt) : undefined,
    });
    return { success: true };
  }

  
  @Post(':id/transcribe')
  async transcribeRecording(
    @Request() req,
    @Param('id') id: string,
  ) {
    return this.callLogsService.transcribeRecording(req.user.tenantId, id);
  }

  @Post(':id/generate-summary')
  async generateSummary(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { transcript: string }
  ) {
    return this.callLogsService.generateSummary(req.user.tenantId, id, body.transcript);
  }

  @Post(':id/share-summary')
  async shareSummary(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { recipients: string[] }
  ) {
    return this.callLogsService.shareSummary(req.user.tenantId, id, body.recipients);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.callLogsService.remove(req.user.tenantId, id);
    return { success: true };
  }
}
