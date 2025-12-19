import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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

  @Post('templates')
  createTemplate(@Req() req: any, @Body() body: any) {
    return this.automationService.createTemplate(req.tenantId, body);
  }

  @Patch('templates/:id')
  updateTemplate(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.automationService.updateTemplate(req.tenantId, id, body);
  }

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

  @Post('sequences')
  createSequence(@Req() req: any, @Body() body: any) {
    return this.automationService.createSequence(req.tenantId, body);
  }

  @Patch('sequences/:id')
  updateSequence(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.automationService.updateSequence(req.tenantId, id, body);
  }

  @Delete('sequences/:id')
  deleteSequence(@Req() req: any, @Param('id') id: string) {
    return this.automationService.deleteSequence(req.tenantId, id);
  }

  // ============ SEQUENCE STEPS ============
  
  @Post('sequences/:id/steps')
  addSequenceStep(@Req() req: any, @Param('id') sequenceId: string, @Body() body: any) {
    return this.automationService.addSequenceStep(req.tenantId, sequenceId, body);
  }

  @Patch('sequence-steps/:id')
  updateSequenceStep(@Req() req: any, @Param('id') stepId: string, @Body() body: any) {
    return this.automationService.updateSequenceStep(req.tenantId, stepId, body);
  }

  @Delete('sequence-steps/:id')
  deleteSequenceStep(@Req() req: any, @Param('id') stepId: string) {
    return this.automationService.deleteSequenceStep(req.tenantId, stepId);
  }

  // ============ SCHEDULED COMMUNICATIONS ============
  
  @Get('scheduled-communications')
  getScheduledCommunications(@Req() req: any, @Query('status') status?: string) {
    return this.automationService.getScheduledCommunications(req.tenantId, status);
  }

  @Post('scheduled-communications')
  createScheduledCommunication(@Req() req: any, @Body() body: any) {
    return this.automationService.createScheduledCommunication(req.tenantId, body);
  }

  @Patch('scheduled-communications/:id')
  updateScheduledCommunication(@Req() req: any, @Param('id') id: string, @Body() body: any) {
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
  
  @Post('sequences/:id/enroll')
  enrollContact(@Req() req: any, @Param('id') sequenceId: string, @Body() body: any) {
    return this.automationService.enrollContact(req.tenantId, sequenceId, body.contactId, body.dealId);
  }

  @Post('enrollments/:id/unenroll')
  unenrollContact(@Req() req: any, @Param('id') enrollmentId: string) {
    return this.automationService.unenrollContact(req.tenantId, enrollmentId);
  }

  // ============ EMAIL SENDING ============
  
  @Post('templates/:id/send')
  sendTemplateToContact(
    @Req() req: any,
    @Param('id') templateId: string,
    @Body() body: { contactId: string; dealId?: string }
  ) {
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
