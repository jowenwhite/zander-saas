import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SupportTicketsService } from './support-tickets.service';
import { TicketSource, TicketCategory, TicketStatus, HeadwindPriority } from '@prisma/client';

@Controller('support-tickets')
@UseGuards(JwtAuthGuard)
export class SupportTicketsController {
  constructor(private readonly supportTicketsService: SupportTicketsService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query('tenantId') tenantId?: string,
    @Query('tenantIds') tenantIds?: string,
    @Query('status') status?: TicketStatus,
    @Query('priority') priority?: HeadwindPriority,
    @Query('category') category?: TicketCategory,
    @Query('createdVia') createdVia?: TicketSource,
    @Query('myTickets') myTickets?: string,
  ) {
    // SuperAdmin can see all tickets or filter by tenant
    if (req.user.isSuperAdmin) {
      const parsedTenantIds = tenantIds ? tenantIds.split(',') : undefined;
      return this.supportTicketsService.findAll({
        tenantId,
        tenantIds: parsedTenantIds,
        status,
        priority,
        category,
        createdVia,
        userId: myTickets === 'true' ? req.user.id : undefined,
      });
    }

    // Regular users see only their tenant's tickets (or just their own)
    return this.supportTicketsService.findAll({
      tenantId: req.user.tenantId,
      status,
      priority,
      category,
      createdVia,
      userId: myTickets === 'true' ? req.user.id : undefined,
    });
  }

  @Get('stats')
  async getStats(@Request() req, @Query('tenantId') tenantId?: string) {
    if (req.user.isSuperAdmin) {
      return this.supportTicketsService.getStats(tenantId);
    }
    return this.supportTicketsService.getStats(req.user.tenantId);
  }

  @Get('number/:ticketNumber')
  async findByTicketNumber(
    @Request() req,
    @Param('ticketNumber') ticketNumber: string,
  ) {
    const ticket = await this.supportTicketsService.findByTicketNumber(ticketNumber);
    
    if (!req.user.isSuperAdmin && ticket.tenantId !== req.user.tenantId) {
      throw new ForbiddenException('Access denied');
    }
    
    return ticket;
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const ticket = await this.supportTicketsService.findOne(id);
    
    if (!req.user.isSuperAdmin && ticket.tenantId !== req.user.tenantId) {
      throw new ForbiddenException('Access denied');
    }
    
    return ticket;
  }

  @Post()
  async create(
    @Request() req,
    @Body() data: {
      subject: string;
      description: string;
      category?: TicketCategory;
      priority?: HeadwindPriority;
      createdVia?: TicketSource;
      tenantId?: string;
      userId?: string;
    },
  ) {
    // SuperAdmin can create tickets for any tenant/user
    // Regular users create tickets for themselves
    const ticketData = {
      subject: data.subject,
      description: data.description,
      category: data.category,
      priority: data.priority,
      createdVia: data.createdVia || 'MANUAL',
      tenantId: req.user.isSuperAdmin && data.tenantId ? data.tenantId : req.user.tenantId,
      userId: req.user.isSuperAdmin && data.userId ? data.userId : req.user.id,
    };

    return this.supportTicketsService.create(ticketData);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() data: {
      subject?: string;
      description?: string;
      category?: TicketCategory;
      priority?: HeadwindPriority;
      status?: TicketStatus;
      aiSummary?: string;
      aiResponse?: string;
      linkedHeadwindId?: string;
      resolution?: string;
    },
  ) {
    const ticket = await this.supportTicketsService.findOne(id);
    
    // Only SuperAdmin can update tickets from other tenants
    if (!req.user.isSuperAdmin && ticket.tenantId !== req.user.tenantId) {
      throw new ForbiddenException('Access denied');
    }

    // Only SuperAdmin can set AI fields and link headwinds
    if (!req.user.isSuperAdmin) {
      delete data.aiSummary;
      delete data.aiResponse;
      delete data.linkedHeadwindId;
    }

    return this.supportTicketsService.update(id, data);
  }

  @Put(':id/link-headwind/:headwindId')
  async linkToHeadwind(
    @Request() req,
    @Param('id') id: string,
    @Param('headwindId') headwindId: string,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only SuperAdmin can link tickets to headwinds');
    }

    return this.supportTicketsService.linkToHeadwind(id, headwindId);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    const ticket = await this.supportTicketsService.findOne(id);
    
    if (!req.user.isSuperAdmin && ticket.tenantId !== req.user.tenantId) {
      throw new ForbiddenException('Access denied');
    }

    return this.supportTicketsService.delete(id);
  }
}
