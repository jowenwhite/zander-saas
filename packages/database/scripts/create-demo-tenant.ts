import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://zander_admin:ZanderProd2026!@zander-prod-db.cavkq4gew6zt.us-east-1.rds.amazonaws.com:5432/zander_prod'
    }
  }
});

async function createDemoTenant() {
  console.log('Creating Pinnacle Property Services demo tenant...\n');

  // STEP 1: Create tenant and user
  const tenant = await prisma.tenant.create({
    data: {
      companyName: 'Pinnacle Property Services',
      subdomain: 'pinnacle-demo',
      tier: 'FREE',
      tierOverride: 'ENTERPRISE',
    }
  });
  console.log('Tenant created: ' + tenant.id);

  const passwordHash = await bcrypt.hash('PinnacleDemo2026!', 10);
  const user = await prisma.user.create({
    data: {
      email: 'demo@pinnaclepropertyservices.com',
      firstName: 'Marcus',
      lastName: 'Chen',
      password: passwordHash,
      tenantId: tenant.id,
    }
  });
  console.log('User created: ' + user.email);

  // STEP 2: Populate HQ

  // Keystones (5 pillars)
  const keystones = [
    { name: 'People', score: 72, notes: 'Team morale strong, hiring pipeline needs attention' },
    { name: 'Process', score: 65, notes: 'SOPs documented but not consistently followed' },
    { name: 'Projects', score: 80, notes: 'On-time completion rate improved this quarter' },
    { name: 'Production', score: 78, notes: 'Efficiency gains from new scheduling system' },
    { name: 'Strategy', score: 58, notes: 'Need clearer 3-year roadmap' },
  ];

  for (const k of keystones) {
    await prisma.keystone.create({
      data: {
        tenantId: tenant.id,
        name: k.name,
        score: k.score,
        notes: k.notes,
        updatedAt: new Date(),
      }
    });
  }
  console.log('Keystones created: ' + keystones.length);

  // Headwinds (4 items)
  const headwinds = [
    'Hiring skilled technicians in competitive market',
    'Rising material costs impacting margins',
    'Scheduling efficiency during peak season',
    'Customer follow-up consistency',
  ];

  for (let i = 0; i < headwinds.length; i++) {
    await prisma.headwind.create({
      data: {
        tenantId: tenant.id,
        title: headwinds[i],
        severity: i === 0 ? 'HIGH' : i === 1 ? 'MEDIUM' : 'LOW',
        status: 'ACTIVE',
      }
    });
  }
  console.log('Headwinds created: ' + headwinds.length);

  // Horizon/HQ Goals (3 items)
  const goals = [
    { title: 'Expand to second service territory by Q3', targetDate: new Date('2026-09-30') },
    { title: 'Launch preventive maintenance subscription program', targetDate: new Date('2026-06-30') },
    { title: 'Hire operations manager to reduce owner dependency', targetDate: new Date('2026-08-15') },
  ];

  for (const g of goals) {
    await prisma.hQGoal.create({
      data: {
        tenantId: tenant.id,
        title: g.title,
        targetDate: g.targetDate,
        status: 'IN_PROGRESS',
        category: 'QUARTERLY',
      }
    });
  }
  console.log('HQ Goals (Horizon) created: ' + goals.length);

  // Founding Principles
  await prisma.founding.create({
    data: {
      tenantId: tenant.id,
      vision: 'To be the most trusted home services company in our region, known for quality craftsmanship and exceptional customer care.',
      mission: 'Delivering expert home improvement solutions that exceed expectations while building lasting relationships with our customers and team.',
      values: JSON.stringify([
        'Every customer interaction is an opportunity to earn a referral',
        'Our reputation is built one job at a time',
        'Invest in our people first'
      ]),
      story: 'Founded in 2018 by Marcus Chen after 15 years in the trades, Pinnacle Property Services started with a simple belief: homeowners deserve contractors who show up on time, communicate clearly, and stand behind their work.',
    }
  });
  console.log('Founding principles created');

  // Assembly (5 recurring items)
  const assemblies = [
    { title: 'Monday morning team huddle', frequency: 'WEEKLY' },
    { title: 'Weekly pipeline review with Jordan', frequency: 'WEEKLY' },
    { title: 'Monthly P&L review', frequency: 'MONTHLY' },
    { title: 'Quarterly strategic planning session', frequency: 'QUARTERLY' },
    { title: 'Daily job completion verification', frequency: 'DAILY' },
  ];

  for (const a of assemblies) {
    await prisma.assembly.create({
      data: {
        tenantId: tenant.id,
        title: a.title,
        frequency: a.frequency,
        status: 'ACTIVE',
      }
    });
  }
  console.log('Assembly items created: ' + assemblies.length);

  // STEP 3: Pipeline stages
  const defaultStages = [
    { name: 'Lead', order: 1, probability: 10 },
    { name: 'Qualified', order: 2, probability: 25 },
    { name: 'Proposal', order: 3, probability: 50 },
    { name: 'Negotiation', order: 4, probability: 75 },
    { name: 'Closed Won', order: 5, probability: 100 },
    { name: 'Closed Lost', order: 6, probability: 0 },
  ];

  for (const s of defaultStages) {
    await prisma.pipelineStage.create({
      data: {
        tenantId: tenant.id,
        name: s.name,
        order: s.order,
        probability: s.probability,
      }
    });
  }

  const pipelineStages = await prisma.pipelineStage.findMany({
    where: { tenantId: tenant.id },
    orderBy: { order: 'asc' }
  });

  const stageMap: Record<string, string> = {};
  for (const s of pipelineStages) {
    stageMap[s.name] = s.id;
  }
  console.log('Pipeline stages created: ' + defaultStages.length);

  // Contacts (8)
  const contacts = [
    { firstName: 'Robert', lastName: 'Thompson', email: 'robert.thompson@email.com', phone: '(555) 234-5678', company: 'Thompson Residence' },
    { firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@email.com', phone: '(555) 345-6789', company: 'Garcia Family' },
    { firstName: 'James', lastName: 'Henderson', email: 'j.henderson@email.com', phone: '(555) 456-7890', company: 'Henderson Home' },
    { firstName: 'Susan', lastName: 'Park', email: 'susan.park@email.com', phone: '(555) 567-8901', company: 'Park Place Estates' },
    { firstName: 'Michael', lastName: 'Rivers', email: 'mrivers@riverside.net', phone: '(555) 678-9012', company: 'Riverside Properties' },
    { firstName: 'Jennifer', lastName: 'Oak', email: 'jen.oak@email.com', phone: '(555) 789-0123', company: 'Oakmont Holdings' },
    { firstName: 'David', lastName: 'West', email: 'dwest@westfield.com', phone: '(555) 890-1234', company: 'Westfield LLC' },
    { firstName: 'Amanda', lastName: 'Brooks', email: 'amanda.brooks@crestview.com', phone: '(555) 901-2345', company: 'Crestview Homes' },
  ];

  const contactIds: string[] = [];
  for (const c of contacts) {
    const contact = await prisma.contact.create({
      data: {
        tenantId: tenant.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        company: c.company,
        status: 'ACTIVE',
      }
    });
    contactIds.push(contact.id);
  }
  console.log('Contacts created: ' + contacts.length);

  // Deals (10)
  const deals = [
    { name: 'Thompson Master Bath Remodel', amount: 18500, stage: 'Lead', contactIdx: 0 },
    { name: 'Garcia Outdoor Kitchen', amount: 22000, stage: 'Lead', contactIdx: 1 },
    { name: 'Henderson Kitchen Cabinets', amount: 14200, stage: 'Qualified', contactIdx: 2 },
    { name: 'Park Place HVAC Upgrade', amount: 9800, stage: 'Qualified', contactIdx: 3 },
    { name: 'Riverside Full Kitchen Reno', amount: 35000, stage: 'Proposal', contactIdx: 4 },
    { name: 'Oakmont Basement Finish', amount: 28000, stage: 'Proposal', contactIdx: 5 },
    { name: 'Westfield Whole-Home Repipe', amount: 12500, stage: 'Negotiation', contactIdx: 6 },
    { name: 'Belmont Deck & Pergola', amount: 16000, stage: 'Closed Won', contactIdx: 7 },
    { name: 'Crestview Bathroom Suite', amount: 11200, stage: 'Closed Won', contactIdx: 7 },
    { name: 'Millbrook Addition', amount: 45000, stage: 'Closed Lost', contactIdx: 0 },
  ];

  for (const d of deals) {
    await prisma.deal.create({
      data: {
        tenantId: tenant.id,
        name: d.name,
        amount: d.amount,
        stageId: stageMap[d.stage],
        contactId: contactIds[d.contactIdx],
        status: d.stage === 'Closed Won' ? 'WON' : d.stage === 'Closed Lost' ? 'LOST' : 'OPEN',
        expectedCloseDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000),
      }
    });
  }
  console.log('Deals created: ' + deals.length);

  // STEP 4: Populate Don CMO

  // Campaigns (4)
  const campaigns = [
    { name: 'Spring Home Improvement Push', type: 'MULTI_CHANNEL', status: 'ACTIVE', startDate: new Date('2026-03-01'), endDate: new Date('2026-05-31') },
    { name: 'Referral Rewards Program', type: 'REFERRAL', status: 'ACTIVE', startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31') },
    { name: 'Google Reviews Campaign', type: 'EMAIL', status: 'ACTIVE', startDate: new Date('2026-04-01'), endDate: new Date('2026-06-30') },
    { name: 'Neighborhood Mailer Q2', type: 'DIRECT_MAIL', status: 'DRAFT', startDate: new Date('2026-04-15'), endDate: new Date('2026-06-15') },
  ];

  for (const c of campaigns) {
    await prisma.campaign.create({
      data: {
        tenantId: tenant.id,
        name: c.name,
        type: c.type,
        status: c.status,
        startDate: c.startDate,
        endDate: c.endDate,
      }
    });
  }
  console.log('Campaigns created: ' + campaigns.length);

  // Content Calendar (10 entries)
  const contentCalendar = [
    { title: 'Before/After kitchen reveal post', date: 1, type: 'SOCIAL' },
    { title: 'Send spring promo email blast', date: 3, type: 'EMAIL' },
    { title: 'Publish deck maintenance tips blog', date: 5, type: 'BLOG' },
    { title: 'Team spotlight: Meet our lead carpenter', date: 8, type: 'SOCIAL' },
    { title: 'Google Ads spring campaign launch', date: 10, type: 'AD' },
    { title: 'Customer testimonial video edit', date: 12, type: 'VIDEO' },
    { title: 'Monthly newsletter send', date: 15, type: 'EMAIL' },
    { title: 'Home show booth planning', date: 18, type: 'EVENT' },
    { title: 'Outdoor living season kickoff post', date: 22, type: 'SOCIAL' },
    { title: 'Q2 direct mail drop', date: 28, type: 'DIRECT_MAIL' },
  ];

  for (const c of contentCalendar) {
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + c.date);

    await prisma.activity.create({
      data: {
        tenantId: tenant.id,
        type: 'TASK',
        subject: c.title,
        notes: 'Content type: ' + c.type,
        scheduledAt: scheduledDate,
        status: 'PENDING',
      }
    });
  }
  console.log('Content calendar entries created: ' + contentCalendar.length);

  // Email Templates (3)
  const emailTemplates = [
    {
      title: 'New Lead Welcome',
      content: 'Hi {{firstName}},\n\nThank you for reaching out to Pinnacle Property Services! We are excited to learn more about your project.\n\nOne of our project consultants will contact you within 24 hours to discuss your needs and schedule a free on-site estimate.\n\nIn the meantime, feel free to browse our portfolio at pinnaclepropertyservices.com/portfolio\n\nBest regards,\nThe Pinnacle Team'
    },
    {
      title: 'Post-Job Follow-Up',
      content: 'Hi {{firstName}},\n\nWe hope you are enjoying your newly completed {{projectType}}!\n\nWe would love to hear about your experience. Would you take 2 minutes to leave us a review on Google? Your feedback helps other homeowners find quality contractors.\n\n[Leave a Review]\n\nIf you have any questions about your project or need anything else, we are just a call away.\n\nThank you for trusting Pinnacle!'
    },
    {
      title: 'Seasonal Promotion',
      content: 'Hi {{firstName}},\n\nSpring is here, and it is the perfect time to tackle those home improvement projects!\n\nThis month only, enjoy 10% off any kitchen or bathroom remodel booked before May 31st.\n\nReady to get started? Reply to this email or call us at (555) 123-4567.\n\nHere is to a beautiful home,\nThe Pinnacle Team'
    },
  ];

  for (const t of emailTemplates) {
    await prisma.knowledge.create({
      data: {
        tenantId: tenant.id,
        title: 'Email Template: ' + t.title,
        content: t.content,
        category: 'EMAIL_TEMPLATE',
        status: 'PUBLISHED',
      }
    });
  }
  console.log('Email templates created: ' + emailTemplates.length);

  // Social Post Drafts (5)
  const socialPosts = [
    {
      title: 'Kitchen Transformation Post',
      content: 'From dated to STUNNING! Check out this kitchen transformation we just completed in Riverside.\n\nNew shaker cabinets, quartz countertops, and that subway tile backsplash our client dreamed about.\n\nWhat is on YOUR home improvement wishlist?\n\n#KitchenRemodel #HomeImprovement #PinnaclePropertyServices #BeforeAndAfter'
    },
    {
      title: 'Team Recognition Post',
      content: 'Shoutout to our amazing crew!\n\nThis week marks Carlos 5th anniversary with Pinnacle. His attention to detail and commitment to quality is why our customers keep coming back.\n\nThank you for being part of the Pinnacle family!\n\n#TeamAppreciation #SkilledTrades #QualityCraftsmanship'
    },
    {
      title: 'Spring Tips Post',
      content: 'Spring Home Maintenance Checklist:\n\n- Clean gutters & downspouts\n- Inspect roof for winter damage\n- Check exterior caulking\n- Service HVAC before summer\n- Power wash deck & siding\n\nNeed help with any of these? We have got you covered!\n\n#SpringMaintenance #HomeTips #PropertyCare'
    },
    {
      title: 'Project Milestone Post',
      content: 'Another happy homeowner!\n\nJust wrapped up a complete basement finishing project in Oakmont. 800 sq ft of new living space including a home theater and wet bar.\n\nDreaming of more space? Let us make it happen.\n\n#BasementFinish #HomeAddition #MoreSpace #PinnacleBuilds'
    },
    {
      title: 'Community Involvement Post',
      content: 'Giving back to our community!\n\nThis weekend, Team Pinnacle volunteered with Habitat for Humanity. Nothing beats using our skills to help families in need.\n\nProud to be part of this amazing community.\n\n#HabitatForHumanity #GivingBack #CommunityFirst #TradesForGood'
    },
  ];

  for (const p of socialPosts) {
    await prisma.knowledge.create({
      data: {
        tenantId: tenant.id,
        title: 'Social Draft: ' + p.title,
        content: p.content,
        category: 'SOCIAL_POST',
        status: 'DRAFT',
      }
    });
  }
  console.log('Social post drafts created: ' + socialPosts.length);

  console.log('\n' + '='.repeat(50));
  console.log('DEMO TENANT SUMMARY');
  console.log('='.repeat(50));
  console.log('Tenant ID: ' + tenant.id);
  console.log('Company: Pinnacle Property Services');
  console.log('User: demo@pinnaclepropertyservices.com');
  console.log('Password: PinnacleDemo2026!');
  console.log('Tier: ENTERPRISE (override)');
  console.log('');
  console.log('HQ Data:');
  console.log('  Keystones: 5');
  console.log('  Headwinds: 4');
  console.log('  HQ Goals (Horizon): 3');
  console.log('  Founding: 1 (with 3 values)');
  console.log('  Assembly: 5');
  console.log('');
  console.log('Jordan CRO Data:');
  console.log('  Pipeline Stages: 6');
  console.log('  Contacts: 8');
  console.log('  Deals: 10');
  console.log('');
  console.log('Don CMO Data:');
  console.log('  Campaigns: 4');
  console.log('  Content Calendar: 10');
  console.log('  Email Templates: 3');
  console.log('  Social Drafts: 5');
  console.log('='.repeat(50));

  await prisma.$disconnect();
}

createDemoTenant().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
