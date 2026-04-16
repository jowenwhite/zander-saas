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

// Map price IDs to download URLs (will be populated after Stripe product creation)
const PRODUCT_DOWNLOADS: Record<string, string> = {
  // 'price_xxx': 'https://storage.example.com/operations-playbook.pdf',
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

    const downloadUrl = PRODUCT_DOWNLOADS[priceId];

    if (!downloadUrl) {
      // For now, return a placeholder message
      return NextResponse.json({
        message: 'Download link will be sent via email',
        downloadUrl: null,
      });
    }

    return NextResponse.json({ downloadUrl });
  } catch (error: unknown) {
    console.error('Download error:', error);
    const message = error instanceof Error ? error.message : 'Download failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
