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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier } = body;

    if (tier !== 'waitlist') {
      return NextResponse.json(
        { error: 'Invalid tier' },
        { status: 400 }
      );
    }

    const priceId = process.env.STRIPE_PRICE_WAITLIST;

    if (!priceId) {
      console.error('STRIPE_PRICE_WAITLIST not configured');
      return NextResponse.json(
        { error: 'Waitlist not configured' },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    const origin = request.headers.get('origin') || 'https://app.zanderos.com';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/waitlist/confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
      metadata: {
        tier: 'waitlist',
        type: 'founding_50_reservation',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Waitlist checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
