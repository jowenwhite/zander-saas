import { Controller, Get, Post, Patch, Delete, Body, Param, Request } from '@nestjs/common';
import { UsersService } from './users.service';

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

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.usersService.remove(id, req.tenantId, req.user.sub);
  }
}
