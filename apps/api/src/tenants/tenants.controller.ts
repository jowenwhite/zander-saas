import { Controller, Get, Patch, Body, Request } from '@nestjs/common';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('me')
  async getMyTenant(@Request() req) {
    return this.tenantsService.findOne(req.tenantId);
  }

  @Patch('me')
  async updateMyTenant(
    @Request() req,
    @Body() updateData: { companyName?: string; subdomain?: string }
  ) {
    return this.tenantsService.update(req.tenantId, updateData);
  }
}
