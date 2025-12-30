import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { TreasuryService } from './treasury.service';
import { Public } from '../auth/public.decorator';

@Controller('treasury')
export class TreasuryController {
  constructor(private readonly treasuryService: TreasuryService) {}

  @Public()
  @Get()
  async findAll(
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('executive') executive?: string,
    @Query('industry') industry?: string,
    @Query('channels') channels?: string,
  ) {
    const channelsArray = channels ? channels.split(',') : undefined;
    return this.treasuryService.findAll({
      type,
      category,
      executive,
      industry,
      channels: channelsArray,
    });
  }

  @Get('campaigns')
  async getCampaigns(
    @Query('category') category?: string,
    @Query('executive') executive?: string,
    @Query('industry') industry?: string,
    @Query('channels') channels?: string,
  ) {
    const channelsArray = channels ? channels.split(',') : undefined;
    return this.treasuryService.findAll({
      type: 'campaign',
      category,
      executive,
      industry,
      channels: channelsArray,
    });
  }

  @Get('forms')
  async getForms(
    @Query('category') category?: string,
    @Query('executive') executive?: string,
    @Query('industry') industry?: string,
  ) {
    return this.treasuryService.findAll({
      type: 'form',
      category,
      executive,
      industry,
    });
  }

  @Get('sops')
  async getSops(
    @Query('category') category?: string,
    @Query('executive') executive?: string,
    @Query('industry') industry?: string,
  ) {
    return this.treasuryService.findAll({
      type: 'sop',
      category,
      executive,
      industry,
    });
  }

  @Get('assemblies')
  async getAssemblies(
    @Query('category') category?: string,
    @Query('executive') executive?: string,
    @Query('industry') industry?: string,
  ) {
    return this.treasuryService.findAll({
      type: 'assembly',
      category,
      executive,
      industry,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.treasuryService.findOne(id);
  }

  @Post()
  async create(
    @Body() data: {
      type: string;
      name: string;
      description?: string;
      category?: string;
      executive?: string;
      industry?: string;
      channels?: string[];
      content: any;
      stepCount?: number;
      duration?: string;
    }
  ) {
    return this.treasuryService.create(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: {
      name?: string;
      description?: string;
      category?: string;
      executive?: string;
      industry?: string;
      channels?: string[];
      content?: any;
      stepCount?: number;
      duration?: string;
      isActive?: boolean;
      sortOrder?: number;
    }
  ) {
    return this.treasuryService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.treasuryService.remove(id);
  }

    @Post('seed')
  async seed() {
    const treasuryItems = [
      // CAMPAIGN TEMPLATES
      { type: 'campaign', name: 'New Lead Nurture', description: 'Welcome new leads with a 5-step email sequence over 14 days', category: 'sales', executive: 'CRO', industry: 'general', channels: ['email'], stepCount: 5, duration: '14 days', sortOrder: 1, content: { steps: [{ day: 0, channel: 'email', subject: 'Welcome to {{company}}' }] } },
      { type: 'campaign', name: 'Post-Quote Follow-Up', description: 'Follow up after sending a quote with email and phone touchpoints', category: 'sales', executive: 'CRO', industry: 'general', channels: ['email', 'phone'], stepCount: 4, duration: '10 days', sortOrder: 2, content: { steps: [] } },
      { type: 'campaign', name: 'Cabinet Project Follow-Up', description: 'MCF-specific follow-up sequence for cabinet projects', category: 'sales', executive: 'CRO', industry: 'cabinet_millwork', channels: ['email', 'phone', 'sms'], stepCount: 6, duration: '21 days', sortOrder: 3, content: { steps: [] } },
      { type: 'campaign', name: 'Customer Reactivation', description: 'Re-engage past customers who have not ordered in 12+ months', category: 'marketing', executive: 'CMO', industry: 'general', channels: ['email'], stepCount: 3, duration: '14 days', sortOrder: 4, content: { steps: [] } },
      { type: 'campaign', name: 'Appointment Reminder', description: 'Automated reminders before scheduled appointments', category: 'operations', executive: 'COO', industry: 'general', channels: ['email', 'sms'], stepCount: 3, duration: '2 days', sortOrder: 5, content: { steps: [] } },
      // FORM TEMPLATES
      { type: 'form', name: 'Client Intake Form', description: 'Comprehensive new client information gathering', category: 'sales', executive: 'CRO', industry: 'general', channels: [], sortOrder: 1, content: { fields: [] } },
      { type: 'form', name: 'Cabinet Measurement Form', description: 'Site measurement and specification form for cabinet projects', category: 'operations', executive: 'COO', industry: 'cabinet_millwork', channels: [], sortOrder: 2, content: { fields: [] } },
      { type: 'form', name: 'Project Satisfaction Survey', description: 'Post-project customer satisfaction survey', category: 'operations', executive: 'COO', industry: 'general', channels: [], sortOrder: 3, content: { fields: [] } },
      // SOP TEMPLATES
      { type: 'sop', name: 'New Lead Processing', description: 'Standard procedure for handling new incoming leads', category: 'sales', executive: 'CRO', industry: 'general', channels: [], sortOrder: 1, content: { steps: [] } },
      { type: 'sop', name: 'Cabinet Order Processing', description: 'Step-by-step process for processing cabinet orders', category: 'operations', executive: 'COO', industry: 'cabinet_millwork', channels: [], sortOrder: 2, content: { steps: [] } },
      { type: 'sop', name: 'Customer Complaint Resolution', description: 'Process for handling and resolving customer complaints', category: 'operations', executive: 'COO', industry: 'general', channels: [], sortOrder: 3, content: { steps: [] } },
      // ASSEMBLY TEMPLATES
      { type: 'assembly', name: 'Sales Discovery Call', description: '30-minute discovery call agenda for new prospects', category: 'sales', executive: 'CRO', industry: 'general', channels: ['phone'], sortOrder: 1, content: { duration: '30 minutes', agenda: [] } },
      { type: 'assembly', name: 'Project Kickoff Meeting', description: 'Internal kickoff meeting for new projects', category: 'operations', executive: 'COO', industry: 'general', channels: [], sortOrder: 2, content: { duration: '45 minutes', agenda: [] } },
      { type: 'assembly', name: 'Cabinet Design Consultation', description: 'In-home or showroom design consultation', category: 'sales', executive: 'CRO', industry: 'cabinet_millwork', channels: [], sortOrder: 3, content: { duration: '90 minutes', agenda: [] } },
      { type: 'assembly', name: 'Weekly Team Standup', description: 'Quick weekly team alignment meeting', category: 'operations', executive: 'COO', industry: 'general', channels: [], sortOrder: 4, content: { duration: '15 minutes', agenda: [] } },
    ];
    
    const existing = await this.treasuryService.findAll({});
    if (existing.length > 0) {
      return { message: 'Treasury already seeded', count: existing.length };
    }
    
    for (const item of treasuryItems) {
      await this.treasuryService.create(item);
    }
    
    return { message: 'Treasury seeded successfully', count: treasuryItems.length };
  }

}