import { PrismaClient, DealStage, DealPriority } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create 64 West Holdings tenant
  const tenant = await prisma.tenant.create({
    data: {
      companyName: '64 West Holdings',
      subdomain: '64west',
    },
  });
  console.log('✅ Created tenant:', tenant.companyName);

  // Create users (Jonathan & Dave)
  const hashedPassword = await bcrypt.hash('Zander2026!', 10);
  
  const jonathan = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'jonathan@64west.co',
      firstName: 'Jonathan',
      lastName: 'White',
      password: hashedPassword,
    },
  });
  console.log('✅ Created user:', jonathan.email);

  const dave = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'dave@64west.co',
      firstName: 'David',
      lastName: 'Sheets',
      password: hashedPassword,
    },
  });
  console.log('✅ Created user:', dave.email);

  // Create contacts (potential Zander customers)
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        tenantId: tenant.id,
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'mchen@abcmanufacturing.com',
        phone: '(404) 555-0101',
        company: 'ABC Manufacturing',
        title: 'Owner',
        source: 'Referral',
        notes: 'Met at Atlanta Business Expo. Interested in CRO module.',
      },
    }),
    prisma.contact.create({
      data: {
        tenantId: tenant.id,
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@smithconstruction.com',
        phone: '(770) 555-0102',
        company: 'Smith Construction',
        title: 'Operations Manager',
        source: 'Website',
        notes: 'Downloaded whitepaper. Struggling with 10+ software tools.',
      },
    }),
    prisma.contact.create({
      data: {
        tenantId: tenant.id,
        firstName: 'Robert',
        lastName: 'Williams',
        email: 'rwilliams@metrobuilders.com',
        phone: '(678) 555-0103',
        company: 'Metro Builders LLC',
        title: 'CEO',
        source: '64W Finance',
        notes: 'Existing finance client. Great candidate for Zander upsell.',
      },
    }),
    prisma.contact.create({
      data: {
        tenantId: tenant.id,
        firstName: 'Jennifer',
        lastName: 'Martinez',
        email: 'jmartinez@precisionmetal.com',
        phone: '(404) 555-0104',
        company: 'Precision Metal Works',
        title: 'President',
        source: 'LinkedIn',
        notes: 'Connected via LinkedIn. 25 employees, perfect ICP.',
      },
    }),
    prisma.contact.create({
      data: {
        tenantId: tenant.id,
        firstName: 'David',
        lastName: 'Thompson',
        email: 'dthompson@thompsonauto.com',
        phone: '(770) 555-0105',
        company: 'Thompson Auto Group',
        title: 'General Manager',
        source: 'Referral - Dave',
        notes: 'Dave\'s contact from consulting days. Multi-location operation.',
      },
    }),
  ]);
  console.log('✅ Created', contacts.length, 'contacts');

  // Create deals (Zander pipeline)
  const deals = await Promise.all([
    prisma.deal.create({
      data: {
        tenantId: tenant.id,
        dealName: 'Zander CRO - ABC Manufacturing',
        contactId: contacts[0].id,
        dealValue: 6000,
        probability: 75,
        stage: DealStage.PROPOSAL,
        priority: DealPriority.HIGH,
        expectedCloseDate: new Date('2026-02-15'),
        notes: 'Demo completed. Very interested. Waiting on budget approval.',
        nextSteps: 'Follow up call Jan 20th',
      },
    }),
    prisma.deal.create({
      data: {
        tenantId: tenant.id,
        dealName: 'Zander CRO - Smith Construction',
        contactId: contacts[1].id,
        dealValue: 6000,
        probability: 50,
        stage: DealStage.QUALIFIED,
        priority: DealPriority.MEDIUM,
        expectedCloseDate: new Date('2026-03-01'),
        notes: 'Initial call went well. Pain points around software chaos.',
        nextSteps: 'Schedule demo for next week',
      },
    }),
    prisma.deal.create({
      data: {
        tenantId: tenant.id,
        dealName: 'Startup Package - Metro Builders',
        contactId: contacts[2].id,
        dealValue: 297,
        probability: 90,
        stage: DealStage.NEGOTIATION,
        priority: DealPriority.MEDIUM,
        expectedCloseDate: new Date('2026-01-20'),
        notes: 'Ready to purchase startup package. Upsell to full Zander later.',
        nextSteps: 'Send payment link',
      },
    }),
    prisma.deal.create({
      data: {
        tenantId: tenant.id,
        dealName: 'Zander Full Suite - Precision Metal',
        contactId: contacts[3].id,
        dealValue: 12000,
        probability: 40,
        stage: DealStage.PROSPECT,
        priority: DealPriority.HIGH,
        expectedCloseDate: new Date('2026-04-01'),
        notes: 'Interested in CRO + CFO bundle. Large opportunity.',
        nextSteps: 'Discovery call scheduled Jan 15',
      },
    }),
    prisma.deal.create({
      data: {
        tenantId: tenant.id,
        dealName: 'Zander CRO - Thompson Auto',
        contactId: contacts[4].id,
        dealValue: 18000,
        probability: 60,
        stage: DealStage.QUALIFIED,
        priority: DealPriority.CRITICAL,
        expectedCloseDate: new Date('2026-02-28'),
        notes: 'Multi-location deal. 3 locations x $6K each. Dave relationship.',
        nextSteps: 'Proposal presentation Jan 25',
      },
    }),
  ]);
  console.log('✅ Created', deals.length, 'deals');

  // Calculate pipeline value
  const totalPipeline = deals.reduce((sum, d) => sum + d.dealValue, 0);
  const weightedPipeline = deals.reduce((sum, d) => sum + (d.dealValue * d.probability / 100), 0);
  
  console.log('\n📊 Pipeline Summary:');
  console.log(`   Total Pipeline: $${totalPipeline.toLocaleString()}`);
  console.log(`   Weighted Pipeline: $${weightedPipeline.toLocaleString()}`);
  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
