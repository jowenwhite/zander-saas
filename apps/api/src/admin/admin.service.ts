import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async seedMarketing(): Promise<{ success: boolean; message: string; details: string[] }> {
    const details: string[] = [];

    // Find or create 64 West Holdings tenant
    let tenant = await this.prisma.tenant.findUnique({
      where: { subdomain: '64west' },
    });

    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: {
          companyName: '64 West Holdings LLC',
          subdomain: '64west',
          tenantType: 'holding_company',
        },
      });
      details.push(`Created tenant: ${tenant.companyName}`);
    } else {
      details.push(`Found tenant: ${tenant.companyName}`);
    }

    // Find or create a user for the tenant
    let user = await this.prisma.user.findFirst({
      where: { tenantId: tenant.id },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: 'admin@64west.com',
          firstName: 'Admin',
          lastName: '64 West',
          role: 'admin',
          password: '',
        },
      });
      details.push(`Created user: ${user.email}`);
    }

    // Seed campaigns
    const campaigns = [
      {
        name: 'Zander Launch Campaign',
        description: 'Official launch campaign for Zander SaaS platform targeting small business owners',
        businessUnit: 'zander',
        status: 'active',
        type: 'multi',
        channels: ['email', 'social'],
        goal: 'Generate 500 trial signups in 90 days',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Small Business OS Awareness',
        description: 'Content marketing campaign to build awareness of Zander as the small business operating system',
        businessUnit: 'zander',
        status: 'draft',
        type: 'multi',
        channels: ['email', 'social', 'content'],
        goal: 'Increase brand awareness and website traffic',
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Q1 Loan Promo',
        description: 'Promotional campaign for Q1 loan products with competitive rates',
        businessUnit: 'finance',
        status: 'active',
        type: 'multi',
        channels: ['email', 'direct'],
        goal: 'Generate 50 qualified loan applications',
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Refinance Outreach',
        description: 'Targeted outreach to existing clients for refinancing opportunities',
        businessUnit: 'finance',
        status: 'draft',
        type: 'single',
        channels: ['email', 'phone'],
        goal: 'Convert 20% of eligible clients to refinance',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Business Strategy Discovery',
        description: 'Campaign to attract businesses seeking strategic consulting and fractional executive services',
        businessUnit: 'consulting',
        status: 'active',
        type: 'multi',
        channels: ['email', 'linkedin', 'webinar'],
        goal: 'Book 25 discovery calls per month',
        startDate: new Date(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Fractional CFO Services',
        description: 'Promote fractional CFO services to growing businesses needing financial leadership',
        businessUnit: 'consulting',
        status: 'draft',
        type: 'multi',
        channels: ['email', 'content', 'referral'],
        goal: 'Onboard 5 new fractional CFO clients',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    ];

    let campaignsCreated = 0;
    for (const campaign of campaigns) {
      const existing = await this.prisma.campaign.findFirst({
        where: { tenantId: tenant.id, name: campaign.name },
      });

      if (!existing) {
        await this.prisma.campaign.create({
          data: { tenantId: tenant.id, ...campaign },
        });
        campaignsCreated++;
      }
    }
    details.push(`Campaigns: ${campaignsCreated} created, ${campaigns.length - campaignsCreated} already existed`);

    // Seed funnels
    const funnels = [
      {
        name: 'Zander SaaS Funnel',
        description: 'Lead to paid customer journey for Zander platform',
        stages: [
          { name: 'Lead Magnet', stageType: 'awareness', stageOrder: 1 },
          { name: 'Demo Request', stageType: 'interest', stageOrder: 2 },
          { name: 'Trial Signup', stageType: 'decision', stageOrder: 3 },
          { name: 'Paid Conversion', stageType: 'action', stageOrder: 4 },
        ],
      },
      {
        name: 'Finance Loan Funnel',
        description: 'Loan inquiry to funding journey',
        stages: [
          { name: 'Loan Inquiry', stageType: 'awareness', stageOrder: 1 },
          { name: 'Application', stageType: 'interest', stageOrder: 2 },
          { name: 'Underwriting', stageType: 'decision', stageOrder: 3 },
          { name: 'Funded', stageType: 'action', stageOrder: 4 },
        ],
      },
      {
        name: 'Consulting Engagement Funnel',
        description: 'Discovery to consulting engagement journey',
        stages: [
          { name: 'Discovery Call', stageType: 'awareness', stageOrder: 1 },
          { name: 'Needs Assessment', stageType: 'interest', stageOrder: 2 },
          { name: 'Proposal', stageType: 'decision', stageOrder: 3 },
          { name: 'Engagement', stageType: 'action', stageOrder: 4 },
        ],
      },
    ];

    let funnelsCreated = 0;
    for (const funnel of funnels) {
      const existing = await this.prisma.funnel.findFirst({
        where: { tenantId: tenant.id, name: funnel.name },
      });

      if (!existing) {
        const createdFunnel = await this.prisma.funnel.create({
          data: {
            tenantId: tenant.id,
            name: funnel.name,
            description: funnel.description,
            status: 'active',
          },
        });

        for (const stage of funnel.stages) {
          await this.prisma.funnelStage.create({
            data: {
              funnelId: createdFunnel.id,
              name: stage.name,
              stageType: stage.stageType,
              stageOrder: stage.stageOrder,
            },
          });
        }
        funnelsCreated++;
      }
    }
    details.push(`Funnels: ${funnelsCreated} created, ${funnels.length - funnelsCreated} already existed`);

    // Seed personas
    const personas = [
      {
        name: 'Sam Martinez',
        tagline: 'Overwhelmed small business owner seeking simplicity',
        isDefault: true,
        demographics: {
          age: '35-50',
          location: 'Suburban USA',
          occupation: 'Small business owner',
          income: '$75,000-$150,000',
          education: 'Some college or trade school',
          familyStatus: 'Married with children',
        },
        psychographics: {
          values: ['Family time', 'Financial security', 'Independence'],
          personality: 'Practical, hardworking, overwhelmed but optimistic',
          lifestyle: 'Works long hours, limited personal time, values efficiency',
        },
        behaviors: {
          techAdoption: 'Reluctant adopter',
          buyingStyle: 'Value-focused, needs clear ROI',
          researchHabits: 'Asks peers, reads reviews, wants demos',
        },
        painPoints: [
          'Too many disconnected software tools',
          'No time to learn complex systems',
          'Struggles to delegate without proper processes',
          'Feels like they are always putting out fires',
          'Worries about missing important follow-ups',
        ],
        goals: [
          'Grow business without becoming a tech expert',
          'Find one system that does it all',
          'Spend more time with family',
          'Build a business that runs without constant oversight',
          'Feel confident nothing is falling through the cracks',
        ],
        preferredChannels: ['email', 'facebook', 'phone'],
        brandAffinities: ['Apple', 'Costco', 'Local businesses'],
        interview: `Sam runs a custom cabinet shop that his father started 32 years ago. He took over the business 8 years ago and has grown it from 12 to 24 employees.`,
      },
      {
        name: 'Regional Developer',
        tagline: 'Real estate developer needing flexible financing solutions',
        isDefault: false,
        demographics: { age: '40-60', location: 'Regional metro areas', occupation: 'Real estate developer' },
        psychographics: { values: ['Deal flow', 'Relationships', 'Speed to close'] },
        behaviors: { techAdoption: 'Uses what works', buyingStyle: 'Relationship-driven' },
        painPoints: ['Traditional banks too slow', 'Need quick bridge financing'],
        goals: ['Close deals faster', 'Build lending relationships'],
        preferredChannels: ['phone', 'email', 'in-person'],
        brandAffinities: ['Local banks', 'Private equity firms'],
      },
      {
        name: 'Growing Founder',
        tagline: 'Startup founder needing strategic guidance and fractional leadership',
        isDefault: false,
        demographics: { age: '30-45', location: 'Urban areas', occupation: 'Startup founder / CEO' },
        psychographics: { values: ['Growth', 'Innovation', 'Building something meaningful'] },
        behaviors: { techAdoption: 'Early adopter', buyingStyle: 'ROI-focused' },
        painPoints: ['Cannot afford full-time C-suite', 'Needs strategic guidance'],
        goals: ['Access executive expertise affordably', 'Build scalable operations'],
        preferredChannels: ['email', 'linkedin', 'webinar'],
        brandAffinities: ['Y Combinator', 'Sequoia'],
      },
      {
        name: 'Multi-Service Prospect',
        tagline: 'Established business owner who might benefit from all 64 West services',
        isDefault: false,
        demographics: { age: '45-60', location: 'Suburban/regional', occupation: 'Business owner' },
        psychographics: { values: ['Stability', 'Growth', 'Trusted partnerships'] },
        behaviors: { techAdoption: 'Selective', buyingStyle: 'Relationship driven' },
        painPoints: ['Business has grown past management capabilities', 'Needs better systems'],
        goals: ['Find trusted partners', 'Streamline operations'],
        preferredChannels: ['phone', 'email', 'in-person'],
        brandAffinities: ['Local business community', 'Chamber of Commerce'],
      },
    ];

    let personasCreated = 0;
    for (const persona of personas) {
      const existing = await this.prisma.persona.findFirst({
        where: { tenantId: tenant.id, name: persona.name },
      });

      if (!existing) {
        await this.prisma.persona.create({
          data: { tenantId: tenant.id, ...persona },
        });
        personasCreated++;
      }
    }
    details.push(`Personas: ${personasCreated} created, ${personas.length - personasCreated} already existed`);

    // Seed monthly theme
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    await this.prisma.monthlyTheme.upsert({
      where: {
        tenantId_year_month: {
          tenantId: tenant.id,
          year: currentYear,
          month: currentMonth,
        },
      },
      update: {
        name: 'New Year Growth',
        description: 'Focus on growth initiatives for the new year across all business units',
        focusAreas: ['Lead generation', 'Brand awareness', 'Cross-sell opportunities', 'Customer retention'],
        colorCode: '#10B981',
        isActive: true,
      },
      create: {
        tenantId: tenant.id,
        year: currentYear,
        month: currentMonth,
        name: 'New Year Growth',
        description: 'Focus on growth initiatives for the new year across all business units',
        focusAreas: ['Lead generation', 'Brand awareness', 'Cross-sell opportunities', 'Customer retention'],
        colorCode: '#10B981',
        isActive: true,
      },
    });
    details.push(`Monthly theme: upserted for ${currentYear}-${currentMonth}`);

    // Seed calendar events
    const getDateThisMonth = (day: number, hour: number = 10) => {
      return new Date(currentYear, currentMonth - 1, day, hour, 0, 0);
    };

    const calendarEvents = [
      { title: 'Zander Launch Email Blast', description: 'Send initial launch announcement', eventType: 'task', category: 'content', startTime: getDateThisMonth(3, 9), endTime: getDateThisMonth(3, 10), marketingChannel: 'email', contentStatus: 'scheduled' },
      { title: 'Finance Q1 Promo Kickoff', description: 'Launch Q1 loan promotion campaign', eventType: 'task', category: 'campaign', startTime: getDateThisMonth(5, 10), endTime: getDateThisMonth(5, 11), marketingChannel: 'email', contentStatus: 'draft' },
      { title: 'Social Media: Small Biz Tips', description: 'Weekly social media posts', eventType: 'task', category: 'social', startTime: getDateThisMonth(8, 14), endTime: getDateThisMonth(8, 15), marketingChannel: 'social', contentStatus: 'draft' },
      { title: 'Consulting Webinar: Strategy 101', description: 'Free webinar on business strategy', eventType: 'meeting', category: 'event', startTime: getDateThisMonth(10, 13), endTime: getDateThisMonth(10, 14), marketingChannel: 'webinar', contentStatus: 'scheduled' },
      { title: 'Blog Post: SaaS for SMBs', description: 'Publish blog post about unified SaaS platforms', eventType: 'task', category: 'content', startTime: getDateThisMonth(15, 10), endTime: getDateThisMonth(15, 11), marketingChannel: 'content', contentStatus: 'draft' },
      { title: 'Finance Follow-up Sequence', description: 'Launch automated follow-up email sequence', eventType: 'task', category: 'campaign', startTime: getDateThisMonth(17, 9), endTime: getDateThisMonth(17, 10), marketingChannel: 'email', contentStatus: 'draft' },
      { title: 'Cross-sell Email Campaign', description: 'Email campaign to existing customers', eventType: 'task', category: 'campaign', startTime: getDateThisMonth(22, 10), endTime: getDateThisMonth(22, 11), marketingChannel: 'email', contentStatus: 'draft' },
      { title: 'Monthly Performance Review', description: 'Internal marketing performance review', eventType: 'meeting', category: 'internal', startTime: getDateThisMonth(25, 15), endTime: getDateThisMonth(25, 16), marketingChannel: null, contentStatus: null },
    ];

    let eventsCreated = 0;
    for (const event of calendarEvents) {
      const existing = await this.prisma.calendarEvent.findFirst({
        where: { tenantId: tenant.id, title: event.title, startTime: event.startTime },
      });

      if (!existing) {
        await this.prisma.calendarEvent.create({
          data: {
            tenantId: tenant.id,
            createdById: user.id,
            title: event.title,
            description: event.description,
            eventType: event.eventType,
            category: event.category,
            startTime: event.startTime,
            endTime: event.endTime,
            marketingChannel: event.marketingChannel,
            contentStatus: event.contentStatus,
            status: 'scheduled',
          },
        });
        eventsCreated++;
      }
    }
    details.push(`Calendar events: ${eventsCreated} created, ${calendarEvents.length - eventsCreated} already existed`);

    return {
      success: true,
      message: 'Marketing seed completed successfully',
      details,
    };
  }
}
