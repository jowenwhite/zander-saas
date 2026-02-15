import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Summit Home Services Tenant ID
const SUMMIT_TENANT_ID = 'cmlnkgwan0000j8hsv1tl8dml';

// Helper functions for dates
function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function getDateAtHour(date: Date, hour: number): Date {
  const d = new Date(date);
  d.setHours(hour, 0, 0, 0);
  return d;
}

// ==========================================
// PERSONAS
// ==========================================
const PERSONAS = [
  {
    name: 'Sarah the Homeowner',
    tagline: 'Busy homeowner seeking reliable, trustworthy home comfort',
    isDefault: true,
    demographics: {
      age: '35-50',
      location: 'Denver suburbs (Highlands Ranch, Littleton, Aurora)',
      occupation: 'Professional with family',
      income: '$80,000-$120,000 household',
      education: 'College degree',
      familyStatus: 'Married with children, homeowner',
      homeType: 'Single-family home, 2,000-3,500 sq ft',
    },
    psychographics: {
      values: ['Family comfort', 'Peace of mind', 'Fair dealing'],
      personality: 'Practical, research-oriented, values recommendations',
      lifestyle: 'Busy juggling work and family, limited time for home maintenance',
    },
    behaviors: {
      techAdoption: 'Comfortable with technology but prefers phone calls for service',
      buyingStyle: 'Research-first, reads reviews, asks neighbors',
      researchHabits: 'Google searches, Nextdoor, Facebook neighborhood groups',
      preferredContactTime: 'Early evening or weekends',
    },
    painPoints: [
      'Unexpected AC or furnace breakdowns during extreme weather',
      'Difficulty finding trustworthy contractors who show up on time',
      'Worry about being overcharged or sold unnecessary services',
      'Not knowing if repair or replacement is the right choice',
      'Coordinating service calls around work schedule',
    ],
    goals: [
      'Keep family comfortable year-round without surprises',
      'Find a single trusted company for all home comfort needs',
      'Prevent emergencies with regular maintenance',
      'Understand what they are paying for',
      'Not have to think about HVAC until scheduled maintenance',
    ],
    preferredChannels: ['phone', 'email', 'nextdoor'],
    brandAffinities: ['Home Depot', 'Costco', 'Local businesses with good reviews'],
    interview: `Sarah and her husband bought their home in Highlands Ranch 8 years ago. The original
HVAC system is now 15 years old and she's been noticing higher energy bills and uneven
temperatures between rooms.

"I just want someone I can trust to tell me honestly whether we need to repair or replace.
Last time I called a big national company, they immediately tried to sell me a $15,000
system. It felt like a hard sell. I'd rather pay a little more for someone who takes the
time to explain things and doesn't pressure me."

Sarah found Summit through a recommendation on Nextdoor after posting asking for HVAC
recommendations. "The reviews all mentioned the technicians being on time and respectful
of their homes. That matters to me with two kids and a dog."`,
  },
  {
    name: 'Mike the Property Manager',
    tagline: 'Multi-unit property manager needing reliable, fast service partners',
    isDefault: false,
    demographics: {
      age: '30-55',
      location: 'Denver metro area',
      occupation: 'Property Manager / Real Estate Investor',
      income: '$60,000-$100,000 personal, manages $5M+ in properties',
      education: 'Varied - some college to degree',
      familyStatus: 'Varied',
      properties: 'Manages 15-50 rental units',
    },
    psychographics: {
      values: ['Reliability', 'Speed', 'Cost control', 'Tenant satisfaction'],
      personality: 'Efficient, no-nonsense, relationship-oriented with vendors',
      lifestyle: 'Always on call, manages multiple priorities, values trusted partners',
    },
    behaviors: {
      techAdoption: 'Uses property management software, prefers text/email',
      buyingStyle: 'Relationship and repeat business focused, negotiates volume pricing',
      researchHabits: 'Industry associations, peer recommendations, past experience',
      preferredContactTime: 'Business hours, text for emergencies',
    },
    painPoints: [
      'Tenant complaints about heating/cooling during extreme weather',
      'Need for fast turnaround to minimize tenant disruption',
      'Juggling multiple vendors across different trades',
      'Unexpected repair costs eating into margins',
      'Finding contractors who understand landlord-tenant dynamics',
    ],
    goals: [
      'One reliable vendor for HVAC, plumbing, and electrical',
      'Consistent pricing and priority scheduling',
      'Quick diagnosis and same-day service when possible',
      'Clear documentation for property records',
      'Preventive maintenance to avoid emergency calls',
    ],
    preferredChannels: ['text', 'email', 'phone'],
    brandAffinities: ['NARPM', 'BiggerPockets', 'Home warranty companies'],
    interview: null,
  },
  {
    name: 'Lisa the Realtor',
    tagline: 'Residential realtor needing trusted partners for closings and referrals',
    isDefault: false,
    demographics: {
      age: '28-45',
      location: 'Denver metro, works across Front Range',
      occupation: 'Residential Real Estate Agent',
      income: 'Commission-based, $75,000-$200,000',
      education: 'Some college to degree',
      familyStatus: 'Varied, flexible schedule',
      salesVolume: '15-30 transactions per year',
    },
    psychographics: {
      values: ['Client service', 'Reputation', 'Network building'],
      personality: 'Outgoing, relationship-focused, always networking',
      lifestyle: 'Evenings and weekends working with clients, values efficient partners',
    },
    behaviors: {
      techAdoption: 'Heavy smartphone user, social media savvy',
      buyingStyle: 'Referral-based, values mutual benefit',
      researchHabits: 'Agent networks, MLS forums, social media',
      preferredContactTime: 'Flexible but responsive to calls',
    },
    painPoints: [
      'Last-minute inspection issues threatening closings',
      'Need fast turnaround for pre-listing repairs',
      'Clients asking for contractor recommendations',
      'Coordinating access to properties for service calls',
      'Finding vendors who understand real estate timelines',
    ],
    goals: [
      'Trusted partner to recommend to clients confidently',
      'Fast response for pre-closing emergencies',
      'Mutual referral relationship',
      'Vendor who makes them look good to clients',
      'Simple billing and documentation for transaction files',
    ],
    preferredChannels: ['phone', 'text', 'instagram'],
    brandAffinities: ['RE/MAX', 'Keller Williams', 'Colorado Association of Realtors'],
    interview: null,
  },
];

// ==========================================
// CAMPAIGNS
// ==========================================
const CAMPAIGNS = [
  {
    name: 'Spring AC Tune-Up Special',
    description: 'Annual spring promotion for AC maintenance to prevent summer breakdowns. Targets homeowners before cooling season begins.',
    type: 'multi',
    channels: ['email', 'direct_mail'],
    status: 'active',
    goal: 'Book 150 AC tune-up appointments in 6 weeks',
    budget: 3500,
    startDate: daysAgo(30),
    endDate: daysFromNow(14),
    steps: [
      {
        order: 1,
        channel: 'email',
        dayOffset: 0,
        subject: 'Is Your AC Ready for Denver Summer?',
        content: `Hi {{first_name}},

Colorado summers are getting hotter, and the last thing you want is your AC giving out during a heat wave.

Summit Home Services is offering our Spring AC Tune-Up Special - just $99 (regularly $149) when you book before May 15th.

Our 21-point inspection includes:
• Clean condenser coils
• Check refrigerant levels
• Inspect electrical connections
• Test thermostat calibration
• And 17 more critical checks

Most Denver homeowners wait until their AC breaks to call us. Don't be one of them!

Book your tune-up: [Schedule Now]

Stay cool,
The Summit Team`,
      },
      {
        order: 2,
        channel: 'email',
        dayOffset: 7,
        subject: 'Your neighbors are getting ready for summer ☀️',
        content: `Hi {{first_name}},

We've already tuned up 47 AC units in the {{city}} area this month. Your neighbors know the secret to a worry-free summer!

Just a reminder - our $99 AC Tune-Up Special ends May 15th. After that, it's back to our regular $149 price.

Plus, if we find any issues during your tune-up, we'll give you an honest assessment with no pressure to repair. We believe in earning your trust.

[Book Your $99 Tune-Up]

- Mike Sullivan, Owner
Summit Home Services`,
      },
    ],
  },
  {
    name: 'Referral Rewards Program',
    description: 'Ongoing referral program offering credits to customers who refer friends and family.',
    type: 'single',
    channels: ['email'],
    status: 'active',
    goal: 'Generate 10 referrals per month',
    budget: 600,
    startDate: daysAgo(90),
    endDate: daysFromNow(275),
    steps: [
      {
        order: 1,
        channel: 'email',
        dayOffset: 0,
        subject: 'You earned $50! Here\'s how to share the love',
        content: `Hi {{first_name}},

Thank you for choosing Summit Home Services! We hope your {{service_type}} went smoothly.

As a thank you, we'd love to offer you $50 off your next service when you refer a friend or neighbor. Plus, they'll get $25 off their first service too!

It's simple:
1. Share your unique referral link: summit.link/{{referral_code}}
2. When they book and complete service, you both save!

There's no limit to how many friends you can refer. Some of our best customers have earned hundreds in credits!

[Share Your Link Now]

Thanks for spreading the word about Summit!`,
      },
    ],
  },
  {
    name: 'Google Review Request Campaign',
    description: 'Automated post-service campaign requesting Google reviews from satisfied customers.',
    type: 'single',
    channels: ['email', 'sms'],
    status: 'active',
    goal: 'Achieve 50+ Google reviews with 4.8+ average rating',
    budget: 0,
    startDate: daysAgo(120),
    endDate: null,
    steps: [
      {
        order: 1,
        channel: 'email',
        dayOffset: 1,
        subject: 'How did we do, {{first_name}}?',
        content: `Hi {{first_name}},

Thank you for choosing Summit Home Services for your recent {{service_type}}.

We'd love to hear about your experience! Your feedback helps us improve and helps other Denver homeowners find reliable service.

If you have 2 minutes, would you mind leaving us a Google review?

[Leave a Review on Google]

If anything wasn't perfect, please reply to this email or call Mike directly at (303) 555-HVAC. We want to make it right.

Thank you!
The Summit Team`,
      },
      {
        order: 2,
        channel: 'sms',
        dayOffset: 3,
        subject: null,
        content: `Hi {{first_name}}, this is Summit Home Services. If you were happy with your recent service, we'd really appreciate a quick Google review! It takes 30 seconds and means the world to our small team. Review link: g.page/summit-denver/review - Thank you! 🙏`,
      },
    ],
  },
  {
    name: 'Winter Furnace Safety Campaign',
    description: 'Fall campaign promoting furnace tune-ups and safety inspections before heating season.',
    type: 'multi',
    channels: ['email', 'direct_mail'],
    status: 'draft',
    goal: 'Book 100 furnace tune-ups in October-November',
    budget: 2800,
    startDate: daysFromNow(240),
    endDate: daysFromNow(300),
    steps: [
      {
        order: 1,
        channel: 'email',
        dayOffset: 0,
        subject: 'Don\'t let your furnace leave you in the cold this winter',
        content: `Hi {{first_name}},

Denver winters are no joke. When temperatures drop below zero, your furnace becomes your family's lifeline.

Is yours ready?

Schedule your Furnace Safety Tune-Up now - just $89 (save $40) through November 15th.

Our comprehensive inspection includes:
• Carbon monoxide safety check
• Heat exchanger inspection
• Burner cleaning and calibration
• Filter replacement
• Thermostat testing

Don't wait until the first cold snap when everyone's calling. Book now while appointments are available.

[Schedule My Furnace Tune-Up]

Stay warm,
Summit Home Services`,
      },
    ],
  },
];

// ==========================================
// WORKFLOWS
// ==========================================
const WORKFLOWS = [
  {
    name: 'New Lead Nurture Sequence',
    description: 'Automated 3-email sequence for new leads who requested information but haven\'t booked',
    status: 'active',
    triggerType: 'lead_created',
    triggerConfig: { source: ['website', 'phone'] },
    entryCount: 89,
    completionCount: 34,
    nodes: [
      {
        nodeType: 'send_email',
        name: 'Send Welcome Email',
        config: {
          subject: 'Thanks for reaching out to Summit Home Services!',
          fromName: 'Mike Sullivan',
          previewText: 'We received your request and would love to help...',
        },
        sortOrder: 1,
      },
      {
        nodeType: 'wait',
        name: 'Wait 2 Days',
        config: { duration: 2, unit: 'days' },
        sortOrder: 2,
      },
      {
        nodeType: 'condition',
        name: 'Check if Booked',
        config: { field: 'hasAppointment', operator: 'equals', value: false },
        sortOrder: 3,
      },
      {
        nodeType: 'send_email',
        name: 'Send Follow-up Email',
        config: {
          subject: 'Still need help with your {{issue_type}}?',
          fromName: 'Summit Team',
          previewText: 'We\'re here when you\'re ready...',
        },
        sortOrder: 4,
      },
      {
        nodeType: 'wait',
        name: 'Wait 5 Days',
        config: { duration: 5, unit: 'days' },
        sortOrder: 5,
      },
      {
        nodeType: 'send_email',
        name: 'Send Final Offer',
        config: {
          subject: '$25 off your first service - this week only',
          fromName: 'Mike Sullivan',
          previewText: 'We\'d love to earn your business...',
        },
        sortOrder: 6,
      },
      {
        nodeType: 'end',
        name: 'End Workflow',
        config: {},
        sortOrder: 7,
      },
    ],
  },
  {
    name: 'Post-Service Follow-Up',
    description: 'Thank you and review request sequence triggered after service completion',
    status: 'active',
    triggerType: 'service_completed',
    triggerConfig: { excludeTypes: ['callback', 'warranty'] },
    entryCount: 156,
    completionCount: 142,
    nodes: [
      {
        nodeType: 'wait',
        name: 'Wait 1 Day',
        config: { duration: 1, unit: 'days' },
        sortOrder: 1,
      },
      {
        nodeType: 'send_email',
        name: 'Send Thank You Email',
        config: {
          subject: 'Thank you for choosing Summit!',
          fromName: 'Summit Team',
          previewText: 'We hope everything is working perfectly...',
        },
        sortOrder: 2,
      },
      {
        nodeType: 'wait',
        name: 'Wait 3 Days',
        config: { duration: 3, unit: 'days' },
        sortOrder: 3,
      },
      {
        nodeType: 'send_sms',
        name: 'Send Review Request SMS',
        config: {
          message: 'Hi! Thanks for choosing Summit. If you have a moment, a Google review would mean the world to us!',
        },
        sortOrder: 4,
      },
      {
        nodeType: 'end',
        name: 'End Workflow',
        config: {},
        sortOrder: 5,
      },
    ],
  },
  {
    name: 'Annual Maintenance Reminder',
    description: 'Reminder workflow for customers due for annual HVAC maintenance',
    status: 'active',
    triggerType: 'date_trigger',
    triggerConfig: { field: 'lastServiceDate', offsetDays: 335 },
    entryCount: 67,
    completionCount: 45,
    nodes: [
      {
        nodeType: 'send_email',
        name: 'Send Reminder Email',
        config: {
          subject: 'Time for your annual {{equipment_type}} tune-up!',
          fromName: 'Summit Team',
          previewText: 'It\'s been almost a year since we last serviced...',
        },
        sortOrder: 1,
      },
      {
        nodeType: 'wait',
        name: 'Wait 7 Days',
        config: { duration: 7, unit: 'days' },
        sortOrder: 2,
      },
      {
        nodeType: 'condition',
        name: 'Check if Scheduled',
        config: { field: 'hasUpcomingAppointment', operator: 'equals', value: false },
        sortOrder: 3,
      },
      {
        nodeType: 'send_email',
        name: 'Send Urgency Email',
        config: {
          subject: 'Don\'t forget - your {{equipment_type}} needs attention',
          fromName: 'Mike Sullivan',
          previewText: 'Regular maintenance prevents costly repairs...',
        },
        sortOrder: 4,
      },
      {
        nodeType: 'create_task',
        name: 'Create Follow-up Task',
        config: {
          taskType: 'call',
          assignTo: 'sales_rep',
          description: 'Call customer for maintenance scheduling',
        },
        sortOrder: 5,
      },
      {
        nodeType: 'end',
        name: 'End Workflow',
        config: {},
        sortOrder: 6,
      },
    ],
  },
];

// ==========================================
// CALENDAR EVENTS (Mix of past and future)
// ==========================================
const CALENDAR_EVENTS = [
  // Past events (completed)
  {
    title: 'Launch Spring AC Campaign',
    description: 'Kick off spring AC tune-up promotion with email blast and social posts',
    eventType: 'task',
    category: 'campaign',
    startTime: getDateAtHour(daysAgo(30), 9),
    endTime: getDateAtHour(daysAgo(30), 10),
    marketingChannel: 'email',
    contentStatus: 'published',
    status: 'completed',
  },
  {
    title: 'Review January Metrics',
    description: 'Monthly review of marketing performance, lead sources, and conversion rates',
    eventType: 'meeting',
    category: 'internal',
    startTime: getDateAtHour(daysAgo(45), 14),
    endTime: getDateAtHour(daysAgo(45), 15),
    marketingChannel: null,
    contentStatus: null,
    status: 'completed',
  },
  {
    title: 'Update Google Business Profile',
    description: 'Add new photos, update holiday hours, respond to recent reviews',
    eventType: 'task',
    category: 'content',
    startTime: getDateAtHour(daysAgo(21), 10),
    endTime: getDateAtHour(daysAgo(21), 11),
    marketingChannel: 'google',
    contentStatus: 'published',
    status: 'completed',
  },
  {
    title: 'Neighborhood Sponsorship: HOA Newsletter',
    description: 'Submit ad for Highlands Ranch HOA spring newsletter',
    eventType: 'task',
    category: 'advertising',
    startTime: getDateAtHour(daysAgo(14), 11),
    endTime: getDateAtHour(daysAgo(14), 12),
    marketingChannel: 'print',
    contentStatus: 'published',
    status: 'completed',
  },
  // Upcoming events (scheduled)
  {
    title: 'Review February Metrics',
    description: 'Monthly marketing performance review and campaign optimization',
    eventType: 'meeting',
    category: 'internal',
    startTime: getDateAtHour(daysFromNow(5), 14),
    endTime: getDateAtHour(daysFromNow(5), 15),
    marketingChannel: null,
    contentStatus: null,
    status: 'scheduled',
  },
  {
    title: 'Spring AC Campaign Email #2',
    description: 'Send second email in spring AC tune-up sequence',
    eventType: 'task',
    category: 'campaign',
    startTime: getDateAtHour(daysFromNow(7), 9),
    endTime: getDateAtHour(daysFromNow(7), 10),
    marketingChannel: 'email',
    contentStatus: 'scheduled',
    status: 'scheduled',
  },
  {
    title: 'Realtor Referral Lunch',
    description: 'Networking lunch with Lisa Chen from RE/MAX to discuss referral partnership',
    eventType: 'meeting',
    category: 'networking',
    startTime: getDateAtHour(daysFromNow(10), 12),
    endTime: getDateAtHour(daysFromNow(10), 13),
    marketingChannel: null,
    contentStatus: null,
    status: 'scheduled',
  },
  {
    title: 'Direct Mail Drop: AC Special',
    description: 'Send direct mail postcards to 2,500 homeowners in target zip codes',
    eventType: 'task',
    category: 'advertising',
    startTime: getDateAtHour(daysFromNow(12), 10),
    endTime: getDateAtHour(daysFromNow(12), 11),
    marketingChannel: 'direct_mail',
    contentStatus: 'draft',
    status: 'scheduled',
  },
  {
    title: 'Quarterly Newsletter Send',
    description: 'Send Q1 customer newsletter with tips, promotions, and company updates',
    eventType: 'task',
    category: 'content',
    startTime: getDateAtHour(daysFromNow(18), 10),
    endTime: getDateAtHour(daysFromNow(18), 11),
    marketingChannel: 'email',
    contentStatus: 'draft',
    status: 'scheduled',
  },
  {
    title: 'Home Show Booth: Denver Home Expo',
    description: 'Man booth at Denver Home Expo, collect leads, give away AC tune-up drawings',
    eventType: 'event',
    category: 'event',
    startTime: getDateAtHour(daysFromNow(35), 9),
    endTime: getDateAtHour(daysFromNow(35), 17),
    marketingChannel: 'event',
    contentStatus: null,
    status: 'scheduled',
  },
];

// ==========================================
// MONTHLY THEMES
// ==========================================
const MONTHLY_THEMES = [
  {
    month: 2, // February
    year: 2026,
    name: 'Spring Preparation Push',
    description: 'Focus on spring AC tune-up campaign launch and early season bookings',
    focusAreas: ['AC maintenance promotion', 'Email campaign optimization', 'Review generation'],
    colorCode: '#22C55E',
  },
  {
    month: 3, // March
    year: 2026,
    name: 'Peak Booking Season',
    description: 'Maximize AC tune-up appointments before summer rush begins',
    focusAreas: ['Direct mail campaign', 'Referral program push', 'Realtor partnerships'],
    colorCode: '#3B82F6',
  },
  {
    month: 4, // April
    year: 2026,
    name: 'Summer Readiness',
    description: 'Final push for spring maintenance, begin AC replacement lead generation',
    focusAreas: ['Replacement consultations', 'Smart thermostat promotion', 'Home show events'],
    colorCode: '#F59E0B',
  },
  {
    month: 5, // May
    year: 2026,
    name: 'Cooling Season Kickoff',
    description: 'Transition from tune-ups to emergency service readiness and replacement sales',
    focusAreas: ['Emergency service availability', 'Financing promotions', 'Customer retention'],
    colorCode: '#EF4444',
  },
];

// ==========================================
// FUNNELS
// ==========================================
const FUNNELS = [
  {
    name: 'Service Call Booking Funnel',
    description: 'Lead journey from initial inquiry to completed service call',
    stages: [
      { name: 'Website Visit', stageType: 'awareness', stageOrder: 1, entryCount: 450, exitCount: 180 },
      { name: 'Contact Form / Call', stageType: 'interest', stageOrder: 2, entryCount: 180, exitCount: 145 },
      { name: 'Appointment Booked', stageType: 'decision', stageOrder: 3, entryCount: 145, exitCount: 132 },
      { name: 'Service Completed', stageType: 'action', stageOrder: 4, entryCount: 132, exitCount: 132 },
    ],
  },
  {
    name: 'Maintenance Plan Enrollment',
    description: 'Journey from one-time customer to annual maintenance plan member',
    stages: [
      { name: 'Service Completed', stageType: 'awareness', stageOrder: 1, entryCount: 132, exitCount: 89 },
      { name: 'Plan Presented', stageType: 'interest', stageOrder: 2, entryCount: 89, exitCount: 45 },
      { name: 'Follow-up Call', stageType: 'decision', stageOrder: 3, entryCount: 45, exitCount: 28 },
      { name: 'Plan Enrolled', stageType: 'action', stageOrder: 4, entryCount: 28, exitCount: 28 },
    ],
  },
];

// ==========================================
// EMAIL TEMPLATES
// ==========================================
const EMAIL_TEMPLATES = [
  {
    name: 'Service Confirmation',
    subject: 'Your Summit Home Services appointment is confirmed',
    type: 'email',
    category: 'transactional',
    status: 'active',
    body: `Hi {{first_name}},

Your service appointment is confirmed!

**Appointment Details:**
- Date: {{appointment_date}}
- Time: {{appointment_time}}
- Service: {{service_type}}
- Address: {{service_address}}

Your technician will call 30 minutes before arrival.

**What to expect:**
Our technician will arrive in a clearly marked Summit vehicle. They will wear shoe covers and clean up after any work.

Need to reschedule? Call us at (303) 555-HVAC or reply to this email.

See you soon!
Summit Home Services`,
    variables: ['first_name', 'appointment_date', 'appointment_time', 'service_type', 'service_address'],
  },
  {
    name: 'Quote Follow-up',
    subject: 'Your Summit Home Services quote is ready',
    type: 'email',
    category: 'sales',
    status: 'active',
    body: `Hi {{first_name}},

Thank you for considering Summit Home Services for your {{equipment_type}} {{service_type}}.

Attached is your detailed quote as discussed. Here's a summary:

**Option {{option_number}}: {{option_name}}**
- Equipment: {{equipment_details}}
- Installation: Included
- Warranty: {{warranty_terms}}
- **Total: {{total_price}}**

**Financing available** - Payments as low as {{monthly_payment}}/month with approved credit.

This quote is valid for 30 days. Ready to move forward? Just reply to this email or call us at (303) 555-HVAC.

Questions? I'm happy to walk through everything with you.

Best regards,
{{sales_rep_name}}
Summit Home Services`,
    variables: ['first_name', 'equipment_type', 'service_type', 'option_number', 'option_name', 'equipment_details', 'warranty_terms', 'total_price', 'monthly_payment', 'sales_rep_name'],
  },
  {
    name: 'Maintenance Reminder',
    subject: 'Time for your annual {{equipment_type}} tune-up!',
    type: 'email',
    category: 'marketing',
    status: 'active',
    body: `Hi {{first_name}},

It's been {{months_since_service}} months since we last serviced your {{equipment_type}}. Annual maintenance keeps your system running efficiently and catches small problems before they become expensive repairs.

**Schedule your tune-up and save:**
- Regular price: $149
- Your loyalty price: **$99** (Save $50!)

**What's included:**
✓ Complete system inspection
✓ Clean and adjust components
✓ Test safety controls
✓ Check efficiency levels
✓ Written report with recommendations

[Schedule My Tune-Up →]

Or call us at (303) 555-HVAC to book.

Keeping Denver comfortable,
Summit Home Services`,
    variables: ['first_name', 'months_since_service', 'equipment_type'],
  },
  {
    name: 'Thank You After Service',
    subject: 'Thank you for choosing Summit, {{first_name}}!',
    type: 'email',
    category: 'transactional',
    status: 'active',
    body: `Hi {{first_name}},

Thank you for trusting Summit Home Services with your {{service_type}} today!

**Service Summary:**
- Service: {{service_type}}
- Technician: {{technician_name}}
- Date: {{service_date}}

We hope everything is working perfectly. If you notice any issues or have questions, please don't hesitate to call us at (303) 555-HVAC.

**Would you recommend us?**
If you were happy with your service, we'd be grateful if you shared your experience on Google. It takes just 30 seconds and helps other Denver homeowners find reliable service.

[Leave a Review →]

Thank you for being part of the Summit family!

Warmly,
The Summit Team`,
    variables: ['first_name', 'service_type', 'technician_name', 'service_date'],
  },
];

// ==========================================
// BRAND PROFILE (Marketing Plan Summary)
// ==========================================
const BRAND_PROFILE = {
  primaryColor: '#0066CC',
  secondaryColor: '#003366',
  accentColor: '#FF6600',
  fontPrimary: 'Inter',
  fontSecondary: 'Open Sans',
  voiceTone: 'Friendly, professional, and trustworthy',
  tagline: 'Your Comfort, Our Commitment',
  mission: `Summit Home Services exists to keep Denver families comfortable year-round with honest,
reliable HVAC, plumbing, and electrical services. We believe every homeowner deserves a
contractor they can trust - one who shows up on time, explains options clearly, and stands
behind their work. Founded by Mike Sullivan, a 20-year industry veteran, Summit combines
old-fashioned values with modern convenience.`,
  voiceGuidelines: `TONE: Warm, knowledgeable, and reassuring. We're the neighbor who happens to be an expert.

DO:
- Use conversational language (contractions are OK)
- Acknowledge customer concerns before solving
- Be specific about what we'll do and when
- Include calls to action with clear next steps
- Reference local Denver/Colorado context

DON'T:
- Use industry jargon without explanation
- Make claims we can't back up
- Be pushy or use high-pressure language
- Disparage competitors
- Overpromise on timing or outcomes

BRAND PILLARS:
1. TRUST - We do what we say, every time
2. EXPERTISE - 20+ years combined experience
3. LOCAL - Denver-born, Denver-proud
4. VALUE - Fair prices, no surprises`,
};

// ==========================================
// MAIN SEED FUNCTION
// ==========================================
async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  SUMMIT HOME SERVICES - CMO Marketing Data Seed (Phase 4)');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  // Verify tenant exists
  const tenant = await prisma.tenant.findUnique({
    where: { id: SUMMIT_TENANT_ID },
  });

  if (!tenant) {
    throw new Error(`Tenant not found: ${SUMMIT_TENANT_ID}. Run Phase 1 seed first.`);
  }

  console.log(`Tenant: ${tenant.companyName} (${tenant.id})`);
  console.log('');

  // Get a user for createdById fields
  const user = await prisma.user.findFirst({
    where: { tenantId: SUMMIT_TENANT_ID, role: 'admin' },
  });

  if (!user) {
    throw new Error('No admin user found. Run Phase 1 seed first.');
  }

  console.log(`Using user: ${user.firstName} ${user.lastName} (${user.id})`);
  console.log('');

  // ==========================================
  // 1. BRAND PROFILE
  // ==========================================
  console.log('1. BRAND PROFILE');
  console.log('─────────────────────────────────────────');

  const existingBrand = await prisma.brandProfile.findUnique({
    where: { tenantId: SUMMIT_TENANT_ID },
  });

  if (!existingBrand) {
    await prisma.brandProfile.create({
      data: {
        tenantId: SUMMIT_TENANT_ID,
        ...BRAND_PROFILE,
      },
    });
    console.log('  Created brand profile with marketing guidelines');
  } else {
    console.log('  Brand profile already exists');
  }
  console.log('');

  // ==========================================
  // 2. PERSONAS
  // ==========================================
  console.log('2. PERSONAS');
  console.log('─────────────────────────────────────────');

  let personaCreated = 0;
  let personaExisting = 0;

  for (const persona of PERSONAS) {
    const existing = await prisma.persona.findFirst({
      where: { tenantId: SUMMIT_TENANT_ID, name: persona.name },
    });

    if (!existing) {
      await prisma.persona.create({
        data: {
          tenantId: SUMMIT_TENANT_ID,
          ...persona,
        },
      });
      console.log(`  Created: ${persona.name}`);
      personaCreated++;
    } else {
      console.log(`  Exists: ${persona.name}`);
      personaExisting++;
    }
  }

  console.log(`  Total: ${personaCreated} created, ${personaExisting} existing`);
  console.log('');

  // ==========================================
  // 3. CAMPAIGNS
  // ==========================================
  console.log('3. CAMPAIGNS');
  console.log('─────────────────────────────────────────');

  let campaignCreated = 0;
  let campaignExisting = 0;

  for (const campaignData of CAMPAIGNS) {
    const { steps, ...campaign } = campaignData;

    const existing = await prisma.campaign.findFirst({
      where: { tenantId: SUMMIT_TENANT_ID, name: campaign.name },
    });

    if (!existing) {
      const createdCampaign = await prisma.campaign.create({
        data: {
          tenantId: SUMMIT_TENANT_ID,
          createdById: user.id,
          name: campaign.name,
          description: campaign.description,
          type: campaign.type,
          channels: campaign.channels,
          status: campaign.status,
          goal: campaign.goal,
          budget: campaign.budget ? new Prisma.Decimal(campaign.budget) : null,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
        },
      });

      // Create steps
      for (const step of steps) {
        await prisma.campaignStep.create({
          data: {
            campaignId: createdCampaign.id,
            order: step.order,
            channel: step.channel,
            dayOffset: step.dayOffset,
            subject: step.subject,
            content: step.content,
          },
        });
      }

      console.log(`  Created: ${campaign.name} (${steps.length} steps)`);
      campaignCreated++;
    } else {
      console.log(`  Exists: ${campaign.name}`);
      campaignExisting++;
    }
  }

  console.log(`  Total: ${campaignCreated} created, ${campaignExisting} existing`);
  console.log('');

  // ==========================================
  // 4. WORKFLOWS
  // ==========================================
  console.log('4. WORKFLOWS');
  console.log('─────────────────────────────────────────');

  let workflowCreated = 0;
  let workflowExisting = 0;

  for (const workflowData of WORKFLOWS) {
    const { nodes, ...workflow } = workflowData;

    const existing = await prisma.workflow.findFirst({
      where: { tenantId: SUMMIT_TENANT_ID, name: workflow.name },
    });

    if (!existing) {
      const createdWorkflow = await prisma.workflow.create({
        data: {
          tenantId: SUMMIT_TENANT_ID,
          name: workflow.name,
          description: workflow.description,
          status: workflow.status,
          triggerType: workflow.triggerType,
          triggerConfig: workflow.triggerConfig,
          entryCount: workflow.entryCount,
          completionCount: workflow.completionCount,
        },
      });

      // Create nodes
      for (const node of nodes) {
        await prisma.workflowNode.create({
          data: {
            workflowId: createdWorkflow.id,
            nodeType: node.nodeType,
            name: node.name,
            config: node.config,
            sortOrder: node.sortOrder,
            positionX: 0,
            positionY: node.sortOrder * 100,
          },
        });
      }

      console.log(`  Created: ${workflow.name} (${nodes.length} nodes)`);
      workflowCreated++;
    } else {
      console.log(`  Exists: ${workflow.name}`);
      workflowExisting++;
    }
  }

  console.log(`  Total: ${workflowCreated} created, ${workflowExisting} existing`);
  console.log('');

  // ==========================================
  // 5. CALENDAR EVENTS
  // ==========================================
  console.log('5. CALENDAR EVENTS');
  console.log('─────────────────────────────────────────');

  let eventCreated = 0;
  let eventExisting = 0;

  for (const event of CALENDAR_EVENTS) {
    const existing = await prisma.calendarEvent.findFirst({
      where: {
        tenantId: SUMMIT_TENANT_ID,
        title: event.title,
      },
    });

    if (!existing) {
      await prisma.calendarEvent.create({
        data: {
          tenantId: SUMMIT_TENANT_ID,
          createdById: user.id,
          title: event.title,
          description: event.description,
          eventType: event.eventType,
          category: event.category,
          startTime: event.startTime,
          endTime: event.endTime,
          marketingChannel: event.marketingChannel,
          contentStatus: event.contentStatus,
          status: event.status,
        },
      });
      console.log(`  Created: ${event.title}`);
      eventCreated++;
    } else {
      console.log(`  Exists: ${event.title}`);
      eventExisting++;
    }
  }

  console.log(`  Total: ${eventCreated} created, ${eventExisting} existing`);
  console.log('');

  // ==========================================
  // 6. MONTHLY THEMES
  // ==========================================
  console.log('6. MONTHLY THEMES');
  console.log('─────────────────────────────────────────');

  let themeCreated = 0;
  let themeExisting = 0;

  for (const theme of MONTHLY_THEMES) {
    const existing = await prisma.monthlyTheme.findFirst({
      where: {
        tenantId: SUMMIT_TENANT_ID,
        year: theme.year,
        month: theme.month,
      },
    });

    if (!existing) {
      await prisma.monthlyTheme.create({
        data: {
          tenantId: SUMMIT_TENANT_ID,
          month: theme.month,
          year: theme.year,
          name: theme.name,
          description: theme.description,
          focusAreas: theme.focusAreas,
          colorCode: theme.colorCode,
          isActive: true,
        },
      });
      console.log(`  Created: ${theme.year}-${String(theme.month).padStart(2, '0')} - ${theme.name}`);
      themeCreated++;
    } else {
      console.log(`  Exists: ${theme.year}-${String(theme.month).padStart(2, '0')} - ${theme.name}`);
      themeExisting++;
    }
  }

  console.log(`  Total: ${themeCreated} created, ${themeExisting} existing`);
  console.log('');

  // ==========================================
  // 7. FUNNELS
  // ==========================================
  console.log('7. FUNNELS');
  console.log('─────────────────────────────────────────');

  let funnelCreated = 0;
  let funnelExisting = 0;

  for (const funnelData of FUNNELS) {
    const { stages, ...funnel } = funnelData;

    const existing = await prisma.funnel.findFirst({
      where: { tenantId: SUMMIT_TENANT_ID, name: funnel.name },
    });

    if (!existing) {
      const createdFunnel = await prisma.funnel.create({
        data: {
          tenantId: SUMMIT_TENANT_ID,
          name: funnel.name,
          description: funnel.description,
          status: 'active',
          totalVisits: stages[0]?.entryCount || 0,
          totalConversions: stages[stages.length - 1]?.exitCount || 0,
        },
      });

      // Create stages
      for (const stage of stages) {
        await prisma.funnelStage.create({
          data: {
            funnelId: createdFunnel.id,
            name: stage.name,
            stageType: stage.stageType,
            stageOrder: stage.stageOrder,
            entryCount: stage.entryCount,
            exitCount: stage.exitCount,
            conversionRate: stage.entryCount > 0
              ? new Prisma.Decimal((stage.exitCount / stage.entryCount * 100).toFixed(2))
              : null,
          },
        });
      }

      console.log(`  Created: ${funnel.name} (${stages.length} stages)`);
      funnelCreated++;
    } else {
      console.log(`  Exists: ${funnel.name}`);
      funnelExisting++;
    }
  }

  console.log(`  Total: ${funnelCreated} created, ${funnelExisting} existing`);
  console.log('');

  // ==========================================
  // 8. EMAIL TEMPLATES
  // ==========================================
  console.log('8. EMAIL TEMPLATES');
  console.log('─────────────────────────────────────────');

  let templateCreated = 0;
  let templateExisting = 0;

  for (const template of EMAIL_TEMPLATES) {
    const existing = await prisma.emailTemplate.findFirst({
      where: { tenantId: SUMMIT_TENANT_ID, name: template.name },
    });

    if (!existing) {
      await prisma.emailTemplate.create({
        data: {
          tenantId: SUMMIT_TENANT_ID,
          name: template.name,
          subject: template.subject,
          body: template.body,
          type: template.type,
          category: template.category,
          status: template.status,
          variables: template.variables,
        },
      });
      console.log(`  Created: ${template.name}`);
      templateCreated++;
    } else {
      console.log(`  Exists: ${template.name}`);
      templateExisting++;
    }
  }

  console.log(`  Total: ${templateCreated} created, ${templateExisting} existing`);
  console.log('');

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  PHASE 4 SEED COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('CMO Marketing Data for Summit Home Services:');
  console.log('');
  console.log('  Brand Profile:    1 (with marketing plan, voice guidelines)');
  console.log(`  Personas:         ${PERSONAS.length} (Sarah Homeowner, Mike Property Mgr, Lisa Realtor)`);
  console.log(`  Campaigns:        ${CAMPAIGNS.length} (Spring AC, Referral, Reviews, Winter Furnace)`);
  console.log(`  Workflows:        ${WORKFLOWS.length} (Lead Nurture, Post-Service, Maintenance Reminder)`);
  console.log(`  Calendar Events:  ${CALENDAR_EVENTS.length} (mix of completed and upcoming)`);
  console.log(`  Monthly Themes:   ${MONTHLY_THEMES.length} (Feb-May 2026)`);
  console.log(`  Funnels:          ${FUNNELS.length} (Service Call, Maintenance Plan)`);
  console.log(`  Email Templates:  ${EMAIL_TEMPLATES.length} (Confirmation, Quote, Reminder, Thank You)`);
  console.log('');
  console.log('This tenant now has a complete CMO module demo setup!');
  console.log('');
}

main()
  .catch((e) => {
    console.error('Error seeding Phase 4 data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
