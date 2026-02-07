import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { FormsService } from './forms.service';
import { Public } from '../auth/public.decorator';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @SkipThrottle()
  @Get()
  async findAll(@Request() req) {
    return this.formsService.findAll(req.tenantId);
  }

  @SkipThrottle()
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.formsService.findOne(id, req.tenantId);
  }

  @SkipThrottle()
  @Post()
  async create(
    @Request() req,
    @Body() createData: {
      name: string;
      description?: string;
      fields?: any[];
      settings?: any;
    }
  ) {
    return this.formsService.create(req.tenantId, createData);
  }

  @SkipThrottle()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateData: {
      name?: string;
      description?: string;
      fields?: any[];
      settings?: any;
      status?: string;
    }
  ) {
    return this.formsService.update(id, req.tenantId, updateData);
  }

  @SkipThrottle()
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.formsService.remove(id, req.tenantId);
  }

  @SkipThrottle()
  @Get(':id/submissions')
  async getSubmissions(@Param('id') id: string, @Request() req) {
    return this.formsService.getSubmissions(id, req.tenantId);
  }

  // Public endpoint for form submissions (no auth required)
  // RATE LIMITED: 3 submissions per minute per IP to prevent spam
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post(':id/submit')
  async submitForm(@Param('id') id: string, @Body() data: any) {
    return this.formsService.createSubmission(id, data);
  }

  // Get or create submission for an attached form (calendar event)
  @SkipThrottle()
  @Post(':id/event-submission')
  async getOrCreateEventSubmission(
    @Param('id') formId: string,
    @Request() req,
    @Body() body: {
      calendarEventId: string;
      contactId?: string;
    }
  ) {
    return this.formsService.getOrCreateEventSubmission(
      formId,
      body.calendarEventId,
      req.tenantId,
      body.contactId,
      req.user?.id
    );
  }

  // Get a specific submission
  @SkipThrottle()
  @Get('submissions/:submissionId')
  async getSubmission(@Param('submissionId') submissionId: string) {
    return this.formsService.getSubmission(submissionId);
  }

  // Auto-save draft
  @SkipThrottle()
  @Patch('submissions/:submissionId/draft')
  async saveSubmissionDraft(
    @Param('submissionId') submissionId: string,
    @Request() req,
    @Body() body: { data: any }
  ) {
    return this.formsService.saveSubmissionDraft(
      submissionId,
      body.data,
      req.user?.id
    );
  }

  // Submit/complete a submission
  @SkipThrottle()
  @Patch('submissions/:submissionId/submit')
  async submitSubmission(
    @Param('submissionId') submissionId: string,
    @Request() req,
    @Body() body: { data: any }
  ) {
    return this.formsService.submitSubmission(
      submissionId,
      body.data,
      req.user?.id
    );
  }

  // Get submission by calendar event
  @SkipThrottle()
  @Get(':id/event/:eventId')
  async getSubmissionByEventId(
    @Param('id') formId: string,
    @Param('eventId') eventId: string
  ) {
    return this.formsService.getSubmissionByEventId(formId, eventId);
  }

  // Get all submissions for a calendar event
  @SkipThrottle()
  @Get('event/:eventId/submissions')
  async getSubmissionsByEventId(@Param('eventId') eventId: string) {
    return this.formsService.getSubmissionsByEventId(eventId);
  }
}
