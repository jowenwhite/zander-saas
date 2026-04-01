import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TierGuard } from '../../common/guards/tier.guard';
import { RequireTier } from '../../common/decorators/require-tier.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PersonasService } from './personas.service';
import { CreatePersonaDto } from './dto/create-persona.dto';

@Controller('cmo/personas')
@UseGuards(JwtAuthGuard, TierGuard)
@RequireTier('BUSINESS')
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  @Get()
  async findAll(@Request() req) {
    return this.personasService.findAll(req.tenantId);
  }

  @Get('default')
  async getDefault(@Request() req) {
    return this.personasService.getDefault(req.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.personasService.findOne(id, req.tenantId);
  }

  @Post()
  async create(
    @Request() req,
    @Body() createData: CreatePersonaDto,
  ) {
    // DIAGNOSTIC: Log what the controller receives after ValidationPipe
    console.log('[PersonasController.create] Received body:', {
      tenantId: req.tenantId,
      bodyKeys: Object.keys(createData || {}),
      name: createData?.name,
    });

    return this.personasService.create(req.tenantId, createData);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateData: CreatePersonaDto,
  ) {
    return this.personasService.update(id, req.tenantId, updateData);
  }

  // HIGH-4: Admin/Owner only - deletion is destructive
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.personasService.remove(id, req.tenantId);
  }

  @Post('test')
  async testContent(
    @Request() req,
    @Body()
    body: {
      personaId: string;
      content: string;
      contentType: 'email' | 'ad' | 'social' | 'landing_page';
    },
  ) {
    return this.personasService.testContent(
      req.tenantId,
      body.personaId,
      body.content,
      body.contentType,
    );
  }

  @Post('seed-default')
  async seedDefault(@Request() req) {
    return this.personasService.seedDefaultPersona(req.tenantId);
  }
}
