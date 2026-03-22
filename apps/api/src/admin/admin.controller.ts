import { Controller, Post, Get, Param, Query, Headers, UnauthorizedException, HttpCode, Request, UseGuards } from '@nestjs/common';
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
}
