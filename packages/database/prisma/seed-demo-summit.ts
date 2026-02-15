import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Default pipeline stages (same as auth.service.ts)
const DEFAULT_PIPELINE_STAGES = [
  { name: 'Lead', order: 1, probability: 10, color: '#6C757D' },
  { name: 'Qualified', order: 2, probability: 25, color: '#17A2B8' },
  { name: 'Proposal', order: 3, probability: 50, color: '#007BFF' },
  { name: 'Negotiation', order: 4, probability: 75, color: '#6F42C1' },
  { name: 'Closed Won', order: 5, probability: 100, color: '#28A745' },
  { name: 'Closed Lost', order: 6, probability: 0, color: '#DC3545' },
];

// Demo password for all Summit users
const DEMO_PASSWORD = 'SummitDemo2026!';

// Summit Home Services users
const SUMMIT_USERS = [
  {
    email: 'mike@summithomeservices.com',
    firstName: 'Mike',
    lastName: 'Sullivan',
    role: 'admin',
    isSuperAdmin: false,
  },
  {
    email: 'jessica@summithomeservices.com',
    firstName: 'Jessica',
    lastName: 'Reyes',
    role: 'manager',
    isSuperAdmin: false,
  },
  {
    email: 'tyler@summithomeservices.com',
    firstName: 'Tyler',
    lastName: 'Brooks',
    role: 'sales',
    isSuperAdmin: false,
  },
  {
    email: 'amanda@summithomeservices.com',
    firstName: 'Amanda',
    lastName: 'Foster',
    role: 'marketing',
    isSuperAdmin: false,
  },
];

// Summit Home Services products
const SUMMIT_PRODUCTS: Array<{
  name: string;
  category: string;
  basePrice: number;
  description: string;
}> = [
  // HVAC (10 products)
  { name: 'AC Tune-Up', category: 'HVAC', basePrice: 149, description: 'Comprehensive AC inspection and maintenance service' },
  { name: 'Furnace Tune-Up', category: 'HVAC', basePrice: 129, description: 'Complete furnace inspection and maintenance service' },
  { name: 'AC Repair', category: 'HVAC', basePrice: 350, description: 'Standard AC repair service (parts additional)' },
  { name: 'Furnace Repair', category: 'HVAC', basePrice: 325, description: 'Standard furnace repair service (parts additional)' },
  { name: 'AC Replacement Entry', category: 'HVAC', basePrice: 6500, description: 'Entry-level AC unit replacement with installation' },
  { name: 'AC Replacement Premium', category: 'HVAC', basePrice: 9500, description: 'Premium high-efficiency AC unit replacement with installation' },
  { name: 'Furnace Replacement Entry', category: 'HVAC', basePrice: 4500, description: 'Entry-level furnace replacement with installation' },
  { name: 'Furnace Replacement Premium', category: 'HVAC', basePrice: 7200, description: 'Premium high-efficiency furnace replacement with installation' },
  { name: 'Ductwork Repair', category: 'HVAC', basePrice: 800, description: 'Ductwork inspection, sealing, and repair service' },
  { name: 'Smart Thermostat Install', category: 'HVAC', basePrice: 350, description: 'Smart thermostat installation and setup' },

  // Plumbing (6 products)
  { name: 'Drain Cleaning', category: 'Plumbing', basePrice: 175, description: 'Professional drain cleaning service' },
  { name: 'Water Heater Flush', category: 'Plumbing', basePrice: 150, description: 'Water heater maintenance and flush service' },
  { name: 'Water Heater Replacement', category: 'Plumbing', basePrice: 2650, description: 'Standard water heater replacement with installation' },
  { name: 'Fixture Replacement', category: 'Plumbing', basePrice: 425, description: 'Faucet or fixture replacement service' },
  { name: 'Leak Repair', category: 'Plumbing', basePrice: 350, description: 'Standard plumbing leak repair service' },
  { name: 'Whole House Repipe', category: 'Plumbing', basePrice: 11500, description: 'Complete home repiping service' },

  // Electrical (4 products)
  { name: 'Panel Inspection', category: 'Electrical', basePrice: 125, description: 'Electrical panel safety inspection' },
  { name: 'Outlet/Switch Repair', category: 'Electrical', basePrice: 225, description: 'Outlet or switch repair/replacement service' },
  { name: 'Panel Upgrade', category: 'Electrical', basePrice: 3500, description: 'Electrical panel upgrade to 200 amp service' },
  { name: 'Whole House Surge Protection', category: 'Electrical', basePrice: 450, description: 'Whole house surge protector installation' },
];

async function seedPipelineStages(tenantId: string): Promise<void> {
  const existingStages = await prisma.pipelineStage.findMany({
    where: { tenantId }
  });

  if (existingStages.length === 0) {
    console.log('  Creating default pipeline stages...');
    await prisma.pipelineStage.createMany({
      data: DEFAULT_PIPELINE_STAGES.map(stage => ({
        tenantId,
        name: stage.name,
        order: stage.order,
        probability: stage.probability,
        color: stage.color,
      }))
    });
    console.log(`  Created ${DEFAULT_PIPELINE_STAGES.length} pipeline stages`);
  } else {
    console.log(`  Pipeline stages already exist (${existingStages.length} stages)`);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  SUMMIT HOME SERVICES - Demo Tenant Seed');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('Starting Summit Home Services demo seed...');
  console.log('');

  // ==========================================
  // TENANT
  // ==========================================
  console.log('1. TENANT');
  console.log('─────────────────────────────────────────');

  let tenant = await prisma.tenant.findUnique({
    where: { subdomain: 'summit-home-services' },
  });

  if (!tenant) {
    console.log('  Creating Summit Home Services tenant...');
    tenant = await prisma.tenant.create({
      data: {
        companyName: 'Summit Home Services',
        subdomain: 'summit-home-services',
        tenantType: 'demo',
        industry: 'Home Services',
        city: 'Denver',
        state: 'CO',
        phone: '(303) 555-HVAC',
        email: 'info@summithomeservices.com',
        website: 'https://summithomeservices.com',
      },
    });
    console.log(`  Created tenant: ${tenant.companyName}`);
  } else {
    console.log(`  Tenant already exists: ${tenant.companyName}`);
  }
  console.log(`  Tenant ID: ${tenant.id}`);
  console.log('');

  // ==========================================
  // PIPELINE STAGES
  // ==========================================
  console.log('2. PIPELINE STAGES');
  console.log('─────────────────────────────────────────');
  await seedPipelineStages(tenant.id);
  console.log('');

  // ==========================================
  // USERS
  // ==========================================
  console.log('3. USERS');
  console.log('─────────────────────────────────────────');

  // Hash password once (same for all demo users)
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
  console.log('  Password for all users: SummitDemo2026!');
  console.log('');

  for (const userData of SUMMIT_USERS) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!existingUser) {
      const user = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          password: hashedPassword,
          role: userData.role,
          isSuperAdmin: userData.isSuperAdmin,
        },
      });
      console.log(`  Created user: ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
    } else {
      // Update existing user to ensure correct tenant and password
      await prisma.user.update({
        where: { email: userData.email },
        data: {
          tenantId: tenant.id,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
        },
      });
      console.log(`  Updated user: ${userData.firstName} ${userData.lastName} (${userData.email}) - ${userData.role}`);
    }
  }
  console.log('');

  // ==========================================
  // PRODUCTS
  // ==========================================
  console.log('4. PRODUCTS');
  console.log('─────────────────────────────────────────');

  let createdCount = 0;
  let existingCount = 0;

  for (const productData of SUMMIT_PRODUCTS) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        tenantId: tenant.id,
        name: productData.name,
      },
    });

    if (!existingProduct) {
      await prisma.product.create({
        data: {
          tenantId: tenant.id,
          name: productData.name,
          description: productData.description,
          category: productData.category,
          type: 'SERVICE',
          status: 'ACTIVE',
          pricingModel: 'SIMPLE',
          basePrice: new Prisma.Decimal(productData.basePrice),
          unit: 'service',
        },
      });
      createdCount++;
    } else {
      existingCount++;
    }
  }

  console.log(`  Created ${createdCount} new products`);
  if (existingCount > 0) {
    console.log(`  ${existingCount} products already existed`);
  }

  // Show product summary by category
  const hvacProducts = SUMMIT_PRODUCTS.filter(p => p.category === 'HVAC');
  const plumbingProducts = SUMMIT_PRODUCTS.filter(p => p.category === 'Plumbing');
  const electricalProducts = SUMMIT_PRODUCTS.filter(p => p.category === 'Electrical');

  console.log('');
  console.log('  Product breakdown:');
  console.log(`    HVAC:       ${hvacProducts.length} products ($${Math.min(...hvacProducts.map(p => p.basePrice))} - $${Math.max(...hvacProducts.map(p => p.basePrice))})`);
  console.log(`    Plumbing:   ${plumbingProducts.length} products ($${Math.min(...plumbingProducts.map(p => p.basePrice))} - $${Math.max(...plumbingProducts.map(p => p.basePrice))})`);
  console.log(`    Electrical: ${electricalProducts.length} products ($${Math.min(...electricalProducts.map(p => p.basePrice))} - $${Math.max(...electricalProducts.map(p => p.basePrice))})`);
  console.log('');

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  SEED COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('Summit Home Services demo tenant is ready!');
  console.log('');
  console.log('Tenant Details:');
  console.log(`  Company:    ${tenant.companyName}`);
  console.log(`  Subdomain:  ${tenant.subdomain}`);
  console.log(`  Tenant ID:  ${tenant.id}`);
  console.log(`  Location:   Denver, CO`);
  console.log(`  Industry:   Home Services (HVAC, Plumbing, Electrical)`);
  console.log('');
  console.log('Login Credentials (all users):');
  console.log('  Password: SummitDemo2026!');
  console.log('');
  console.log('  Users:');
  for (const user of SUMMIT_USERS) {
    console.log(`    ${user.firstName} ${user.lastName.padEnd(10)} | ${user.email.padEnd(35)} | ${user.role}`);
  }
  console.log('');
  console.log('Products: 20 total');
  console.log('  - HVAC: 10 services');
  console.log('  - Plumbing: 6 services');
  console.log('  - Electrical: 4 services');
  console.log('');
  console.log('This tenant will appear in the Super Admin tenant switcher.');
  console.log('');
}

main()
  .catch((e) => {
    console.error('Error seeding Summit demo data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
