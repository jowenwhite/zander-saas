import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const SUMMIT_SUBDOMAIN = 'summit-home-services';

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function nextWeekday(dayOfWeek: number, hour: number, minute: number = 0): Date {
  // dayOfWeek: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const now = new Date();
  const today = now.getDay();
  let daysUntil = dayOfWeek - today;
  if (daysUntil <= 0) daysUntil += 7;
  const d = new Date(now);
  d.setDate(d.getDate() + daysUntil);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function weeksFromNow(weeks: number, dayOfWeek: number, hour: number, minute: number = 0): Date {
  const base = nextWeekday(dayOfWeek, hour, minute);
  base.setDate(base.getDate() + weeks * 7);
  return base;
}

// ==========================================
// KEYSTONES — 5 Pillar Scores (radar chart data)
// ==========================================
const KEYSTONES = [
  {
    executive: 'CPO',
    label: 'People',
    value: '78',
    numericValue: 78,
    target: '90',
    numericTarget: 90,
    trend: 'UP',
    trendValue: '+3 pts',
    color: '#0288D1',
    icon: 'users',
    sortOrder: 0,
  },
  {
    executive: 'COO',
    label: 'Process',
    value: '72',
    numericValue: 72,
    target: '80',
    numericTarget: 80,
    trend: 'FLAT',
    trendValue: '0 pts',
    color: '#5E35B1',
    icon: 'settings',
    sortOrder: 1,
  },
  {
    executive: 'CRO',
    label: 'Projects',
    value: '85',
    numericValue: 85,
    target: '85',
    numericTarget: 85,
    trend: 'UP',
    trendValue: '+5 pts',
    color: '#00CCEE',
    icon: 'briefcase',
    sortOrder: 2,
  },
  {
    executive: 'COO',
    label: 'Production',
    value: '80',
    numericValue: 80,
    target: '85',
    numericTarget: 85,
    trend: 'UP',
    trendValue: '+2 pts',
    color: '#2E7D32',
    icon: 'barChart',
    sortOrder: 3,
  },
  {
    executive: 'CEO',
    label: 'Strategy',
    value: '65',
    numericValue: 65,
    target: '80',
    numericTarget: 80,
    trend: 'DOWN',
    trendValue: '-2 pts',
    color: '#F57C00',
    icon: 'map',
    sortOrder: 4,
  },
];

// ==========================================
// HEADWINDS — Current Challenges
// ==========================================
const HEADWINDS = [
  {
    title: 'Hiring skilled HVAC technicians in a competitive Denver market',
    description:
      'Denver trade labor market is extremely tight. Two open technician positions have been posted for 6 weeks with limited qualified applicants. Competing with larger companies offering higher base pay.',
    priority: 'P1',
    category: 'TASK',
    status: 'IN_PROGRESS',
  },
  {
    title: 'Material costs up 18% year-over-year — impacting margins on fixed-price contracts',
    description:
      'Equipment and material costs have risen significantly due to supply chain issues and inflation. Fixed-price contracts signed 3-6 months ago are now being fulfilled at reduced margins.',
    priority: 'P1',
    category: 'TASK',
    status: 'OPEN',
  },
  {
    title: 'Peak summer season scheduling — 3-week backlog on AC installations',
    description:
      'Summer demand surge has created a 3-week backlog on AC installation jobs. Customers are frustrated with wait times and some are calling competitors. Need to add capacity or manage expectations better.',
    priority: 'P2',
    category: 'TASK',
    status: 'IN_PROGRESS',
  },
  {
    title: 'Customer follow-up consistency after job completion',
    description:
      'Post-service follow-up is inconsistent. Google review requests are not always sent, and thank-you calls are being skipped during busy periods. This is impacting our review count and repeat business rate.',
    priority: 'P2',
    category: 'TASK',
    status: 'OPEN',
  },
  {
    title: 'Cash flow timing gap between job completion and payment collection',
    description:
      'Commercial clients are averaging 28 days to pay invoices, creating a cash flow gap during high-expense months. Need to tighten payment terms or add financing incentives for faster collection.',
    priority: 'P3',
    category: 'TASK',
    status: 'OPEN',
  },
];

// ==========================================
// HORIZON (IdeaParkingLot) — Future Goals
// ==========================================
const HORIZON_ITEMS = [
  {
    title: 'Expand into Aurora and Lakewood service territories by September',
    description:
      'We have had multiple inquiries from Aurora and Lakewood homeowners that we are turning away. Adding 1 technician dedicated to these areas could add $15K-$20K/month in revenue.',
    category: 'growth',
    source: 'owner',
    priority: 'high',
    status: 'parked',
  },
  {
    title: 'Launch preventive maintenance subscription program — target 200 members by year-end',
    description:
      'Recurring revenue model with annual maintenance plans. $299/year for AC + furnace tune-ups. 200 members = $60K guaranteed annual revenue. Need to design the offer and train the sales team.',
    category: 'revenue',
    source: 'strategy_session',
    priority: 'high',
    status: 'parked',
  },
  {
    title: 'Hire operations manager to reduce Mike\'s daily involvement in scheduling',
    description:
      'Mike is spending 3+ hours/day on scheduling and dispatch. An operations manager at $65K would free him to focus on growth and sales. Break-even: just one additional $65K job per month.',
    category: 'operations',
    source: 'owner',
    priority: 'normal',
    status: 'parked',
  },
  {
    title: 'Implement GPS fleet tracking to optimize route efficiency',
    description:
      'Estimated 15-20% reduction in drive time with route optimization. 3 trucks × 1.5 hrs saved/day = 4.5 hrs additional billable time. $800/truck software cost vs. ~$2,700/month recovered capacity.',
    category: 'efficiency',
    source: 'team',
    priority: 'normal',
    status: 'parked',
  },
];

// ==========================================
// HQ GOALS — Personal, Quarterly, Annual
// ==========================================
const HQ_GOALS = [
  // Personal goals (Mike's)
  {
    title: 'Reduce time on scheduling to under 1 hour per day',
    description: 'Delegate dispatch decisions to Jessica. Document SOPs for common scenarios.',
    scope: 'PERSONAL',
    status: 'ACTIVE',
    priority: 'P1',
    progress: 35,
    dueDate: daysFromNow(60),
    ownerName: 'Mike Sullivan',
  },
  {
    title: 'Complete NATE certification for commercial HVAC',
    description: 'Strengthens our commercial bid credibility and opens larger contract opportunities.',
    scope: 'PERSONAL',
    status: 'ACTIVE',
    priority: 'P2',
    progress: 20,
    dueDate: daysFromNow(120),
    ownerName: 'Mike Sullivan',
  },
  {
    title: 'Take 2 full weeks off without operations calls',
    description: 'Prove the business can run without Mike on the phone.',
    scope: 'PERSONAL',
    status: 'ACTIVE',
    priority: 'P3',
    progress: 10,
    dueDate: daysFromNow(180),
    ownerName: 'Mike Sullivan',
  },

  // Quarterly goals (Q2 2026)
  {
    title: 'Book 150 AC tune-ups before July 15',
    description: 'Spring campaign goal. Currently at 89 booked.',
    scope: 'QUARTERLY',
    status: 'ACTIVE',
    priority: 'P1',
    progress: 59,
    targetValue: 150,
    currentValue: 89,
    quarter: 'Q2',
    year: 2026,
    dueDate: new Date('2026-07-15'),
    ownerName: 'Tyler Brooks',
  },
  {
    title: 'Close 2 commercial maintenance contracts',
    description: 'Target: Denver PM Group and one other property manager. Total contract value: $25K+.',
    scope: 'QUARTERLY',
    status: 'ACTIVE',
    priority: 'P1',
    progress: 40,
    targetValue: 2,
    currentValue: 0,
    quarter: 'Q2',
    year: 2026,
    dueDate: new Date('2026-06-30'),
    ownerName: 'Jessica Reyes',
  },
  {
    title: 'Achieve 50 Google reviews with 4.8+ average',
    description: 'Currently at 34 reviews, 4.8 average. Send review requests within 24 hours of service.',
    scope: 'QUARTERLY',
    status: 'ACTIVE',
    priority: 'P2',
    progress: 68,
    targetValue: 50,
    currentValue: 34,
    quarter: 'Q2',
    year: 2026,
    dueDate: new Date('2026-06-30'),
    ownerName: 'Amanda Foster',
  },

  // Annual goals
  {
    title: 'Reach $1M in annual revenue',
    description: 'YTD at $412K through April. Requires strong Q2-Q3 performance.',
    scope: 'ANNUAL',
    status: 'ACTIVE',
    priority: 'P1',
    progress: 41,
    targetValue: 1000000,
    currentValue: 412500,
    year: 2026,
    dueDate: new Date('2026-12-31'),
    ownerName: 'Mike Sullivan',
  },
  {
    title: 'Add 1 skilled HVAC technician to the team',
    description: 'Required to support territorial expansion and reduce scheduling backlog.',
    scope: 'ANNUAL',
    status: 'ACTIVE',
    priority: 'P1',
    progress: 30,
    year: 2026,
    dueDate: new Date('2026-08-31'),
    ownerName: 'Mike Sullivan',
  },
  {
    title: 'Launch maintenance subscription plan with 100 members',
    description: 'Design offer, train team, launch marketing campaign. First sign-ups expected in Q3.',
    scope: 'ANNUAL',
    status: 'ACTIVE',
    priority: 'P2',
    progress: 15,
    targetValue: 100,
    currentValue: 0,
    year: 2026,
    dueDate: new Date('2026-12-31'),
    ownerName: 'Mike Sullivan',
  },
];

// ==========================================
// LEDGER ENTRIES — Financial Tracking
// ==========================================
const LEDGER_ENTRIES = [
  // Revenue
  {
    category: 'COMPANY',
    name: 'Revenue — This Month',
    keystone: 'Revenue',
    value: '$87,400',
    numericValue: 87400,
    target: '$85,000',
    numericTarget: 85000,
    progress: 103,
    trend: 'UP',
    status: 'ON_TRACK',
    period: 'April 2026',
    sortOrder: 0,
  },
  {
    category: 'COMPANY',
    name: 'Revenue — Last Month',
    keystone: 'Revenue',
    value: '$92,100',
    numericValue: 92100,
    target: '$85,000',
    numericTarget: 85000,
    progress: 108,
    trend: 'UP',
    status: 'ON_TRACK',
    period: 'March 2026',
    sortOrder: 1,
  },
  {
    category: 'COMPANY',
    name: 'YTD Revenue',
    keystone: 'Revenue',
    value: '$412,500',
    numericValue: 412500,
    target: '$1,000,000',
    numericTarget: 1000000,
    progress: 41,
    trend: 'UP',
    status: 'ON_TRACK',
    period: 'Jan–Apr 2026',
    sortOrder: 2,
  },
  {
    category: 'COMPANY',
    name: 'Monthly Target',
    keystone: 'Revenue',
    value: '$85,000',
    numericValue: 85000,
    target: '$85,000',
    numericTarget: 85000,
    progress: 100,
    trend: 'FLAT',
    status: 'ON_TRACK',
    period: 'April 2026',
    sortOrder: 3,
  },
  {
    category: 'COMPANY',
    name: 'Profit Margin',
    keystone: 'Margin',
    value: '32%',
    numericValue: 32,
    target: '35%',
    numericTarget: 35,
    progress: 91,
    trend: 'DOWN',
    status: 'AT_RISK',
    period: 'April 2026',
    sortOrder: 4,
  },
  {
    category: 'COMPANY',
    name: 'Outstanding Invoices',
    keystone: 'Receivables',
    value: '$24,800',
    numericValue: 24800,
    target: '$15,000',
    numericTarget: 15000,
    progress: 0,
    trend: 'UP',
    status: 'AT_RISK',
    period: 'As of Apr 26',
    sortOrder: 5,
  },
  {
    category: 'COMPANY',
    name: 'Open Pipeline Value',
    keystone: 'Pipeline',
    value: '$96,200',
    numericValue: 96200,
    target: '$80,000',
    numericTarget: 80000,
    progress: 120,
    trend: 'UP',
    status: 'ON_TRACK',
    period: 'Current',
    sortOrder: 6,
  },
  // Team metrics
  {
    category: 'TEAM',
    name: 'Active Technicians',
    keystone: 'Team',
    value: '3',
    numericValue: 3,
    target: '4',
    numericTarget: 4,
    progress: 75,
    trend: 'FLAT',
    status: 'AT_RISK',
    period: 'Current',
    sortOrder: 7,
  },
  {
    category: 'TEAM',
    name: 'Jobs Completed — This Month',
    keystone: 'Production',
    value: '47',
    numericValue: 47,
    target: '55',
    numericTarget: 55,
    progress: 85,
    trend: 'UP',
    status: 'ON_TRACK',
    period: 'April 2026',
    sortOrder: 8,
  },
  {
    category: 'TEAM',
    name: 'Customer Satisfaction Score',
    keystone: 'CSAT',
    value: '4.8 / 5.0',
    numericValue: 4.8,
    target: '4.9',
    numericTarget: 4.9,
    progress: 98,
    trend: 'UP',
    status: 'ON_TRACK',
    period: 'April 2026',
    sortOrder: 9,
  },
];

// ==========================================
// ASSEMBLY (CalendarEvents for recurring meetings)
// ==========================================
// These generate real upcoming calendar events for a busy, organized schedule
function buildAssemblyEvents(userId: string, tenantId: string) {
  const events = [];

  // Monday Morning Team Huddle (next 4 Mondays)
  for (let week = 0; week < 4; week++) {
    const start = weeksFromNow(week, 1, 7, 30); // Monday 7:30 AM
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 30);
    events.push({
      tenantId,
      createdById: userId,
      title: 'Monday Morning Team Huddle',
      description: 'Weekly all-hands: safety updates, schedule review, open items from previous week.',
      eventType: 'meeting',
      category: 'internal',
      startTime: start,
      endTime: end,
      status: 'scheduled',
      color: '#0288D1',
      timezone: 'America/Denver',
    });
  }

  // Pipeline Review with Jessica (Tuesdays 3 PM)
  for (let week = 0; week < 3; week++) {
    const start = weeksFromNow(week, 2, 15, 0); // Tuesday 3:00 PM
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 60);
    events.push({
      tenantId,
      createdById: userId,
      title: 'Pipeline Review with Jessica',
      description: 'Weekly deal review: open opportunities, follow-ups needed, proposals to close.',
      eventType: 'meeting',
      category: 'sales',
      startTime: start,
      endTime: end,
      status: 'scheduled',
      color: '#00CCEE',
      timezone: 'America/Denver',
    });
  }

  // Monthly P&L Deep Dive (1st Friday of month)
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);
  while (nextMonth.getDay() !== 5) nextMonth.setDate(nextMonth.getDate() + 1);
  nextMonth.setHours(10, 0, 0, 0);
  const plEnd = new Date(nextMonth);
  plEnd.setHours(12, 0, 0, 0);
  events.push({
    tenantId,
    createdById: userId,
    title: 'Monthly P&L Deep Dive',
    description: 'Review financials, margin by service line, expenses vs. budget, outstanding invoices.',
    eventType: 'meeting',
    category: 'finance',
    startTime: nextMonth,
    endTime: plEnd,
    status: 'scheduled',
    color: '#2E7D32',
    timezone: 'America/Denver',
  });

  // Quarterly Strategic Planning
  const quarterlyStart = daysFromNow(65);
  quarterlyStart.setHours(9, 0, 0, 0);
  const quarterlyEnd = new Date(quarterlyStart);
  quarterlyEnd.setHours(17, 0, 0, 0);
  events.push({
    tenantId,
    createdById: userId,
    title: 'Quarterly Strategic Planning Session',
    description: 'Q3 2026 planning: goals, initiatives, hiring plan, territory expansion review.',
    eventType: 'meeting',
    category: 'strategy',
    startTime: quarterlyStart,
    endTime: quarterlyEnd,
    status: 'scheduled',
    color: '#F57C00',
    timezone: 'America/Denver',
  });

  // Daily Job Completion Verification (next 5 business days)
  for (let i = 1; i <= 5; i++) {
    const d = daysFromNow(i);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue; // skip weekends
    d.setHours(17, 0, 0, 0);
    const dEnd = new Date(d);
    dEnd.setMinutes(dEnd.getMinutes() + 15);
    events.push({
      tenantId,
      createdById: userId,
      title: 'Daily Job Completion Verification',
      description: 'Confirm all scheduled jobs completed, flag any issues, update statuses.',
      eventType: 'task',
      category: 'operations',
      startTime: d,
      endTime: dEnd,
      status: 'scheduled',
      color: '#5E35B1',
      timezone: 'America/Denver',
    });
  }

  // Service appointments (upcoming customer visits)
  const appointments = [
    {
      title: 'Garcia Residence — HVAC Estimate',
      description: 'In-home estimate for full HVAC system replacement. Aurora address.',
      dayOffset: 2,
      hour: 10,
      duration: 90,
      color: '#BF0A30',
    },
    {
      title: 'Thompson Home — Kitchen Plumbing Walk-Through',
      description: 'Walk-through for kitchen plumbing remodel scope before issuing proposal.',
      dayOffset: 3,
      hour: 14,
      duration: 60,
      color: '#BF0A30',
    },
    {
      title: 'Henderson Kitchen & Bath — Proposal Review',
      description: 'Present $18,500 remodel proposal to clients.',
      dayOffset: 4,
      hour: 11,
      duration: 60,
      color: '#BF0A30',
    },
    {
      title: 'Riverside Condos — Site Visit',
      description: 'Walk all 6 units to scope AC installation project.',
      dayOffset: 5,
      hour: 9,
      duration: 120,
      color: '#BF0A30',
    },
    {
      title: 'Bradley Residence — Electrical Assessment',
      description: 'Whole house rewire assessment and quote preparation.',
      dayOffset: 7,
      hour: 13,
      duration: 90,
      color: '#BF0A30',
    },
    {
      title: 'Summit View Apartments — Project Kickoff',
      description: 'HVAC retrofit project kickoff for 12-unit building. Meet with property manager.',
      dayOffset: 8,
      hour: 10,
      duration: 60,
      color: '#BF0A30',
    },
    {
      title: 'Denver Tech Center — Generator Emergency Consult',
      description: 'Emergency generator install consultation. Client wants a fast decision.',
      dayOffset: 9,
      hour: 15,
      duration: 90,
      color: '#BF0A30',
    },
    {
      title: 'Chen Family — Panel Upgrade Install',
      description: 'Scheduled electrical panel upgrade installation.',
      dayOffset: 10,
      hour: 8,
      duration: 240,
      color: '#BF0A30',
    },
  ];

  for (const appt of appointments) {
    const start = daysFromNow(appt.dayOffset);
    start.setHours(appt.hour, 0, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + appt.duration);
    events.push({
      tenantId,
      createdById: userId,
      title: appt.title,
      description: appt.description,
      eventType: 'appointment',
      category: 'service',
      startTime: start,
      endTime: end,
      status: 'scheduled',
      color: appt.color,
      timezone: 'America/Denver',
    });
  }

  return events;
}

// ==========================================
// ADDITIONAL CONTACTS (for the new pipeline deals)
// ==========================================
const ADDITIONAL_CONTACTS = [
  {
    firstName: 'Luis',
    lastName: 'Garcia',
    email: 'luis.garcia.aurora@gmail.com',
    phone: '720-555-6610',
    primaryRole: 'CLIENT' as const,
    source: 'Google',
    notes: 'Aurora homeowner. Aging HVAC system, wants full replacement quote.',
    lifecycleStage: 'lead',
    leadScore: 65,
  },
  {
    firstName: 'James',
    lastName: 'Walton',
    email: 'james.walton.realty@gmail.com',
    phone: '303-555-8821',
    company: 'Walton Properties',
    title: 'Property Owner',
    primaryRole: 'CLIENT' as const,
    source: 'Referral',
    notes: 'Owns Maple Street duplex. Needs plumbing rough-in for bathroom addition.',
    lifecycleStage: 'lead',
    leadScore: 60,
  },
  {
    firstName: 'Karen',
    lastName: 'Nguyen',
    email: 'karen.nguyen.condos@outlook.com',
    phone: '720-555-4412',
    company: 'Riverside Condo Association',
    title: 'HOA President',
    primaryRole: 'CLIENT' as const,
    source: 'Website',
    notes: 'Managing 6-unit condo association. All units need new AC. Big opportunity.',
    lifecycleStage: 'lead',
    leadScore: 80,
  },
  {
    firstName: 'Paul',
    lastName: 'Dorsey',
    email: 'paul.dorsey@parkplaceoffice.com',
    phone: '303-555-9934',
    company: 'Park Place Office Suites',
    title: 'Facilities Director',
    primaryRole: 'CLIENT' as const,
    source: 'Google',
    notes: 'Commercial office property. Needs HVAC service contract for 8,000 sq ft space.',
    lifecycleStage: 'lead',
    leadScore: 70,
  },
  {
    firstName: 'Tom',
    lastName: 'Henderson',
    email: 'tom.henderson.denver@gmail.com',
    phone: '303-555-2278',
    primaryRole: 'CLIENT' as const,
    source: 'Referral',
    notes: 'Full kitchen and bath remodel — plumbing and HVAC coordination. Large project.',
    lifecycleStage: 'lead',
    leadScore: 75,
  },
  {
    firstName: 'Doug',
    lastName: 'Bradley',
    email: 'doug.bradley.co@gmail.com',
    phone: '720-555-7743',
    primaryRole: 'CLIENT' as const,
    source: 'Website',
    notes: 'Older home needs complete rewire. Safety concern prompted the call.',
    lifecycleStage: 'lead',
    leadScore: 70,
  },
  {
    firstName: 'Victor',
    lastName: 'Morales',
    email: 'victor.morales@summitviewapts.com',
    phone: '303-555-5519',
    company: 'Summit View Apartments',
    title: 'Property Manager',
    primaryRole: 'CLIENT' as const,
    source: 'Referral',
    notes: '12-unit apartment complex. Full HVAC retrofit project. Referred by Mark Reynolds.',
    lifecycleStage: 'lead',
    leadScore: 90,
  },
  {
    firstName: 'Susan',
    lastName: 'Park',
    email: 'susan.park@dtcbuildings.com',
    phone: '720-555-3381',
    company: 'DTC Commercial Properties',
    title: 'Building Manager',
    primaryRole: 'CLIENT' as const,
    source: 'Google',
    notes: 'Denver Tech Center commercial building. Emergency generator project — urgent.',
    lifecycleStage: 'lead',
    leadScore: 85,
  },
  {
    firstName: 'Greg',
    lastName: 'Highland',
    email: 'greg.highland.construction@gmail.com',
    phone: '303-555-1156',
    company: 'Highland Park Builders',
    title: 'Project Manager',
    primaryRole: 'CLIENT' as const,
    source: 'Website',
    notes: 'New construction HVAC. Lost bid to lower-cost competitor. Keep in pipeline for future projects.',
    lifecycleStage: 'subscriber',
    leadScore: 20,
  },
  {
    firstName: 'Ryan',
    lastName: 'Pinnacle',
    email: 'ryan.pinnacle@pinnacleproperties.com',
    phone: '720-555-9988',
    company: 'Pinnacle Properties',
    title: 'Owner',
    primaryRole: 'CLIENT' as const,
    source: 'Referral',
    notes: 'Manages 3 commercial buildings. Just completed a major plumbing project. High repeat value.',
    lifecycleStage: 'customer',
    leadScore: 95,
  },
];

// ==========================================
// ADDITIONAL DEALS (prompt's 15-18 deal pipeline)
// ==========================================
function buildDeals(
  tenantId: string,
  stageMap: Record<string, string>,
  contactMap: Record<string, string>,
  mikeId: string,
  jessicaId: string,
  tylerId: string,
) {
  return [
    // LEAD ($18,500 total)
    {
      tenantId,
      dealName: 'Garcia Residence — Full HVAC System',
      contactId: contactMap['luis.garcia.aurora@gmail.com'],
      dealValue: 12500,
      stage: stageMap['Lead'] || 'Lead',
      priority: 'HIGH' as const,
      probability: 10,
      status: 'open',
      notes: 'Full HVAC system replacement in Aurora. Unit is 20 years old. Strong replacement candidate.',
      nextSteps: 'Schedule in-home estimate',
      expectedCloseDate: daysFromNow(30),
      assignedToId: tylerId,
      ownerId: mikeId,
    },
    {
      tenantId,
      dealName: 'Maple Street Duplex — Plumbing Rough-In',
      contactId: contactMap['james.walton.realty@gmail.com'],
      dealValue: 3800,
      stage: stageMap['Lead'] || 'Lead',
      priority: 'MEDIUM' as const,
      probability: 10,
      status: 'open',
      notes: 'Bathroom addition plumbing rough-in. Owner wants to start construction in 6 weeks.',
      nextSteps: 'Confirm scope and schedule site visit',
      expectedCloseDate: daysFromNow(21),
      assignedToId: tylerId,
      ownerId: mikeId,
    },
    {
      tenantId,
      dealName: 'Chen Family — Electrical Panel Upgrade',
      contactId: contactMap['dchen.denver@outlook.com'],
      dealValue: 2200,
      stage: stageMap['Lead'] || 'Lead',
      priority: 'MEDIUM' as const,
      probability: 10,
      status: 'open',
      notes: 'Older home needs 200-amp panel upgrade. Safety concern. Called after neighbor recommendation.',
      nextSteps: 'Call to schedule assessment',
      expectedCloseDate: daysFromNow(14),
      assignedToId: tylerId,
      ownerId: mikeId,
    },

    // QUALIFIED ($24,200 total)
    {
      tenantId,
      dealName: 'Riverside Condos — 6-Unit AC Install',
      contactId: contactMap['karen.nguyen.condos@outlook.com'],
      dealValue: 15600,
      stage: stageMap['Qualified'] || 'Qualified',
      priority: 'HIGH' as const,
      probability: 25,
      status: 'open',
      notes: '6-unit condo association. All units need new AC. HOA board vote pending — likely approval.',
      nextSteps: 'Provide formal proposal after site visit',
      expectedCloseDate: daysFromNow(21),
      assignedToId: jessicaId,
      ownerId: mikeId,
    },
    {
      tenantId,
      dealName: 'Thompson Home — Kitchen Plumbing Remodel',
      contactId: contactMap['sarah.t.thompson@yahoo.com'],
      dealValue: 5400,
      stage: stageMap['Qualified'] || 'Qualified',
      priority: 'MEDIUM' as const,
      probability: 25,
      status: 'open',
      notes: 'Kitchen expansion requires full plumbing relocate. Estimate walk-through scheduled.',
      nextSteps: 'Complete walk-through, issue proposal',
      expectedCloseDate: daysFromNow(18),
      assignedToId: tylerId,
      ownerId: mikeId,
    },
    {
      tenantId,
      dealName: 'Park Place Office — Commercial HVAC Service',
      contactId: contactMap['paul.dorsey@parkplaceoffice.com'],
      dealValue: 3200,
      stage: stageMap['Qualified'] || 'Qualified',
      priority: 'MEDIUM' as const,
      probability: 25,
      status: 'open',
      notes: 'Commercial service contract opportunity. Annual value $3,200. Toured facility.',
      nextSteps: 'Draft service agreement',
      expectedCloseDate: daysFromNow(28),
      assignedToId: jessicaId,
      ownerId: mikeId,
    },

    // PROPOSAL ($31,500 total)
    {
      tenantId,
      dealName: 'Henderson Kitchen & Bath Remodel',
      contactId: contactMap['tom.henderson.denver@gmail.com'],
      dealValue: 18500,
      stage: stageMap['Proposal'] || 'Proposal',
      priority: 'HIGH' as const,
      probability: 50,
      status: 'open',
      notes: 'Large scope: kitchen plumbing + HVAC relocation + 2 bath plumbing. Proposal sent and reviewed.',
      nextSteps: 'Follow up post-proposal meeting',
      expectedCloseDate: daysFromNow(10),
      assignedToId: jessicaId,
      ownerId: mikeId,
    },
    {
      tenantId,
      dealName: 'Oakwood HOA — Annual Maintenance Contract',
      contactId: contactMap['sclark@redrockrealty.com'],
      dealValue: 8000,
      stage: stageMap['Proposal'] || 'Proposal',
      priority: 'MEDIUM' as const,
      probability: 50,
      status: 'open',
      notes: 'Annual HVAC + plumbing maintenance contract for HOA common areas. Proposal under review.',
      nextSteps: 'HOA board meets next week to vote',
      expectedCloseDate: daysFromNow(12),
      assignedToId: jessicaId,
      ownerId: mikeId,
    },
    {
      tenantId,
      dealName: 'Bradley Residence — Whole House Rewire',
      contactId: contactMap['doug.bradley.co@gmail.com'],
      dealValue: 5000,
      stage: stageMap['Proposal'] || 'Proposal',
      priority: 'MEDIUM' as const,
      probability: 50,
      status: 'open',
      notes: 'Complete electrical rewire for 1960s home. Safety inspection triggered the request.',
      nextSteps: 'Client reviewing 2 competing bids',
      expectedCloseDate: daysFromNow(7),
      assignedToId: tylerId,
      ownerId: mikeId,
    },

    // NEGOTIATION ($22,000 total)
    {
      tenantId,
      dealName: 'Summit View Apartments — 12-Unit HVAC Retrofit',
      contactId: contactMap['victor.morales@summitviewapts.com'],
      dealValue: 14500,
      stage: stageMap['Negotiation'] || 'Negotiation',
      priority: 'HIGH' as const,
      probability: 75,
      status: 'open',
      notes: 'Verbal agreement. Working through final scope. Building owner wants unit access coordination plan.',
      nextSteps: 'Finalize access schedule and sign contract',
      expectedCloseDate: daysFromNow(5),
      assignedToId: jessicaId,
      ownerId: mikeId,
    },
    {
      tenantId,
      dealName: 'Denver Tech Center — Emergency Generator Install',
      contactId: contactMap['susan.park@dtcbuildings.com'],
      dealValue: 7500,
      stage: stageMap['Negotiation'] || 'Negotiation',
      priority: 'HIGH' as const,
      probability: 75,
      status: 'open',
      notes: 'Client had power outage last week. Urgent. Working through permit requirements.',
      nextSteps: 'Permit application submitted. Sign contract pending permit.',
      expectedCloseDate: daysFromNow(7),
      assignedToId: mikeId,
      ownerId: mikeId,
    },

    // CLOSED WON ($48,300 total)
    {
      tenantId,
      dealName: 'Martinez Residence — AC Replacement',
      contactId: contactMap['robert.martinez@gmail.com'],
      dealValue: 8200,
      stage: stageMap['Closed Won'] || 'Closed Won',
      priority: 'MEDIUM' as const,
      probability: 100,
      status: 'closed',
      notes: 'Premium AC unit installed. Customer thrilled. Left 5-star Google review immediately.',
      actualCloseDate: daysAgo(11),
      assignedToId: tylerId,
      ownerId: mikeId,
    },
    {
      tenantId,
      dealName: 'Foster Property Group — Quarterly Service',
      contactId: contactMap['rfoster@mountainviewproperties.com'],
      dealValue: 12400,
      stage: stageMap['Closed Won'] || 'Closed Won',
      priority: 'HIGH' as const,
      probability: 100,
      status: 'closed',
      notes: 'Q1 maintenance contract completed across 4 properties. Renewal discussion already started.',
      actualCloseDate: daysAgo(18),
      assignedToId: jessicaId,
      ownerId: mikeId,
    },
    {
      tenantId,
      dealName: 'Williams Home — Bathroom Remodel Plumbing',
      contactId: contactMap['jen.williams.co@gmail.com'],
      dealValue: 6700,
      stage: stageMap['Closed Won'] || 'Closed Won',
      priority: 'MEDIUM' as const,
      probability: 100,
      status: 'closed',
      notes: 'Master bath plumbing complete. Client referred us to 2 neighbors post-service.',
      actualCloseDate: daysAgo(29),
      assignedToId: tylerId,
      ownerId: mikeId,
    },
    {
      tenantId,
      dealName: 'Pinnacle Properties — 3-Building Plumbing',
      contactId: contactMap['ryan.pinnacle@pinnacleproperties.com'],
      dealValue: 21000,
      stage: stageMap['Closed Won'] || 'Closed Won',
      priority: 'HIGH' as const,
      probability: 100,
      status: 'closed',
      notes: 'Major plumbing project across 3 commercial buildings. Completed on schedule. Strong reference.',
      actualCloseDate: daysAgo(42),
      assignedToId: jessicaId,
      ownerId: mikeId,
    },

    // CLOSED LOST
    {
      tenantId,
      dealName: 'Highland Park — New Construction HVAC',
      contactId: contactMap['greg.highland.construction@gmail.com'],
      dealValue: 28000,
      stage: stageMap['Closed Lost'] || 'Closed Lost',
      priority: 'HIGH' as const,
      probability: 0,
      status: 'closed',
      isLost: true,
      lossReason: 'Lost to competitor on price — competitor bid $4,500 lower. Did not match.',
      stageAtLoss: 'Proposal',
      notes: 'Lost on price to Regional Comfort Systems. Our proposal was $28K vs their $23,500.',
      actualCloseDate: daysAgo(15),
      assignedToId: jessicaId,
      ownerId: mikeId,
    },
  ];
}

// ==========================================
// MAIN SEED FUNCTION
// ==========================================
async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  SUMMIT HOME SERVICES - Phase 5: HQ Module + Pipeline Refresh');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: SUMMIT_SUBDOMAIN },
  });
  if (!tenant) throw new Error('Summit tenant not found. Run Phase 1 first.');

  const users = await prisma.user.findMany({ where: { tenantId: tenant.id } });
  const mike = users.find((u) => u.email === 'mike@summithomeservices.com');
  const jessica = users.find((u) => u.email === 'jessica@summithomeservices.com');
  const tyler = users.find((u) => u.email === 'tyler@summithomeservices.com');
  if (!mike || !jessica || !tyler) throw new Error('Required users not found. Run Phase 1 first.');

  console.log(`Tenant: ${tenant.companyName} (${tenant.id})`);
  console.log(`Mike: ${mike.id}`);
  console.log('');

  // ==========================================
  // 1. KEYSTONES
  // ==========================================
  console.log('1. KEYSTONES');
  console.log('─────────────────────────────────────────');

  const existingKeystones = await prisma.keystone.findMany({ where: { tenantId: tenant.id } });
  if (existingKeystones.length > 0) {
    await prisma.keystone.deleteMany({ where: { tenantId: tenant.id } });
    console.log(`  Cleared ${existingKeystones.length} existing keystones`);
  }

  for (const k of KEYSTONES) {
    await prisma.keystone.create({ data: { tenantId: tenant.id, ...k } });
  }
  console.log(`  Created ${KEYSTONES.length} keystones (People, Process, Projects, Production, Strategy)`);
  console.log('');

  // ==========================================
  // 2. HEADWINDS
  // ==========================================
  console.log('2. HEADWINDS');
  console.log('─────────────────────────────────────────');

  let headwindCreated = 0;
  for (const h of HEADWINDS) {
    const existing = await prisma.headwind.findFirst({
      where: { tenantId: tenant.id, title: h.title },
    });
    if (!existing) {
      await prisma.headwind.create({
        data: {
          tenantId: tenant.id,
          createdById: mike.id,
          title: h.title,
          description: h.description,
          priority: h.priority as any,
          category: h.category as any,
          status: h.status as any,
        },
      });
      headwindCreated++;
    }
  }
  console.log(`  Created ${headwindCreated} headwinds`);
  console.log('');

  // ==========================================
  // 3. HORIZON ITEMS (IdeaParkingLot)
  // ==========================================
  console.log('3. HORIZON ITEMS');
  console.log('─────────────────────────────────────────');

  let horizonCreated = 0;
  for (const item of HORIZON_ITEMS) {
    const existing = await prisma.ideaParkingLot.findFirst({
      where: { tenantId: tenant.id, title: item.title },
    });
    if (!existing) {
      await prisma.ideaParkingLot.create({ data: { tenantId: tenant.id, ...item } });
      horizonCreated++;
    }
  }
  console.log(`  Created ${horizonCreated} horizon items`);
  console.log('');

  // ==========================================
  // 4. HQ GOALS
  // ==========================================
  console.log('4. HQ GOALS');
  console.log('─────────────────────────────────────────');

  let goalCreated = 0;
  for (const g of HQ_GOALS) {
    const existing = await prisma.hQGoal.findFirst({
      where: { tenantId: tenant.id, title: g.title },
    });
    if (!existing) {
      await prisma.hQGoal.create({ data: { tenantId: tenant.id, ...g } });
      goalCreated++;
    }
  }
  const personal = HQ_GOALS.filter((g) => g.scope === 'PERSONAL').length;
  const quarterly = HQ_GOALS.filter((g) => g.scope === 'QUARTERLY').length;
  const annual = HQ_GOALS.filter((g) => g.scope === 'ANNUAL').length;
  console.log(`  Created ${goalCreated} goals (${personal} personal, ${quarterly} quarterly, ${annual} annual)`);
  console.log('');

  // ==========================================
  // 5. FOUNDING DOCUMENT
  // ==========================================
  console.log('5. FOUNDING DOCUMENT');
  console.log('─────────────────────────────────────────');

  await prisma.foundingDocument.upsert({
    where: { tenantId: tenant.id },
    update: {
      vision: 'Build the most trusted home services company in the Denver metro area — the one neighbors recommend without hesitation.',
      mission: 'Summit Home Services exists to keep Denver families comfortable year-round with honest, reliable HVAC, plumbing, and electrical services. We show up on time, explain everything clearly, and stand behind every job.',
      values: [
        {
          title: 'Every customer interaction is an opportunity to earn a referral',
          description: 'We treat every homeowner like we would a friend. The job is not done until they would confidently recommend us to their neighbor.',
        },
        {
          title: 'Our reputation is built one job at a time',
          description: 'There are no shortcuts. We do the work right, document it properly, and follow up to make sure everything is still working. Small details compound into a great reputation.',
        },
        {
          title: 'Invest in our people — their growth is our growth',
          description: 'A technician who feels valued and grows professionally is a technician who stays. Our goal is to be the best place to build a trade career in Denver.',
        },
      ] as any,
      story: `Summit Home Services was founded by Mike Sullivan in 2018 after 20 years working for large national HVAC companies. After watching customers get oversold on equipment they didn't need and technicians who were rewarded for ticket size instead of customer satisfaction, Mike decided to build something different.

Summit started with one truck, Mike, and a promise: honest assessments, fair prices, and work done right the first time. Word spread quickly through Highland Ranch and Littleton, and within 18 months the team grew to three technicians.

Today Summit serves the greater Denver metro area with HVAC, plumbing, and electrical services. We are still a small team — and that's intentional. We would rather grow slowly and keep our standards high than scale fast and lose what makes us different.

Mike still goes on every new customer estimate. He believes the owner should be accountable to the customer, not just the spreadsheet.`,
    },
    create: {
      tenantId: tenant.id,
      vision: 'Build the most trusted home services company in the Denver metro area — the one neighbors recommend without hesitation.',
      mission: 'Summit Home Services exists to keep Denver families comfortable year-round with honest, reliable HVAC, plumbing, and electrical services. We show up on time, explain everything clearly, and stand behind every job.',
      values: [
        {
          title: 'Every customer interaction is an opportunity to earn a referral',
          description: 'We treat every homeowner like we would a friend. The job is not done until they would confidently recommend us to their neighbor.',
        },
        {
          title: 'Our reputation is built one job at a time',
          description: 'There are no shortcuts. We do the work right, document it properly, and follow up to make sure everything is still working. Small details compound into a great reputation.',
        },
        {
          title: 'Invest in our people — their growth is our growth',
          description: 'A technician who feels valued and grows professionally is a technician who stays. Our goal is to be the best place to build a trade career in Denver.',
        },
      ] as any,
      story: `Summit Home Services was founded by Mike Sullivan in 2018 after 20 years working for large national HVAC companies. After watching customers get oversold on equipment they didn't need and technicians who were rewarded for ticket size instead of customer satisfaction, Mike decided to build something different.

Summit started with one truck, Mike, and a promise: honest assessments, fair prices, and work done right the first time. Word spread quickly through Highland Ranch and Littleton, and within 18 months the team grew to three technicians.

Today Summit serves the greater Denver metro area with HVAC, plumbing, and electrical services. We are still a small team — and that's intentional. We would rather grow slowly and keep our standards high than scale fast and lose what makes us different.

Mike still goes on every new customer estimate. He believes the owner should be accountable to the customer, not just the spreadsheet.`,
    },
  });
  console.log('  Upserted founding document (vision, mission, 3 values, story)');
  console.log('');

  // ==========================================
  // 6. LEGACY MILESTONES
  // ==========================================
  console.log('6. LEGACY MILESTONES');
  console.log('─────────────────────────────────────────');

  const legacyMilestones = [
    {
      year: 2027,
      title: 'Create a business that runs without Mike in the truck every day',
      description:
        'The goal is a company that executes at a high level whether Mike is on-site or not. Operations manager hired, dispatching automated, SOPs documented for every common scenario.',
      goals: [
        'Hire and develop an operations manager',
        'Document all dispatch and service SOPs',
        'Automate scheduling and reminders',
        'Mike spends 80% of time on growth and relationships',
      ] as any,
      progress: 20,
      status: 'IN_PROGRESS',
      sortOrder: 0,
    },
    {
      year: 2028,
      title: 'Build the most trusted home services company in the Denver metro area',
      description:
        'Defined as: #1 rated HVAC/plumbing/electrical company on Google in Denver metro. 500+ reviews averaging 4.9 stars. First name that neighbors recommend on Nextdoor.',
      goals: [
        'Reach 500 Google reviews at 4.9 average',
        'Expand to 6 service territories',
        'Win Denver Business Journal Best Place to Work',
        '$3M+ annual revenue with 30%+ margin',
      ] as any,
      progress: 10,
      status: 'PLANNED',
      sortOrder: 1,
    },
  ];

  let legacyCreated = 0;
  for (const m of legacyMilestones) {
    const existing = await prisma.legacyMilestone.findFirst({
      where: { tenantId: tenant.id, title: m.title },
    });
    if (!existing) {
      await prisma.legacyMilestone.create({ data: { tenantId: tenant.id, ...m } });
      legacyCreated++;
    }
  }
  console.log(`  Created ${legacyCreated} legacy milestones`);
  console.log('');

  // ==========================================
  // 7. LEDGER ENTRIES
  // ==========================================
  console.log('7. LEDGER ENTRIES');
  console.log('─────────────────────────────────────────');

  let ledgerCreated = 0;
  for (const entry of LEDGER_ENTRIES) {
    const existing = await prisma.ledgerEntry.findFirst({
      where: { tenantId: tenant.id, name: entry.name },
    });
    if (!existing) {
      await prisma.ledgerEntry.create({ data: { tenantId: tenant.id, ...entry } });
      ledgerCreated++;
    }
  }
  console.log(`  Created ${ledgerCreated} ledger entries`);
  console.log('');

  // ==========================================
  // 8. CALENDAR EVENTS (Assembly + Appointments)
  // ==========================================
  console.log('8. CALENDAR EVENTS (Assembly + Appointments)');
  console.log('─────────────────────────────────────────');

  const assemblyEvents = buildAssemblyEvents(mike.id, tenant.id);
  let eventCreated = 0;
  for (const event of assemblyEvents) {
    const existing = await prisma.calendarEvent.findFirst({
      where: {
        tenantId: tenant.id,
        title: event.title,
        startTime: event.startTime,
      },
    });
    if (!existing) {
      await prisma.calendarEvent.create({ data: event });
      eventCreated++;
    }
  }
  console.log(`  Created ${eventCreated} calendar events (team meetings + service appointments)`);
  console.log('');

  // ==========================================
  // 9. ADDITIONAL CONTACTS
  // ==========================================
  console.log('9. ADDITIONAL CONTACTS');
  console.log('─────────────────────────────────────────');

  let contactCreated = 0;
  const contactMap: Record<string, string> = {};

  // Load existing contacts first
  const existingContacts = await prisma.contact.findMany({ where: { tenantId: tenant.id } });
  for (const c of existingContacts) {
    contactMap[c.email] = c.id;
  }

  for (const c of ADDITIONAL_CONTACTS) {
    if (!contactMap[c.email]) {
      const created = await prisma.contact.create({
        data: {
          tenantId: tenant.id,
          ownerId: tyler.id,
          ...c,
        },
      });
      contactMap[c.email] = created.id;
      contactCreated++;
    }
  }
  console.log(`  Created ${contactCreated} new contacts (${Object.keys(contactMap).length} total)`);
  console.log('');

  // ==========================================
  // 10. PIPELINE DEALS
  // ==========================================
  console.log('10. PIPELINE DEALS');
  console.log('─────────────────────────────────────────');

  // Build pipeline stage map by name
  const stages = await prisma.pipelineStage.findMany({ where: { tenantId: tenant.id } });
  const stageMap: Record<string, string> = {};
  for (const s of stages) {
    stageMap[s.name] = s.name; // We use name directly in deals (not stage ID)
  }

  const deals = buildDeals(tenant.id, stageMap, contactMap, mike.id, jessica.id, tyler.id);

  let dealCreated = 0;
  let dealSkipped = 0;

  for (const deal of deals) {
    const existing = await prisma.deal.findFirst({
      where: { tenantId: tenant.id, dealName: deal.dealName },
    });
    if (!existing) {
      const { isLost, lossReason, stageAtLoss, ...dealData } = deal as any;
      await prisma.deal.create({
        data: {
          ...dealData,
          isLost: isLost ?? false,
          lossReason: lossReason ?? null,
          stageAtLoss: stageAtLoss ?? null,
        },
      });
      dealCreated++;
    } else {
      dealSkipped++;
    }
  }

  const openValue = deals
    .filter((d) => d.status === 'open')
    .reduce((sum, d) => sum + d.dealValue, 0);
  const wonValue = deals
    .filter((d) => d.status === 'closed' && !(d as any).isLost)
    .reduce((sum, d) => sum + d.dealValue, 0);

  console.log(`  Created ${dealCreated} new deals (${dealSkipped} already existed)`);
  console.log(`  Open pipeline added: $${openValue.toLocaleString()}`);
  console.log(`  Closed Won added: $${wonValue.toLocaleString()}`);
  console.log('');

  // ==========================================
  // FINAL SUMMARY
  // ==========================================
  const totalContacts = await prisma.contact.count({ where: { tenantId: tenant.id } });
  const totalDeals = await prisma.deal.count({ where: { tenantId: tenant.id } });
  const totalEvents = await prisma.calendarEvent.count({ where: { tenantId: tenant.id } });

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  PHASE 5 COMPLETE — HQ Module + Pipeline Refresh');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  HQ Module:');
  console.log(`    Keystones:          ${KEYSTONES.length} (People 78, Process 72, Projects 85, Production 80, Strategy 65)`);
  console.log(`    Headwinds:          ${headwindCreated} active challenges`);
  console.log(`    Horizon Items:      ${horizonCreated} future goals`);
  console.log(`    HQ Goals:           ${goalCreated} (personal, quarterly, annual)`);
  console.log(`    Founding Document:  ✓ (vision, mission, 3 values, story)`);
  console.log(`    Legacy Milestones:  ${legacyCreated}`);
  console.log(`    Ledger Entries:     ${ledgerCreated} (revenue, margins, pipeline)`);
  console.log('');
  console.log('  Pipeline:');
  console.log(`    Total Contacts:     ${totalContacts}`);
  console.log(`    Total Deals:        ${totalDeals}`);
  console.log(`    Open Pipeline:      ~$96,200`);
  console.log(`    Closed Won (60d):   ~$48,300`);
  console.log('');
  console.log('  Schedule:');
  console.log(`    Calendar Events:    ${totalEvents} total`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('Phase 5 seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
