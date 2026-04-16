import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ConsultingService } from './consulting.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateEngagementDto, UpdateEngagementDto } from './dto/create-engagement.dto';
import { CreateTimeEntryDto, UpdateTimeEntryDto } from './dto/create-time-entry.dto';
import { CreateDeliverableDto, UpdateDeliverableDto } from './dto/create-deliverable.dto';
import { CreateIntakeDto, UpdateIntakeDto } from './dto/create-intake.dto';

@Controller('consulting')
@UseGuards(JwtAuthGuard)
export class ConsultingController {
  constructor(private readonly consultingService: ConsultingService) {}

  // ============================================
  // ENGAGEMENTS
  // ============================================

  /**
   * Create a new engagement (superadmin only)
   */
  @Post('engagements')
  async createEngagement(
    @Request() req: any,
    @Body() dto: CreateEngagementDto,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can create engagements');
    }
    return this.consultingService.createEngagement(dto);
  }

  /**
   * List engagements
   * Superadmin: sees all or can filter by tenantId
   * Regular user: sees only their tenant's engagements
   */
  @Get('engagements')
  async listEngagements(
    @Request() req: any,
    @Query('tenantId') queryTenantId?: string,
  ) {
    if (req.user.isSuperAdmin) {
      // Superadmin can see all or filter by tenant
      return this.consultingService.listEngagements(queryTenantId);
    }
    // Regular users only see their own tenant
    return this.consultingService.listEngagements(req.user.tenantId);
  }

  /**
   * Get a specific engagement
   */
  @Get('engagements/:id')
  async getEngagement(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    if (req.user.isSuperAdmin) {
      return this.consultingService.getEngagement(id);
    }
    // Regular users can only see their own tenant's engagements
    return this.consultingService.getEngagement(id, req.user.tenantId);
  }

  /**
   * Update an engagement (superadmin only)
   */
  @Patch('engagements/:id')
  async updateEngagement(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateEngagementDto,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can update engagements');
    }
    return this.consultingService.updateEngagement(id, dto);
  }

  // ============================================
  // TIME ENTRIES
  // ============================================

  /**
   * Create a time entry (superadmin only)
   */
  @Post('time-entries')
  async createTimeEntry(
    @Request() req: any,
    @Body() dto: CreateTimeEntryDto,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can create time entries');
    }
    return this.consultingService.createTimeEntry(dto);
  }

  /**
   * List time entries
   * Superadmin: sees all or can filter
   * Regular user: sees only their tenant's entries
   */
  @Get('time-entries')
  async listTimeEntries(
    @Request() req: any,
    @Query('tenantId') queryTenantId?: string,
    @Query('engagementId') engagementId?: string,
  ) {
    if (req.user.isSuperAdmin) {
      return this.consultingService.listTimeEntries(queryTenantId, engagementId);
    }
    return this.consultingService.listTimeEntries(req.user.tenantId, engagementId);
  }

  /**
   * Update a time entry (superadmin only)
   */
  @Patch('time-entries/:id')
  async updateTimeEntry(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTimeEntryDto,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can update time entries');
    }
    return this.consultingService.updateTimeEntry(id, dto);
  }

  /**
   * Get time entry summary/analytics
   */
  @Get('time-entries/summary')
  async getTimeEntrySummary(
    @Request() req: any,
    @Query('tenantId') queryTenantId?: string,
    @Query('engagementId') engagementId?: string,
  ) {
    if (req.user.isSuperAdmin) {
      return this.consultingService.getTimeEntrySummary(queryTenantId, engagementId);
    }
    return this.consultingService.getTimeEntrySummary(req.user.tenantId, engagementId);
  }

  // ============================================
  // DELIVERABLES
  // ============================================

  /**
   * Create a deliverable (superadmin only)
   */
  @Post('deliverables')
  async createDeliverable(
    @Request() req: any,
    @Body() dto: CreateDeliverableDto,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can create deliverables');
    }
    return this.consultingService.createDeliverable(dto);
  }

  /**
   * List deliverables
   */
  @Get('deliverables')
  async listDeliverables(
    @Request() req: any,
    @Query('tenantId') queryTenantId?: string,
    @Query('engagementId') engagementId?: string,
  ) {
    if (req.user.isSuperAdmin) {
      return this.consultingService.listDeliverables(queryTenantId, engagementId);
    }
    return this.consultingService.listDeliverables(req.user.tenantId, engagementId);
  }

  /**
   * Get a specific deliverable
   */
  @Get('deliverables/:id')
  async getDeliverable(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    if (req.user.isSuperAdmin) {
      return this.consultingService.getDeliverable(id);
    }
    return this.consultingService.getDeliverable(id, req.user.tenantId);
  }

  /**
   * Update a deliverable (superadmin only)
   */
  @Patch('deliverables/:id')
  async updateDeliverable(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDeliverableDto,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can update deliverables');
    }
    return this.consultingService.updateDeliverable(id, dto);
  }

  // ============================================
  // INTAKES
  // ============================================

  /**
   * Create an intake survey submission
   * Can be submitted by authenticated users (for their own tenant)
   */
  @Post('intakes')
  async createIntake(
    @Request() req: any,
    @Body() dto: CreateIntakeDto,
  ) {
    // Users can only create intakes for their own tenant unless superadmin
    if (!req.user.isSuperAdmin && dto.tenantId !== req.user.tenantId) {
      throw new ForbiddenException('Cannot create intake for another tenant');
    }
    return this.consultingService.createIntake(dto, req.user.id);
  }

  /**
   * List intakes
   * Superadmin: sees all or can filter
   * Regular user: sees only their tenant's intakes
   */
  @Get('intakes')
  async listIntakes(
    @Request() req: any,
    @Query('tenantId') queryTenantId?: string,
    @Query('status') status?: string,
  ) {
    if (req.user.isSuperAdmin) {
      return this.consultingService.listIntakes(queryTenantId, status);
    }
    return this.consultingService.listIntakes(req.user.tenantId, status);
  }

  /**
   * Get a specific intake
   */
  @Get('intakes/:id')
  async getIntake(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    if (req.user.isSuperAdmin) {
      return this.consultingService.getIntake(id);
    }
    return this.consultingService.getIntake(id, req.user.tenantId);
  }

  /**
   * Update an intake (superadmin only for status changes)
   */
  @Patch('intakes/:id')
  async updateIntake(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateIntakeDto,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can update intakes');
    }
    return this.consultingService.updateIntake(id, dto, req.user.id);
  }

  /**
   * Convert an intake to an engagement (superadmin only)
   */
  @Post('intakes/:id/convert')
  async convertIntakeToEngagement(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { packageType: string; startDate: string; totalHours: number },
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can convert intakes');
    }
    return this.consultingService.convertIntakeToEngagement(
      id,
      body.packageType,
      body.startDate,
      body.totalHours,
      req.user.id,
    );
  }

  // ============================================
  // OVERVIEW / DASHBOARD
  // ============================================

  /**
   * Get consulting overview/dashboard data
   */
  @Get('overview')
  async getOverview(
    @Request() req: any,
    @Query('tenantId') queryTenantId?: string,
  ) {
    if (req.user.isSuperAdmin) {
      return this.consultingService.getConsultingOverview(queryTenantId);
    }
    return this.consultingService.getConsultingOverview(req.user.tenantId);
  }
}
