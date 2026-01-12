import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DealsService } from './deals.service';

@Controller('deals')
@UseGuards(JwtAuthGuard) // All routes require authentication
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  // GET /deals - List all deals with filters
  @Get()
  async findAll(@Request() req, @Query() query: any) {
    return this.dealsService.findAll(req.tenantId, query);
  }

  // GET /deals/pipeline - Get pipeline view (deals grouped by stage)
  @Get('pipeline')
  async getPipeline(@Request() req) {
    return this.dealsService.getPipeline(req.tenantId);
  }

  // GET /deals/:id - Get single deal
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.dealsService.findOne(id, req.tenantId);
  }

  // POST /deals - Create new deal
  @Post()
  async create(@Body() data: any, @Request() req) {
    return this.dealsService.create(data, req.tenantId);
  }

  // PATCH /deals/:id - Update deal
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.dealsService.update(id, data, req.tenantId);
  }

  // PATCH /deals/:id/stage - Move deal to different stage
  @Patch(':id/stage')
  async updateStage(@Param('id') id: string, @Body() body: { stage: string }, @Request() req) {
    return this.dealsService.updateStage(id, body.stage, req.tenantId, req.user?.userId || req.user?.sub);
  }

  // DELETE /deals/:id - Delete deal
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    return this.dealsService.delete(id, req.tenantId);
  }

  // POST /deals/import - Bulk import
  @Post('import')
  async bulkImport(@Body() data: { deals: any[] }, @Request() req) {
    return this.dealsService.bulkImport(data.deals, req.tenantId);
  }

  // GET /deals/export - Export deals (returns CSV data)
  @Get('export')
  async export(@Request() req) {
    const { data } = await this.dealsService.findAll(req.tenantId, { limit: 10000 });
    
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
