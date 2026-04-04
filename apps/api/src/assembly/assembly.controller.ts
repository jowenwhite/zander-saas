import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { AssemblyService } from './assembly.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAssemblyDto, UpdateAssemblyDto, RunSectionDto } from './dto/create-assembly.dto';

@Controller('assemblies')
@UseGuards(JwtAuthGuard)
export class AssemblyController {
  constructor(private readonly assemblyService: AssemblyService) {}

  // GET /assemblies - List all assemblies
  @Get()
  async findAll(
    @Request() req: any,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    const assemblies = await this.assemblyService.findAll(req.user.tenantId, { type, status });
    return { assemblies };
  }

  // GET /assemblies/:id - Get single assembly
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const assembly = await this.assemblyService.findOne(id, req.user.tenantId);
    return { assembly };
  }

  // POST /assemblies - Create new assembly
  @Post()
  async create(@Body() dto: CreateAssemblyDto, @Request() req: any) {
    const assembly = await this.assemblyService.create(
      dto,
      req.user.tenantId,
      req.user.userId,
    );
    return { assembly };
  }

  // PATCH /assemblies/:id - Update assembly
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAssemblyDto,
    @Request() req: any,
  ) {
    const assembly = await this.assemblyService.update(id, dto, req.user.tenantId);
    return { assembly };
  }

  // DELETE /assemblies/:id - Archive assembly
  @Delete(':id')
  async archive(@Param('id') id: string, @Request() req: any) {
    return this.assemblyService.archive(id, req.user.tenantId);
  }

  // POST /assemblies/:id/run - Run all sections
  @Post(':id/run')
  async runAll(
    @Param('id') id: string,
    @Request() req: any,
    @Headers('authorization') authHeader: string,
  ) {
    const authToken = authHeader?.replace('Bearer ', '') || '';
    return this.assemblyService.runAll(id, req.user.tenantId, authToken);
  }

  // POST /assemblies/:id/sections/:sectionId/run - Run single section
  @Post(':id/sections/:sectionId/run')
  async runSection(
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: RunSectionDto,
    @Request() req: any,
    @Headers('authorization') authHeader: string,
  ) {
    const authToken = authHeader?.replace('Bearer ', '') || '';
    return this.assemblyService.runSection(
      id,
      sectionId,
      req.user.tenantId,
      authToken,
      dto,
    );
  }
}
