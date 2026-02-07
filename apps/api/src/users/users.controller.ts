import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Request() req) {
    return this.usersService.findAllByTenant(req.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.usersService.findOne(id, req.tenantId);
  }

  // HIGH-4: Admin/Owner only - user creation is privileged
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Post('invite')
  async invite(
    @Request() req,
    @Body() inviteData: {
      email: string;
      firstName: string;
      lastName: string;
      role?: string;
    }
  ) {
    return this.usersService.invite(req.tenantId, inviteData);
  }

  // HIGH-4: Admin/Owner only - user updates including role changes
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateData: {
      firstName?: string;
      lastName?: string;
      role?: string;
      phone?: string;
    }
  ) {
    return this.usersService.update(id, req.tenantId, updateData);
  }

  // HIGH-4: Admin/Owner only - user deletion is critical
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.usersService.remove(id, req.tenantId, req.user.sub);
  }

  // ==================== ONBOARDING ENDPOINTS ====================

  @Get('onboarding/status')
  async getOnboardingStatus(@Request() req) {
    return this.usersService.getOnboardingStatus(req.user.sub);
  }

  @Patch('onboarding/step')
  async updateOnboardingStep(
    @Request() req,
    @Body() data: { step: number }
  ) {
    return this.usersService.updateOnboardingStep(req.user.sub, data.step);
  }

  @Patch('onboarding/focus-area')
  async setOnboardingFocusArea(
    @Request() req,
    @Body() data: { focusArea: string }
  ) {
    return this.usersService.setOnboardingFocusArea(req.user.sub, data.focusArea);
  }

  @Patch('onboarding/checklist')
  async updateOnboardingChecklist(
    @Request() req,
    @Body() data: { checklist: Record<string, boolean> }
  ) {
    return this.usersService.updateOnboardingChecklist(req.user.sub, data.checklist);
  }

  @Post('onboarding/complete')
  async completeOnboarding(@Request() req) {
    return this.usersService.completeOnboarding(req.user.sub);
  }

  @Post('onboarding/first-login')
  async recordFirstLogin(@Request() req) {
    return this.usersService.recordFirstLogin(req.user.sub);
  }
}