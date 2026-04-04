import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CreateEmailTemplateDto, UpdateEmailTemplateDto, SendTemplateDto,
  CreateEmailSequenceDto, UpdateEmailSequenceDto, CreateSequenceStepDto, UpdateSequenceStepDto, EnrollContactSequenceDto,
  CreateScheduledCommunicationDto, UpdateScheduledCommunicationDto
} from './dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  // ============ EMAIL TEMPLATES ============
  
  @Get('templates')
  getTemplates(@Req() req: any) {
    return this.automationService.getTemplates(req.tenantId);
  }

  @Get('templates/:id')
  getTemplate(@Req() req: any, @Param('id') id: string) {
    return this.automationService.getTemplate(req.tenantId, id);
  }

  // MEDIUM-1: Input validation via CreateEmailTemplateDto
  @Post('templates')
  createTemplate(@Req() req: any, @Body() body: CreateEmailTemplateDto) {
    return this.automationService.createTemplate(req.tenantId, body);
  }

  // MEDIUM-1: Input validation via UpdateEmailTemplateDto
  @Patch('templates/:id')
  updateTemplate(@Req() req: any, @Param('id') id: string, @Body() body: UpdateEmailTemplateDto) {
    return this.automationService.updateTemplate(req.tenantId, id, body);
  }

  // HIGH-4: Admin/Owner only - deletion is destructive
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Delete('templates/:id')
  deleteTemplate(@Req() req: any, @Param('id') id: string) {
    return this.automationService.deleteTemplate(req.tenantId, id);
  }

  // ============ EMAIL SEQUENCES ============
  
  @Get('sequences')
  getSequences(@Req() req: any) {
    return this.automationService.getSequences(req.tenantId);
  }

  @Get('sequences/:id')
  getSequence(@Req() req: any, @Param('id') id: string) {
    return this.automationService.getSequence(req.tenantId, id);
  }

  // MEDIUM-1: Input validation via CreateEmailSequenceDto
  @Post('sequences')
  createSequence(@Req() req: any, @Body() body: CreateEmailSequenceDto) {
    return this.automationService.createSequence(req.tenantId, body);
  }

  // MEDIUM-1: Input validation via UpdateEmailSequenceDto
  @Patch('sequences/:id')
  updateSequence(@Req() req: any, @Param('id') id: string, @Body() body: UpdateEmailSequenceDto) {
    return this.automationService.updateSequence(req.tenantId, id, body);
  }

  // HIGH-4: Admin/Owner only - deletion is destructive
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Delete('sequences/:id')
  deleteSequence(@Req() req: any, @Param('id') id: string) {
    return this.automationService.deleteSequence(req.tenantId, id);
  }

  // ============ SEQUENCE STEPS ============

  // MEDIUM-1: Input validation via CreateSequenceStepDto
  @Post('sequences/:id/steps')
  addSequenceStep(@Req() req: any, @Param('id') sequenceId: string, @Body() body: CreateSequenceStepDto) {
    return this.automationService.addSequenceStep(req.tenantId, sequenceId, body);
  }

  // MEDIUM-1: Input validation via UpdateSequenceStepDto
  @Patch('sequence-steps/:id')
  updateSequenceStep(@Req() req: any, @Param('id') stepId: string, @Body() body: UpdateSequenceStepDto) {
    return this.automationService.updateSequenceStep(req.tenantId, stepId, body);
  }

  // HIGH-4: Admin/Owner only - deletion is destructive
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Delete('sequence-steps/:id')
  deleteSequenceStep(@Req() req: any, @Param('id') stepId: string) {
    return this.automationService.deleteSequenceStep(req.tenantId, stepId);
  }

  // ============ SCHEDULED COMMUNICATIONS ============
  
  @Get('scheduled-communications')
  getScheduledCommunications(@Req() req: any, @Query('status') status?: string) {
    return this.automationService.getScheduledCommunications(req.tenantId, status);
  }

  // MEDIUM-1: Input validation via CreateScheduledCommunicationDto
  @Post('scheduled-communications')
  createScheduledCommunication(@Req() req: any, @Body() body: CreateScheduledCommunicationDto) {
    return this.automationService.createScheduledCommunication(req.tenantId, body);
  }

  // MEDIUM-1: Input validation via UpdateScheduledCommunicationDto
  @Patch('scheduled-communications/:id')
  updateScheduledCommunication(@Req() req: any, @Param('id') id: string, @Body() body: UpdateScheduledCommunicationDto) {
    return this.automationService.updateScheduledCommunication(req.tenantId, id, body);
  }

  @Post('scheduled-communications/:id/approve')
  approveScheduledCommunication(@Req() req: any, @Param('id') id: string) {
    return this.automationService.approveScheduledCommunication(req.tenantId, id);
  }

  @Post('scheduled-communications/:id/cancel')
  cancelScheduledCommunication(@Req() req: any, @Param('id') id: string) {
    return this.automationService.cancelScheduledCommunication(req.tenantId, id);
  }

  // ============ SEQUENCE ENROLLMENTS ============

  // MEDIUM-1: Input validation via EnrollContactSequenceDto
  @Post('sequences/:id/enroll')
  enrollContact(@Req() req: any, @Param('id') sequenceId: string, @Body() body: EnrollContactSequenceDto) {
    return this.automationService.enrollContact(req.tenantId, sequenceId, body.contactId, body.dealId);
  }

  @Post('enrollments/:id/unenroll')
  unenrollContact(@Req() req: any, @Param('id') enrollmentId: string) {
    return this.automationService.unenrollContact(req.tenantId, enrollmentId);
  }

  // ============ EMAIL SENDING ============

  // MEDIUM-1: Input validation via SendTemplateDto
  @Post('templates/:id/send')
  sendTemplateToContact(@Req() req: any, @Param('id') templateId: string, @Body() body: SendTemplateDto) {
    return this.automationService.sendTemplateToContact(
      req.tenantId,
      templateId,
      body.contactId,
      body.dealId,
    );
  }

  @Post('scheduled-communications/:id/send')
  sendScheduledCommunication(@Req() req: any, @Param('id') id: string) {
    return this.automationService.sendScheduledCommunication(req.tenantId, id);
  }

  @Post('enrollments/:id/process-step')
  processSequenceStep(@Req() req: any, @Param('id') enrollmentId: string) {
    return this.automationService.processSequenceStep(req.tenantId, enrollmentId);
  }
}
