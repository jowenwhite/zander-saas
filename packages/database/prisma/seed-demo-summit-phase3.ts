import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate dates in the past
function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

// Helper to generate random time during business hours
function randomBusinessTime(baseDate: Date): Date {
  const hours = 8 + Math.floor(Math.random() * 10); // 8 AM to 6 PM
  const minutes = Math.floor(Math.random() * 60);
  const d = new Date(baseDate);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

// Summit phone number
const SUMMIT_PHONE = '+13035551234';

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  SUMMIT HOME SERVICES - Phase 3: Communications & Tasks');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  // ==========================================
  // VERIFY PHASE 1 & 2 DATA
  // ==========================================
  console.log('1. VERIFYING PHASE 1 & 2 DATA');
  console.log('─────────────────────────────────────────');

  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: 'summit-home-services' },
  });

  if (!tenant) {
    console.error('ERROR: Summit Home Services tenant not found!');
    console.error('Please run Phase 1 seed first: npm run seed:demo-summit');
    process.exit(1);
  }
  console.log(`  Tenant: ${tenant.companyName}`);

  // Get users
  const users = await prisma.user.findMany({
    where: { tenantId: tenant.id },
  });

  const tyler = users.find(u => u.email === 'tyler@summithomeservices.com');
  const jessica = users.find(u => u.email === 'jessica@summithomeservices.com');
  const amanda = users.find(u => u.email === 'amanda@summithomeservices.com');
  const mike = users.find(u => u.email === 'mike@summithomeservices.com');

  if (!tyler || !jessica || !amanda || !mike) {
    console.error('ERROR: Required users not found!');
    process.exit(1);
  }
  console.log(`  Users: ${users.length} found`);

  // Get contacts with deals
  const contacts = await prisma.contact.findMany({
    where: { tenantId: tenant.id },
    include: { deals: true },
  });

  if (contacts.length === 0) {
    console.error('ERROR: No contacts found!');
    console.error('Please run Phase 2 seed first: npm run seed:demo-summit-phase2');
    process.exit(1);
  }
  console.log(`  Contacts: ${contacts.length} found`);

  // Get deals
  const deals = await prisma.deal.findMany({
    where: { tenantId: tenant.id },
  });
  console.log(`  Deals: ${deals.length} found`);
  console.log('');

  // Build lookup maps
  const contactsByEmail = new Map(contacts.map(c => [c.email, c]));
  const dealsByName = new Map(deals.map(d => [d.dealName, d]));

  // ==========================================
  // EMAIL MESSAGES (25)
  // ==========================================
  console.log('2. EMAIL MESSAGES');
  console.log('─────────────────────────────────────────');

  interface EmailData {
    contactEmail: string;
    direction: 'inbound' | 'outbound';
    subject: string;
    body: string;
    userId: string;
    daysAgo: number;
    status: string;
  }

  const emails: EmailData[] = [
    // ─── INBOUND INQUIRIES ───
    {
      contactEmail: 'amanda.rod@gmail.com',
      direction: 'inbound',
      subject: 'AC Not Cooling - Need Help ASAP',
      body: `Hi,

Our AC stopped working yesterday and it's getting really hot in the house. We live in Aurora and need someone to come out as soon as possible.

The unit is running but blowing warm air. It's a Carrier unit, about 8 years old.

Can you send someone today or tomorrow?

Thanks,
Amanda Rodriguez
720-555-6789`,
      userId: tyler.id,
      daysAgo: 2,
      status: 'received',
    },
    {
      contactEmail: 'jpeterson.denver@gmail.com',
      direction: 'inbound',
      subject: 'Furnace Replacement Quote Request',
      body: `Hello Summit Home Services,

I found you on Yelp and saw great reviews. Our furnace is 18 years old and I think it's time to replace it before winter hits.

Can you come out and give us a quote? We're in the Washington Park area.

What brands do you recommend? We're looking for something energy efficient.

James Peterson`,
      userId: tyler.id,
      daysAgo: 5,
      status: 'received',
    },
    {
      contactEmail: 'bmitchell@denverpmgroup.com',
      direction: 'inbound',
      subject: 'RE: Multi-Property HVAC Contract Inquiry',
      body: `Tyler,

Thanks for the tour yesterday. I was impressed with how thorough your team was.

I've discussed with my partners and we'd like to move forward with a formal proposal for all 28 properties.

A few questions:
1. What's your typical response time for emergency calls?
2. Do you offer 24/7 service?
3. Can we get a discount for annual contracts?

Looking forward to the proposal.

Brian Mitchell
Denver PM Group`,
      userId: jessica.id,
      daysAgo: 10,
      status: 'received',
    },
    {
      contactEmail: 'rfoster@mountainviewproperties.com',
      direction: 'inbound',
      subject: 'URGENT: Multiple Units Down',
      body: `Jessica,

We have an emergency situation. 4 of our units in the Highlands complex have HVAC failures - tenants are complaining.

Units 104, 112, 118, and 122.

Can you get someone out there today? This is priority #1.

Rachel Foster
Mountain View Properties
303-555-6677`,
      userId: jessica.id,
      daysAgo: 11,
      status: 'received',
    },
    {
      contactEmail: 'maria.g.garcia@gmail.com',
      direction: 'inbound',
      subject: 'Plumbing Quote Follow-up',
      body: `Hi Tyler,

I received the quote for the bathroom fixtures. I'm comparing a few options but your price seems fair.

Quick question - does the quote include removing the old fixtures and hauling them away?

Also, how long would the work take? I work from home so I need to plan around it.

Maria`,
      userId: tyler.id,
      daysAgo: 16,
      status: 'received',
    },

    // ─── OUTBOUND RESPONSES ───
    {
      contactEmail: 'amanda.rod@gmail.com',
      direction: 'outbound',
      subject: 'RE: AC Not Cooling - Need Help ASAP',
      body: `Hi Amanda,

Thank you for reaching out to Summit Home Services! I'm sorry to hear about your AC troubles, especially with this heat.

I have a technician available tomorrow morning between 9-11 AM. Does that work for you?

Based on your description (running but blowing warm air on an 8-year-old Carrier), it could be a refrigerant issue or a compressor problem. Our diagnostic fee is $89, which gets applied to any repair we do.

Please confirm the appointment and your address, and we'll get you cooling again soon!

Best,
Tyler Brooks
Summit Home Services
303-555-HVAC`,
      userId: tyler.id,
      daysAgo: 2,
      status: 'delivered',
    },
    {
      contactEmail: 'jpeterson.denver@gmail.com',
      direction: 'outbound',
      subject: 'RE: Furnace Replacement Quote Request',
      body: `Hi James,

Thanks for considering Summit Home Services for your furnace replacement!

I'd be happy to come out and assess your current system. For an 18-year-old furnace, replacement is definitely the smart choice - you'll see significant energy savings with a modern unit.

We carry Carrier and Lennox primarily. For high-efficiency, I'd recommend looking at the Carrier Infinity series (up to 98.5% AFUE) or the Lennox SL280V.

I have availability:
- Tuesday 2-4 PM
- Thursday 10 AM - 12 PM

Let me know what works best!

Tyler Brooks
Summit Home Services`,
      userId: tyler.id,
      daysAgo: 4,
      status: 'opened',
    },
    {
      contactEmail: 'rfoster@mountainviewproperties.com',
      direction: 'outbound',
      subject: 'RE: URGENT: Multiple Units Down',
      body: `Rachel,

Got it - dispatching two technicians now. They'll be at the Highlands complex within the hour.

I'll personally oversee this to make sure all four units are addressed today. My cell is 303-555-0101 if you need me.

Units 104 and 112 first, then 118 and 122.

Will send updates as we complete each unit.

Jessica Reyes
Summit Home Services`,
      userId: jessica.id,
      daysAgo: 11,
      status: 'delivered',
    },
    {
      contactEmail: 'bmitchell@denverpmgroup.com',
      direction: 'outbound',
      subject: 'Denver PM Group - Proposal',
      body: `Brian,

Great speaking with you! Attached is our proposal for the 28-property maintenance contract.

Highlights:
- Annual maintenance: $175/unit (vs $249 retail)
- Emergency response: 4-hour guaranteed (vs 24-hour standard)
- 24/7 emergency line: Yes, included
- Volume discount: 15% on all repairs

Total annual value: $12,600 (saves $2,500+ vs individual pricing)

Happy to discuss any questions. Let me know when you'd like to review together.

Best,
Jessica Reyes
Operations Manager
Summit Home Services`,
      userId: jessica.id,
      daysAgo: 8,
      status: 'opened',
    },
    {
      contactEmail: 'maria.g.garcia@gmail.com',
      direction: 'outbound',
      subject: 'RE: Plumbing Quote Follow-up',
      body: `Hi Maria,

Great questions!

Yes, the quote includes:
✓ Removal and disposal of old fixtures
✓ Installation of new fixtures
✓ Testing and cleanup

Timeline: About 4-5 hours for all 4 fixtures. We'd aim to start at 8 AM and be done by early afternoon.

If you'd like to proceed, I can schedule you for next Tuesday or Wednesday. Just let me know!

Tyler Brooks
Summit Home Services`,
      userId: tyler.id,
      daysAgo: 15,
      status: 'delivered',
    },

    // ─── MORE EMAIL THREADS ───
    {
      contactEmail: 'robert.martinez@gmail.com',
      direction: 'outbound',
      subject: 'Your AC Replacement is Scheduled!',
      body: `Hi Robert,

Great news - your new Carrier 24ACC636A003 is in stock and ready for installation!

Installation Details:
- Date: Next Tuesday
- Time: 8:00 AM - 12:00 PM (4 hour job)
- Crew: Mike and Carlos

What to expect:
1. We'll remove and dispose of your old unit
2. Install the new system
3. Run full diagnostics
4. Walk you through the new thermostat

Payment: The remaining balance ($3,900) is due upon completion. We accept check, card, or financing.

See you Tuesday!

Jessica Reyes
Summit Home Services`,
      userId: jessica.id,
      daysAgo: 36,
      status: 'opened',
    },
    {
      contactEmail: 'robert.martinez@gmail.com',
      direction: 'inbound',
      subject: 'RE: Your AC Replacement is Scheduled!',
      body: `Perfect, we'll be ready. Can you text me when the crew is on their way?

Also, should I do anything to prepare? Move furniture away from the unit or anything?

Thanks!
Robert`,
      userId: jessica.id,
      daysAgo: 35,
      status: 'received',
    },
    {
      contactEmail: 'sarah.t.thompson@yahoo.com',
      direction: 'outbound',
      subject: 'Time for Your Annual AC Tune-Up!',
      body: `Hi Sarah,

Spring is here, which means it's time for your annual AC tune-up!

As one of our valued maintenance plan customers, you're due for your complimentary spring inspection.

Available appointments:
- Next Monday 9-11 AM
- Next Wednesday 1-3 PM
- Following Monday 10 AM - 12 PM

Reply to this email or call us at 303-555-HVAC to schedule.

See you soon!

Amanda Foster
Summit Home Services`,
      userId: amanda.id,
      daysAgo: 50,
      status: 'delivered',
    },
    {
      contactEmail: 'sarah.t.thompson@yahoo.com',
      direction: 'inbound',
      subject: 'RE: Time for Your Annual AC Tune-Up!',
      body: `Wednesday 1-3 PM works great. Thanks for the reminder!

Sarah`,
      userId: amanda.id,
      daysAgo: 48,
      status: 'received',
    },
    {
      contactEmail: 'dchen.denver@outlook.com',
      direction: 'outbound',
      subject: 'How is your new water heater working?',
      body: `Hi David,

It's been a month since we installed your new Rheem water heater. I wanted to check in and make sure everything is working well.

A few things to keep in mind:
- The warranty card should be registered online (I've attached instructions)
- The anode rod should be checked annually
- We recommend a flush every 6 months for optimal performance

If you have any questions or notice anything unusual, don't hesitate to reach out!

Also, if you've been happy with our service, we'd really appreciate a Google review. It helps other Denver homeowners find us.

Thank you for choosing Summit Home Services!

Tyler Brooks`,
      userId: tyler.id,
      daysAgo: 28,
      status: 'delivered',
    },
    {
      contactEmail: 'dchen.denver@outlook.com',
      direction: 'inbound',
      subject: 'RE: How is your new water heater working?',
      body: `Tyler,

The new water heater is working great! Hot water in seconds now, and I've already noticed the energy bill is lower.

I left you guys a 5-star review on Google - you earned it!

By the way, we're planning a kitchen remodel in the fall. Would you be able to relocate a gas line for a new range location?

David`,
      userId: tyler.id,
      daysAgo: 26,
      status: 'received',
    },
    {
      contactEmail: 'lisa.nguyen.co@yahoo.com',
      direction: 'outbound',
      subject: 'Electrical Panel Upgrade - Quote Attached',
      body: `Hi Lisa,

Thank you for having me out to assess your electrical panel. As discussed, your 100-amp panel is undersized for a home your age (1962) with modern appliances.

Attached is my quote for upgrading to a 200-amp service.

The work includes:
- New 200-amp main panel
- Updated meter base (if needed per Xcel requirements)
- All necessary permits and inspections
- 2-year warranty on labor

Timeline: 1 day for the main work, plus a follow-up inspection.

Let me know if you have any questions. I'm happy to walk through the quote over the phone if helpful.

Best,
Jessica Reyes
Summit Home Services`,
      userId: jessica.id,
      daysAgo: 22,
      status: 'opened',
    },
    {
      contactEmail: 'kevjackson@outlook.com',
      direction: 'outbound',
      subject: 'Your HVAC Assessment Results',
      body: `Hi Kevin,

Congratulations on your new home! I completed the full HVAC assessment yesterday and wanted to share my findings.

Good News:
- Your furnace (2019 Lennox) is in excellent condition
- AC compressor is functioning well
- Thermostat is modern and efficient

Recommendations:
1. Ductwork sealing - Found several leaks in the basement ($450)
2. AC tune-up - Due for maintenance ($149)
3. Air filter upgrade - Your system can handle HEPA ($35)

Total recommended: $634 (optional but will improve efficiency 10-15%)

These aren't urgent, but doing them now will save you money over the winter.

Let me know what you'd like to proceed with!

Tyler Brooks`,
      userId: tyler.id,
      daysAgo: 7,
      status: 'delivered',
    },

    // ─── MARKETING/NURTURE EMAILS ───
    {
      contactEmail: 'tanderson.co@gmail.com',
      direction: 'outbound',
      subject: 'Still thinking about that AC upgrade?',
      body: `Hi Thomas,

I wanted to follow up on our conversation from a few months ago about replacing your AC.

I know you mentioned budget was a concern. Good news - we now offer 0% financing for 18 months on qualifying systems.

If you're still interested, I'd be happy to update the quote and go over the financing options.

No pressure either way - just wanted to make sure you knew about the new program.

Best,
Tyler Brooks
Summit Home Services`,
      userId: tyler.id,
      daysAgo: 60,
      status: 'delivered',
    },
    {
      contactEmail: 'nancy.taylor.co@outlook.com',
      direction: 'outbound',
      subject: 'Your HVAC Maintenance Checklist + Spring Offer',
      body: `Hi Nancy,

Thanks for downloading our seasonal HVAC maintenance checklist!

Did you know that regular maintenance can extend your system's life by 5+ years and reduce energy bills by 15%?

As a thank you for signing up, here's an exclusive offer:

🌸 SPRING SPECIAL 🌸
$99 AC Tune-Up (regularly $149)
Valid through end of month

Schedule online at summithomeservices.com or call 303-555-HVAC.

To your comfort,
Amanda Foster
Summit Home Services`,
      userId: amanda.id,
      daysAgo: 75,
      status: 'delivered',
    },
    {
      contactEmail: 'jessica@palmerrealestate.com',
      direction: 'outbound',
      subject: 'Partner Referral Program Update',
      body: `Hi Jessica,

Quick update on our referral partnership!

Your referrals this quarter:
- 3 HVAC inspections
- 1 furnace replacement
- Your commission: $425

Great work! The Hendersons specifically mentioned you referred them - they were thrilled with our service.

Reminder: Our pre-inspection HVAC report package is still $99 for your clients (normally $125). It includes a written report with photos - perfect for negotiations.

Let me know if you have any listings coming up that need inspections!

Amanda Foster
Summit Home Services`,
      userId: amanda.id,
      daysAgo: 40,
      status: 'opened',
    },

    // ─── A FEW MORE VARIETY ───
    {
      contactEmail: 'jen.williams.co@gmail.com',
      direction: 'outbound',
      subject: 'Invoice #2847 - Drain Cleaning Service',
      body: `Hi Jennifer,

Attached is your invoice for the drain cleaning service completed today.

Service: Main Line Drain Cleaning
Amount: $175.00
Status: PAID - Thank you!

Our tech noted that the blockage was caused by tree roots. You may want to consider annual maintenance to prevent future issues.

Thank you for choosing Summit Home Services!

Tyler Brooks`,
      userId: tyler.id,
      daysAgo: 90,
      status: 'delivered',
    },
    {
      contactEmail: 'sclark@redrockrealty.com',
      direction: 'inbound',
      subject: 'HOA Maintenance Request',
      body: `Hello,

I manage maintenance for 3 HOA communities in the west Denver area. We're looking for a reliable HVAC contractor for common area maintenance and homeowner referrals.

Properties:
- Vista Ridge (64 units)
- Maple Creek (48 units)
- Sunset Gardens (32 units)

Can we schedule a call to discuss partnership options?

Stephanie Clark
Red Rock Realty Management
303-555-8899`,
      userId: jessica.id,
      daysAgo: 18,
      status: 'received',
    },
    {
      contactEmail: 'mark.reynolds@apexapartments.com',
      direction: 'outbound',
      subject: 'Q1 Maintenance Schedule - Apex Properties',
      body: `Mark,

Here's the quarterly maintenance schedule for your three properties:

Apex Tower (2/5-2/7):
- Units 101-140 (40 units)
- Boiler room inspection

Apex Gardens (2/12-2/13):
- Units 1-24 (24 units)
- Replace filters, check thermostats

Apex Commons (2/19):
- Units 1-16 (16 units)
- HVAC inspections

Total: 80 units @ $45/unit = $3,600

Please confirm these dates work for your staff. We'll coordinate key access as usual.

Jessica Reyes
Summit Home Services`,
      userId: jessica.id,
      daysAgo: 55,
      status: 'opened',
    },
    {
      contactEmail: 'mobrien77@comcast.net',
      direction: 'outbound',
      subject: 'Annual Service Agreement Renewal',
      body: `Hi Michael,

It's that time of year again! Your annual HVAC service agreement is up for renewal.

Current plan: Premium Care ($299/year)
Includes:
- 2 tune-ups (spring AC, fall furnace)
- Priority scheduling
- 15% discount on repairs
- No overtime charges

Renew by the 15th and lock in the same rate. Otherwise, the new rate is $329/year.

Reply RENEW to this email or call us at 303-555-HVAC.

Thank you for being a loyal customer for 6 years!

Amanda Foster
Summit Home Services`,
      userId: amanda.id,
      daysAgo: 30,
      status: 'delivered',
    },
  ];

  let emailsCreated = 0;
  let emailsExisting = 0;

  for (const emailData of emails) {
    const contact = contactsByEmail.get(emailData.contactEmail);
    if (!contact) {
      console.log(`  WARNING: Contact not found: ${emailData.contactEmail}`);
      continue;
    }

    // Check if similar email exists
    const existing = await prisma.emailMessage.findFirst({
      where: {
        tenantId: tenant.id,
        contactId: contact.id,
        subject: emailData.subject,
      },
    });

    if (existing) {
      emailsExisting++;
      continue;
    }

    const sentAt = randomBusinessTime(daysAgo(emailData.daysAgo));

    await prisma.emailMessage.create({
      data: {
        tenantId: tenant.id,
        contactId: contact.id,
        dealId: contact.deals[0]?.id || null,
        userId: emailData.userId,
        direction: emailData.direction,
        fromAddress: emailData.direction === 'outbound'
          ? 'service@summithomeservices.com'
          : emailData.contactEmail,
        toAddress: emailData.direction === 'outbound'
          ? emailData.contactEmail
          : 'service@summithomeservices.com',
        subject: emailData.subject,
        body: emailData.body,
        status: emailData.status,
        sentAt: sentAt,
        isRead: emailData.direction === 'inbound',
        createdAt: sentAt,
      },
    });
    emailsCreated++;
  }

  console.log(`  Created: ${emailsCreated} emails`);
  if (emailsExisting > 0) {
    console.log(`  Existing: ${emailsExisting} already existed`);
  }
  console.log(`  Inbound: ${emails.filter(e => e.direction === 'inbound').length}`);
  console.log(`  Outbound: ${emails.filter(e => e.direction === 'outbound').length}`);
  console.log('');

  // ==========================================
  // CALL LOGS (15)
  // ==========================================
  console.log('3. CALL LOGS');
  console.log('─────────────────────────────────────────');

  interface CallData {
    contactEmail: string;
    direction: 'inbound' | 'outbound';
    outcome: string;
    duration: number; // seconds
    notes: string;
    daysAgo: number;
    userId: string;
  }

  const calls: CallData[] = [
    {
      contactEmail: 'amanda.rod@gmail.com',
      direction: 'outbound',
      outcome: 'completed',
      duration: 180,
      notes: 'Scheduled diagnostic for tomorrow 9-11 AM. Customer mentioned unit is 8 years old Carrier. Blowing warm air.',
      daysAgo: 2,
      userId: tyler.id,
    },
    {
      contactEmail: 'jpeterson.denver@gmail.com',
      direction: 'outbound',
      outcome: 'completed',
      duration: 420,
      notes: 'Good conversation. He\'s price shopping but seemed impressed with our reviews. Scheduled estimate for Thursday. Interested in high-efficiency options.',
      daysAgo: 4,
      userId: tyler.id,
    },
    {
      contactEmail: 'bmitchell@denverpmgroup.com',
      direction: 'inbound',
      outcome: 'completed',
      duration: 1200,
      notes: 'Initial call from Brian. 28 properties need reliable HVAC contractor. Current vendor is inconsistent. Scheduled property tour for next week.',
      daysAgo: 15,
      userId: jessica.id,
    },
    {
      contactEmail: 'rfoster@mountainviewproperties.com',
      direction: 'inbound',
      outcome: 'completed',
      duration: 300,
      notes: 'EMERGENCY - 4 units down at Highlands. Dispatched Mike and Carlos immediately. Rachel is a great customer, prioritize her.',
      daysAgo: 11,
      userId: jessica.id,
    },
    {
      contactEmail: 'maria.g.garcia@gmail.com',
      direction: 'outbound',
      outcome: 'completed',
      duration: 240,
      notes: 'Follow-up on plumbing quote. She\'s comparing with one other contractor. Will decide by end of week.',
      daysAgo: 14,
      userId: tyler.id,
    },
    {
      contactEmail: 'robert.martinez@gmail.com',
      direction: 'outbound',
      outcome: 'completed',
      duration: 600,
      notes: 'Reviewed AC options. Decided on Carrier 24ACC636A003 (premium efficiency). Signed contract, collected $3,900 deposit. Install next Tuesday.',
      daysAgo: 40,
      userId: jessica.id,
    },
    {
      contactEmail: 'lisa.nguyen.co@yahoo.com',
      direction: 'outbound',
      outcome: 'voicemail',
      duration: 60,
      notes: 'Left voicemail about panel upgrade quote. Asked to call back or reply to email.',
      daysAgo: 20,
      userId: jessica.id,
    },
    {
      contactEmail: 'lisa.nguyen.co@yahoo.com',
      direction: 'inbound',
      outcome: 'completed',
      duration: 480,
      notes: 'Lisa called back. Has questions about permit process and timeline. Explained everything. She\'s getting one more quote but we\'re frontrunner.',
      daysAgo: 18,
      userId: jessica.id,
    },
    {
      contactEmail: 'kevjackson@outlook.com',
      direction: 'outbound',
      outcome: 'completed',
      duration: 360,
      notes: 'Walked through assessment results. He was relieved nothing major is wrong. Wants to do duct sealing + tune-up. Scheduled for next week.',
      daysAgo: 6,
      userId: tyler.id,
    },
    {
      contactEmail: 'tanderson.co@gmail.com',
      direction: 'outbound',
      outcome: 'no_answer',
      duration: 0,
      notes: 'No answer. Sent follow-up email about financing options.',
      daysAgo: 58,
      userId: tyler.id,
    },
    {
      contactEmail: 'sclark@redrockrealty.com',
      direction: 'outbound',
      outcome: 'completed',
      duration: 900,
      notes: 'Great call with Stephanie. 144 total units across 3 HOAs. Wants partnership similar to Apex deal. Scheduling site visits for next month.',
      daysAgo: 16,
      userId: jessica.id,
    },
    {
      contactEmail: 'jessica@palmerrealestate.com',
      direction: 'inbound',
      outcome: 'completed',
      duration: 300,
      notes: 'Jessica has a client closing next week, needs pre-inspection HVAC report. Scheduled for Wednesday.',
      daysAgo: 45,
      userId: amanda.id,
    },
    {
      contactEmail: 'carlos@denverhometeam.com',
      direction: 'outbound',
      outcome: 'completed',
      duration: 420,
      notes: 'Introductory call with Carlos. Explained our realtor referral program. He\'s interested - sending partnership materials.',
      daysAgo: 50,
      userId: amanda.id,
    },
    {
      contactEmail: 'mobrien77@comcast.net',
      direction: 'outbound',
      outcome: 'completed',
      duration: 240,
      notes: 'Annual renewal call. Michael wants to continue with Premium plan. Locked in same $299 rate. Great customer for 6 years.',
      daysAgo: 28,
      userId: amanda.id,
    },
    {
      contactEmail: 'sarah.t.thompson@yahoo.com',
      direction: 'outbound',
      outcome: 'completed',
      duration: 120,
      notes: 'Confirmation call for tune-up appointment. Wednesday 1-3 PM confirmed. She mentioned neighbor might need service - asked for referral info.',
      daysAgo: 47,
      userId: amanda.id,
    },
  ];

  let callsCreated = 0;
  let callsExisting = 0;

  for (const callData of calls) {
    const contact = contactsByEmail.get(callData.contactEmail);
    if (!contact) {
      console.log(`  WARNING: Contact not found: ${callData.contactEmail}`);
      continue;
    }

    // Check if similar call exists
    const startedAt = randomBusinessTime(daysAgo(callData.daysAgo));
    const existing = await prisma.callLog.findFirst({
      where: {
        tenantId: tenant.id,
        contactId: contact.id,
        startedAt: {
          gte: new Date(startedAt.getTime() - 24 * 60 * 60 * 1000),
          lte: new Date(startedAt.getTime() + 24 * 60 * 60 * 1000),
        },
        notes: callData.notes,
      },
    });

    if (existing) {
      callsExisting++;
      continue;
    }

    const endedAt = callData.duration > 0
      ? new Date(startedAt.getTime() + callData.duration * 1000)
      : null;

    await prisma.callLog.create({
      data: {
        tenantId: tenant.id,
        contactId: contact.id,
        dealId: contact.deals[0]?.id || null,
        userId: callData.userId,
        type: 'manual_call',
        direction: callData.direction,
        fromNumber: callData.direction === 'outbound' ? SUMMIT_PHONE : contact.phone,
        toNumber: callData.direction === 'outbound' ? contact.phone : SUMMIT_PHONE,
        duration: callData.duration,
        outcome: callData.outcome,
        status: 'completed',
        notes: callData.notes,
        startedAt: startedAt,
        endedAt: endedAt,
        createdAt: startedAt,
      },
    });
    callsCreated++;
  }

  console.log(`  Created: ${callsCreated} calls`);
  if (callsExisting > 0) {
    console.log(`  Existing: ${callsExisting} already existed`);
  }
  console.log(`  Completed: ${calls.filter(c => c.outcome === 'completed').length}`);
  console.log(`  Voicemail/No answer: ${calls.filter(c => ['voicemail', 'no_answer'].includes(c.outcome)).length}`);
  console.log('');

  // ==========================================
  // SMS MESSAGES (10)
  // ==========================================
  console.log('4. SMS MESSAGES');
  console.log('─────────────────────────────────────────');

  interface SmsData {
    contactEmail: string;
    direction: 'inbound' | 'outbound';
    body: string;
    daysAgo: number;
    userId: string;
  }

  const smsMessages: SmsData[] = [
    {
      contactEmail: 'amanda.rod@gmail.com',
      direction: 'outbound',
      body: 'Hi Amanda, this is Tyler from Summit Home Services. Your technician Mike is on his way and should arrive in about 20 minutes. -Summit HVAC',
      daysAgo: 1,
      userId: tyler.id,
    },
    {
      contactEmail: 'amanda.rod@gmail.com',
      direction: 'inbound',
      body: 'Great, thank you! I\'ll be here.',
      daysAgo: 1,
      userId: tyler.id,
    },
    {
      contactEmail: 'robert.martinez@gmail.com',
      direction: 'outbound',
      body: 'Good morning Robert! Summit Home Services here. Our install crew (Mike & Carlos) are on their way for your AC installation. ETA 8:15 AM.',
      daysAgo: 33,
      userId: jessica.id,
    },
    {
      contactEmail: 'robert.martinez@gmail.com',
      direction: 'inbound',
      body: 'Perfect timing. Coffee is ready. See them soon!',
      daysAgo: 33,
      userId: jessica.id,
    },
    {
      contactEmail: 'sarah.t.thompson@yahoo.com',
      direction: 'outbound',
      body: 'Hi Sarah, reminder: Your AC tune-up is tomorrow (Wednesday) 1-3 PM. Reply YES to confirm or call 303-555-HVAC to reschedule. -Summit',
      daysAgo: 46,
      userId: amanda.id,
    },
    {
      contactEmail: 'sarah.t.thompson@yahoo.com',
      direction: 'inbound',
      body: 'YES - confirmed!',
      daysAgo: 46,
      userId: amanda.id,
    },
    {
      contactEmail: 'rfoster@mountainviewproperties.com',
      direction: 'outbound',
      body: 'Rachel - Units 104 and 112 are done. Both had failed capacitors. Moving to 118 and 122 now. Should be wrapped up by 4pm.',
      daysAgo: 11,
      userId: jessica.id,
    },
    {
      contactEmail: 'rfoster@mountainviewproperties.com',
      direction: 'inbound',
      body: 'You guys are lifesavers. Thank you!',
      daysAgo: 11,
      userId: jessica.id,
    },
    {
      contactEmail: 'kevjackson@outlook.com',
      direction: 'outbound',
      body: 'Hi Kevin, Summit Home Services here. Just confirming your duct sealing appointment for Tuesday 9am-12pm. Reply to confirm. Thanks!',
      daysAgo: 5,
      userId: tyler.id,
    },
    {
      contactEmail: 'kevjackson@outlook.com',
      direction: 'inbound',
      body: 'Confirmed. Thanks Tyler',
      daysAgo: 5,
      userId: tyler.id,
    },
  ];

  let smsCreated = 0;
  let smsExisting = 0;

  for (const smsData of smsMessages) {
    const contact = contactsByEmail.get(smsData.contactEmail);
    if (!contact || !contact.phone) {
      continue;
    }

    // Check if similar SMS exists
    const existing = await prisma.smsMessage.findFirst({
      where: {
        tenantId: tenant.id,
        contactId: contact.id,
        body: smsData.body,
      },
    });

    if (existing) {
      smsExisting++;
      continue;
    }

    const sentAt = randomBusinessTime(daysAgo(smsData.daysAgo));

    await prisma.smsMessage.create({
      data: {
        tenantId: tenant.id,
        contactId: contact.id,
        dealId: contact.deals[0]?.id || null,
        userId: smsData.userId,
        direction: smsData.direction,
        fromNumber: smsData.direction === 'outbound' ? SUMMIT_PHONE : contact.phone,
        toNumber: smsData.direction === 'outbound' ? contact.phone : SUMMIT_PHONE,
        body: smsData.body,
        status: 'delivered',
        sentAt: sentAt,
        createdAt: sentAt,
      },
    });
    smsCreated++;
  }

  console.log(`  Created: ${smsCreated} SMS messages`);
  if (smsExisting > 0) {
    console.log(`  Existing: ${smsExisting} already existed`);
  }
  console.log('');

  // ==========================================
  // ACTIVITIES/TASKS (20)
  // ==========================================
  console.log('5. ACTIVITIES & TASKS');
  console.log('─────────────────────────────────────────');

  interface ActivityData {
    type: 'task' | 'note' | 'meeting';
    subject: string;
    description: string;
    contactEmail?: string;
    dealName?: string;
    daysAgo: number;
    userId: string;
    isCompleted: boolean;
  }

  const activities: ActivityData[] = [
    // ─── COMPLETED TASKS (8) ───
    {
      type: 'task',
      subject: 'Follow up with James Peterson on furnace quote',
      description: 'COMPLETED: Called and scheduled estimate for Thursday. He\'s price shopping but interested in high-efficiency.',
      contactEmail: 'jpeterson.denver@gmail.com',
      daysAgo: 4,
      userId: tyler.id,
      isCompleted: true,
    },
    {
      type: 'task',
      subject: 'Send proposal to Denver PM Group',
      description: 'COMPLETED: Sent comprehensive proposal for 28-property contract. $12,600/year value.',
      contactEmail: 'bmitchell@denverpmgroup.com',
      daysAgo: 8,
      userId: jessica.id,
      isCompleted: true,
    },
    {
      type: 'task',
      subject: 'Order Carrier AC unit for Martinez install',
      description: 'COMPLETED: Ordered Carrier 24ACC636A003. Arriving Monday for Tuesday install.',
      contactEmail: 'robert.martinez@gmail.com',
      daysAgo: 38,
      userId: jessica.id,
      isCompleted: true,
    },
    {
      type: 'task',
      subject: 'Request Google review from David Chen',
      description: 'COMPLETED: Sent review request email. He left us a 5-star review! Great customer.',
      contactEmail: 'dchen.denver@outlook.com',
      daysAgo: 27,
      userId: tyler.id,
      isCompleted: true,
    },
    {
      type: 'task',
      subject: 'Schedule Sarah Thompson tune-up',
      description: 'COMPLETED: Booked for Wednesday 1-3pm. Sent confirmation.',
      contactEmail: 'sarah.t.thompson@yahoo.com',
      daysAgo: 48,
      userId: amanda.id,
      isCompleted: true,
    },
    {
      type: 'task',
      subject: 'Send realtor partnership materials to Carlos',
      description: 'COMPLETED: Emailed referral program details and commission structure.',
      contactEmail: 'carlos@denverhometeam.com',
      daysAgo: 49,
      userId: amanda.id,
      isCompleted: true,
    },
    {
      type: 'task',
      subject: 'Process Michael O\'Brien renewal',
      description: 'COMPLETED: Renewed Premium Care plan at $299. Customer for 6 years!',
      contactEmail: 'mobrien77@comcast.net',
      daysAgo: 28,
      userId: amanda.id,
      isCompleted: true,
    },
    {
      type: 'task',
      subject: 'Complete Mountain View emergency repairs',
      description: 'COMPLETED: All 4 units (104, 112, 118, 122) repaired. Capacitor issues. Rachel very happy.',
      contactEmail: 'rfoster@mountainviewproperties.com',
      daysAgo: 10,
      userId: jessica.id,
      isCompleted: true,
    },

    // ─── PENDING TASKS (7) ───
    {
      type: 'task',
      subject: 'Call Amanda Rodriguez to follow up on AC repair',
      description: 'Completed diagnostic yesterday. Need to call with repair options and pricing.',
      contactEmail: 'amanda.rod@gmail.com',
      daysAgo: -1, // Due tomorrow
      userId: tyler.id,
      isCompleted: false,
    },
    {
      type: 'task',
      subject: 'Follow up with Maria Garcia on plumbing decision',
      description: 'Said she would decide by end of week. Check if she\'s ready to schedule.',
      contactEmail: 'maria.g.garcia@gmail.com',
      daysAgo: 0, // Due today
      userId: tyler.id,
      isCompleted: false,
    },
    {
      type: 'task',
      subject: 'Check Lisa Nguyen panel quote status',
      description: 'She mentioned getting one more quote. Follow up to see if she\'s ready to proceed.',
      contactEmail: 'lisa.nguyen.co@yahoo.com',
      daysAgo: -2, // Due in 2 days
      userId: jessica.id,
      isCompleted: false,
    },
    {
      type: 'task',
      subject: 'Prepare contract for Denver PM Group',
      description: 'Brian approved the proposal. Need to prepare formal contract for 28-property deal.',
      contactEmail: 'bmitchell@denverpmgroup.com',
      daysAgo: -3, // Due in 3 days
      userId: jessica.id,
      isCompleted: false,
    },
    {
      type: 'task',
      subject: 'Schedule site visits with Stephanie Clark',
      description: 'Need to tour all 3 HOA properties. Coordinate with her calendar.',
      contactEmail: 'sclark@redrockrealty.com',
      daysAgo: -5, // Due in 5 days
      userId: jessica.id,
      isCompleted: false,
    },
    {
      type: 'task',
      subject: 'Send spring marketing email blast',
      description: 'Promote $99 AC tune-up special. Target: all contacts who haven\'t had service in 6+ months.',
      daysAgo: -7, // Due in 7 days
      userId: amanda.id,
      isCompleted: false,
    },
    {
      type: 'task',
      subject: 'Create partner referral tracking spreadsheet',
      description: 'Need better system to track realtor referrals and commissions.',
      daysAgo: -10, // Due in 10 days
      userId: amanda.id,
      isCompleted: false,
    },

    // ─── OVERDUE TASKS (5) ───
    {
      type: 'task',
      subject: 'Call Thomas Anderson about AC financing',
      description: 'OVERDUE: Sent email about 0% financing but no response. Try calling.',
      contactEmail: 'tanderson.co@gmail.com',
      daysAgo: 7, // 7 days overdue
      userId: tyler.id,
      isCompleted: false,
    },
    {
      type: 'task',
      subject: 'Follow up with Patricia Lewis',
      description: 'OVERDUE: She went with competitor 3 months ago. Time to re-engage.',
      contactEmail: 'pat.lewis.denver@yahoo.com',
      daysAgo: 14, // 2 weeks overdue
      userId: tyler.id,
      isCompleted: false,
    },
    {
      type: 'task',
      subject: 'Send Lauren Hughes partnership agreement',
      description: 'OVERDUE: Met at chamber event. Need to send formal referral agreement.',
      contactEmail: 'lauren.hughes@remax.com',
      daysAgo: 10, // 10 days overdue
      userId: amanda.id,
      isCompleted: false,
    },
    {
      type: 'task',
      subject: 'Update Apex quarterly maintenance schedule',
      description: 'OVERDUE: Q2 schedule needs to be sent to Mark Reynolds.',
      contactEmail: 'mark.reynolds@apexapartments.com',
      daysAgo: 5, // 5 days overdue
      userId: jessica.id,
      isCompleted: false,
    },
    {
      type: 'task',
      subject: 'Review Google/Yelp reviews and respond',
      description: 'OVERDUE: Weekly task - respond to all new reviews.',
      daysAgo: 3, // 3 days overdue
      userId: amanda.id,
      isCompleted: false,
    },
  ];

  let activitiesCreated = 0;
  let activitiesExisting = 0;

  for (const activityData of activities) {
    const contact = activityData.contactEmail
      ? contactsByEmail.get(activityData.contactEmail)
      : null;
    const deal = activityData.dealName
      ? dealsByName.get(activityData.dealName)
      : (contact?.deals[0] || null);

    // Check if similar activity exists
    const existing = await prisma.activity.findFirst({
      where: {
        tenantId: tenant.id,
        subject: activityData.subject,
      },
    });

    if (existing) {
      activitiesExisting++;
      continue;
    }

    const activityDate = daysAgo(activityData.daysAgo);

    await prisma.activity.create({
      data: {
        tenantId: tenant.id,
        type: activityData.type,
        subject: activityData.subject,
        description: activityData.description,
        date: activityDate,
        contactId: contact?.id || null,
        dealId: deal?.id || null,
        userId: activityData.userId,
        createdAt: activityData.isCompleted ? activityDate : new Date(),
      },
    });
    activitiesCreated++;
  }

  const completedTasks = activities.filter(a => a.isCompleted);
  const pendingTasks = activities.filter(a => !a.isCompleted && a.daysAgo <= 0);
  const overdueTasks = activities.filter(a => !a.isCompleted && a.daysAgo > 0);

  console.log(`  Created: ${activitiesCreated} activities/tasks`);
  if (activitiesExisting > 0) {
    console.log(`  Existing: ${activitiesExisting} already existed`);
  }
  console.log('');
  console.log('  Task Status:');
  console.log(`    Completed: ${completedTasks.length}`);
  console.log(`    Pending:   ${pendingTasks.length}`);
  console.log(`    Overdue:   ${overdueTasks.length}`);
  console.log('');

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  PHASE 3 COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('Summit Home Services communications seeded!');
  console.log('');
  console.log('Communications: 50 total');
  console.log(`  - Emails:    ${emails.length} (${emails.filter(e => e.direction === 'inbound').length} inbound, ${emails.filter(e => e.direction === 'outbound').length} outbound)`);
  console.log(`  - Calls:     ${calls.length} (${calls.filter(c => c.outcome === 'completed').length} completed, ${calls.filter(c => c.outcome !== 'completed').length} voicemail/no answer)`);
  console.log(`  - SMS:       ${smsMessages.length} (${smsMessages.filter(s => s.direction === 'inbound').length} inbound, ${smsMessages.filter(s => s.direction === 'outbound').length} outbound)`);
  console.log('');
  console.log('Tasks: 20 total');
  console.log(`  - Completed: ${completedTasks.length}`);
  console.log(`  - Pending:   ${pendingTasks.length}`);
  console.log(`  - Overdue:   ${overdueTasks.length}`);
  console.log('');
  console.log('Assigned to:');
  console.log(`  - Tyler Brooks (sales):     ${activities.filter(a => a.userId === tyler.id).length} tasks`);
  console.log(`  - Jessica Reyes (manager):  ${activities.filter(a => a.userId === jessica.id).length} tasks`);
  console.log(`  - Amanda Foster (marketing): ${activities.filter(a => a.userId === amanda.id).length} tasks`);
  console.log('');
  console.log('Date range: Past 90 days of activity');
  console.log('');
}

main()
  .catch((e) => {
    console.error('Error seeding Phase 3 data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
