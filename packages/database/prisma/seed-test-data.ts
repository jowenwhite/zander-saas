import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.log('No tenant found. Please create a tenant first.');
    return;
  }
  
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user found. Please create a user first.');
    return;
  }
  
  console.log(`Seeding test data for tenant: ${tenant.companyName} (${tenant.id})`);
  const tenantId = tenant.id;
  const userId = user.id;

  // === CONTACTS (People) ===
  console.log('\nCreating contacts...');
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        tenantId,
        firstName: 'Sarah',
        lastName: 'Mitchell',
        email: 'sarah.mitchell@example.com',
        phone: '(404) 555-1234',
        company: 'Mitchell Homes',
        title: 'Homeowner',
        source: 'Website',
        primaryRole: 'CLIENT',
      }
    }),
    prisma.contact.create({
      data: {
        tenantId,
        firstName: 'James',
        lastName: 'Peterson',
        email: 'james.p@buildersinc.com',
        phone: '(678) 555-5678',
        company: 'Builders Inc',
        title: 'General Contractor',
        source: 'Referral',
        primaryRole: 'PARTNER',
      }
    }),
    prisma.contact.create({
      data: {
        tenantId,
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@designstudio.com',
        phone: '(770) 555-9012',
        company: 'Garcia Design Studio',
        title: 'Interior Designer',
        source: 'Trade Show',
        primaryRole: 'PARTNER',
      }
    }),
    prisma.contact.create({
      data: {
        tenantId,
        firstName: 'Robert',
        lastName: 'Chen',
        email: 'rchen@chenproperties.com',
        phone: '(404) 555-3456',
        company: 'Chen Properties',
        title: 'Property Developer',
        source: 'LinkedIn',
        primaryRole: 'CLIENT',
      }
    }),
    prisma.contact.create({
      data: {
        tenantId,
        firstName: 'Emily',
        lastName: 'Thompson',
        email: 'emily.t@gmail.com',
        phone: '(678) 555-7890',
        title: 'Homeowner',
        source: 'Google',
        primaryRole: 'CLIENT',
      }
    }),
  ]);
  console.log(`Created ${contacts.length} contacts`);

  // === DEALS (Projects) ===
  console.log('\nCreating deals...');
  const deals = await Promise.all([
    prisma.deal.create({
      data: {
        tenantId,
        contactId: contacts[0].id,
        dealName: 'Mitchell Kitchen Remodel',
        dealValue: 45000,
        stage: 'QUALIFIED',
        priority: 'HIGH',
        status: 'open',
        probability: 60,
        expectedCloseDate: new Date('2025-02-15'),
        notes: 'Full kitchen cabinet replacement, white shaker style',
      }
    }),
    prisma.deal.create({
      data: {
        tenantId,
        contactId: contacts[1].id,
        dealName: 'Builders Inc - Townhome Project',
        dealValue: 125000,
        stage: 'PROPOSAL',
        priority: 'HIGH',
        status: 'open',
        probability: 75,
        expectedCloseDate: new Date('2025-01-30'),
        notes: '5 unit townhome development, all kitchens and baths',
      }
    }),
    prisma.deal.create({
      data: {
        tenantId,
        contactId: contacts[2].id,
        dealName: 'Garcia Studio - Client Showroom',
        dealValue: 32000,
        stage: 'NEGOTIATION',
        priority: 'MEDIUM',
        status: 'open',
        probability: 85,
        expectedCloseDate: new Date('2025-01-20'),
        notes: 'Custom display cabinets for design showroom',
      }
    }),
    prisma.deal.create({
      data: {
        tenantId,
        contactId: contacts[3].id,
        dealName: 'Chen Properties Phase 1',
        dealValue: 280000,
        stage: 'LEAD',
        priority: 'MEDIUM',
        status: 'open',
        probability: 25,
        expectedCloseDate: new Date('2025-04-01'),
        notes: 'Luxury condo development - 12 units',
      }
    }),
  ]);
  console.log(`Created ${deals.length} deals`);

  // === PRODUCTS ===
  console.log('\nCreating products...');
  const products = await Promise.all([
    prisma.product.create({
      data: {
        tenantId,
        name: 'Shaker Cabinet - Base 36"',
        description: 'White shaker style base cabinet, 36 inch width',
        sku: 'CAB-BASE-36-WHT',
        basePrice: 450,
        costOfGoods: 180,
        category: 'Base Cabinets',
        status: 'ACTIVE',
        type: 'PHYSICAL',
      }
    }),
    prisma.product.create({
      data: {
        tenantId,
        name: 'Shaker Cabinet - Wall 30"',
        description: 'White shaker style wall cabinet, 30 inch width',
        sku: 'CAB-WALL-30-WHT',
        basePrice: 320,
        costOfGoods: 125,
        category: 'Wall Cabinets',
        status: 'ACTIVE',
        type: 'PHYSICAL',
      }
    }),
    prisma.product.create({
      data: {
        tenantId,
        name: 'Soft-Close Drawer Slides',
        description: 'Blum Tandem soft-close drawer slides, pair',
        sku: 'HW-SLIDES-SC',
        basePrice: 45,
        costOfGoods: 22,
        category: 'Hardware',
        status: 'ACTIVE',
        type: 'PHYSICAL',
      }
    }),
    prisma.product.create({
      data: {
        tenantId,
        name: 'Installation Labor - Per Cabinet',
        description: 'Professional cabinet installation, per unit',
        sku: 'SVC-INSTALL',
        basePrice: 85,
        costOfGoods: 45,
        category: 'Services',
        status: 'ACTIVE',
        type: 'SERVICE',
      }
    }),
  ]);
  console.log(`Created ${products.length} products`);

  // === SMS MESSAGES ===
  console.log('\nCreating SMS messages...');
  const now = new Date();
  const smsMessages = await Promise.all([
    prisma.smsMessage.create({
      data: {
        tenantId,
        contactId: contacts[0].id,
        direction: 'outbound',
        fromNumber: '+14045551000',
        toNumber: '+14045551234',
        body: 'Hi Sarah! This is Jonathan from MCF. Just confirming our appointment tomorrow at 10am.',
        status: 'delivered',
        sentAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      }
    }),
    prisma.smsMessage.create({
      data: {
        tenantId,
        contactId: contacts[0].id,
        direction: 'inbound',
        fromNumber: '+14045551234',
        toNumber: '+14045551000',
        body: 'Perfect, see you tomorrow! Should I have the contractor there too?',
        status: 'received',
        sentAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      }
    }),
    prisma.smsMessage.create({
      data: {
        tenantId,
        contactId: contacts[1].id,
        direction: 'outbound',
        fromNumber: '+14045551000',
        toNumber: '+16785555678',
        body: 'James, quote is ready for the townhome project. Sending via email now.',
        status: 'delivered',
        sentAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      }
    }),
  ]);
  console.log(`Created ${smsMessages.length} SMS messages`);

  // === CALL LOGS ===
  console.log('\nCreating call logs...');
  const callLogs = await Promise.all([
    prisma.callLog.create({
      data: {
        tenantId,
        contactId: contacts[0].id,
        userId,
        type: 'manual_call',
        direction: 'outbound',
        fromNumber: '+14045551000',
        toNumber: '+14045551234',
        duration: 480,
        status: 'completed',
        outcome: 'connected',
        notes: 'Discussed kitchen layout options, scheduled site visit',
      }
    }),
    prisma.callLog.create({
      data: {
        tenantId,
        contactId: contacts[1].id,
        userId,
        type: 'manual_call',
        direction: 'inbound',
        fromNumber: '+16785555678',
        toNumber: '+14045551000',
        duration: 720,
        status: 'completed',
        outcome: 'connected',
        notes: 'Questions about cabinet specs for townhome project',
      }
    }),
    prisma.callLog.create({
      data: {
        tenantId,
        contactId: contacts[2].id,
        userId,
        type: 'manual_call',
        direction: 'outbound',
        fromNumber: '+14045551000',
        toNumber: '+17705559012',
        duration: 0,
        status: 'completed',
        outcome: 'no_answer',
        notes: 'Left voicemail about showroom quote',
      }
    }),
  ]);
  console.log(`Created ${callLogs.length} call logs`);

  // === CALENDAR EVENTS (Assemblies) ===
  console.log('\nCreating calendar events...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(11, 30, 0, 0);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(9, 0, 0, 0);
  
  const nextWeekEnd = new Date(nextWeek);
  nextWeekEnd.setHours(10, 0, 0, 0);
  
  const events = await Promise.all([
    prisma.calendarEvent.create({
      data: {
        tenantId,
        createdById: userId,
        title: 'Site Visit - Mitchell Kitchen',
        description: 'Final measurements and material selections',
        startTime: tomorrow,
        endTime: tomorrowEnd,
        location: '123 Oak Street, Atlanta, GA',
        meetingPlatform: 'in_person',
        status: 'confirmed',
      }
    }),
    prisma.calendarEvent.create({
      data: {
        tenantId,
        createdById: userId,
        title: 'Builders Inc - Project Kickoff',
        description: 'Kickoff meeting for townhome cabinet package',
        startTime: nextWeek,
        endTime: nextWeekEnd,
        location: 'Zoom',
        meetingPlatform: 'zoom',
        meetingUrl: 'https://zoom.us/j/123456789',
        status: 'pending',
      }
    }),
  ]);
  console.log(`Created ${events.length} calendar events`);

  // === FORMS ===
  console.log('\nCreating forms...');
  const forms = await Promise.all([
    prisma.form.create({
      data: {
        tenantId,
        name: 'Project Intake Form',
        description: 'Initial project requirements gathering',
        formType: 'form',
        status: 'active',
        fields: [
          { id: '1', type: 'text', label: 'Project Name', required: true },
          { id: '2', type: 'select', label: 'Project Type', options: ['Kitchen', 'Bathroom', 'Closet'], required: true },
        ],
      }
    }),
    prisma.form.create({
      data: {
        tenantId,
        name: 'Cabinet Order Processing',
        description: 'Step-by-step order processing procedure',
        formType: 'sop',
        status: 'active',
        fields: [
          { id: '1', title: 'Verify Order Details', description: 'Check all specifications match quote' },
          { id: '2', title: 'Schedule Production', description: 'Add to production calendar' },
        ],
      }
    }),
  ]);
  console.log(`Created ${forms.length} forms`);

  console.log('\n✅ Test data seeding complete!');
  console.log(`
Summary:
- ${contacts.length} Contacts (People)
- ${deals.length} Deals (Projects)
- ${products.length} Products
- ${smsMessages.length} SMS Messages
- ${callLogs.length} Call Logs
- ${events.length} Calendar Events (Assemblies)
- ${forms.length} Forms (including SOPs)
`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
