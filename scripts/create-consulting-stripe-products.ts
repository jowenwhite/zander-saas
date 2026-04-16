/**
 * Create Consulting and Digital Store Products in Stripe
 *
 * Run with: cd apps/api && pnpm exec ts-node ../../scripts/create-consulting-stripe-products.ts
 *
 * This script creates all consulting packages and digital store products in Stripe.
 * It's idempotent - running it multiple times won't create duplicates (checks by name).
 */

import Stripe from 'stripe';

// Uses STRIPE_SECRET_KEY from apps/api/.env (loaded by ts-node)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Consulting packages (one-time payments)
const CONSULTING_PACKAGES = [
  {
    name: 'Comprehensive Business Analysis',
    description: 'In-depth analysis of your business operations, financials, and strategic positioning.',
    price: 50000, // $500 in cents
    hours: 0,
    type: 'BUSINESS_ANALYSIS',
  },
  {
    name: 'Compass Package',
    description: '20-hour consulting engagement for strategic direction and operational assessment.',
    price: 250000, // $2,500 in cents
    hours: 20,
    type: 'COMPASS',
  },
  {
    name: 'Foundation Package',
    description: '40-hour consulting engagement for comprehensive business foundation building.',
    price: 450000, // $4,500 in cents
    hours: 40,
    type: 'FOUNDATION',
  },
  {
    name: 'Blueprint Package',
    description: '80-hour consulting engagement for full business transformation and implementation.',
    price: 800000, // $8,000 in cents
    hours: 80,
    type: 'BLUEPRINT',
  },
  {
    name: 'Package Extension',
    description: '10 additional consulting hours for existing engagements.',
    price: 25000, // $250 in cents
    hours: 10,
    type: 'EXTENSION',
  },
];

// Digital store products (downloadable content)
const DIGITAL_PRODUCTS = [
  {
    name: 'Operations Playbook',
    description: 'SOPs, process templates, and efficiency guides to systematize your operations.',
    price: 7900, // $79 in cents
    type: 'OPERATIONS_PLAYBOOK',
  },
  {
    name: 'Startup Foundations Kit',
    description: 'Business plan template, financial projections, and launch checklist.',
    price: 9900, // $99 in cents
    type: 'STARTUP_FOUNDATIONS',
  },
  {
    name: 'Sales and Marketing Kit',
    description: 'Scripts, email templates, and funnel blueprints.',
    price: 9900, // $99 in cents
    type: 'SALES_MARKETING',
  },
  {
    name: 'Hiring and Team Building Kit',
    description: 'Job descriptions, interview guides, and onboarding checklists.',
    price: 9900, // $99 in cents
    type: 'HIRING_TEAM',
  },
  {
    name: 'Financial Clarity Kit',
    description: 'Cash flow templates, KPI dashboards, and bookkeeping basics.',
    price: 7900, // $79 in cents
    type: 'FINANCIAL_CLARITY',
  },
  {
    name: 'Industry Starter Packs',
    description: 'Industry-specific templates tailored to your business vertical.',
    price: 14900, // $149 in cents
    type: 'INDUSTRY_STARTER',
  },
];

async function findExistingProduct(name: string): Promise<Stripe.Product | null> {
  const products = await stripe.products.list({ limit: 100 });
  return products.data.find(p => p.name === name) || null;
}

async function findExistingPrice(productId: string): Promise<Stripe.Price | null> {
  const prices = await stripe.prices.list({ product: productId, limit: 10 });
  return prices.data.find(p => p.active) || null;
}

async function createOrGetProduct(
  name: string,
  description: string,
  price: number,
  metadata: Record<string, string>,
): Promise<{ product: Stripe.Product; price: Stripe.Price }> {
  // Check if product already exists
  let product = await findExistingProduct(name);

  if (product) {
    console.log(`  Found existing product: ${name} (${product.id})`);
  } else {
    product = await stripe.products.create({
      name,
      description,
      metadata,
    });
    console.log(`  Created product: ${name} (${product.id})`);
  }

  // Check if price exists for this product
  let priceObj = await findExistingPrice(product.id);

  if (priceObj) {
    console.log(`    Found existing price: $${(priceObj.unit_amount || 0) / 100} (${priceObj.id})`);

    // Check if price matches
    if (priceObj.unit_amount !== price) {
      console.log(`    Warning: Price mismatch! Expected $${price / 100}, found $${(priceObj.unit_amount || 0) / 100}`);
    }
  } else {
    priceObj = await stripe.prices.create({
      product: product.id,
      unit_amount: price,
      currency: 'usd',
    });
    console.log(`    Created price: $${price / 100} (${priceObj.id})`);
  }

  return { product, price: priceObj };
}

async function main() {
  console.log('='.repeat(60));
  console.log('Creating Stripe Products for Zander Consulting');
  console.log('='.repeat(60));
  console.log('');

  const results: { name: string; productId: string; priceId: string; amount: number }[] = [];

  // Create consulting packages
  console.log('CONSULTING PACKAGES');
  console.log('-'.repeat(40));
  for (const pkg of CONSULTING_PACKAGES) {
    const { product, price } = await createOrGetProduct(
      pkg.name,
      pkg.description,
      pkg.price,
      {
        category: 'consulting',
        package_type: pkg.type,
        hours: pkg.hours.toString(),
      },
    );
    results.push({
      name: pkg.name,
      productId: product.id,
      priceId: price.id,
      amount: price.unit_amount || 0,
    });
  }
  console.log('');

  // Create digital store products
  console.log('DIGITAL STORE PRODUCTS');
  console.log('-'.repeat(40));
  for (const product of DIGITAL_PRODUCTS) {
    const { product: prod, price } = await createOrGetProduct(
      product.name,
      product.description,
      product.price,
      {
        category: 'digital_store',
        product_type: product.type,
      },
    );
    results.push({
      name: product.name,
      productId: prod.id,
      priceId: price.id,
      amount: price.unit_amount || 0,
    });
  }
  console.log('');

  // Output summary
  console.log('='.repeat(60));
  console.log('SUMMARY - Price IDs for Configuration');
  console.log('='.repeat(60));
  console.log('');
  console.log('Add these to your configuration:');
  console.log('');
  console.log('// Consulting Packages');
  for (const result of results.filter(r => CONSULTING_PACKAGES.some(p => p.name === r.name))) {
    const pkg = CONSULTING_PACKAGES.find(p => p.name === result.name)!;
    console.log(`${pkg.type}: '${result.priceId}', // $${result.amount / 100}`);
  }
  console.log('');
  console.log('// Digital Store Products');
  for (const result of results.filter(r => DIGITAL_PRODUCTS.some(p => p.name === r.name))) {
    const prod = DIGITAL_PRODUCTS.find(p => p.name === result.name)!;
    console.log(`${prod.type}: '${result.priceId}', // $${result.amount / 100}`);
  }
  console.log('');

  // Generate TypeScript constants
  console.log('='.repeat(60));
  console.log('TypeScript Constants for apps/web/app/store/page.tsx');
  console.log('='.repeat(60));
  console.log('');
  console.log('const STRIPE_PRICE_IDS = {');
  console.log('  // Consulting Packages');
  for (const result of results.filter(r => CONSULTING_PACKAGES.some(p => p.name === r.name))) {
    const pkg = CONSULTING_PACKAGES.find(p => p.name === result.name)!;
    console.log(`  '${pkg.type}': '${result.priceId}',`);
  }
  console.log('  // Digital Store Products');
  for (const result of results.filter(r => DIGITAL_PRODUCTS.some(p => p.name === r.name))) {
    const prod = DIGITAL_PRODUCTS.find(p => p.name === result.name)!;
    console.log(`  '${prod.type}': '${result.priceId}',`);
  }
  console.log('};');
  console.log('');

  console.log('Done! All products created or verified.');
}

main().catch((err) => {
  console.error('Error creating Stripe products:', err);
  process.exit(1);
});
