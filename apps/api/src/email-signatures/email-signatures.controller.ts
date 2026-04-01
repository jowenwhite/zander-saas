import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TierGuard } from '../common/guards/tier.guard';
import { RequireTier } from '../common/decorators/require-tier.decorator';
import { EmailSignaturesService } from './email-signatures.service';
import { CreateEmailSignatureDto } from './dto/create-email-signature.dto';
import { UpdateEmailSignatureDto } from './dto/update-email-signature.dto';

@Controller('email-signatures')
@UseGuards(JwtAuthGuard, TierGuard)
@RequireTier('STARTER')
export class EmailSignaturesController {
  constructor(private readonly emailSignaturesService: EmailSignaturesService) {}

  @Get()
  async findAll(@Request() req) {
    return this.emailSignaturesService.findAll(req.user.id, req.tenantId);
  }

  @Get('default')
  async getDefault(@Request() req) {
    return this.emailSignaturesService.getDefault(req.user.id, req.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.emailSignaturesService.findOne(id, req.user.id, req.tenantId);
  }

  @Post()
  async create(@Request() req, @Body() createDto: CreateEmailSignatureDto) {
    return this.emailSignaturesService.create(req.user.id, req.tenantId, createDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateDto: UpdateEmailSignatureDto
  ) {
    return this.emailSignaturesService.update(id, req.user.id, req.tenantId, updateDto);
  }

  @Post(':id/set-default')
  async setDefault(@Param('id') id: string, @Request() req) {
    return this.emailSignaturesService.setDefault(id, req.user.id, req.tenantId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.emailSignaturesService.remove(id, req.user.id, req.tenantId);
  }
}
