import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe lazily to avoid build-time errors
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover' as Stripe.LatestApiVersion,
  });
}

// Product metadata for downloads
// Files will be stored in S3 at: s3://zander-digital-products/{product-key}.pdf
interface ProductDownload {
  name: string;
  filename: string;
  s3Key: string;
  placeholder: boolean; // true while waiting for real content
}

const PRODUCT_DOWNLOADS: Record<string, ProductDownload> = {
  'price_1TN9EjCryiiyM4ce1JuVPzP7': {
    name: 'Operations Playbook',
    filename: 'operations-playbook.pdf',
    s3Key: 'products/operations-playbook.pdf',
    placeholder: true,
  },
  'price_1TN9KECryiiyM4ce4GUDL3G0': {
    name: 'Startup Foundations Kit',
    filename: 'startup-foundations-kit.pdf',
    s3Key: 'products/startup-foundations-kit.pdf',
    placeholder: true,
  },
  'price_1TN9LdCryiiyM4cedyseEGCe': {
    name: 'Sales and Marketing Kit',
    filename: 'sales-marketing-kit.pdf',
    s3Key: 'products/sales-marketing-kit.pdf',
    placeholder: true,
  },
  'price_1TN9NfCryiiyM4ceJhjP9acm': {
    name: 'Hiring and Team Building Kit',
    filename: 'hiring-team-building-kit.pdf',
    s3Key: 'products/hiring-team-building-kit.pdf',
    placeholder: true,
  },
  'price_1TN9OeCryiiyM4ceegNAxeI5': {
    name: 'Financial Clarity Kit',
    filename: 'financial-clarity-kit.pdf',
    s3Key: 'products/financial-clarity-kit.pdf',
    placeholder: true,
  },
  'price_1TN9PrCryiiyM4cetv9u1wIM': {
    name: 'Industry Starter Packs',
    filename: 'industry-starter-packs.pdf',
    s3Key: 'products/industry-starter-packs.pdf',
    placeholder: true,
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const stripe = getStripe();

    // Verify the session was successful
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    // Get the line items to find the product
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
    const priceId = lineItems.data[0]?.price?.id;

    if (!priceId) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = PRODUCT_DOWNLOADS[priceId];

    if (!product) {
      return NextResponse.json({
        error: 'Product download not configured',
        priceId,
      }, { status: 404 });
    }

    // If this is still a placeholder, return info about email delivery
    if (product.placeholder) {
      return NextResponse.json({
        success: true,
        product: product.name,
        message: `Thank you for purchasing ${product.name}! Your download link will be emailed to ${session.customer_details?.email || 'your email address'} within 24 hours.`,
        deliveryMethod: 'email',
        downloadUrl: null,
      });
    }

    // For real files, generate a presigned S3 URL or return the download URL
    // TODO: Implement S3 presigned URL generation
    const downloadUrl = `https://cdn.zanderos.com/${product.s3Key}`;

    return NextResponse.json({
      success: true,
      product: product.name,
      filename: product.filename,
      downloadUrl,
    });
  } catch (error: unknown) {
    console.error('Download error:', error);
    const message = error instanceof Error ? error.message : 'Download failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
