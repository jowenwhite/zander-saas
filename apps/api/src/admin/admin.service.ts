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

    // Seed workflows
    let workflowsCreated = 0;

    // Workflow 1: New Lead Welcome Sequence
    const welcomeWorkflowName = 'New Lead Welcome Sequence';
    const existingWelcomeWorkflow = await this.prisma.workflow.findFirst({
      where: { tenantId: tenant.id, name: welcomeWorkflowName },
    });

    if (!existingWelcomeWorkflow) {
      const welcomeWorkflow = await this.prisma.workflow.create({
        data: {
          tenantId: tenant.id,
          name: welcomeWorkflowName,
          description: 'Automatically welcome new contacts with an email sequence',
          status: 'active',
          triggerType: 'contact_created',
          triggerConfig: {},
          entryCount: 47,
          completionCount: 32,
        },
      });

      const welcomeEmailNode = await this.prisma.workflowNode.create({
        data: {
          workflowId: welcomeWorkflow.id,
          nodeType: 'send_email',
          name: 'Send Welcome Email',
          config: { subject: 'Welcome to 64 West Holdings!', fromName: '64 West Team' },
          positionX: 0,
          positionY: 0,
          sortOrder: 1,
        },
      });

      const waitNode = await this.prisma.workflowNode.create({
        data: {
          workflowId: welcomeWorkflow.id,
          nodeType: 'wait',
          name: 'Wait 2 Days',
          config: { duration: 2, unit: 'days' },
          positionX: 0,
          positionY: 100,
          sortOrder: 2,
        },
      });

      const followUpNode = await this.prisma.workflowNode.create({
        data: {
          workflowId: welcomeWorkflow.id,
          nodeType: 'send_email',
          name: 'Send Follow-up Email',
          config: { subject: 'How can we help you today?', fromName: '64 West Team' },
          positionX: 0,
          positionY: 200,
          sortOrder: 3,
        },
      });

      const endNode = await this.prisma.workflowNode.create({
        data: {
          workflowId: welcomeWorkflow.id,
          nodeType: 'end',
          name: 'End Workflow',
          config: {},
          positionX: 0,
          positionY: 300,
          sortOrder: 4,
        },
      });

      await this.prisma.workflowNode.update({ where: { id: welcomeEmailNode.id }, data: { nextNodeId: waitNode.id } });
      await this.prisma.workflowNode.update({ where: { id: waitNode.id }, data: { nextNodeId: followUpNode.id } });
      await this.prisma.workflowNode.update({ where: { id: followUpNode.id }, data: { nextNodeId: endNode.id } });

      workflowsCreated++;
    }

    // Workflow 2: Webinar Follow-up
    const webinarWorkflowName = 'Webinar Follow-up';
    const existingWebinarWorkflow = await this.prisma.workflow.findFirst({
      where: { tenantId: tenant.id, name: webinarWorkflowName },
    });

    if (!existingWebinarWorkflow) {
      const webinarWorkflow = await this.prisma.workflow.create({
        data: {
          tenantId: tenant.id,
          name: webinarWorkflowName,
          description: 'Follow up with contacts who attended a webinar',
          status: 'active',
          triggerType: 'tag_added',
          triggerConfig: { tagName: 'webinar_attended' },
          entryCount: 23,
          completionCount: 21,
        },
      });

      const thankYouNode = await this.prisma.workflowNode.create({
        data: {
          workflowId: webinarWorkflow.id,
          nodeType: 'send_email',
          name: 'Send Thank You Email',
          config: { subject: 'Thank you for attending our webinar!', fromName: '64 West Holdings' },
          positionX: 0,
          positionY: 0,
          sortOrder: 1,
        },
      });

      const addTagNode = await this.prisma.workflowNode.create({
        data: {
          workflowId: webinarWorkflow.id,
          nodeType: 'add_tag',
          name: 'Add to Nurture Segment',
          config: { tagName: 'nurture_segment' },
          positionX: 0,
          positionY: 100,
          sortOrder: 2,
        },
      });

      const webinarEndNode = await this.prisma.workflowNode.create({
        data: {
          workflowId: webinarWorkflow.id,
          nodeType: 'end',
          name: 'End Workflow',
          config: {},
          positionX: 0,
          positionY: 200,
          sortOrder: 3,
        },
      });

      await this.prisma.workflowNode.update({ where: { id: thankYouNode.id }, data: { nextNodeId: addTagNode.id } });
      await this.prisma.workflowNode.update({ where: { id: addTagNode.id }, data: { nextNodeId: webinarEndNode.id } });

      workflowsCreated++;
    }

    // Workflow 3: Lead Nurture Drip Campaign
    const nurtureWorkflowName = 'Lead Nurture Drip Campaign';
    const existingNurtureWorkflow = await this.prisma.workflow.findFirst({
      where: { tenantId: tenant.id, name: nurtureWorkflowName },
    });

    if (!existingNurtureWorkflow) {
      const nurtureWorkflow = await this.prisma.workflow.create({
        data: {
          tenantId: tenant.id,
          name: nurtureWorkflowName,
          description: 'Multi-touch email drip campaign for leads who download content',
          status: 'draft',
          triggerType: 'form_submission',
          triggerConfig: { formId: 'lead_magnet_download' },
          entryCount: 0,
          completionCount: 0,
        },
      });

      const deliverNode = await this.prisma.workflowNode.create({
        data: { workflowId: nurtureWorkflow.id, nodeType: 'send_email', name: 'Deliver Content', config: { subject: 'Your download is ready!' }, positionX: 0, positionY: 0, sortOrder: 1 },
      });
      const wait3Node = await this.prisma.workflowNode.create({
        data: { workflowId: nurtureWorkflow.id, nodeType: 'wait', name: 'Wait 3 Days', config: { duration: 3, unit: 'days' }, positionX: 0, positionY: 100, sortOrder: 2 },
      });
      const eduNode = await this.prisma.workflowNode.create({
        data: { workflowId: nurtureWorkflow.id, nodeType: 'send_email', name: 'Send Educational Content', config: { subject: '3 ways to grow your business' }, positionX: 0, positionY: 200, sortOrder: 3 },
      });
      const wait5Node = await this.prisma.workflowNode.create({
        data: { workflowId: nurtureWorkflow.id, nodeType: 'wait', name: 'Wait 5 Days', config: { duration: 5, unit: 'days' }, positionX: 0, positionY: 300, sortOrder: 4 },
      });
      const ctaNode = await this.prisma.workflowNode.create({
        data: { workflowId: nurtureWorkflow.id, nodeType: 'send_email', name: 'Send CTA Email', config: { subject: 'Ready to take the next step?' }, positionX: 0, positionY: 400, sortOrder: 5 },
      });
      const notifyNode = await this.prisma.workflowNode.create({
        data: { workflowId: nurtureWorkflow.id, nodeType: 'notify_user', name: 'Notify Sales Team', config: { message: 'Lead completed nurture sequence' }, positionX: 0, positionY: 500, sortOrder: 6 },
      });
      const nurtureEndNode = await this.prisma.workflowNode.create({
        data: { workflowId: nurtureWorkflow.id, nodeType: 'end', name: 'End Workflow', config: {}, positionX: 0, positionY: 600, sortOrder: 7 },
      });

      await this.prisma.workflowNode.update({ where: { id: deliverNode.id }, data: { nextNodeId: wait3Node.id } });
      await this.prisma.workflowNode.update({ where: { id: wait3Node.id }, data: { nextNodeId: eduNode.id } });
      await this.prisma.workflowNode.update({ where: { id: eduNode.id }, data: { nextNodeId: wait5Node.id } });
      await this.prisma.workflowNode.update({ where: { id: wait5Node.id }, data: { nextNodeId: ctaNode.id } });
      await this.prisma.workflowNode.update({ where: { id: ctaNode.id }, data: { nextNodeId: notifyNode.id } });
      await this.prisma.workflowNode.update({ where: { id: notifyNode.id }, data: { nextNodeId: nurtureEndNode.id } });

      workflowsCreated++;
    }

    details.push(`Workflows: ${workflowsCreated} created, ${3 - workflowsCreated} already existed`);

    return {
      success: true,
      message: 'Marketing seed completed successfully',
      details,
    };
  }

  async seedKnowledge(): Promise<{ success: boolean; message: string; details: string[] }> {
    const details: string[] = [];

    // Find a user to use as creator (use 64 West admin or first available)
    let user = await this.prisma.user.findFirst({
      where: { email: 'admin@64west.com' },
    });

    if (!user) {
      user = await this.prisma.user.findFirst({
        where: { role: 'admin' },
      });
    }

    if (!user) {
      user = await this.prisma.user.findFirst();
    }

    if (!user) {
      return {
        success: false,
        message: 'No user found to create knowledge articles. Please create a user first.',
        details: [],
      };
    }

    details.push(`Using creator: ${user.email}`);

    const articles = [
      // ============================================
      // GETTING STARTED (5 articles)
      // ============================================
      {
        title: 'Account Setup Guide',
        slug: 'account-setup-guide',
        summary: 'Learn how to set up your Zander account and configure your organization settings.',
        category: 'PLATFORM_GUIDE',
        tags: ['getting-started', 'setup', 'account', 'onboarding'],
        searchTerms: 'create account setup configure organization company profile initial setup first time',
        sortOrder: 1,
        content: `# Account Setup Guide

Welcome to Zander! This guide will walk you through setting up your account and organization.

## Step 1: Create Your Account

1. Visit [app.zanderos.com/signup](https://app.zanderos.com/signup)
2. Enter your email address and create a secure password
3. Verify your email by clicking the link sent to your inbox
4. Complete the initial profile setup

## Step 2: Set Up Your Organization

After logging in for the first time, you'll be prompted to:

1. **Company Name**: Enter your business name
2. **Industry**: Select your primary industry
3. **Team Size**: Indicate how many people will use Zander
4. **Primary Goals**: Tell us what you want to accomplish

## Step 3: Invite Team Members

Once your organization is set up:

1. Navigate to **Settings > Team**
2. Click **Invite Member**
3. Enter their email address and select their role
4. They'll receive an invitation to join your organization

## Step 4: Configure Your Executive Modules

Zander provides 7 AI Executives. Start by enabling the ones most relevant to your business:

- **CRO** (Chief Revenue Officer): Sales and pipeline management
- **CMO** (Chief Marketing Officer): Marketing automation and campaigns
- **CFO** (Chief Financial Officer): Financial tracking and reporting
- **COO** (Chief Operating Officer): Operations and processes
- **CPO** (Chief Product Officer): Product management
- **CIO** (Chief Information Officer): IT and integrations
- **EA** (Executive Assistant): Scheduling and communications

## Next Steps

- [First Login Guide](/knowledge/first-login-guide)
- [Dashboard Overview](/knowledge/dashboard-overview)
- [Navigation Guide](/knowledge/navigation-guide)`,
      },
      {
        title: 'First Login Guide',
        slug: 'first-login-guide',
        summary: 'What to expect and do on your first login to Zander.',
        category: 'PLATFORM_GUIDE',
        tags: ['getting-started', 'login', 'first-time', 'onboarding'],
        searchTerms: 'first login initial access welcome tour getting started new user',
        sortOrder: 2,
        content: `# First Login Guide

Your first login to Zander sets the foundation for your experience. Here's what to expect.

## Logging In

1. Go to [app.zanderos.com/login](https://app.zanderos.com/login)
2. Enter your email and password
3. If you have 2FA enabled, enter your verification code

## The Welcome Experience

On first login, you'll see the **Onboarding Wizard** which helps you:

1. **Verify your profile** - Confirm your name and contact info
2. **Set preferences** - Choose notification settings and display options
3. **Take a tour** - Quick overview of the main features
4. **Set your first goal** - Define what you want to accomplish

## Navigating the Dashboard

Your dashboard shows:

- **Quick Stats**: Key metrics at a glance
- **Recent Activity**: Latest actions across your organization
- **Tasks**: Your pending to-dos
- **AI Insights**: Recommendations from your AI executives

## Getting Help

If you need assistance:

- Click the **?** icon in the top-right corner
- Use the **Ask Don** AI assistant (red robot icon)
- Visit the Knowledge Base
- Submit a support ticket

## Tips for Success

1. **Complete your profile** - Better data means better AI recommendations
2. **Connect your email** - Enable email tracking and automation
3. **Import your contacts** - Get started with your existing customer data
4. **Explore each module** - Spend 10 minutes in each AI executive area`,
      },
      {
        title: 'Dashboard Overview',
        slug: 'dashboard-overview',
        summary: 'Understand your Zander dashboard and its key components.',
        category: 'PLATFORM_GUIDE',
        tags: ['getting-started', 'dashboard', 'overview', 'navigation'],
        searchTerms: 'dashboard home main screen widgets metrics overview interface',
        sortOrder: 3,
        content: `# Dashboard Overview

The Zander dashboard is your command center for managing your business.

## Dashboard Layout

### Top Navigation Bar

- **Executive Tabs**: Switch between CRO, CFO, COO, CMO, CPO, CIO, and EA
- **HQ Button**: Return to headquarters (main dashboard)
- **Notifications**: Bell icon shows pending alerts
- **Profile Menu**: Access settings, help, and logout

### Left Sidebar

Each executive module has a 5-pillar structure:

1. **Core Functions**: Primary tools for that role
2. **Process**: Workflows and procedures
3. **Automation**: Automated tasks and triggers
4. **Insights**: Analytics and reports
5. **Assets**: Templates and resources

### Main Content Area

Displays the active page content based on your selection.

### AI Assistant (Don)

The red robot icon in the bottom-right corner provides:

- Context-aware suggestions
- Quick actions
- AI-powered insights
- Module switching

## Dashboard Widgets

Your main dashboard includes:

| Widget | Description |
|--------|-------------|
| Revenue Summary | Monthly and quarterly revenue metrics |
| Pipeline Health | Deal stages and conversion rates |
| Tasks Due | Upcoming deadlines and to-dos |
| Team Activity | Recent actions by team members |
| AI Recommendations | Suggested next actions |

## Customizing Your Dashboard

1. Click the **gear icon** on any widget
2. Drag widgets to reorder
3. Hide/show widgets based on preferences
4. Set default time ranges for data`,
      },
      {
        title: 'Navigation Guide',
        slug: 'navigation-guide',
        summary: 'Learn how to navigate efficiently through Zander\'s interface.',
        category: 'PLATFORM_GUIDE',
        tags: ['getting-started', 'navigation', 'interface', 'ui'],
        searchTerms: 'navigate menu sidebar tabs buttons interface how to find',
        sortOrder: 4,
        content: `# Navigation Guide

Zander is designed for efficient navigation. Here's how to get around.

## Primary Navigation Methods

### 1. Executive Tabs (Top Bar)

Click any executive tab to switch modules:
- **CRO** - Sales and revenue
- **CFO** - Finance
- **COO** - Operations
- **CMO** - Marketing
- **CPO** - Product
- **CIO** - IT/Integrations
- **EA** - Scheduling/Admin

### 2. Left Sidebar (5 Pillars)

Within each module, the sidebar shows 5 pillars:
1. Core functions
2. Process & workflows
3. Automation
4. Insights & analytics
5. Assets & templates

### 3. Breadcrumbs

At the top of each page, breadcrumbs show your location:
\`CRO > Pipeline > Deals > ABC Company\`

Click any breadcrumb to navigate back.

### 4. Quick Search (Cmd/Ctrl + K)

Press **Cmd+K** (Mac) or **Ctrl+K** (Windows) to open universal search:
- Search contacts, deals, tasks
- Jump to any page
- Find recent items

### 5. AI Assistant (Don)

Click the red robot to:
- Ask questions about any feature
- Get contextual help
- Switch modules quickly

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd/Ctrl + K | Open search |
| Cmd/Ctrl + N | Create new item |
| Cmd/Ctrl + / | Show shortcuts |
| Esc | Close modal/sidebar |
| ? | Open help |

## Mobile Navigation

On mobile devices:
- Tap the hamburger menu (☰) for sidebar
- Swipe left/right to navigate tabs
- Use bottom navigation for quick access`,
      },
      {
        title: 'Settings Configuration',
        slug: 'settings-configuration',
        summary: 'Configure Zander settings to match your business needs.',
        category: 'PLATFORM_GUIDE',
        tags: ['getting-started', 'settings', 'configuration', 'preferences'],
        searchTerms: 'settings configure options preferences customize personalize profile',
        sortOrder: 5,
        content: `# Settings Configuration

Customize Zander to fit your workflow and business requirements.

## Accessing Settings

1. Click your **profile icon** in the top-right corner
2. Select **Settings** from the dropdown
3. Or navigate directly to Settings in the sidebar

## Settings Categories

### Personal Settings

- **Profile**: Name, photo, contact info
- **Notifications**: Email, push, and in-app alerts
- **Display**: Theme, language, timezone
- **Security**: Password, 2FA, sessions

### Organization Settings

- **Company Info**: Name, logo, address
- **Billing**: Subscription, payment methods
- **Team**: User management, roles
- **Integrations**: Connected apps

### Module Settings

Each AI executive has specific settings:
- Pipeline stages (CRO)
- Chart of accounts (CFO)
- Process templates (COO)
- Campaign defaults (CMO)

## Key Configuration Steps

### 1. Set Your Timezone

\`Settings > Personal > Display > Timezone\`

Ensures all dates and times display correctly.

### 2. Configure Notifications

\`Settings > Personal > Notifications\`

Choose what triggers:
- Email notifications
- Push notifications
- In-app alerts

### 3. Set Up Email Integration

\`Settings > Organization > Integrations > Email\`

Connect Gmail or Outlook for:
- Email tracking
- Automated sending
- Calendar sync

### 4. Customize Pipeline Stages

\`CRO > Settings > Pipeline Stages\`

Define your sales process:
1. Add/remove stages
2. Set stage probabilities
3. Configure automation triggers

## Saving Changes

Most settings auto-save. Look for:
- ✓ Green checkmark = Saved
- ⏳ Loading spinner = Saving
- ❌ Red X = Error (click to retry)`,
      },
      // ============================================
      // CRO/SALES (4 articles)
      // ============================================
      {
        title: 'Managing Contacts',
        slug: 'managing-contacts',
        summary: 'Learn how to add, organize, and manage contacts in Zander CRO.',
        category: 'PLATFORM_GUIDE',
        tags: ['cro', 'contacts', 'sales', 'customers'],
        searchTerms: 'contacts people customers leads prospects add import organize tags segments',
        sortOrder: 10,
        content: `# Managing Contacts

Contacts are the foundation of your sales process. Here's how to manage them effectively.

## Adding Contacts

### Manually Add a Contact

1. Navigate to **CRO > People**
2. Click **+ New Contact**
3. Fill in the contact form:
   - Name (First, Last)
   - Email
   - Phone
   - Company
   - Tags
4. Click **Save**

### Import Contacts

1. Go to **CRO > People > Import**
2. Download the CSV template
3. Fill in your contact data
4. Upload the completed CSV
5. Map columns to Zander fields
6. Review and confirm import

### Quick Add from Email

When viewing an email, click **Add to Contacts** to create a contact from the sender.

## Organizing Contacts

### Using Tags

Tags help you segment contacts:
1. Select one or more contacts
2. Click **Add Tag**
3. Enter tag name or select existing
4. Examples: "Hot Lead", "VIP", "Newsletter"

### Contact Statuses

| Status | Description |
|--------|-------------|
| Lead | New potential customer |
| Prospect | Qualified, in discussions |
| Customer | Paying customer |
| Inactive | No recent activity |
| Churned | Former customer |

### Custom Fields

Add fields specific to your business:
1. Go to **Settings > CRO > Custom Fields**
2. Click **Add Field**
3. Choose field type (text, number, date, dropdown)
4. Add to your contact forms

## Contact Details

Click any contact to see:
- **Overview**: Key info and activity timeline
- **Deals**: Associated opportunities
- **Emails**: Communication history
- **Tasks**: Related to-dos
- **Notes**: Team observations

## Best Practices

1. **Keep data clean**: Regular deduplication
2. **Use consistent tagging**: Create a tag taxonomy
3. **Log all interactions**: Notes and emails
4. **Set follow-up tasks**: Never miss a touch point`,
      },
      {
        title: 'Pipeline Stages',
        slug: 'pipeline-stages',
        summary: 'Configure and use pipeline stages to track your sales process.',
        category: 'PLATFORM_GUIDE',
        tags: ['cro', 'pipeline', 'stages', 'sales-process'],
        searchTerms: 'pipeline stages deals opportunities funnel sales process kanban configure',
        sortOrder: 11,
        content: `# Pipeline Stages

Your sales pipeline represents the journey from lead to customer. Configure stages that match your sales process.

## Default Pipeline Stages

Zander comes with standard stages:

| Stage | Probability | Description |
|-------|-------------|-------------|
| Lead | 10% | New opportunity identified |
| Qualified | 25% | Confirmed fit and interest |
| Proposal | 50% | Proposal/quote sent |
| Negotiation | 75% | Terms being discussed |
| Closed Won | 100% | Deal completed |
| Closed Lost | 0% | Opportunity lost |

## Viewing Your Pipeline

### Kanban View

Navigate to **CRO > Pipeline** to see deals as cards across stages:
- Drag cards to move between stages
- Click cards to see details
- Color-coded by priority/value

### List View

Toggle to list view for:
- Sorting by any column
- Bulk actions
- Export capabilities

## Customizing Stages

### Add a Stage

1. Go to **CRO > Settings > Pipeline**
2. Click **+ Add Stage**
3. Enter:
   - Stage name
   - Win probability (%)
   - Stage color
   - Automation triggers (optional)

### Reorder Stages

Drag and drop stages to reorder them in your process.

### Edit a Stage

Click any stage to modify its properties.

### Archive a Stage

You can't delete stages with deals, but you can archive them to hide from new deals.

## Stage Automation

Set up automatic actions when deals enter a stage:

- **Send email**: Notify the prospect
- **Create task**: Assign follow-up
- **Update field**: Change deal properties
- **Notify team**: Alert sales manager

## Pipeline Metrics

Track these key metrics:
- **Conversion rates**: Stage-to-stage movement
- **Average time in stage**: Identify bottlenecks
- **Stage distribution**: Balance of deals
- **Velocity**: Speed through pipeline`,
      },
      {
        title: 'Deal Tracking',
        slug: 'deal-tracking',
        summary: 'Track deals through your pipeline and manage opportunities effectively.',
        category: 'PLATFORM_GUIDE',
        tags: ['cro', 'deals', 'opportunities', 'tracking'],
        searchTerms: 'deals opportunities tracking value forecast close date win rate revenue',
        sortOrder: 12,
        content: `# Deal Tracking

Deals represent potential revenue. Track them effectively to improve your close rate.

## Creating a Deal

### From Pipeline

1. Click **+ New Deal** in the pipeline
2. Enter deal details:
   - Deal name
   - Value
   - Contact/Company
   - Expected close date
   - Pipeline stage
3. Click **Create**

### From a Contact

1. Open a contact record
2. Click **+ Add Deal**
3. Deal auto-links to the contact

## Deal Information

### Essential Fields

| Field | Purpose |
|-------|---------|
| Name | Identifier (e.g., "ABC Corp - Enterprise") |
| Value | Potential revenue |
| Stage | Current pipeline position |
| Close Date | Expected close |
| Probability | Likelihood of winning |
| Owner | Assigned salesperson |

### Custom Fields

Add fields like:
- Product interest
- Lead source
- Competition
- Decision makers

## Managing Deals

### Move Between Stages

- **Drag and drop** on kanban board
- **Edit deal** and change stage
- **Quick actions** menu

### Update Deal Value

Values can change during negotiation:
1. Open deal details
2. Edit the value field
3. Add a note explaining the change

### Set Activities

Keep deals moving:
- Create tasks (calls, meetings)
- Log emails
- Add notes
- Set reminders

## Deal Analytics

### Win/Loss Analysis

After closing, record:
- Win/loss reason
- Competitor involved
- Key factors

### Forecasting

Weighted pipeline value:
\`Forecast = Sum(Deal Value × Probability)\`

### Reports

- Pipeline by stage
- Deals by owner
- Revenue forecast
- Win rate trends

## Best Practices

1. **Update regularly**: Keep stages current
2. **Add close dates**: Enable forecasting
3. **Log activities**: Track all interactions
4. **Review weekly**: Pipeline hygiene
5. **Analyze losses**: Learn from closed-lost`,
      },
      {
        title: 'Email Integration',
        slug: 'email-integration-cro',
        summary: 'Connect your email to track communications with contacts and deals.',
        category: 'PLATFORM_GUIDE',
        tags: ['cro', 'email', 'integration', 'gmail', 'outlook'],
        searchTerms: 'email connect sync gmail outlook tracking communication inbox',
        sortOrder: 13,
        content: `# Email Integration for CRO

Connect your email to automatically track communications with contacts and deals.

## Why Integrate Email?

- **Automatic logging**: Emails appear on contact/deal records
- **Send from Zander**: Compose without leaving the app
- **Templates**: Use saved templates for common messages
- **Tracking**: Know when emails are opened
- **Sequences**: Automated follow-up campaigns

## Connecting Gmail

1. Go to **Settings > Integrations > Email**
2. Click **Connect Gmail**
3. Sign in to your Google account
4. Grant permissions for:
   - Read emails
   - Send emails
   - Access contacts (optional)
5. Click **Authorize**

## Connecting Outlook

1. Go to **Settings > Integrations > Email**
2. Click **Connect Outlook/Microsoft 365**
3. Sign in to your Microsoft account
4. Grant permissions
5. Click **Accept**

## Email Features

### Viewing Email History

On any contact or deal, the **Emails** tab shows:
- All sent and received emails
- Open/click tracking status
- Attachments

### Sending Email from Zander

1. Open a contact or deal
2. Click **Send Email**
3. Compose your message
4. Choose to track opens/clicks
5. Click **Send**

### Email Templates

Create reusable templates:
1. Go to **CRO > Treasury > Templates**
2. Click **+ New Template**
3. Write your template with variables:
   \`Hi {{first_name}}, ...\`
4. Save for future use

### Tracking

When enabled, you'll see:
- ✓ Email opened (with timestamp)
- 🔗 Links clicked
- ↩️ Replies received

## Email Sync Settings

Control what syncs:
- **All emails**: Everything from connected account
- **Contact emails only**: Only from known contacts
- **Manual selection**: Choose per conversation

## Troubleshooting

### Emails Not Syncing

1. Check connection status in Settings
2. Re-authorize if needed
3. Verify email permissions
4. Wait 15 minutes for initial sync

### Tracking Not Working

Some email clients block tracking pixels. This is normal behavior.`,
      },
      // ============================================
      // BILLING (3 articles)
      // ============================================
      {
        title: 'Subscription Plans',
        slug: 'subscription-plans',
        summary: 'Understand Zander subscription plans and features included in each tier.',
        category: 'FAQ',
        tags: ['billing', 'subscription', 'pricing', 'plans'],
        searchTerms: 'subscription plan pricing tier cost features upgrade downgrade monthly annual',
        sortOrder: 20,
        content: `# Subscription Plans

Zander offers flexible plans to fit businesses of all sizes.

## Available Plans

### Starter

**Best for**: Solopreneurs and small teams

- Up to 3 users
- 1,000 contacts
- Basic CRO features
- Email integration
- Standard support

### Professional

**Best for**: Growing businesses

- Up to 10 users
- 10,000 contacts
- All AI executives
- Advanced automation
- Priority support
- Custom fields

### Enterprise

**Best for**: Larger organizations

- Unlimited users
- Unlimited contacts
- All features
- Dedicated support
- Custom integrations
- SLA guarantee
- Training included

## Billing Cycles

### Monthly

- Pay month-to-month
- Cancel anytime
- Full flexibility

### Annual

- Pay for 12 months
- **Save 20%** vs monthly
- Priority support upgrade

## Changing Plans

### Upgrade

1. Go to **Settings > Billing**
2. Click **Change Plan**
3. Select new plan
4. Confirm upgrade
5. Changes take effect immediately
6. Prorated credit for current period

### Downgrade

1. Go to **Settings > Billing**
2. Click **Change Plan**
3. Select new plan
4. Review feature changes
5. Downgrade at end of billing cycle

## What Happens When...

### Trial Ends

- 14-day free trial of Professional
- Choose a plan to continue
- Data preserved if you subscribe

### Plan Limits Exceeded

- Warning notifications
- Grace period to upgrade
- Features limited after grace period

### Subscription Cancelled

- Access until end of billing period
- Data retained for 90 days
- Export available anytime

## FAQ

**Can I switch from monthly to annual?**
Yes! Contact support for prorated conversion.

**Do you offer non-profit discounts?**
Yes, 25% off for verified non-profits.

**Is there a free plan?**
No, but we offer a 14-day free trial.`,
      },
      {
        title: 'Payment Methods',
        slug: 'payment-methods',
        summary: 'Learn how to add, update, and manage payment methods for your subscription.',
        category: 'FAQ',
        tags: ['billing', 'payment', 'credit-card', 'invoice'],
        searchTerms: 'payment credit card debit add update change billing method invoice',
        sortOrder: 21,
        content: `# Payment Methods

Manage how you pay for your Zander subscription.

## Accepted Payment Methods

### Credit/Debit Cards

- Visa
- Mastercard
- American Express
- Discover

### Other Methods

- ACH bank transfer (Enterprise)
- Wire transfer (Enterprise)
- Invoice billing (Enterprise, annual only)

## Adding a Payment Method

1. Go to **Settings > Billing**
2. Click **Payment Methods**
3. Click **+ Add Payment Method**
4. Enter card details:
   - Card number
   - Expiration date
   - CVV
   - Billing address
5. Click **Save**

## Updating Payment Method

### Replace Card

1. Add new payment method (steps above)
2. Set as default
3. Delete old card if desired

### Update Expiration Date

1. Go to **Settings > Billing > Payment Methods**
2. Click **Edit** on the card
3. Update expiration date
4. Save changes

## Default Payment Method

Your default method is charged for:
- Subscription renewals
- Additional users
- Overage charges

To change default:
1. Go to Payment Methods
2. Click **Set as Default** on desired method

## Security

- **PCI Compliant**: We never store full card numbers
- **Encrypted**: All data encrypted in transit
- **Secure Processor**: Payments handled by Stripe

## Troubleshooting

### Payment Failed

Common reasons:
1. Card expired
2. Insufficient funds
3. Bank declined
4. Address mismatch

**Resolution**:
1. Update payment method
2. Contact your bank
3. Try a different card

### Charges You Don't Recognize

Review your billing history:
1. **Settings > Billing > Invoices**
2. Check for additional users or overages
3. Contact support if unclear

## Enterprise Invoicing

For annual Enterprise plans:
1. Request invoice billing during signup
2. Receive invoice via email
3. Pay via ACH or wire
4. NET 30 terms available`,
      },
      {
        title: 'Invoice History',
        slug: 'invoice-history',
        summary: 'Access and download your billing invoices and payment history.',
        category: 'FAQ',
        tags: ['billing', 'invoices', 'receipts', 'history'],
        searchTerms: 'invoice receipt history download pdf billing statement tax',
        sortOrder: 22,
        content: `# Invoice History

Access all your billing invoices and payment receipts.

## Viewing Invoices

1. Go to **Settings > Billing**
2. Click **Invoices** or **Billing History**
3. View list of all invoices

## Invoice List

Each invoice shows:
- Invoice number
- Date
- Amount
- Status (Paid, Pending, Failed)
- Plan/Items

## Invoice Details

Click any invoice to see:

### Header
- Invoice number
- Date issued
- Due date
- Payment status

### Bill To
- Company name
- Billing address
- Tax ID (if provided)

### Line Items
| Item | Quantity | Price | Total |
|------|----------|-------|-------|
| Professional Plan | 1 month | $99 | $99 |
| Additional Users (2) | 1 month | $20 | $40 |
| **Total** | | | **$139** |

### Payment Info
- Payment method used
- Transaction ID
- Payment date

## Downloading Invoices

### Single Invoice

1. Click the invoice
2. Click **Download PDF**
3. Save to your computer

### Bulk Download

1. Select multiple invoices (checkboxes)
2. Click **Download Selected**
3. Receive ZIP file with all PDFs

## Invoice Settings

### Company Information

Update what appears on invoices:
1. **Settings > Billing > Invoice Settings**
2. Edit:
   - Company legal name
   - Billing address
   - Tax ID / VAT number
3. Save changes

### Email Preferences

Choose who receives invoice emails:
1. **Settings > Billing > Notifications**
2. Add/remove email addresses
3. Toggle invoice emails on/off

## Tax Information

### Adding Tax ID

For businesses that need tax documentation:
1. Go to **Invoice Settings**
2. Enter Tax ID / VAT number
3. This appears on all future invoices

### Tax Exemption

If tax-exempt:
1. Contact support
2. Provide exemption certificate
3. Future charges exclude tax

## Refunds

Refunds appear as negative invoices:
- Linked to original invoice
- Shows refund reason
- Credits applied to account

## Exporting for Accounting

Export invoice data:
1. Click **Export**
2. Choose format (CSV, PDF)
3. Select date range
4. Download for accounting software`,
      },
      // ============================================
      // INTEGRATIONS (3 articles)
      // ============================================
      {
        title: 'Gmail Setup',
        slug: 'gmail-setup',
        summary: 'Step-by-step guide to connect your Gmail account to Zander.',
        category: 'API_DOCS',
        tags: ['integrations', 'gmail', 'google', 'email'],
        searchTerms: 'gmail google email connect setup integrate sync workspace',
        sortOrder: 30,
        content: `# Gmail Setup

Connect Gmail to sync emails, send messages, and track communications.

## Prerequisites

- Gmail or Google Workspace account
- Admin access to your Zander organization
- Chrome, Firefox, Safari, or Edge browser

## Connection Steps

### Step 1: Navigate to Integrations

1. Go to **Settings > Integrations**
2. Find **Email** section
3. Click **Gmail / Google Workspace**

### Step 2: Start OAuth Flow

1. Click **Connect Gmail**
2. A Google sign-in window opens
3. Select your Gmail account

### Step 3: Grant Permissions

Google will ask for these permissions:

| Permission | Why Needed |
|------------|------------|
| Read emails | Sync conversations with contacts |
| Send emails | Compose from within Zander |
| Manage labels | Organize synced emails |
| View contacts | Import Google contacts (optional) |

Click **Allow** to grant permissions.

### Step 4: Configure Sync Settings

After connecting, configure:

- **Sync direction**: Two-way or read-only
- **Sync scope**: All emails or contacts only
- **Historical sync**: How far back to import
- **Auto-BCC**: Copy all sent emails to Zander

### Step 5: Verify Connection

1. Check that status shows "Connected"
2. Look for recent emails appearing
3. Try sending a test email from Zander

## Features After Connection

### Email Sync
- Emails with contacts appear on records
- Conversations threaded automatically
- Attachments accessible

### Send from Zander
- Compose emails in contact/deal views
- Use templates
- Track opens and clicks

### Calendar Sync (Optional)
- View meetings in Zander
- Create events from deals
- Two-way sync supported

## Troubleshooting

### "Connection Failed" Error

1. Clear browser cookies
2. Try incognito/private window
3. Ensure pop-ups allowed
4. Check Google account access

### Emails Not Syncing

1. Verify connection status
2. Check sync settings
3. Wait 15-30 minutes for initial sync
4. Try "Force Sync" button

### Permission Denied

1. Go to Google Account settings
2. Check "Third-party apps"
3. Ensure Zander has access
4. Re-authorize if needed

## Disconnecting Gmail

1. Go to **Settings > Integrations > Gmail**
2. Click **Disconnect**
3. Confirm disconnection
4. Existing synced data remains in Zander

Also revoke access in Google:
1. Visit myaccount.google.com
2. Security > Third-party apps
3. Remove Zander access`,
      },
      {
        title: 'Outlook Setup',
        slug: 'outlook-setup',
        summary: 'Step-by-step guide to connect Microsoft Outlook to Zander.',
        category: 'API_DOCS',
        tags: ['integrations', 'outlook', 'microsoft', 'email', 'office365'],
        searchTerms: 'outlook microsoft email connect setup integrate sync office 365 exchange',
        sortOrder: 31,
        content: `# Outlook Setup

Connect Microsoft Outlook or Office 365 to sync emails and calendar.

## Prerequisites

- Outlook.com, Office 365, or Exchange account
- Admin access to your Zander organization
- Modern browser (Edge, Chrome, Firefox, Safari)

## Connection Steps

### Step 1: Navigate to Integrations

1. Go to **Settings > Integrations**
2. Find **Email** section
3. Click **Outlook / Microsoft 365**

### Step 2: Start OAuth Flow

1. Click **Connect Outlook**
2. Microsoft sign-in window opens
3. Enter your Microsoft credentials

### Step 3: Grant Permissions

Microsoft requests these permissions:

| Permission | Why Needed |
|------------|------------|
| Read mail | Sync email conversations |
| Send mail | Compose from Zander |
| Access calendars | Sync meetings and events |
| Read contacts | Import Microsoft contacts |

Click **Accept** to authorize.

### Step 4: Configure Settings

After connecting:

- **Email sync**: Choose what to sync
- **Calendar sync**: Enable two-way sync
- **Contact import**: Optional contact sync
- **Default send account**: Choose reply-from address

### Step 5: Test Connection

1. Verify "Connected" status
2. Check for synced emails
3. Send a test email
4. Create a test calendar event

## Features After Connection

### Email Integration
- Full conversation history on contacts
- Send emails from contact/deal views
- Email templates support
- Open and click tracking

### Calendar Integration
- See Outlook calendar in Zander
- Create meetings from deals
- Availability shown for scheduling
- Two-way event sync

### Contact Sync
- Import Outlook contacts
- Keep contacts synchronized
- Map fields between systems

## Outlook-Specific Settings

### Shared Mailboxes

For shared mailboxes:
1. Connect individual account first
2. Go to **Email Settings > Shared Mailboxes**
3. Add shared mailbox address
4. Assign to team members

### Multiple Accounts

Connect additional accounts:
1. Click **Add Another Account**
2. Complete authorization
3. Set primary send-from account

## Troubleshooting

### Can't Connect

1. Check browser pop-up settings
2. Ensure you're using supported browser
3. Clear cookies and retry
4. Verify Microsoft account access

### Sync Issues

1. Check last sync time
2. Click "Force Sync"
3. Review sync error messages
4. Verify permissions still granted

### Calendar Not Showing

1. Enable calendar sync in settings
2. Check calendar permissions
3. Wait for initial sync (up to 1 hour)
4. Verify correct calendar selected

## Disconnecting Outlook

1. **Settings > Integrations > Outlook**
2. Click **Disconnect**
3. Confirm action

Remove Zander from Microsoft:
1. account.microsoft.com
2. Privacy > Apps and services
3. Remove Zander access`,
      },
      {
        title: 'API Access',
        slug: 'api-access',
        summary: 'Learn how to access the Zander API for custom integrations.',
        category: 'API_DOCS',
        tags: ['integrations', 'api', 'developers', 'webhooks'],
        searchTerms: 'api access key token developer integration webhook rest',
        sortOrder: 32,
        content: `# API Access

Build custom integrations using the Zander REST API.

## Overview

The Zander API allows you to:
- Read and write contacts, deals, and activities
- Trigger automations
- Sync data with external systems
- Build custom applications

## Getting API Credentials

### Generate API Key

1. Go to **Settings > Integrations > API**
2. Click **Generate API Key**
3. Name your key (e.g., "Production Integration")
4. Copy the key immediately (shown only once)

### Key Permissions

Choose permissions for each key:
- **Read**: View data only
- **Write**: Create and update data
- **Delete**: Remove records
- **Admin**: Full access

## Authentication

### API Key Header

Include your API key in all requests:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" \\
     https://api.zanderos.com/contacts
\`\`\`

### JWT Tokens

For user-context operations:
1. Authenticate with username/password
2. Receive JWT token
3. Include token in requests

## API Endpoints

### Base URL

\`https://api.zanderos.com\`

### Common Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| /contacts | GET, POST | List and create contacts |
| /contacts/:id | GET, PUT, DELETE | Single contact operations |
| /deals | GET, POST | List and create deals |
| /deals/:id | GET, PUT, DELETE | Single deal operations |
| /activities | GET, POST | Activity/task management |
| /emails | GET, POST | Email operations |

## Rate Limits

| Plan | Requests/Minute |
|------|-----------------|
| Starter | 60 |
| Professional | 300 |
| Enterprise | 1000 |

Rate limit headers returned:
- \`X-RateLimit-Limit\`
- \`X-RateLimit-Remaining\`
- \`X-RateLimit-Reset\`

## Webhooks

Receive real-time notifications for events.

### Setting Up Webhooks

1. Go to **Settings > Integrations > Webhooks**
2. Click **+ Add Webhook**
3. Enter your endpoint URL
4. Select events to subscribe:
   - contact.created
   - deal.updated
   - email.received
   - etc.
5. Save and test

### Webhook Payload

\`\`\`json
{
  "event": "contact.created",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "id": "contact_abc123",
    "email": "jane@example.com",
    "firstName": "Jane",
    "lastName": "Doe"
  }
}
\`\`\`

## Error Handling

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 429 | Rate limited |
| 500 | Server error |

### Error Response Format

\`\`\`json
{
  "error": "validation_error",
  "message": "Email is required",
  "field": "email"
}
\`\`\`

## SDKs & Libraries

Coming soon:
- JavaScript/TypeScript SDK
- Python SDK
- PHP SDK

## API Documentation

Full API reference:
- [api.zanderos.com/docs](https://api.zanderos.com/docs)
- OpenAPI/Swagger spec available`,
      },
      // ============================================
      // TROUBLESHOOTING (3 articles)
      // ============================================
      {
        title: 'Login Issues',
        slug: 'login-issues',
        summary: 'Troubleshoot common login problems and access issues.',
        category: 'TROUBLESHOOTING',
        tags: ['troubleshooting', 'login', 'access', 'authentication'],
        searchTerms: 'login cant access password locked out authentication error sign in problem',
        sortOrder: 40,
        content: `# Login Issues

Can't log in? Here's how to troubleshoot common login problems.

## "Invalid Email or Password"

### Check Your Email

1. Verify you're using the correct email
2. Check for typos
3. Try lowercase only
4. Confirm which email you signed up with

### Reset Your Password

1. Click **"Forgot Password"** on login page
2. Enter your email address
3. Check inbox (and spam folder)
4. Click reset link within 24 hours
5. Create new password

## Account Locked

After 5 failed attempts, accounts are locked for 30 minutes.

### Wait for Unlock

- Wait 30 minutes
- Try again with correct credentials

### Contact Support

If urgent:
1. Email support@zanderos.com
2. Include your email address
3. We can manually unlock

## Two-Factor Authentication (2FA) Issues

### Lost Authenticator Access

1. Click **"Can't access your authenticator?"**
2. Enter a backup code (provided during setup)
3. Each backup code works once

### No Backup Codes

1. Contact support
2. Verify your identity
3. We'll help reset 2FA

## Browser Issues

### Clear Cache and Cookies

1. Clear browser data
2. Close and reopen browser
3. Try logging in again

### Try Incognito/Private Mode

1. Open incognito/private window
2. Go to app.zanderos.com
3. Attempt login

### Try Different Browser

Test with:
- Chrome
- Firefox
- Safari
- Edge

## Network Issues

### Check Internet Connection

1. Visit other websites
2. Restart router if needed
3. Try mobile data instead of WiFi

### VPN Interference

Some VPNs block our services:
1. Disable VPN temporarily
2. Try logging in
3. Whitelist Zander in VPN settings

## Account Issues

### Account Deactivated

Possible reasons:
- Unpaid subscription
- Admin disabled your access
- Violation of terms

Contact your organization admin or support.

### Wrong Organization

If you belong to multiple organizations:
1. Check you're logging into correct one
2. Use organization-specific login URL
3. Contact admin for access

## Still Can't Log In?

### Gather This Information

Before contacting support:
1. Email address used
2. Browser and version
3. Error message (exact text)
4. Screenshots if possible

### Contact Support

- Email: support@zanderos.com
- Include info above
- We'll respond within 24 hours`,
      },
      {
        title: 'Password Reset',
        slug: 'password-reset',
        summary: 'How to reset your password if you\'ve forgotten it.',
        category: 'TROUBLESHOOTING',
        tags: ['troubleshooting', 'password', 'reset', 'forgot'],
        searchTerms: 'password reset forgot change update credentials new password',
        sortOrder: 41,
        content: `# Password Reset

Forgot your password? Here's how to reset it.

## Request Password Reset

### Step 1: Go to Login Page

Visit [app.zanderos.com/login](https://app.zanderos.com/login)

### Step 2: Click "Forgot Password"

Below the login button, click the link.

### Step 3: Enter Your Email

1. Enter the email associated with your account
2. Click **Send Reset Link**
3. Check for confirmation message

### Step 4: Check Your Email

1. Look for email from "Zander" or "noreply@zanderos.com"
2. Check spam/junk folder
3. Email arrives within 5 minutes

### Step 5: Click Reset Link

1. Click the link in the email
2. Link expires after 24 hours
3. Can only be used once

### Step 6: Create New Password

Requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character

### Step 7: Log In

Use your new password to log in.

## Didn't Receive Email?

### Check Spam Folder

Reset emails sometimes filtered as spam.

### Verify Email Address

Make sure you entered the correct email.

### Request Again

Wait 5 minutes, then request another reset.

### Whitelist Our Email

Add noreply@zanderos.com to contacts/safe senders.

### Contact Support

If still not receiving:
1. Email support@zanderos.com
2. From a different email address
3. Include your Zander account email

## Change Password (When Logged In)

If you know your current password:

1. Go to **Settings > Security**
2. Click **Change Password**
3. Enter current password
4. Enter new password (twice)
5. Click **Update Password**

## Password Best Practices

### Do's

- Use a unique password for Zander
- Consider a password manager
- Enable two-factor authentication
- Update periodically (every 6 months)

### Don'ts

- Don't reuse passwords
- Don't share your password
- Don't use personal info (birthdays, names)
- Don't write it on sticky notes

## Two-Factor Authentication

After resetting your password, enable 2FA:

1. Go to **Settings > Security**
2. Click **Enable 2FA**
3. Scan QR code with authenticator app
4. Enter verification code
5. Save your backup codes

## Account Recovery

If you've lost access to your email too:

1. Contact support@zanderos.com
2. Provide:
   - Your name
   - Organization name
   - Phone number on account
3. We'll verify identity and help recover`,
      },
      {
        title: 'Common Errors',
        slug: 'common-errors',
        summary: 'Solutions for frequently encountered error messages in Zander.',
        category: 'TROUBLESHOOTING',
        tags: ['troubleshooting', 'errors', 'problems', 'issues'],
        searchTerms: 'error message problem issue fix solution something went wrong 500 404 timeout',
        sortOrder: 42,
        content: `# Common Errors

Encountering an error? Here are solutions for common issues.

## "Something Went Wrong"

This generic error usually means a temporary issue.

### Quick Fixes

1. **Refresh the page** (Cmd/Ctrl + R)
2. **Wait a moment** and try again
3. **Clear browser cache**
4. **Try incognito mode**

### If It Persists

1. Note what you were doing
2. Check [status.zanderos.com](https://status.zanderos.com)
3. Contact support with details

## "Session Expired"

Your login session timed out.

### Solution

1. Click **Log In Again**
2. Enter your credentials
3. Check "Remember Me" for longer sessions

### Prevention

- Enable "Remember Me" on login
- Don't leave tab inactive for hours
- Keep browser updated

## "Permission Denied"

You don't have access to this feature.

### Possible Causes

- Role doesn't include this permission
- Feature not in your plan
- Admin-only area

### Solution

1. Contact your organization admin
2. Request appropriate permissions
3. Upgrade plan if feature-limited

## "Network Error" or "Failed to Fetch"

Connection to our servers failed.

### Quick Fixes

1. Check your internet connection
2. Disable VPN temporarily
3. Try a different network
4. Wait and retry

### Check Status

Visit [status.zanderos.com](https://status.zanderos.com) for outage info.

## "Rate Limited" (429 Error)

Too many requests in a short time.

### Solution

1. Wait 1-5 minutes
2. Reduce request frequency
3. For API: check rate limit headers

## "Not Found" (404 Error)

The page or resource doesn't exist.

### Causes

- Typo in URL
- Resource was deleted
- Link is outdated

### Solution

1. Check the URL
2. Use navigation to find correct page
3. Contact support if link came from Zander

## "Timeout" Error

Request took too long to complete.

### Causes

- Large data operation
- Slow connection
- Server under heavy load

### Solution

1. Try again with smaller dataset
2. Check your connection speed
3. Retry during off-peak hours

## Form Validation Errors

Red text indicating invalid input.

### Common Validation Errors

| Error | Solution |
|-------|----------|
| "Email is required" | Enter an email address |
| "Invalid email format" | Check for typos |
| "Password too weak" | Add numbers/symbols |
| "Field is required" | Fill in the field |
| "Invalid date" | Use correct date format |

## Import Errors

When importing data fails.

### "Invalid File Format"

- Use CSV or supported format
- Check file isn't corrupted
- Download and use our template

### "Missing Required Fields"

- Review required columns
- Ensure headers match exactly
- No blank required cells

### "Duplicate Records"

- Check for existing contacts
- Use update option if available
- Deduplicate before import

## Still Stuck?

### Gather Information

- Error message (screenshot)
- URL where error occurred
- Steps to reproduce
- Browser and version

### Contact Support

- Email: support@zanderos.com
- Include all info above
- We'll investigate and help`,
      },
      // ============================================
      // ACCOUNT MANAGEMENT (2 articles)
      // ============================================
      {
        title: 'User Roles',
        slug: 'user-roles',
        summary: 'Understand the different user roles and their permissions in Zander.',
        category: 'PLATFORM_GUIDE',
        tags: ['account', 'roles', 'permissions', 'users', 'admin'],
        searchTerms: 'roles permissions access admin user manager viewer what can do',
        sortOrder: 50,
        content: `# User Roles

Zander uses roles to control what users can see and do.

## Available Roles

### Admin

**Full control** of the organization.

Can:
- Access all features
- Manage users and roles
- Configure settings
- View all data
- Manage billing
- Create/delete any record

Best for: Business owners, IT administrators

### Manager

**Department-level control**.

Can:
- View all team data
- Create and edit records
- Run reports
- Manage team members they supervise
- Configure team settings

Cannot:
- Access billing
- Delete organization data
- Manage other managers

Best for: Sales managers, team leads

### User

**Standard access** for daily work.

Can:
- Access assigned modules
- Create and edit own records
- View shared records
- Run personal reports

Cannot:
- Access settings
- View other users' private data
- Delete records (by default)

Best for: Sales reps, team members

### Viewer

**Read-only access**.

Can:
- View dashboards
- View shared reports
- See team activity

Cannot:
- Create or edit any records
- Access settings
- Export data

Best for: Executives, stakeholders

## Role Permissions Matrix

| Feature | Admin | Manager | User | Viewer |
|---------|-------|---------|------|--------|
| View contacts | ✓ | ✓ | Own/Shared | ✓ |
| Create contacts | ✓ | ✓ | ✓ | ✗ |
| Delete contacts | ✓ | ✓ | ✗ | ✗ |
| View all deals | ✓ | ✓ | Own/Shared | ✓ |
| Manage users | ✓ | Team only | ✗ | ✗ |
| Access billing | ✓ | ✗ | ✗ | ✗ |
| Export data | ✓ | ✓ | Own | ✗ |
| Settings | ✓ | Team | Personal | Personal |

## Assigning Roles

### When Inviting

1. Go to **Settings > Team**
2. Click **Invite Member**
3. Enter email
4. Select role from dropdown
5. Send invitation

### Changing Roles

1. Go to **Settings > Team**
2. Find the user
3. Click **Edit**
4. Change role
5. Save changes

## Custom Permissions

Enterprise plans can customize roles:

1. Go to **Settings > Roles**
2. Click **Create Custom Role**
3. Name the role
4. Toggle individual permissions
5. Save and assign to users

## Best Practices

1. **Principle of least privilege**: Give minimum necessary access
2. **Regular audits**: Review roles quarterly
3. **Document decisions**: Note why users have certain roles
4. **Use teams**: Group users with similar needs
5. **Test before assigning**: Verify permissions work as expected`,
      },
      {
        title: 'Team Invitations',
        slug: 'team-invitations',
        summary: 'Learn how to invite team members and manage access to your organization.',
        category: 'PLATFORM_GUIDE',
        tags: ['account', 'team', 'invitations', 'users', 'onboarding'],
        searchTerms: 'invite team member add user access join organization onboard new employee',
        sortOrder: 51,
        content: `# Team Invitations

Add team members to your Zander organization.

## Inviting Team Members

### Step-by-Step

1. Go to **Settings > Team**
2. Click **+ Invite Member**
3. Enter their email address
4. Select their role (Admin, Manager, User, Viewer)
5. Choose which modules they can access
6. Add a personal message (optional)
7. Click **Send Invitation**

### Bulk Invitations

Invite multiple people at once:

1. Click **Bulk Invite**
2. Enter emails (one per line or comma-separated)
3. Select default role
4. Click **Send All Invitations**

## Invitation Process

### What They Receive

Invitees get an email with:
- Invitation from your organization
- Link to accept
- Your personal message (if added)
- Expiration notice (7 days)

### Accepting an Invitation

The invitee:
1. Clicks the invitation link
2. Creates their password
3. Completes profile setup
4. Accesses the organization

## Managing Invitations

### View Pending Invitations

1. Go to **Settings > Team**
2. Click **Pending Invitations** tab
3. See all outstanding invites

### Resend an Invitation

If they didn't receive it:
1. Find the pending invitation
2. Click **Resend**
3. They'll get a new email

### Cancel an Invitation

1. Find the pending invitation
2. Click **Cancel**
3. Link becomes invalid

### Invitation Expiration

Invitations expire after 7 days. If expired:
1. Cancel the old invitation
2. Send a new one

## After They Join

### Onboarding Checklist

New team members should:
1. Complete their profile
2. Connect their email
3. Review assigned deals/contacts
4. Take the product tour
5. Join team channels

### First Tasks

Assign initial tasks:
1. Go to their profile
2. Click **Assign Task**
3. Create onboarding tasks

## Managing Team Members

### View Team List

**Settings > Team** shows:
- All members
- Their roles
- Status (active, pending)
- Last login

### Edit a Member

1. Click on member name
2. Update role or permissions
3. Modify module access
4. Save changes

### Deactivate a Member

When someone leaves:
1. Click their profile
2. Click **Deactivate**
3. Their data stays, access revoked
4. Can reactivate later

### Transfer Ownership

If the owner leaves:
1. Owner goes to **Settings > Team**
2. Clicks **Transfer Ownership**
3. Selects new owner (must be Admin)
4. Confirms transfer

## Seat Management

### Plan Limits

Each plan has user limits:
- Starter: 3 users
- Professional: 10 users
- Enterprise: Unlimited

### Adding Seats

If at limit:
1. Upgrade plan, or
2. Add additional seats ($10/user/month)

### Viewing Usage

**Settings > Billing > Usage** shows:
- Current seats used
- Seats available
- Cost for additional seats

## Security Notes

- Only Admins can invite users
- Use work emails (avoid personal)
- Review access regularly
- Remove departed employees promptly
- Enable 2FA for all users`,
      },
    ];

    let articlesCreated = 0;
    let articlesSkipped = 0;

    for (const article of articles) {
      const existing = await this.prisma.knowledgeArticle.findUnique({
        where: { slug: article.slug },
      });

      if (!existing) {
        await this.prisma.knowledgeArticle.create({
          data: {
            title: article.title,
            slug: article.slug,
            summary: article.summary,
            content: article.content,
            category: article.category as any,
            tags: article.tags,
            searchTerms: article.searchTerms,
            sortOrder: article.sortOrder,
            isPublished: true,
            createdById: user.id,
          },
        });
        articlesCreated++;
      } else {
        articlesSkipped++;
      }
    }

    details.push(`Knowledge articles: ${articlesCreated} created, ${articlesSkipped} already existed`);
    details.push(`Total articles in database: ${articlesCreated + articlesSkipped}`);

    return {
      success: true,
      message: 'Knowledge base seed completed successfully',
      details,
    };
  }
}
