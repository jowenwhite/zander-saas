import { Controller, Post, Get, Patch, Delete, Param, Query, Headers, Body, UnauthorizedException, HttpCode, Request, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminService } from './admin.service';
import { Public } from '../auth/public.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private configService: ConfigService,
  ) {}

  /**
   * POST /admin/seed-marketing
   *
   * Seeds marketing data for 64 West Holdings tenant.
   * Protected by ADMIN_SECRET_KEY header check.
   *
   * Usage:
   *   curl -X POST https://api.zanderos.com/admin/seed-marketing \
   *     -H "x-admin-secret: YOUR_SECRET_KEY"
   */
  @Public()
  @Post('seed-marketing')
  @HttpCode(200)
  async seedMarketing(@Headers('x-admin-secret') secretKey: string) {
    const expectedSecret = this.configService.get<string>('ADMIN_SECRET_KEY');

    if (!expectedSecret) {
      throw new UnauthorizedException('Admin endpoint not configured');
    }

    if (!secretKey || secretKey !== expectedSecret) {
      throw new UnauthorizedException('Invalid admin secret key');
    }

    return this.adminService.seedMarketing();
  }

  /**
   * POST /admin/seed-knowledge
   *
   * Seeds initial knowledge base articles for the platform.
   * Protected by ADMIN_SECRET_KEY header check.
   *
   * Usage:
   *   curl -X POST https://api.zanderos.com/admin/seed-knowledge \
   *     -H "x-admin-secret: YOUR_SECRET_KEY"
   */
  @Public()
  @Post('seed-knowledge')
  @HttpCode(200)
  async seedKnowledge(@Headers('x-admin-secret') secretKey: string) {
    const expectedSecret = this.configService.get<string>('ADMIN_SECRET_KEY');

    if (!expectedSecret) {
      throw new UnauthorizedException('Admin endpoint not configured');
    }

    if (!secretKey || secretKey !== expectedSecret) {
      throw new UnauthorizedException('Invalid admin secret key');
    }

    return this.adminService.seedKnowledge();
  }

  /**
   * GET /admin/token-usage
   *
   * Get token usage statistics for AI executives.
   * Requires JWT authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Get('token-usage')
  async getTokenUsage(
    @Request() req: any,
    @Query('executive') executive?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.adminService.getTokenUsage(
      req.user.tenantId,
      executive,
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
  }

  /**
   * GET /admin/users
   *
   * Get all users across the tenant (for system admin view).
   * Requires JWT authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Get('users')
  async getUsers(@Request() req: any) {
    return this.adminService.getUsers(req.user.tenantId);
  }

  /**
   * POST /admin/tenants/:tenantId/reset-tokens
   *
   * Reset token usage for a tenant (admin operation).
   * Protected by ADMIN_SECRET_KEY header check.
   */
  @Public()
  @Post('tenants/:tenantId/reset-tokens')
  @HttpCode(200)
  async resetTenantTokens(
    @Param('tenantId') tenantId: string,
    @Headers('x-admin-secret') secretKey: string,
  ) {
    const expectedSecret = this.configService.get<string>('ADMIN_SECRET_KEY');

    if (!expectedSecret) {
      throw new UnauthorizedException('Admin endpoint not configured');
    }

    if (!secretKey || secretKey !== expectedSecret) {
      throw new UnauthorizedException('Invalid admin secret key');
    }

    return this.adminService.resetTenantTokens(tenantId);
  }

  /**
   * GET /admin/error-logs
   *
   * Get error logs for monitoring and debugging.
   * Requires JWT authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Get('error-logs')
  async getErrorLogs(
    @Request() req: any,
    @Query('level') level?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getErrorLogs(
      req.user.tenantId,
      level,
      limit ? parseInt(limit) : 50,
    );
  }

  /**
   * GET /admin/performance-metrics
   *
   * Get system performance metrics.
   * Requires JWT authentication.
   */
  @UseGuards(JwtAuthGuard)
  @Get('performance-metrics')
  async getPerformanceMetrics(@Request() req: any) {
    return this.adminService.getPerformanceMetrics(req.user.tenantId);
  }

  // ============================================
  // ZANDER PLATFORM MASTER - NEW ENDPOINTS
  // ============================================

  /**
   * GET /admin/revenue-summary
   * Revenue intelligence for Zander
   */
  @Public()
  @Get('revenue-summary')
  async getRevenueSummary(@Headers('x-admin-secret') secretKey: string) {
    this.validateAdminSecret(secretKey);
    return this.adminService.getRevenueSummary();
  }

  /**
   * GET /admin/churn-report
   * Churn analysis
   */
  @Public()
  @Get('churn-report')
  async getChurnReport(@Headers('x-admin-secret') secretKey: string) {
    this.validateAdminSecret(secretKey);
    return this.adminService.getChurnReport();
  }

  /**
   * GET /admin/cac-by-channel
   * Customer acquisition cost by channel
   */
  @Public()
  @Get('cac-by-channel')
  async getCACByChannel(@Headers('x-admin-secret') secretKey: string) {
    this.validateAdminSecret(secretKey);
    return this.adminService.getCACByChannel();
  }

  /**
   * GET /admin/founding-member-status
   * Founding member waitlist status
   */
  @Public()
  @Get('founding-member-status')
  async getFoundingMemberStatus(@Headers('x-admin-secret') secretKey: string) {
    this.validateAdminSecret(secretKey);
    return this.adminService.getFoundingMemberStatus();
  }

  /**
   * GET /admin/at-risk-accounts
   * At-risk tenant identification
   */
  @Public()
  @Get('at-risk-accounts')
  async getAtRiskAccounts(@Headers('x-admin-secret') secretKey: string) {
    this.validateAdminSecret(secretKey);
    return this.adminService.getAtRiskAccounts();
  }

  /**
   * GET /admin/power-users
   * High-engagement user identification
   */
  @Public()
  @Get('power-users')
  async getPowerUsers(@Headers('x-admin-secret') secretKey: string) {
    this.validateAdminSecret(secretKey);
    return this.adminService.getPowerUsers();
  }

  /**
   * GET /admin/account-health-summary
   * Overall account health metrics
   */
  @Public()
  @Get('account-health-summary')
  async getAccountHealthSummary(@Headers('x-admin-secret') secretKey: string) {
    this.validateAdminSecret(secretKey);
    return this.adminService.getAccountHealthSummary();
  }

  /**
   * GET /admin/tenant-activity/:tenantId
   * Per-tenant activity details
   */
  @Public()
  @Get('tenant-activity/:tenantId')
  async getTenantActivity(
    @Param('tenantId') tenantId: string,
    @Headers('x-admin-secret') secretKey: string,
  ) {
    this.validateAdminSecret(secretKey);
    return this.adminService.getTenantActivity(tenantId);
  }

  /**
   * GET /admin/morning-briefing
   * Daily executive briefing
   */
  @Public()
  @Get('morning-briefing')
  async getMorningBriefing(@Headers('x-admin-secret') secretKey: string) {
    this.validateAdminSecret(secretKey);
    return this.adminService.getMorningBriefing();
  }

  /**
   * GET /admin/build-queue
   * Build queue status
   */
  @Public()
  @Get('build-queue')
  async getBuildQueue(@Headers('x-admin-secret') secretKey: string) {
    this.validateAdminSecret(secretKey);
    return this.adminService.getBuildQueue();
  }

  /**
   * POST /admin/build-session
   * Create new build session
   */
  @Public()
  @Post('build-session')
  @HttpCode(200)
  async createBuildSession(
    @Headers('x-admin-secret') secretKey: string,
    @Body() data: {
      title: string;
      description?: string;
      priority?: string;
      target?: string;
      linkedHeadwindId?: string;
      linkedTicketId?: string;
      borisPrompt?: string;
      isParallel?: boolean;
      parallelGroup?: string;
    },
  ) {
    this.validateAdminSecret(secretKey);
    return this.adminService.createBuildSession(data);
  }

  /**
   * POST /admin/build-session/:id
   * Update build session
   */
  @Public()
  @Post('build-session/:id')
  @HttpCode(200)
  async updateBuildSession(
    @Param('id') id: string,
    @Headers('x-admin-secret') secretKey: string,
    @Body() data: {
      status?: string;
      version?: string;
      gitBranch?: string;
      gitCommitHash?: string;
      buildOutput?: string;
      errorLog?: string;
    },
  ) {
    this.validateAdminSecret(secretKey);
    return this.adminService.updateBuildSession(id, data);
  }

  /**
   * GET /admin/parallel-build-status/:parallelGroup
   * Parallel build group status
   */
  @Public()
  @Get('parallel-build-status/:parallelGroup')
  async getParallelBuildStatus(
    @Param('parallelGroup') parallelGroup: string,
    @Headers('x-admin-secret') secretKey: string,
  ) {
    this.validateAdminSecret(secretKey);
    return this.adminService.getParallelBuildStatus(parallelGroup);
  }

  /**
   * POST /admin/zander-action-log
   * Log a Zander action
   */
  @Public()
  @Post('zander-action-log')
  @HttpCode(200)
  async logZanderAction(
    @Headers('x-admin-secret') secretKey: string,
    @Body() data: {
      action: string;
      level: string;
      input?: any;
      output?: any;
      success: boolean;
      errorMessage?: string;
      tenantId?: string;
      targetUserId?: string;
      deploymentTarget?: string;
      deploymentVersion?: string;
      durationMs?: number;
    },
  ) {
    this.validateAdminSecret(secretKey);
    return this.adminService.logZanderAction(data);
  }

  /**
   * GET /admin/zander-action-log
   * Get Zander action log
   */
  @Public()
  @Get('zander-action-log')
  async getZanderActionLog(
    @Headers('x-admin-secret') secretKey: string,
    @Query('limit') limit?: string,
    @Query('level') level?: string,
    @Query('action') action?: string,
  ) {
    this.validateAdminSecret(secretKey);
    return this.adminService.getZanderActionLog(
      limit ? parseInt(limit) : 50,
      level,
      action,
    );
  }

  /**
   * GET /admin/system-config
   * Get system configuration
   */
  @Public()
  @Get('system-config')
  async getSystemConfig(
    @Headers('x-admin-secret') secretKey: string,
    @Query('key') key?: string,
    @Query('category') category?: string,
  ) {
    this.validateAdminSecret(secretKey);
    return this.adminService.getSystemConfig(key, category);
  }

  /**
   * POST /admin/system-config
   * Set system configuration
   */
  @Public()
  @Post('system-config')
  @HttpCode(200)
  async setSystemConfig(
    @Headers('x-admin-secret') secretKey: string,
    @Body() data: {
      key: string;
      value: any;
      category?: string;
      description?: string;
    },
  ) {
    this.validateAdminSecret(secretKey);
    return this.adminService.setSystemConfig(
      data.key,
      data.value,
      data.category,
      data.description,
    );
  }

  /**
   * GET /admin/waitlist-summary
   * Get waitlist summary
   */
  @Public()
  @Get('waitlist-summary')
  async getWaitlistSummary(@Headers('x-admin-secret') secretKey: string) {
    this.validateAdminSecret(secretKey);
    return this.adminService.getWaitlistSummary();
  }

  // ============================================
  // TENANT TIER MANAGEMENT ENDPOINTS
  // ============================================

  /**
   * GET /admin/tenants
   * List all tenants with their tier info
   */
  @Public()
  @Get('tenants')
  async listTenants(@Headers('x-admin-secret') secretKey: string) {
    this.validateAdminSecret(secretKey);
    return this.adminService.listTenants();
  }

  /**
   * GET /admin/tenants/:id/subscription
   * Get tenant subscription details
   */
  @Public()
  @Get('tenants/:id/subscription')
  async getTenantSubscription(
    @Param('id') tenantId: string,
    @Headers('x-admin-secret') secretKey: string,
  ) {
    this.validateAdminSecret(secretKey);
    return this.adminService.getTenantSubscription(tenantId);
  }

  /**
   * POST /admin/tenants/:id/tier-override
   * Set tier override for a tenant (grants access without payment)
   */
  @Public()
  @Post('tenants/:id/tier-override')
  @HttpCode(200)
  async setTierOverride(
    @Param('id') tenantId: string,
    @Headers('x-admin-secret') secretKey: string,
    @Body() data: { tier: string; note?: string },
  ) {
    this.validateAdminSecret(secretKey);
    return this.adminService.setTierOverride(tenantId, data.tier, data.note);
  }

  /**
   * DELETE /admin/tenants/:id/tier-override
   * Remove tier override for a tenant
   */
  @Public()
  @Delete('tenants/:id/tier-override')
  async removeTierOverride(
    @Param('id') tenantId: string,
    @Headers('x-admin-secret') secretKey: string,
  ) {
    this.validateAdminSecret(secretKey);
    return this.adminService.removeTierOverride(tenantId);
  }

  /**
   * POST /admin/tenants/:id/trial
   * Start a trial for a tenant
   */
  @Public()
  @Post('tenants/:id/trial')
  @HttpCode(200)
  async startTrial(
    @Param('id') tenantId: string,
    @Headers('x-admin-secret') secretKey: string,
    @Body() data: { tier: string; durationDays: number },
  ) {
    this.validateAdminSecret(secretKey);
    return this.adminService.startTrial(tenantId, data.tier, data.durationDays);
  }

  /**
   * DELETE /admin/tenants/:id/trial
   * End a trial for a tenant
   */
  @Public()
  @Delete('tenants/:id/trial')
  async endTrial(
    @Param('id') tenantId: string,
    @Headers('x-admin-secret') secretKey: string,
  ) {
    this.validateAdminSecret(secretKey);
    return this.adminService.endTrial(tenantId);
  }

  /**
   * PATCH /admin/tenants/:id/subscription-tier
   * Update subscription tier directly (for manual adjustments)
   */
  @Public()
  @Patch('tenants/:id/subscription-tier')
  async updateSubscriptionTier(
    @Param('id') tenantId: string,
    @Headers('x-admin-secret') secretKey: string,
    @Body() data: { tier: string },
  ) {
    this.validateAdminSecret(secretKey);
    return this.adminService.updateSubscriptionTier(tenantId, data.tier);
  }

  // ============================================
  // PHASE 2: TENANT MANAGEMENT ENDPOINTS
  // ============================================

  /**
   * POST /admin/tenants/:id/rename
   * Rename a tenant (update companyName)
   */
  @Public()
  @Post('tenants/:id/rename')
  @HttpCode(200)
  async renameTenant(
    @Param('id') tenantId: string,
    @Headers('x-admin-secret') secretKey: string,
    @Body() data: { newName: string },
  ) {
    this.validateAdminSecret(secretKey);
    return this.adminService.renameTenant(tenantId, data.newName);
  }

  /**
   * POST /admin/tenants/:id/archive
   * Archive a tenant (soft delete)
   */
  @Public()
  @Post('tenants/:id/archive')
  @HttpCode(200)
  async archiveTenant(
    @Param('id') tenantId: string,
    @Headers('x-admin-secret') secretKey: string,
  ) {
    this.validateAdminSecret(secretKey);
    return this.adminService.archiveTenant(tenantId);
  }

  /**
   * POST /admin/tenants/:id/restore
   * Restore an archived tenant
   */
  @Public()
  @Post('tenants/:id/restore')
  @HttpCode(200)
  async restoreTenant(
    @Param('id') tenantId: string,
    @Headers('x-admin-secret') secretKey: string,
  ) {
    this.validateAdminSecret(secretKey);
    return this.adminService.restoreTenant(tenantId);
  }

  /**
   * POST /admin/tenants/:id/trial/extend
   * Extend an existing trial by additional days
   */
  @Public()
  @Post('tenants/:id/trial/extend')
  @HttpCode(200)
  async extendTrial(
    @Param('id') tenantId: string,
    @Headers('x-admin-secret') secretKey: string,
    @Body() data: { additionalDays: number },
  ) {
    this.validateAdminSecret(secretKey);
    return this.adminService.extendTrial(tenantId, data.additionalDays);
  }

  /**
   * GET /admin/users/segments
   * Get users by segment (churning, at_risk, power_users, new, inactive)
   */
  @Public()
  @Get('users/segments')
  async getUsersBySegment(
    @Headers('x-admin-secret') secretKey: string,
    @Query('segment') segment: string,
  ) {
    this.validateAdminSecret(secretKey);
    if (!segment) {
      return { success: false, error: 'segment query parameter is required' };
    }
    return this.adminService.getUsersBySegment(segment);
  }

  // ============================================
  // SYSTEM HEALTH MONITORING ENDPOINTS
  // ============================================

  /**
   * GET /admin/health/system
   * Real-time system health check with actual service pings
   */
  @Public()
  @Get('health/system')
  async getSystemHealth(@Headers('x-admin-secret') secretKey: string) {
    this.validateAdminSecret(secretKey);
    return this.adminService.getSystemHealth();
  }

  /**
   * GET /admin/health/history
   * Historical health snapshots for charts
   */
  @Public()
  @Get('health/history')
  async getSystemHealthHistory(
    @Headers('x-admin-secret') secretKey: string,
    @Query('hours') hours?: string,
  ) {
    this.validateAdminSecret(secretKey);
    return this.adminService.getSystemHealthHistory(
      hours ? parseInt(hours) : 24,
    );
  }

  /**
   * Helper to validate admin secret key
   */
  private validateAdminSecret(secretKey: string) {
    const expectedSecret = this.configService.get<string>('ADMIN_SECRET_KEY');
    if (!expectedSecret) {
      throw new UnauthorizedException('Admin endpoint not configured');
    }
    if (!secretKey || secretKey !== expectedSecret) {
      throw new UnauthorizedException('Invalid admin secret key');
    }
  }
}
