import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseInterceptors,
  UseGuards,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MeetingIntelligenceService } from './meeting-intelligence.service';
import {
  UploadMeetingDto,
  CreateFromUrlDto,
  UpdateMeetingDto,
  ShareMeetingSummaryDto,
} from './meeting-intelligence.dto';

@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingIntelligenceController {
  constructor(private readonly meetingService: MeetingIntelligenceService) {}

  /**
   * POST /meetings/upload
   * Upload a meeting recording file
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 500 * 1024 * 1024, // 500MB max for recordings
      },
    }),
  )
  async uploadMeeting(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadMeetingDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    const allowedTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/x-wav',
      'audio/m4a',
      'audio/x-m4a',
      'video/mp4',
      'video/webm',
      'audio/webm',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
      );
    }

    // Parse attendees if provided as JSON string
    let attendees: any[] | undefined;
    if (body.attendees) {
      try {
        attendees = JSON.parse(body.attendees);
      } catch {
        throw new BadRequestException('Invalid attendees JSON');
      }
    }

    return this.meetingService.createFromUpload(req.user.tenantId, req.user.id, file, {
      title: body.title,
      platform: body.platform,
      attendees,
      engagementId: body.engagementId,
      leadId: body.leadId,
      contactId: body.contactId,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      calendarEventId: body.calendarEventId,
    });
  }

  /**
   * POST /meetings/from-url
   * Create meeting record from external recording URL
   */
  @Post('from-url')
  async createFromUrl(@Request() req, @Body() body: CreateFromUrlDto) {
    let attendees: any[] | undefined;
    if (body.attendees) {
      try {
        attendees = JSON.parse(body.attendees);
      } catch {
        throw new BadRequestException('Invalid attendees JSON');
      }
    }

    return this.meetingService.createFromUrl(req.user.tenantId, req.user.id, {
      recordingUrl: body.recordingUrl,
      title: body.title,
      source: 'external',
      platform: body.platform,
      attendees,
      engagementId: body.engagementId,
      leadId: body.leadId,
      contactId: body.contactId,
    });
  }

  /**
   * POST /meetings/process/:id
   * Manually trigger processing on an existing record
   */
  @Post('process/:id')
  async processRecording(@Request() req, @Param('id') id: string) {
    // Verify ownership first
    const meeting = await this.meetingService.findOne(req.user.tenantId, id);
    if (!meeting) {
      throw new BadRequestException('Meeting not found');
    }

    // Trigger processing asynchronously
    this.meetingService.processRecording(id).catch((err) => {
      console.error(`Processing failed for meeting ${id}:`, err);
    });

    return { success: true, message: 'Processing started', meetingId: id };
  }

  /**
   * GET /meetings
   * List meetings for tenant
   */
  @Get()
  async findAll(
    @Request() req,
    @Query('engagementId') engagementId?: string,
    @Query('leadId') leadId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.meetingService.findAll(req.user.tenantId, {
      engagementId,
      leadId,
      dateFrom,
      dateTo,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  /**
   * GET /meetings/:id
   * Get single meeting with full details
   */
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.meetingService.findOne(req.user.tenantId, id);
  }

  /**
   * GET /meetings/:id/summary
   * Get just the summary (lighter payload for executive tools)
   */
  @Get(':id/summary')
  async getSummary(@Request() req, @Param('id') id: string) {
    return this.meetingService.getSummary(req.user.tenantId, id);
  }

  /**
   * PATCH /meetings/:id
   * Update meeting metadata
   */
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() body: UpdateMeetingDto,
  ) {
    let attendees: any[] | undefined;
    if (body.attendees) {
      try {
        attendees = JSON.parse(body.attendees);
      } catch {
        throw new BadRequestException('Invalid attendees JSON');
      }
    }

    return this.meetingService.update(req.user.tenantId, id, {
      title: body.title,
      attendees,
      engagementId: body.engagementId,
      leadId: body.leadId,
      contactId: body.contactId,
      platform: body.platform,
    });
  }

  /**
   * POST /meetings/:id/share
   * Email summary to specified recipients
   */
  @Post(':id/share')
  async shareSummary(
    @Request() req,
    @Param('id') id: string,
    @Body() body: ShareMeetingSummaryDto,
  ) {
    return this.meetingService.emailMeetingSummary(
      req.user.tenantId,
      id,
      body.recipients,
    );
  }

  /**
   * DELETE /meetings/:id
   * Delete a meeting and its recording
   */
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.meetingService.remove(req.user.tenantId, id);
    return { success: true };
  }
}
