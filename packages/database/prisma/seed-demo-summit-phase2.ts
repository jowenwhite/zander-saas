import { PrismaClient, PersonRole } from '@prisma/client';

const prisma = new PrismaClient();

// ==========================================
// CONTACTS DATA - 25 Denver-area contacts
// ==========================================

interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  title?: string;
  primaryRole: PersonRole;
  source: string;
  notes?: string;
  lifecycleStage: string;
  leadScore: number;
}

const CONTACTS: ContactData[] = [
  // ─────────────────────────────────────────
  // RESIDENTIAL HOMEOWNERS (15)
  // ─────────────────────────────────────────

  // Past customers (repeat business potential)
  {
    firstName: 'Robert',
    lastName: 'Martinez',
    email: 'robert.martinez@gmail.com',
    phone: '303-555-1234',
    primaryRole: 'CLIENT',
    source: 'Repeat Customer',
    notes: 'Had furnace replaced 2023. Very satisfied. Lives in older home, may need electrical panel upgrade soon.',
    lifecycleStage: 'customer',
    leadScore: 85,
  },
  {
    firstName: 'Sarah',
    lastName: 'Thompson',
    email: 'sarah.t.thompson@yahoo.com',
    phone: '720-555-2345',
    primaryRole: 'CLIENT',
    source: 'Repeat Customer',
    notes: 'AC tune-up customer since 2021. Refers neighbors frequently. Highland Ranch area.',
    lifecycleStage: 'customer',
    leadScore: 90,
  },
  {
    firstName: 'David',
    lastName: 'Chen',
    email: 'dchen.denver@outlook.com',
    phone: '303-555-3456',
    primaryRole: 'CLIENT',
    source: 'Google',
    notes: 'Water heater replacement last year. Mentioned kitchen remodel plans - potential plumbing work.',
    lifecycleStage: 'customer',
    leadScore: 75,
  },
  {
    firstName: 'Jennifer',
    lastName: 'Williams',
    email: 'jen.williams.co@gmail.com',
    phone: '720-555-4567',
    primaryRole: 'CLIENT',
    source: 'Referral',
    notes: 'Referred by Sarah Thompson. Completed drain cleaning. Lives in Lakewood.',
    lifecycleStage: 'customer',
    leadScore: 70,
  },
  {
    firstName: 'Michael',
    lastName: 'O\'Brien',
    email: 'mobrien77@comcast.net',
    phone: '303-555-5678',
    primaryRole: 'CLIENT',
    source: 'Repeat Customer',
    notes: 'Long-time customer. Annual HVAC maintenance contract. Very particular about scheduling.',
    lifecycleStage: 'customer',
    leadScore: 95,
  },

  // Recent leads (active prospects)
  {
    firstName: 'Amanda',
    lastName: 'Rodriguez',
    email: 'amanda.rod@gmail.com',
    phone: '720-555-6789',
    primaryRole: 'CLIENT',
    source: 'Website',
    notes: 'Submitted form about AC not cooling. Aurora address. Urgency noted.',
    lifecycleStage: 'lead',
    leadScore: 60,
  },
  {
    firstName: 'James',
    lastName: 'Peterson',
    email: 'jpeterson.denver@gmail.com',
    phone: '303-555-7890',
    primaryRole: 'CLIENT',
    source: 'Yelp',
    notes: 'Interested in furnace replacement quote. Current unit is 18 years old.',
    lifecycleStage: 'lead',
    leadScore: 55,
  },
  {
    firstName: 'Lisa',
    lastName: 'Nguyen',
    email: 'lisa.nguyen.co@yahoo.com',
    phone: '720-555-8901',
    primaryRole: 'CLIENT',
    source: 'Google',
    notes: 'Called about electrical panel inspection. Concerned about safety in older Arvada home.',
    lifecycleStage: 'lead',
    leadScore: 50,
  },
  {
    firstName: 'Kevin',
    lastName: 'Jackson',
    email: 'kevjackson@outlook.com',
    phone: '303-555-9012',
    primaryRole: 'CLIENT',
    source: 'Website',
    notes: 'New homeowner in Littleton. Wants whole-house HVAC assessment.',
    lifecycleStage: 'lead',
    leadScore: 65,
  },
  {
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.g.garcia@gmail.com',
    phone: '720-555-0123',
    primaryRole: 'CLIENT',
    source: 'Referral',
    notes: 'Referred by Michael O\'Brien. Needs plumbing work - multiple fixture replacements.',
    lifecycleStage: 'lead',
    leadScore: 70,
  },

  // Cold/older leads
  {
    firstName: 'Thomas',
    lastName: 'Anderson',
    email: 'tanderson.co@gmail.com',
    phone: '303-555-1122',
    primaryRole: 'CLIENT',
    source: 'Website',
    notes: 'Inquired 3 months ago about AC replacement. No response to follow-ups.',
    lifecycleStage: 'subscriber',
    leadScore: 25,
  },
  {
    firstName: 'Patricia',
    lastName: 'Lewis',
    email: 'pat.lewis.denver@yahoo.com',
    phone: '720-555-2233',
    primaryRole: 'CLIENT',
    source: 'Google',
    notes: 'Got quote but went with competitor. Re-engage in 6 months.',
    lifecycleStage: 'subscriber',
    leadScore: 30,
  },
  {
    firstName: 'Christopher',
    lastName: 'Moore',
    email: 'cmoore.hvac@gmail.com',
    phone: '303-555-3344',
    primaryRole: 'CLIENT',
    source: 'Yelp',
    notes: 'Initial inquiry only. Budget concerns mentioned.',
    lifecycleStage: 'subscriber',
    leadScore: 20,
  },
  {
    firstName: 'Nancy',
    lastName: 'Taylor',
    email: 'nancy.taylor.co@outlook.com',
    phone: '720-555-4455',
    primaryRole: 'CLIENT',
    source: 'Website',
    notes: 'Downloaded maintenance checklist. No service requests yet.',
    lifecycleStage: 'subscriber',
    leadScore: 15,
  },
  {
    firstName: 'Daniel',
    lastName: 'White',
    email: 'dan.white.denver@gmail.com',
    phone: '303-555-5566',
    primaryRole: 'CLIENT',
    source: 'Referral',
    notes: 'Friend of the owner. Casual inquiry about smart thermostat options.',
    lifecycleStage: 'subscriber',
    leadScore: 35,
  },

  // ─────────────────────────────────────────
  // PROPERTY MANAGERS (5 - commercial accounts)
  // ─────────────────────────────────────────
  {
    firstName: 'Rachel',
    lastName: 'Foster',
    email: 'rfoster@mountainviewproperties.com',
    phone: '303-555-6677',
    company: 'Mountain View Properties',
    title: 'Property Manager',
    primaryRole: 'CLIENT',
    source: 'Referral',
    notes: 'Manages 45 rental units in Denver metro. Needs reliable emergency service. High volume potential.',
    lifecycleStage: 'customer',
    leadScore: 100,
  },
  {
    firstName: 'Brian',
    lastName: 'Mitchell',
    email: 'bmitchell@denverpmgroup.com',
    phone: '720-555-7788',
    company: 'Denver PM Group',
    title: 'Operations Director',
    primaryRole: 'CLIENT',
    source: 'Google',
    notes: 'Looking for new HVAC contractor. Current vendor unreliable. 28 properties.',
    lifecycleStage: 'lead',
    leadScore: 85,
  },
  {
    firstName: 'Stephanie',
    lastName: 'Clark',
    email: 'sclark@redrockrealty.com',
    phone: '303-555-8899',
    company: 'Red Rock Realty Management',
    title: 'Maintenance Coordinator',
    primaryRole: 'CLIENT',
    source: 'Website',
    notes: 'Submitted commercial inquiry. Manages HOA maintenance for 3 communities.',
    lifecycleStage: 'lead',
    leadScore: 75,
  },
  {
    firstName: 'Mark',
    lastName: 'Reynolds',
    email: 'mark.reynolds@apexapartments.com',
    phone: '720-555-9900',
    company: 'Apex Apartment Management',
    title: 'Regional Manager',
    primaryRole: 'CLIENT',
    source: 'Repeat Customer',
    notes: 'Active account. 3 apartment complexes. Quarterly maintenance contracts.',
    lifecycleStage: 'customer',
    leadScore: 95,
  },
  {
    firstName: 'Angela',
    lastName: 'Brooks',
    email: 'abrooks@coloradocommercial.com',
    phone: '303-555-0011',
    company: 'Colorado Commercial Properties',
    title: 'Facilities Manager',
    primaryRole: 'CLIENT',
    source: 'Referral',
    notes: 'Small commercial buildings. Referred by Rachel Foster.',
    lifecycleStage: 'lead',
    leadScore: 65,
  },

  // ─────────────────────────────────────────
  // REALTORS (3 - referral partners)
  // ─────────────────────────────────────────
  {
    firstName: 'Jessica',
    lastName: 'Palmer',
    email: 'jessica@palmerrealestate.com',
    phone: '303-555-1133',
    company: 'Palmer Real Estate Group',
    title: 'Broker/Owner',
    primaryRole: 'PARTNER',
    source: 'Networking',
    notes: 'Top producer in Highlands Ranch. Sends pre-inspection HVAC referrals. Pay 5% referral fee.',
    lifecycleStage: 'customer',
    leadScore: 90,
  },
  {
    firstName: 'Carlos',
    lastName: 'Mendez',
    email: 'carlos@denverhometeam.com',
    phone: '720-555-2244',
    company: 'Denver Home Team',
    title: 'Real Estate Agent',
    primaryRole: 'PARTNER',
    source: 'Referral',
    notes: 'New partnership. Focuses on first-time homebuyers who often need inspections.',
    lifecycleStage: 'lead',
    leadScore: 60,
  },
  {
    firstName: 'Lauren',
    lastName: 'Hughes',
    email: 'lauren.hughes@remax.com',
    phone: '303-555-3355',
    company: 'RE/MAX Alliance',
    title: 'Realtor',
    primaryRole: 'PARTNER',
    source: 'Networking',
    notes: 'Met at chamber event. Interested in referral partnership. Covers Lakewood/Golden area.',
    lifecycleStage: 'lead',
    leadScore: 50,
  },

  // ─────────────────────────────────────────
  // VENDORS/SUPPLIERS (2)
  // ─────────────────────────────────────────
  {
    firstName: 'Tom',
    lastName: 'Harrison',
    email: 'tom.harrison@carrierac.com',
    phone: '303-555-4466',
    company: 'Carrier HVAC Supply - Denver',
    title: 'Account Manager',
    primaryRole: 'VENDOR',
    source: 'Vendor',
    notes: 'Primary Carrier equipment supplier. Good pricing on premium units. Net 30 terms.',
    lifecycleStage: 'customer',
    leadScore: 0,
  },
  {
    firstName: 'Michelle',
    lastName: 'Sanders',
    email: 'msanders@fergusonsupply.com',
    phone: '720-555-5577',
    company: 'Ferguson Plumbing Supply',
    title: 'Sales Representative',
    primaryRole: 'VENDOR',
    source: 'Vendor',
    notes: 'Plumbing and water heater supplier. Early morning pickups available.',
    lifecycleStage: 'customer',
    leadScore: 0,
  },
];

// ==========================================
// DEALS DATA - 10 projects across pipeline
// ==========================================

interface DealData {
  dealName: string;
  contactEmail: string; // To link to contact
  dealValue: number;
  stage: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probability: number;
  status: string;
  notes: string;
  nextSteps?: string;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  daysAgo: number; // When was this created
  assignedToEmail: string; // tyler or jessica
}

const DEALS: DealData[] = [
  // ─────────────────────────────────────────
  // LEAD Stage (2) - New inquiries
  // ─────────────────────────────────────────
  {
    dealName: 'Rodriguez Residence - AC Not Cooling',
    contactEmail: 'amanda.rod@gmail.com',
    dealValue: 350, // Likely repair
    stage: 'Lead',
    priority: 'HIGH',
    probability: 10,
    status: 'open',
    notes: 'Urgent: AC stopped cooling. Aurora. Summer heat wave concern.',
    nextSteps: 'Call to schedule diagnostic visit',
    expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    daysAgo: 1,
    assignedToEmail: 'tyler@summithomeservices.com',
  },
  {
    dealName: 'Peterson Home - Furnace Replacement Quote',
    contactEmail: 'jpeterson.denver@gmail.com',
    dealValue: 5500, // Mid-range furnace
    stage: 'Lead',
    priority: 'MEDIUM',
    probability: 10,
    status: 'open',
    notes: 'Current furnace 18 years old. Wants quote before winter.',
    nextSteps: 'Schedule in-home estimate',
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    daysAgo: 3,
    assignedToEmail: 'tyler@summithomeservices.com',
  },

  // ─────────────────────────────────────────
  // QUALIFIED Stage (2) - Estimate scheduled/completed
  // ─────────────────────────────────────────
  {
    dealName: 'Jackson New Home - HVAC Assessment',
    contactEmail: 'kevjackson@outlook.com',
    dealValue: 850, // Assessment + minor repairs
    stage: 'Qualified',
    priority: 'MEDIUM',
    probability: 25,
    status: 'open',
    notes: 'New homeowner wants full system evaluation. Estimate completed - needs duct sealing and tune-up.',
    nextSteps: 'Follow up on quote acceptance',
    expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    daysAgo: 8,
    assignedToEmail: 'tyler@summithomeservices.com',
  },
  {
    dealName: 'Denver PM Group - Multi-Property Contract',
    contactEmail: 'bmitchell@denverpmgroup.com',
    dealValue: 12000, // Annual contract value
    stage: 'Qualified',
    priority: 'HIGH',
    probability: 25,
    status: 'open',
    notes: 'Proposal for maintenance contract on 28 properties. Met with Brian, toured 3 properties.',
    nextSteps: 'Prepare formal proposal document',
    expectedCloseDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    daysAgo: 12,
    assignedToEmail: 'jessica@summithomeservices.com',
  },

  // ─────────────────────────────────────────
  // PROPOSAL Stage (2) - Quote sent, awaiting decision
  // ─────────────────────────────────────────
  {
    dealName: 'Garcia Home - Multi-Fixture Plumbing',
    contactEmail: 'maria.g.garcia@gmail.com',
    dealValue: 2100, // Multiple fixtures
    stage: 'Proposal',
    priority: 'MEDIUM',
    probability: 50,
    status: 'open',
    notes: 'Quote sent for 3 bathroom fixture replacements + kitchen faucet. Waiting on decision.',
    nextSteps: 'Follow up call scheduled for Friday',
    expectedCloseDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    daysAgo: 18,
    assignedToEmail: 'tyler@summithomeservices.com',
  },
  {
    dealName: 'Nguyen Residence - Electrical Panel Upgrade',
    contactEmail: 'lisa.nguyen.co@yahoo.com',
    dealValue: 3500, // Panel upgrade
    stage: 'Proposal',
    priority: 'MEDIUM',
    probability: 50,
    status: 'open',
    notes: 'Older Arvada home needs 200 amp upgrade. Quote delivered, comparing with other bids.',
    nextSteps: 'Check in next week - mentioned deciding by month end',
    expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    daysAgo: 25,
    assignedToEmail: 'jessica@summithomeservices.com',
  },

  // ─────────────────────────────────────────
  // NEGOTIATION Stage (2) - Work in progress
  // ─────────────────────────────────────────
  {
    dealName: 'Martinez Residence - AC Replacement',
    contactEmail: 'robert.martinez@gmail.com',
    dealValue: 7800, // Premium AC unit
    stage: 'Negotiation',
    priority: 'HIGH',
    probability: 75,
    status: 'open',
    notes: 'Accepted quote! Equipment ordered. Install scheduled for next Tuesday.',
    nextSteps: 'Confirm install team availability, prep equipment',
    expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    daysAgo: 35,
    assignedToEmail: 'jessica@summithomeservices.com',
  },
  {
    dealName: 'Mountain View Properties - Emergency Repairs',
    contactEmail: 'rfoster@mountainviewproperties.com',
    dealValue: 4200, // Multiple unit repairs
    stage: 'Negotiation',
    priority: 'CRITICAL',
    probability: 75,
    status: 'open',
    notes: 'Emergency HVAC repairs across 4 units. Work in progress - 2 completed, 2 remaining.',
    nextSteps: 'Complete units 3 and 4 this week',
    expectedCloseDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    daysAgo: 10,
    assignedToEmail: 'jessica@summithomeservices.com',
  },

  // ─────────────────────────────────────────
  // CLOSED WON Stage (2) - Completed jobs
  // ─────────────────────────────────────────
  {
    dealName: 'Thompson Residence - Annual AC Tune-Up',
    contactEmail: 'sarah.t.thompson@yahoo.com',
    dealValue: 149, // Standard tune-up
    stage: 'Closed Won',
    priority: 'LOW',
    probability: 100,
    status: 'closed',
    notes: 'Completed annual AC maintenance. System in excellent condition. Scheduled for next year.',
    actualCloseDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    daysAgo: 45,
    assignedToEmail: 'tyler@summithomeservices.com',
  },
  {
    dealName: 'Chen Home - Water Heater Replacement',
    contactEmail: 'dchen.denver@outlook.com',
    dealValue: 2650, // Water heater
    stage: 'Closed Won',
    priority: 'MEDIUM',
    probability: 100,
    status: 'closed',
    notes: 'Replaced 50-gallon water heater. Customer very satisfied. Left review on Google.',
    actualCloseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
    daysAgo: 60,
    assignedToEmail: 'tyler@summithomeservices.com',
  },
];

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  SUMMIT HOME SERVICES - Phase 2: Contacts & Projects');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  // ==========================================
  // FIND EXISTING TENANT & USERS
  // ==========================================
  console.log('1. VERIFYING PHASE 1 DATA');
  console.log('─────────────────────────────────────────');

  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: 'summit-home-services' },
  });

  if (!tenant) {
    console.error('ERROR: Summit Home Services tenant not found!');
    console.error('Please run Phase 1 seed first: npm run seed:demo-summit');
    process.exit(1);
  }
  console.log(`  Tenant: ${tenant.companyName} (${tenant.id})`);

  // Get users for assignment
  const tylerUser = await prisma.user.findUnique({
    where: { email: 'tyler@summithomeservices.com' },
  });
  const jessicaUser = await prisma.user.findUnique({
    where: { email: 'jessica@summithomeservices.com' },
  });

  if (!tylerUser || !jessicaUser) {
    console.error('ERROR: Required users not found!');
    console.error('Please run Phase 1 seed first: npm run seed:demo-summit');
    process.exit(1);
  }
  console.log(`  Tyler Brooks: ${tylerUser.id}`);
  console.log(`  Jessica Reyes: ${jessicaUser.id}`);
  console.log('');

  // ==========================================
  // SEED CONTACTS
  // ==========================================
  console.log('2. CONTACTS');
  console.log('─────────────────────────────────────────');

  let contactsCreated = 0;
  let contactsExisting = 0;
  const contactIdMap: Record<string, string> = {};

  for (const contactData of CONTACTS) {
    const existing = await prisma.contact.findFirst({
      where: {
        tenantId: tenant.id,
        email: contactData.email,
      },
    });

    if (existing) {
      contactsExisting++;
      contactIdMap[contactData.email] = existing.id;
    } else {
      const contact = await prisma.contact.create({
        data: {
          tenantId: tenant.id,
          ownerId: tylerUser.id, // Default owner
          firstName: contactData.firstName,
          lastName: contactData.lastName,
          email: contactData.email,
          phone: contactData.phone,
          company: contactData.company,
          title: contactData.title,
          primaryRole: contactData.primaryRole,
          source: contactData.source,
          notes: contactData.notes,
          lifecycleStage: contactData.lifecycleStage,
          leadScore: contactData.leadScore,
        },
      });
      contactsCreated++;
      contactIdMap[contactData.email] = contact.id;
    }
  }

  console.log(`  Created: ${contactsCreated} new contacts`);
  if (contactsExisting > 0) {
    console.log(`  Existing: ${contactsExisting} contacts already existed`);
  }

  // Contact breakdown
  const residential = CONTACTS.filter(c => c.primaryRole === 'CLIENT' && !c.company);
  const propertyMgrs = CONTACTS.filter(c => c.primaryRole === 'CLIENT' && c.company);
  const partners = CONTACTS.filter(c => c.primaryRole === 'PARTNER');
  const vendors = CONTACTS.filter(c => c.primaryRole === 'VENDOR');

  console.log('');
  console.log('  Breakdown:');
  console.log(`    Residential homeowners: ${residential.length}`);
  console.log(`    Property managers:      ${propertyMgrs.length}`);
  console.log(`    Realtor partners:       ${partners.length}`);
  console.log(`    Vendors/suppliers:      ${vendors.length}`);
  console.log('');

  // ==========================================
  // SEED DEALS
  // ==========================================
  console.log('3. DEALS (PROJECTS)');
  console.log('─────────────────────────────────────────');

  let dealsCreated = 0;
  let dealsExisting = 0;

  for (const dealData of DEALS) {
    const contactId = contactIdMap[dealData.contactEmail];
    if (!contactId) {
      console.error(`  WARNING: Contact not found for ${dealData.contactEmail}`);
      continue;
    }

    const assignedUser = dealData.assignedToEmail === 'tyler@summithomeservices.com'
      ? tylerUser
      : jessicaUser;

    // Check if deal already exists
    const existing = await prisma.deal.findFirst({
      where: {
        tenantId: tenant.id,
        dealName: dealData.dealName,
      },
    });

    if (existing) {
      dealsExisting++;
    } else {
      const createdAt = new Date(Date.now() - dealData.daysAgo * 24 * 60 * 60 * 1000);

      await prisma.deal.create({
        data: {
          tenantId: tenant.id,
          dealName: dealData.dealName,
          contactId: contactId,
          ownerId: assignedUser.id,
          assignedToId: assignedUser.id,
          dealValue: dealData.dealValue,
          stage: dealData.stage,
          priority: dealData.priority,
          probability: dealData.probability,
          status: dealData.status,
          notes: dealData.notes,
          nextSteps: dealData.nextSteps,
          expectedCloseDate: dealData.expectedCloseDate,
          actualCloseDate: dealData.actualCloseDate,
          createdAt: createdAt,
          updatedAt: createdAt,
        },
      });
      dealsCreated++;
    }
  }

  console.log(`  Created: ${dealsCreated} new deals`);
  if (dealsExisting > 0) {
    console.log(`  Existing: ${dealsExisting} deals already existed`);
  }

  // Deal breakdown by stage
  const stages = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'];
  console.log('');
  console.log('  Pipeline breakdown:');
  for (const stage of stages) {
    const count = DEALS.filter(d => d.stage === stage).length;
    const value = DEALS.filter(d => d.stage === stage).reduce((sum, d) => sum + d.dealValue, 0);
    console.log(`    ${stage.padEnd(12)}: ${count} deals  ($${value.toLocaleString()})`);
  }
  console.log('');

  // ==========================================
  // SUMMARY
  // ==========================================
  const totalPipelineValue = DEALS.filter(d => d.status === 'open').reduce((sum, d) => sum + d.dealValue, 0);
  const closedValue = DEALS.filter(d => d.status === 'closed').reduce((sum, d) => sum + d.dealValue, 0);

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  PHASE 2 COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('Summit Home Services demo data ready!');
  console.log('');
  console.log('Contacts: 25 total');
  console.log('  - 15 Residential homeowners (past customers + leads)');
  console.log('  - 5 Property managers (commercial accounts)');
  console.log('  - 3 Realtors (referral partners)');
  console.log('  - 2 Vendors/suppliers');
  console.log('');
  console.log('Deals: 10 total');
  console.log(`  - Open pipeline value: $${totalPipelineValue.toLocaleString()}`);
  console.log(`  - Closed won value:    $${closedValue.toLocaleString()}`);
  console.log('');
  console.log('Lead Sources: Website, Referral, Google, Yelp, Repeat Customer, Networking, Vendor');
  console.log('');
  console.log('Assigned to:');
  console.log('  - Tyler Brooks (sales): 6 deals');
  console.log('  - Jessica Reyes (manager): 4 deals');
  console.log('');
}

main()
  .catch((e) => {
    console.error('Error seeding Phase 2 data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
