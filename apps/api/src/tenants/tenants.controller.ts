import { Controller, Get, Patch, Post, Body, Request, Param, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

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
    return { 
      success: true, 
      tenant,
      message: 'Switched to ' + tenant.companyName
    };
  }
}
