import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const treasuryItems = [
  // === CAMPAIGN TEMPLATES ===
  {
    type: 'campaign',
    name: 'New Lead Nurture',
    description: 'Welcome new leads with a 5-step email sequence over 14 days',
    category: 'sales',
    executive: 'CRO',
    industry: 'general',
    channels: ['email'],
    stepCount: 5,
    duration: '14 days',
    sortOrder: 1,
    content: {
      steps: [
        { day: 0, channel: 'email', subject: 'Welcome to {{company}}', content: 'Thank you for your interest...' },
        { day: 2, channel: 'email', subject: 'How we can help', content: 'I wanted to share...' },
        { day: 5, channel: 'email', subject: 'Customer success story', content: 'See how {{customer}} achieved...' },
        { day: 9, channel: 'email', subject: 'Quick question', content: 'I noticed you downloaded...' },
        { day: 14, channel: 'email', subject: 'Still interested?', content: 'Just checking in...' },
      ]
    }
  },
  {
    type: 'campaign',
    name: 'Post-Quote Follow-Up',
    description: 'Follow up after sending a quote with email and phone touchpoints',
    category: 'sales',
    executive: 'CRO',
    industry: 'general',
    channels: ['email', 'phone'],
    stepCount: 4,
    duration: '10 days',
    sortOrder: 2,
    content: {
      steps: [
        { day: 1, channel: 'email', subject: 'Your quote from {{company}}', content: 'Following up on the quote...' },
        { day: 3, channel: 'phone', content: 'Call to discuss quote and answer questions' },
        { day: 7, channel: 'email', subject: 'Any questions about your quote?', content: 'I wanted to check...' },
        { day: 10, channel: 'phone', content: 'Final follow-up call before quote expires' },
      ]
    }
  },
  {
    type: 'campaign',
    name: 'Cabinet Project Follow-Up',
    description: 'MCF-specific follow-up sequence for cabinet projects',
    category: 'sales',
    executive: 'CRO',
    industry: 'cabinet_millwork',
    channels: ['email', 'phone', 'sms'],
    stepCount: 6,
    duration: '21 days',
    sortOrder: 3,
    content: {
      steps: [
        { day: 0, channel: 'email', subject: 'Thank you for visiting My Cabinet Factory', content: 'It was great meeting you...' },
        { day: 2, channel: 'sms', content: 'Hi {{firstName}}, thanks for visiting MCF! Let me know if you have questions about your project.' },
        { day: 5, channel: 'email', subject: 'Your cabinet design options', content: 'Based on our conversation...' },
        { day: 7, channel: 'phone', content: 'Follow-up call to discuss design preferences' },
        { day: 14, channel: 'email', subject: 'Ready to move forward?', content: 'I wanted to check in on your timeline...' },
        { day: 21, channel: 'phone', content: 'Final check-in call' },
      ]
    }
  },
  {
    type: 'campaign',
    name: 'Customer Reactivation',
    description: 'Re-engage past customers who haven\'t ordered in 12+ months',
    category: 'marketing',
    executive: 'CMO',
    industry: 'general',
    channels: ['email'],
    stepCount: 3,
    duration: '14 days',
    sortOrder: 4,
    content: {
      steps: [
        { day: 0, channel: 'email', subject: 'We miss you, {{firstName}}!', content: 'It\'s been a while since...' },
        { day: 7, channel: 'email', subject: 'Special offer just for you', content: 'As a valued past customer...' },
        { day: 14, channel: 'email', subject: 'Last chance: Your exclusive offer expires', content: 'Don\'t miss out...' },
      ]
    }
  },
  {
    type: 'campaign',
    name: 'Appointment Reminder',
    description: 'Automated reminders before scheduled appointments',
    category: 'operations',
    executive: 'COO',
    industry: 'general',
    channels: ['email', 'sms'],
    stepCount: 3,
    duration: '2 days',
    sortOrder: 5,
    content: {
      steps: [
        { day: -2, channel: 'email', subject: 'Reminder: Your appointment on {{date}}', content: 'This is a reminder...' },
        { day: -1, channel: 'sms', content: 'Reminder: Your appointment tomorrow at {{time}}. Reply C to confirm.' },
        { day: 0, channel: 'sms', content: 'See you today at {{time}}! Address: {{address}}' },
      ]
    }
  },

  // === FORM TEMPLATES ===
  {
    type: 'form',
    name: 'Client Intake Form',
    description: 'Comprehensive new client information gathering',
    category: 'sales',
    executive: 'CRO',
    industry: 'general',
    channels: [],
    sortOrder: 1,
    content: {
      fields: [
        { type: 'text', label: 'Full Name', required: true },
        { type: 'email', label: 'Email Address', required: true },
        { type: 'tel', label: 'Phone Number', required: true },
        { type: 'text', label: 'Company Name', required: false },
        { type: 'textarea', label: 'Project Description', required: true },
        { type: 'select', label: 'Budget Range', options: ['Under $10k', '$10k-$25k', '$25k-$50k', '$50k+'], required: true },
        { type: 'select', label: 'Timeline', options: ['ASAP', '1-3 months', '3-6 months', '6+ months'], required: true },
      ]
    }
  },
  {
    type: 'form',
    name: 'Cabinet Measurement Form',
    description: 'Site measurement and specification form for cabinet projects',
    category: 'operations',
    executive: 'COO',
    industry: 'cabinet_millwork',
    channels: [],
    sortOrder: 2,
    content: {
      fields: [
        { type: 'text', label: 'Project Name', required: true },
        { type: 'text', label: 'Room Type', required: true },
        { type: 'number', label: 'Wall Length (inches)', required: true },
        { type: 'number', label: 'Ceiling Height (inches)', required: true },
        { type: 'textarea', label: 'Special Considerations', required: false },
        { type: 'file', label: 'Site Photos', required: false },
      ]
    }
  },
  {
    type: 'form',
    name: 'Project Satisfaction Survey',
    description: 'Post-project customer satisfaction survey',
    category: 'operations',
    executive: 'COO',
    industry: 'general',
    channels: [],
    sortOrder: 3,
    content: {
      fields: [
        { type: 'rating', label: 'Overall Satisfaction', required: true },
        { type: 'rating', label: 'Quality of Work', required: true },
        { type: 'rating', label: 'Communication', required: true },
        { type: 'rating', label: 'Timeliness', required: true },
        { type: 'textarea', label: 'What did we do well?', required: false },
        { type: 'textarea', label: 'How can we improve?', required: false },
        { type: 'select', label: 'Would you recommend us?', options: ['Definitely', 'Probably', 'Not sure', 'Probably not'], required: true },
      ]
    }
  },

  // === SOP TEMPLATES ===
  {
    type: 'sop',
    name: 'New Lead Processing',
    description: 'Standard procedure for handling new incoming leads',
    category: 'sales',
    executive: 'CRO',
    industry: 'general',
    channels: [],
    sortOrder: 1,
    content: {
      steps: [
        { order: 1, title: 'Initial Contact', description: 'Respond to new lead within 1 hour during business hours' },
        { order: 2, title: 'Qualification', description: 'Use BANT framework to qualify lead' },
        { order: 3, title: 'CRM Entry', description: 'Create contact and project in Zander with all relevant details' },
        { order: 4, title: 'Assignment', description: 'Assign to appropriate sales rep based on territory/expertise' },
        { order: 5, title: 'Follow-up Schedule', description: 'Enroll in appropriate nurture campaign' },
      ]
    }
  },
  {
    type: 'sop',
    name: 'Cabinet Order Processing',
    description: 'Step-by-step process for processing cabinet orders',
    category: 'operations',
    executive: 'COO',
    industry: 'cabinet_millwork',
    channels: [],
    sortOrder: 2,
    content: {
      steps: [
        { order: 1, title: 'Order Review', description: 'Verify all specifications and measurements' },
        { order: 2, title: 'Material Check', description: 'Confirm material availability and lead times' },
        { order: 3, title: 'Production Schedule', description: 'Add to production calendar with realistic timeline' },
        { order: 4, title: 'Customer Confirmation', description: 'Send order confirmation with expected delivery date' },
        { order: 5, title: 'Deposit Collection', description: 'Collect 50% deposit before production begins' },
        { order: 6, title: 'Production Kickoff', description: 'Release work order to production floor' },
      ]
    }
  },
  {
    type: 'sop',
    name: 'Customer Complaint Resolution',
    description: 'Process for handling and resolving customer complaints',
    category: 'operations',
    executive: 'COO',
    industry: 'general',
    channels: [],
    sortOrder: 3,
    content: {
      steps: [
        { order: 1, title: 'Acknowledge', description: 'Respond within 2 hours acknowledging the complaint' },
        { order: 2, title: 'Document', description: 'Record all details in CRM with photos if applicable' },
        { order: 3, title: 'Investigate', description: 'Gather information from all parties involved' },
        { order: 4, title: 'Propose Solution', description: 'Present resolution options to customer within 24 hours' },
        { order: 5, title: 'Execute', description: 'Implement agreed solution with timeline' },
        { order: 6, title: 'Follow Up', description: 'Confirm resolution satisfaction within 7 days' },
      ]
    }
  },

  // === ASSEMBLY TEMPLATES ===
  {
    type: 'assembly',
    name: 'Sales Discovery Call',
    description: '30-minute discovery call agenda for new prospects',
    category: 'sales',
    executive: 'CRO',
    industry: 'general',
    channels: ['phone'],
    sortOrder: 1,
    content: {
      duration: '30 minutes',
      agenda: [
        { time: '0-5 min', topic: 'Introduction & rapport building' },
        { time: '5-15 min', topic: 'Discovery questions - understand needs, budget, timeline' },
        { time: '15-25 min', topic: 'Solution overview & value proposition' },
        { time: '25-30 min', topic: 'Next steps & scheduling' },
      ],
    }
  },
  {
    type: 'assembly',
    name: 'Project Kickoff Meeting',
    description: 'Internal kickoff meeting for new projects',
    category: 'operations',
    executive: 'COO',
    industry: 'general',
    channels: [],
    sortOrder: 2,
    content: {
      duration: '45 minutes',
      agenda: [
        { time: '0-5 min', topic: 'Project overview & customer background' },
        { time: '5-15 min', topic: 'Scope review & deliverables' },
        { time: '15-25 min', topic: 'Timeline & milestones' },
        { time: '25-35 min', topic: 'Role assignments & responsibilities' },
        { time: '35-45 min', topic: 'Questions & action items' },
      ]
    }
  },
  {
    type: 'assembly',
    name: 'Cabinet Design Consultation',
    description: 'In-home or showroom design consultation',
    category: 'sales',
    executive: 'CRO',
    industry: 'cabinet_millwork',
    channels: [],
    sortOrder: 3,
    content: {
      duration: '90 minutes',
      agenda: [
        { time: '0-15 min', topic: 'Introduction & project vision discussion' },
        { time: '15-45 min', topic: 'Measurements & site assessment' },
        { time: '45-70 min', topic: 'Style selection - doors, finishes, hardware' },
        { time: '70-85 min', topic: 'Budget discussion & options' },
        { time: '85-90 min', topic: 'Next steps & timeline' },
      ],
    }
  },
  {
    type: 'assembly',
    name: 'Weekly Team Standup',
    description: 'Quick weekly team alignment meeting',
    category: 'operations',
    executive: 'COO',
    industry: 'general',
    channels: [],
    sortOrder: 4,
    content: {
      duration: '15 minutes',
      agenda: [
        { time: '0-5 min', topic: 'Wins from last week' },
        { time: '5-10 min', topic: 'This week\'s priorities' },
        { time: '10-15 min', topic: 'Blockers & needs' },
      ]
    }
  },
];

async function main() {
  console.log('Seeding Treasury items...');
  
  // Clear existing treasury items
  await prisma.treasuryItem.deleteMany({});
  console.log('Cleared existing treasury items');
  
  // Insert new items
  for (const item of treasuryItems) {
    await prisma.treasuryItem.create({
      data: item,
    });
    console.log(`Created: ${item.type} - ${item.name}`);
  }
  
  console.log(`\nSeeded ${treasuryItems.length} treasury items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
