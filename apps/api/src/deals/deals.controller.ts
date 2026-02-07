import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { DealsService } from './deals.service';
import { CreateDealDto, UpdateDealDto, ImportDealsDto } from './dto';

@Controller('deals')
@UseGuards(JwtAuthGuard) // All routes require authentication
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  // GET /deals - List all deals with filters
  // HIGH-3: Pass userId and role for ownership-based filtering
  @Get()
  async findAll(@Request() req, @Query() query: any) {
    const { tenantId, user } = req;
    return this.dealsService.findAll(tenantId, query, user?.userId, user?.role);
  }

  // GET /deals/pipeline - Get pipeline view (deals grouped by stage)
  // HIGH-3: Pass userId and role for ownership-based filtering
  @Get('pipeline')
  async getPipeline(@Request() req, @Query() query) {
    const { tenantId, user } = req;
    return this.dealsService.getPipeline(tenantId, query, user?.userId, user?.role);
  }

  // GET /deals/:id - Get single deal
  // HIGH-3: Pass userId and role for ownership-based access control
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const { tenantId, user } = req;
    return this.dealsService.findOne(id, tenantId, user?.userId, user?.role);
  }

  // POST /deals - Create new deal
  // HIGH-3: Pass userId to set owner on creation
  // MEDIUM-1: Input validation via CreateDealDto
  @Post()
  async create(@Body() data: CreateDealDto, @Request() req) {
    const { tenantId, user } = req;
    return this.dealsService.create(data, tenantId, user?.userId);
  }

  // PATCH /deals/:id - Update deal
  // MEDIUM-1: Input validation via UpdateDealDto
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateDealDto, @Request() req) {
    return this.dealsService.update(id, data, req.tenantId);
  }

  // PATCH /deals/:id/stage - Move deal to different stage
  @Patch(':id/stage')
  async updateStage(@Param('id') id: string, @Body() body: { stage: string }, @Request() req) {
    return this.dealsService.updateStage(id, body.stage, req.tenantId, req.user?.userId || req.user?.sub);
  }

  // DELETE /deals/:id - Delete deal
  // HIGH-4: Admin/Owner only - deletion is destructive
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    return this.dealsService.delete(id, req.tenantId);
  }

  // POST /deals/import - Bulk import
  // HIGH-4: Admin/Owner only - bulk operations are privileged
  // MEDIUM-1: Input validation via ImportDealsDto (validates each deal)
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Post('import')
  async bulkImport(@Body() data: ImportDealsDto, @Request() req) {
    return this.dealsService.bulkImport(data.deals, req.tenantId);
  }

  // GET /deals/export - Export deals (returns CSV data)
  // HIGH-3: Pass userId and role for ownership-based filtering
  @Get('export')
  async export(@Request() req) {
    const { tenantId, user } = req;
    const { data } = await this.dealsService.findAll(tenantId, { limit: 10000 }, user?.userId, user?.role);
    
    // Convert to CSV format
    const headers = ['Deal Name', 'Contact', 'Value', 'Stage', 'Priority', 'Probability', 'Expected Close'];
    const csv = [
      headers.join(','),
      ...data.map(deal => [
        deal.dealName,
        `${deal.contact?.firstName || ''} ${deal.contact?.lastName || ''}`,
        deal.dealValue,
        deal.stage,
        deal.priority,
        deal.probability,
        deal.expectedCloseDate || ''
      ].join(','))
    ].join('\n');

    return { csv };
  }

  // PATCH /deals/:id/archive - Archive a deal (excluded from metrics)
  @Patch(':id/archive')
  async archive(@Param('id') id: string, @Body() body: { reason?: string }, @Request() req) {
    return this.dealsService.archive(id, req.tenantId, body.reason, req.user?.userId || req.user?.sub);
  }

  // PATCH /deals/:id/mark-lost - Mark deal as lost (counts in win/loss metrics)
  @Patch(':id/mark-lost')
  async markLost(@Param('id') id: string, @Body() body: { reason: string }, @Request() req) {
    return this.dealsService.markLost(id, req.tenantId, body.reason, req.user?.userId || req.user?.sub);
  }

  // PATCH /deals/:id/restore - Restore an archived or lost deal
  @Patch(':id/restore')
  async restore(@Param('id') id: string, @Request() req) {
    return this.dealsService.restore(id, req.tenantId, req.user?.userId || req.user?.sub);
  }
}
