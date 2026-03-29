/**
 * Stripe Products Creation Script
 *
 * Creates the Zander subscription products and prices in Stripe.
 * Run with: npx ts-node scripts/create-stripe-products.ts
 *
 * Requires: STRIPE_SECRET_KEY environment variable
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

interface ProductConfig {
  name: string;
  description: string;
  monthlyPrice: number;
  metadata: {
    tier: string;
    founding_rate: string;
    public_rate: string;
  };
}

const products: ProductConfig[] = [
  {
    name: 'Zander Starter',
    description: 'Your EA and HQ — fully operational from day one. Includes Pam (AI Executive Assistant), inbox management, calendar, SMS sequences.',
    monthlyPrice: 19900, // $199.00 in cents
    metadata: {
      tier: 'starter',
      founding_rate: '$199/mo',
      public_rate: '$299/mo',
    },
  },
  {
    name: 'Zander Pro',
    description: 'Everything in Starter plus Don (AI CMO), marketing calendar, campaign execution, brand strategy, social and email sequences.',
    monthlyPrice: 34900, // $349.00 in cents
    metadata: {
      tier: 'pro',
      founding_rate: '$349/mo',
      public_rate: '$499/mo',
    },
  },
  {
    name: 'Zander Business',
    description: 'The complete C-suite. Everything in Pro plus Jordan (AI CRO), pipeline management, deal tracking, outreach sequences.',
    monthlyPrice: 59900, // $599.00 in cents
    metadata: {
      tier: 'business',
      founding_rate: '$599/mo',
      public_rate: '$799/mo',
    },
  },
  {
    name: 'Zander Enterprise',
    description: 'Custom build for complex organizations. Everything in Business plus custom executive configuration, multi-location support, priority onboarding.',
    monthlyPrice: 99900, // $999.00 in cents
    metadata: {
      tier: 'enterprise',
      founding_rate: '$999/mo',
      public_rate: '$1,499/mo',
    },
  },
];

const waitlistProduct = {
  name: 'Zander Waitlist Reservation',
  description: 'Reserve your spot in the next Zander onboarding cohort. Non-refundable.',
  price: 4900, // $49.00 in cents
  metadata: {
    tier: 'waitlist',
    type: 'one_time',
  },
};

async function createProducts() {
  console.log('Creating Zander Stripe products...\n');

  const createdPrices: Record<string, string> = {};

  // Create subscription products
  for (const productConfig of products) {
    console.log(`Creating product: ${productConfig.name}`);

    const product = await stripe.products.create({
      name: productConfig.name,
      description: productConfig.description,
      metadata: productConfig.metadata,
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: productConfig.monthlyPrice,
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        tier: productConfig.metadata.tier,
        founding_rate: 'true',
      },
    });

    createdPrices[productConfig.metadata.tier] = price.id;
    console.log(`  Product ID: ${product.id}`);
    console.log(`  Price ID: ${price.id}`);
    console.log('');
  }

  // Create waitlist product (one-time)
  console.log(`Creating product: ${waitlistProduct.name}`);

  const waitlistProd = await stripe.products.create({
    name: waitlistProduct.name,
    description: waitlistProduct.description,
    metadata: waitlistProduct.metadata,
  });

  const waitlistPrice = await stripe.prices.create({
    product: waitlistProd.id,
    unit_amount: waitlistProduct.price,
    currency: 'usd',
    metadata: {
      tier: 'waitlist',
      type: 'one_time',
    },
  });

  createdPrices['waitlist'] = waitlistPrice.id;
  console.log(`  Product ID: ${waitlistProd.id}`);
  console.log(`  Price ID: ${waitlistPrice.id}`);
  console.log('');

  console.log('='.repeat(60));
  console.log('ADD THESE PRICE IDs TO VERCEL ENVIRONMENT VARIABLES:');
  console.log('='.repeat(60));
  console.log('');
  console.log(`STRIPE_PRICE_STARTER=${createdPrices['starter']}`);
  console.log(`STRIPE_PRICE_PRO=${createdPrices['pro']}`);
  console.log(`STRIPE_PRICE_BUSINESS=${createdPrices['business']}`);
  console.log(`STRIPE_PRICE_ENTERPRISE=${createdPrices['enterprise']}`);
  console.log(`STRIPE_PRICE_WAITLIST=${createdPrices['waitlist']}`);
  console.log('');
  console.log('Done! Products and prices created successfully.');
}

createProducts().catch((error) => {
  console.error('Error creating products:', error);
  process.exit(1);
});
