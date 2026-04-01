/**
 * Stripe Products Creation Script
 *
 * Creates the Zander subscription products and prices in Stripe.
 * Run with: npx ts-node scripts/create-stripe-products.ts
 *
 * Requires: STRIPE_SECRET_KEY environment variable
 *
 * NOTE: Does NOT create Enterprise tier — those are custom per customer.
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('ERROR: STRIPE_SECRET_KEY environment variable is required');
  console.error('Usage: STRIPE_SECRET_KEY=sk_live_xxx npx ts-node scripts/create-stripe-products.ts');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

interface ProductConfig {
  name: string;
  description: string;
  monthlyPrice: number;
  tier: string;
}

const products: ProductConfig[] = [
  {
    name: 'Zander Starter',
    description: 'Your EA and HQ — fully operational from day one. Includes Pam (AI Executive Assistant), inbox management, calendar, SMS sequences.',
    monthlyPrice: 19900, // $199.00 in cents
    tier: 'STARTER',
  },
  {
    name: 'Zander Pro',
    description: 'Everything in Starter plus Jordan (AI CRO), pipeline management, deal tracking, outreach sequences.',
    monthlyPrice: 34900, // $349.00 in cents
    tier: 'PRO',
  },
  {
    name: 'Zander Business',
    description: 'The complete C-suite. Everything in Pro plus Don (AI CMO), marketing calendar, campaign execution, brand strategy.',
    monthlyPrice: 59900, // $599.00 in cents
    tier: 'BUSINESS',
  },
];

async function createProducts() {
  console.log('Creating Zander Stripe products...\n');
  console.log('='.repeat(60));

  const results: { tier: string; productId: string; priceId: string }[] = [];

  for (const productConfig of products) {
    console.log(`\nCreating: ${productConfig.name}`);
    console.log(`  Tier: ${productConfig.tier}`);
    console.log(`  Price: $${(productConfig.monthlyPrice / 100).toFixed(2)}/month`);

    const product = await stripe.products.create({
      name: productConfig.name,
      description: productConfig.description,
      metadata: {
        tier: productConfig.tier,
      },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: productConfig.monthlyPrice,
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        tier: productConfig.tier,
      },
    });

    results.push({
      tier: productConfig.tier,
      productId: product.id,
      priceId: price.id,
    });

    console.log(`  Product ID: ${product.id}`);
    console.log(`  Price ID: ${price.id}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY - ADD THESE TO ENVIRONMENT VARIABLES:');
  console.log('='.repeat(60));
  console.log('');

  for (const result of results) {
    console.log(`${result.tier}:`);
    console.log(`  Product: ${result.productId}`);
    console.log(`  Price:   ${result.priceId}`);
    console.log('');
  }

  console.log('Environment variable format:');
  console.log('');
  for (const result of results) {
    console.log(`STRIPE_PRICE_${result.tier}=${result.priceId}`);
  }
  console.log('');
  console.log('Done! Products and prices created successfully.');
}

createProducts().catch((error) => {
  console.error('Error creating products:', error);
  process.exit(1);
});
