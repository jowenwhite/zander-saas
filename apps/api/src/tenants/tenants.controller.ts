import { Controller, Get, Patch, Post, Body, Request, Param, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly authService: AuthService
  ) {}

  @Get('me')
  async getMyTenant(@Request() req) {
    return this.tenantsService.findOne(req.user.tenantId);
  }

  @Patch('me')
  async updateMyTenant(
    @Request() req,
    @Body() updateData: { companyName?: string; subdomain?: string }
  ) {
    return this.tenantsService.update(req.user.tenantId, updateData);
  }

  @Get('accessible')
  async getAccessibleTenants(@Request() req) {
    return this.tenantsService.getAccessibleTenants(
      req.user.sub,
      req.user.isSuperAdmin || false
    );
  }

  @Post('switch/:tenantId')
  async switchTenant(@Request() req, @Param('tenantId') tenantId: string) {
    const tenant = await this.tenantsService.switchTenant(
      req.user.sub,
      tenantId,
      req.user.isSuperAdmin || false
    );
    // Generate new token with updated tenantId
    const token = this.authService.generateTokenForTenant(
      { id: req.user.sub, email: req.user.email, isSuperAdmin: req.user.isSuperAdmin },
      tenantId
    );
    return {
      success: true,
      tenant,
      token,
      message: 'Switched to ' + tenant.companyName
    };
  }
}
