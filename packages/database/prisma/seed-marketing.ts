import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting marketing seed for 64 West Holdings...');

  // Find or create 64 West Holdings tenant
  let tenant = await prisma.tenant.findUnique({
    where: { subdomain: '64west' },
  });

  if (!tenant) {
    console.log('Creating 64 West Holdings tenant...');
    tenant = await prisma.tenant.create({
      data: {
        companyName: '64 West Holdings LLC',
        subdomain: '64west',
        tenantType: 'holding_company',
      },
    });
    console.log(`Created tenant: ${tenant.companyName} (${tenant.id})`);
  } else {
    console.log(`Found tenant: ${tenant.companyName} (${tenant.id})`);
  }

  // Find or create a user for the tenant
  let user = await prisma.user.findFirst({
    where: { tenantId: tenant.id },
  });

  if (!user) {
    console.log('Creating admin user...');
    user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: 'admin@64west.com',
        firstName: 'Admin',
        lastName: '64 West',
        role: 'admin',
        password: '', // Would need hashing in production
      },
    });
    console.log(`Created user: ${user.email}`);
  }

  // ==========================================
  // CAMPAIGNS
  // ==========================================
  console.log('Seeding campaigns...');

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

  for (const campaign of campaigns) {
    const existing = await prisma.campaign.findFirst({
      where: { tenantId: tenant.id, name: campaign.name },
    });

    if (!existing) {
      await prisma.campaign.create({
        data: {
          tenantId: tenant.id,
          ...campaign,
        },
      });
      console.log(`  Created campaign: ${campaign.name}`);
    } else {
      console.log(`  Campaign already exists: ${campaign.name}`);
    }
  }

  // ==========================================
  // FUNNELS
  // ==========================================
  console.log('Seeding funnels...');

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

  for (const funnel of funnels) {
    const existing = await prisma.funnel.findFirst({
      where: { tenantId: tenant.id, name: funnel.name },
    });

    if (!existing) {
      const createdFunnel = await prisma.funnel.create({
        data: {
          tenantId: tenant.id,
          name: funnel.name,
          description: funnel.description,
          status: 'active',
        },
      });

      // Create stages
      for (const stage of funnel.stages) {
        await prisma.funnelStage.create({
          data: {
            funnelId: createdFunnel.id,
            name: stage.name,
            stageType: stage.stageType,
            stageOrder: stage.stageOrder,
          },
        });
      }

      console.log(`  Created funnel: ${funnel.name} with ${funnel.stages.length} stages`);
    } else {
      console.log(`  Funnel already exists: ${funnel.name}`);
    }
  }

  // ==========================================
  // PERSONAS
  // ==========================================
  console.log('Seeding personas...');

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
      interview: `Sam runs a custom cabinet shop that his father started 32 years ago. He took over
the business 8 years ago and has grown it from 12 to 24 employees. Sam is proud of the work
they do but frustrated by the chaos of running the business side.

"I got into this business because I love building beautiful things with my hands. Now I spend
most of my day on the computer, answering emails, chasing invoices, and trying to figure out
which software does what. We have QuickBooks for accounting, some CRM thing the sales guy uses,
a project management tool that nobody really updates, and I'm still tracking a lot of things
in spreadsheets or on sticky notes."

Sam's biggest frustration is the lack of a single system that connects everything. "I want
to open one dashboard and see how my business is doing - not log into five different apps."`,
    },
    {
      name: 'Regional Developer',
      tagline: 'Real estate developer needing flexible financing solutions',
      isDefault: false,
      demographics: {
        age: '40-60',
        location: 'Regional metro areas',
        occupation: 'Real estate developer',
        income: '$200,000+',
        education: 'College degree',
        familyStatus: 'Married, established career',
      },
      psychographics: {
        values: ['Deal flow', 'Relationships', 'Speed to close'],
        personality: 'Confident, deal-oriented, relationship-focused',
        lifestyle: 'Busy with multiple projects, values trusted partners',
      },
      behaviors: {
        techAdoption: 'Uses what works, delegates tech details',
        buyingStyle: 'Relationship-driven, values speed and flexibility',
        researchHabits: 'Network referrals, direct conversations',
      },
      painPoints: [
        'Traditional banks too slow and rigid',
        'Need quick access to bridge financing',
        'Complex deal structures not understood by typical lenders',
        'Frustrated by paperwork and bureaucracy',
      ],
      goals: [
        'Close deals faster with reliable financing',
        'Build long-term lending relationships',
        'Access creative financing solutions',
        'Minimize time spent on financing logistics',
      ],
      preferredChannels: ['phone', 'email', 'in-person'],
      brandAffinities: ['Local banks', 'Private equity firms'],
      interview: null,
    },
    {
      name: 'Growing Founder',
      tagline: 'Startup founder needing strategic guidance and fractional leadership',
      isDefault: false,
      demographics: {
        age: '30-45',
        location: 'Urban areas',
        occupation: 'Startup founder / CEO',
        income: 'Variable, revenue $500K-$5M',
        education: 'College degree or higher',
        familyStatus: 'Young family or single',
      },
      psychographics: {
        values: ['Growth', 'Innovation', 'Building something meaningful'],
        personality: 'Ambitious, driven, open to learning',
        lifestyle: 'All-in on the business, needs trusted advisors',
      },
      behaviors: {
        techAdoption: 'Early adopter, loves new tools',
        buyingStyle: 'ROI-focused, values expertise',
        researchHabits: 'Podcasts, LinkedIn, peer networks',
      },
      painPoints: [
        'Cannot afford full-time C-suite executives',
        'Needs strategic guidance but wears too many hats',
        'Struggles with financial planning and forecasting',
        'Overwhelmed by operational scaling challenges',
      ],
      goals: [
        'Access executive-level expertise affordably',
        'Build scalable operations and processes',
        'Make data-driven strategic decisions',
        'Prepare for next funding round or exit',
      ],
      preferredChannels: ['email', 'linkedin', 'webinar'],
      brandAffinities: ['Y Combinator', 'Sequoia', 'Harvard Business Review'],
      interview: null,
    },
    {
      name: 'Multi-Service Prospect',
      tagline: 'Established business owner who might benefit from all 64 West services',
      isDefault: false,
      demographics: {
        age: '45-60',
        location: 'Suburban/regional',
        occupation: 'Business owner, 20-50 employees',
        income: '$150,000+',
        education: 'College or trade school',
        familyStatus: 'Established family',
      },
      psychographics: {
        values: ['Stability', 'Growth', 'Trusted partnerships'],
        personality: 'Established, looking to level up',
        lifestyle: 'Successful but seeking efficiency',
      },
      behaviors: {
        techAdoption: 'Selective, needs clear value',
        buyingStyle: 'Relationship and referral driven',
        researchHabits: 'Peers, professional networks, advisors',
      },
      painPoints: [
        'Business has grown past their management capabilities',
        'Needs better systems but overwhelmed by options',
        'Looking for financing for expansion',
        'Wants strategic guidance without full-time hires',
      ],
      goals: [
        'Find trusted partners for multiple business needs',
        'Streamline operations with better technology',
        'Access growth capital and financing',
        'Get strategic guidance for next growth phase',
      ],
      preferredChannels: ['phone', 'email', 'in-person'],
      brandAffinities: ['Local business community', 'Chamber of Commerce'],
      interview: null,
    },
  ];

  for (const persona of personas) {
    const existing = await prisma.persona.findFirst({
      where: { tenantId: tenant.id, name: persona.name },
    });

    if (!existing) {
      await prisma.persona.create({
        data: {
          tenantId: tenant.id,
          ...persona,
        },
      });
      console.log(`  Created persona: ${persona.name}`);
    } else {
      console.log(`  Persona already exists: ${persona.name}`);
    }
  }

  // ==========================================
  // MONTHLY THEME
  // ==========================================
  console.log('Seeding monthly theme...');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed

  await prisma.monthlyTheme.upsert({
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
  console.log(`  Upserted monthly theme for ${currentYear}-${currentMonth}`);

  // ==========================================
  // CALENDAR EVENTS
  // ==========================================
  console.log('Seeding calendar events...');

  // Helper to get a date in the current month
  const getDateThisMonth = (day: number, hour: number = 10) => {
    const date = new Date(currentYear, currentMonth - 1, day, hour, 0, 0);
    return date;
  };

  const calendarEvents = [
    {
      title: 'Zander Launch Email Blast',
      description: 'Send initial launch announcement to all prospects and leads',
      eventType: 'task',
      category: 'content',
      startTime: getDateThisMonth(3, 9),
      endTime: getDateThisMonth(3, 10),
      marketingChannel: 'email',
      contentStatus: 'scheduled',
    },
    {
      title: 'Finance Q1 Promo Kickoff',
      description: 'Launch Q1 loan promotion campaign with competitive rates',
      eventType: 'task',
      category: 'campaign',
      startTime: getDateThisMonth(5, 10),
      endTime: getDateThisMonth(5, 11),
      marketingChannel: 'email',
      contentStatus: 'draft',
    },
    {
      title: 'Social Media: Small Biz Tips',
      description: 'Weekly social media posts with small business tips and Zander features',
      eventType: 'task',
      category: 'social',
      startTime: getDateThisMonth(8, 14),
      endTime: getDateThisMonth(8, 15),
      marketingChannel: 'social',
      contentStatus: 'draft',
    },
    {
      title: 'Consulting Webinar: Strategy 101',
      description: 'Free webinar on business strategy fundamentals to generate consulting leads',
      eventType: 'meeting',
      category: 'event',
      startTime: getDateThisMonth(10, 13),
      endTime: getDateThisMonth(10, 14),
      marketingChannel: 'webinar',
      contentStatus: 'scheduled',
    },
    {
      title: 'Blog Post: SaaS for SMBs',
      description: 'Publish blog post about benefits of unified SaaS platforms for small businesses',
      eventType: 'task',
      category: 'content',
      startTime: getDateThisMonth(15, 10),
      endTime: getDateThisMonth(15, 11),
      marketingChannel: 'content',
      contentStatus: 'draft',
    },
    {
      title: 'Finance Follow-up Sequence',
      description: 'Launch automated follow-up email sequence for loan inquiries',
      eventType: 'task',
      category: 'campaign',
      startTime: getDateThisMonth(17, 9),
      endTime: getDateThisMonth(17, 10),
      marketingChannel: 'email',
      contentStatus: 'draft',
    },
    {
      title: 'Cross-sell Email Campaign',
      description: 'Email campaign to existing customers about complementary services across business units',
      eventType: 'task',
      category: 'campaign',
      startTime: getDateThisMonth(22, 10),
      endTime: getDateThisMonth(22, 11),
      marketingChannel: 'email',
      contentStatus: 'draft',
    },
    {
      title: 'Monthly Performance Review',
      description: 'Internal review of marketing performance, campaign results, and next month planning',
      eventType: 'meeting',
      category: 'internal',
      startTime: getDateThisMonth(25, 15),
      endTime: getDateThisMonth(25, 16),
      marketingChannel: null,
      contentStatus: null,
    },
  ];

  for (const event of calendarEvents) {
    const existing = await prisma.calendarEvent.findFirst({
      where: {
        tenantId: tenant.id,
        title: event.title,
        startTime: event.startTime,
      },
    });

    if (!existing) {
      await prisma.calendarEvent.create({
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
      console.log(`  Created event: ${event.title}`);
    } else {
      console.log(`  Event already exists: ${event.title}`);
    }
  }

  console.log('\nMarketing seed completed!');
  console.log('Summary:');
  console.log('  - 6 Campaigns (2 per business unit)');
  console.log('  - 3 Funnels with stages');
  console.log('  - 4 Personas');
  console.log('  - 1 Monthly theme');
  console.log('  - 8 Calendar events');
}

main()
  .catch((e) => {
    console.error('Error seeding marketing data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
