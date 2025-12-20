import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CalendarEventsService } from './calendar-events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('calendar-events')
@UseGuards(JwtAuthGuard)
export class CalendarEventsController {
  constructor(private readonly calendarEventsService: CalendarEventsService) {}

  @Post()
  async create(@Request() req, @Body() body: {
    title: string;
    description?: string;
    location?: string;
    meetingUrl?: string;
    meetingPlatform?: string;
    startTime: string;
    endTime: string;
    allDay?: boolean;
    timezone?: string;
    eventType?: string;
    category?: string;
    priority?: string;
    color?: string;
    willBeRecorded?: boolean;
    contactId?: string;
    dealId?: string;
    agenda?: string;
    attachments?: any;
    prepNotes?: string;
    status?: string;
    attendees?: { userId?: string; contactId?: string; email?: string; name?: string }[];
    reminders?: { type: string; timing: number }[];
  }) {
    return this.calendarEventsService.create(req.user.tenantId, req.user.id, {
      ...body,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
    });
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('eventType') eventType?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('contactId') contactId?: string,
  ) {
    return this.calendarEventsService.findAll(req.user.tenantId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      eventType,
      category,
      status,
      contactId,
    });
  }

  @Get('today')
  async findToday(@Request() req) {
    return this.calendarEventsService.findToday(req.user.tenantId);
  }

  @Get('upcoming')
  async findUpcoming(@Request() req, @Query('limit') limit?: string) {
    return this.calendarEventsService.findUpcoming(
      req.user.tenantId,
      limit ? parseInt(limit) : 10
    );
  }

  @Get('range')
  async findByDateRange(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.calendarEventsService.findByDateRange(
      req.user.tenantId,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('needs-disclosure')
  async getEventsNeedingDisclosure(@Request() req) {
    return this.calendarEventsService.getEventsNeedingDisclosure(req.user.tenantId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.calendarEventsService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  async update(@Request() req, @Param('id') id: string, @Body() body: {
    title?: string;
    description?: string;
    location?: string;
    meetingUrl?: string;
    meetingPlatform?: string;
    startTime?: string;
    endTime?: string;
    allDay?: boolean;
    eventType?: string;
    category?: string;
    priority?: string;
    color?: string;
    willBeRecorded?: boolean;
    recordingConsentStatus?: string;
    contactId?: string;
    dealId?: string;
    agenda?: string;
    attachments?: any;
    prepNotes?: string;
    status?: string;
  }) {
    return this.calendarEventsService.update(req.user.tenantId, id, {
      ...body,
      startTime: body.startTime ? new Date(body.startTime) : undefined,
      endTime: body.endTime ? new Date(body.endTime) : undefined,
    });
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.calendarEventsService.remove(req.user.tenantId, id);
    return { success: true };
  }

  // Attendee endpoints
  @Post(':id/attendees')
  async addAttendee(
    @Request() req,
    @Param('id') eventId: string,
    @Body() body: { userId?: string; contactId?: string; email?: string; name?: string }
  ) {
    return this.calendarEventsService.addAttendee(req.user.tenantId, eventId, body);
  }

  @Patch(':id/attendees/:attendeeId/response')
  async updateAttendeeResponse(
    @Param('id') eventId: string,
    @Param('attendeeId') attendeeId: string,
    @Body() body: { responseStatus: string }
  ) {
    return this.calendarEventsService.updateAttendeeResponse(eventId, attendeeId, body.responseStatus);
  }

  @Patch(':id/attendees/:attendeeId/recording-consent')
  async updateAttendeeRecordingConsent(
    @Param('id') eventId: string,
    @Param('attendeeId') attendeeId: string,
    @Body() body: { consented: boolean }
  ) {
    return this.calendarEventsService.updateAttendeeRecordingConsent(eventId, attendeeId, body.consented);
  }

  @Delete(':id/attendees/:attendeeId')
  async removeAttendee(
    @Param('id') eventId: string,
    @Param('attendeeId') attendeeId: string
  ) {
    await this.calendarEventsService.removeAttendee(eventId, attendeeId);
    return { success: true };
  }

  // Recording compliance endpoints
  @Post(':id/mark-disclosure-sent')
  async markDisclosureSent(@Request() req, @Param('id') eventId: string) {
    await this.calendarEventsService.markDisclosureSent(req.user.tenantId, eventId);
    return { success: true };
  }

  @Patch(':id/recording-consent')
  async updateRecordingConsent(
    @Request() req,
    @Param('id') eventId: string,
    @Body() body: { status: string }
  ) {
    await this.calendarEventsService.updateRecordingConsent(req.user.tenantId, eventId, body.status);
    return { success: true };
  }
}
