# Phase 5 — Consulting Module Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete consulting module with three distinct scopes: Digital Store (public), Consulting Tier (client view), and Consulting Admin (Jonathan's private management tools in Support Admin).

**Architecture:** The consulting module extends the existing Tenant model with consulting-specific fields, adds new Prisma models for engagements/time/deliverables, creates a new NestJS consulting module for backend APIs, and adds consulting tabs to Support Admin plus a new public /store page.

**Tech Stack:** Next.js 15 (App Router), NestJS, PostgreSQL + Prisma, Stripe (one-time payments), Resend (email delivery), existing UI patterns from Support Admin and landing page.

---

## Critical Scope Rules (Enforced Throughout)

| Scope | Location | Users | Access |
|-------|----------|-------|--------|
| Consulting Admin | Support Admin tabs | Jonathan only | `isSuperAdmin` guard |
| Consulting Tier | Client app view | CONSULTING tier tenants | Read-only own data |
| Digital Store | `/store` public page | Anyone | No auth required |

---

## Pre-Implementation: Stripe Product Verification

### Task 0: Verify Existing Stripe Products

**Files:**
- Read: `apps/api/src/billing/billing.service.ts`
- Read: `apps/api/src/billing/webhook.controller.ts`

**Step 1: Check Stripe for existing consulting products**

Run:
```bash
cd /Users/jonathanwhite/dev/zander-saas && grep -r "consulting\|compass\|foundation\|blueprint\|analysis" apps/api/src --include="*.ts" -i
```

**Step 2: Document existing Stripe configuration**

Current subscription price IDs found in codebase:
- STARTER: `price_1THMKiCryiiyM4ceRYP44O8T` ($199/mo)
- PRO: `price_1THMKiCryiiyM4ceQjddUKNI` ($349/mo)
- BUSINESS: `price_1THMKjCryiiyM4ceaJIYMyfI` ($599/mo)

**Step 3: Report findings**

Expected consulting products (need to verify if they exist in Stripe):
- Comprehensive Business Analysis: $500 one-time
- Compass: $2,500 one-time
- Foundation: $4,500 one-time
- Blueprint: $8,000 one-time
- Package Extension: $250 one-time

Digital store products:
- Operations Playbook: $79
- Startup Foundations Kit: $99
- Sales and Marketing Kit: $99
- Hiring and Team Building Kit: $99
- Financial Clarity Kit: $79
- Industry Starter Packs: $149

**Outcome:** Document which products exist vs need creation.

---

## Phase 5A — Digital Store (Public, No Auth)

### Task 1: Create Store Page Route

**Files:**
- Create: `apps/web/app/store/page.tsx`

**Step 1: Create the store page file**

```tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

const PRODUCTS = [
  {
    id: 'operations-playbook',
    name: 'Operations Playbook',
    price: 79,
    description: 'SOPs, process templates, and efficiency guides to systematize your operations.',
    stripePriceId: '', // To be filled after Stripe product creation
  },
  {
    id: 'startup-foundations',
    name: 'Startup Foundations Kit',
    price: 99,
    description: 'Business plan template, financial projections, and launch checklist.',
    stripePriceId: '',
  },
  {
    id: 'sales-marketing',
    name: 'Sales and Marketing Kit',
    price: 99,
    description: 'Scripts, email templates, and funnel blueprints.',
    stripePriceId: '',
  },
  {
    id: 'hiring-team',
    name: 'Hiring and Team Building Kit',
    price: 99,
    description: 'Job descriptions, interview guides, and onboarding checklists.',
    stripePriceId: '',
  },
  {
    id: 'financial-clarity',
    name: 'Financial Clarity Kit',
    price: 79,
    description: 'Cash flow templates, KPI dashboards, and bookkeeping basics.',
    stripePriceId: '',
  },
  {
    id: 'industry-starter',
    name: 'Industry Starter Packs',
    price: 149,
    description: 'Industry-specific templates tailored to your business vertical.',
    stripePriceId: '',
  },
];

export default function StorePage() {
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const handlePurchase = async (productId: string, stripePriceId: string) => {
    if (!stripePriceId) {
      alert('Product coming soon');
      return;
    }
    setPurchasing(productId);
    try {
      const res = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: stripePriceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: '#080A0F',
      color: '#FFFFFF',
      minHeight: '100vh',
    }}>
      {/* Nav */}
      <nav style={{
        padding: '1rem 2rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <a href="/">
          <img src="/images/zander-logo-color.svg" alt="Zander" style={{ height: '40px' }} />
        </a>
        <a href="/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Sign In</a>
      </nav>

      {/* Hero */}
      <section style={{
        padding: '6rem 2rem 4rem',
        textAlign: 'center',
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        <span style={{
          fontSize: '14px',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#00CFEB',
          marginBottom: '1rem',
          display: 'block',
        }}>Operating Simply Resources</span>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 800,
          lineHeight: 1.2,
          marginBottom: '1.5rem',
        }}>
          Tools to help you <span style={{ color: '#00CFEB' }}>operate simply</span>
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'rgba(255,255,255,0.7)',
          lineHeight: 1.7,
          maxWidth: '700px',
          margin: '0 auto',
        }}>
          Practical templates, playbooks, and frameworks distilled from decades of hands-on business ownership.
          No fluff. Just tools that work.
        </p>
      </section>

      {/* Products Grid */}
      <section style={{
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.5rem',
        }}>
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              style={{
                background: '#0E1017',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: '0.75rem',
              }}>{product.name}</h3>
              <p style={{
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.6,
                flex: 1,
                marginBottom: '1.5rem',
              }}>{product.description}</p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                }}>${product.price}</span>
                <button
                  onClick={() => handlePurchase(product.id, product.stripePriceId)}
                  disabled={purchasing === product.id}
                  style={{
                    background: '#00CFEB',
                    color: '#000',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    border: 'none',
                    cursor: 'pointer',
                    opacity: purchasing === product.id ? 0.7 : 1,
                  }}
                >
                  {purchasing === product.id ? 'Loading...' : 'Purchase'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Consulting CTA */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '900px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <div style={{
          background: 'rgba(0,207,235,0.05)',
          border: '1px solid rgba(0,207,235,0.2)',
          borderRadius: '16px',
          padding: '3rem',
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '1rem',
          }}>Need hands-on help?</h2>
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.7,
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem',
          }}>
            Book a discovery call to discuss your business challenges.
            Whether you need a full transformation or just help getting unstuck,
            we can build a plan that fits.
          </p>
          <a
            href="https://calendly.com/jonathan-zanderos"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: 'transparent',
              color: '#00CFEB',
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '1.1rem',
              border: '2px solid #00CFEB',
              textDecoration: 'none',
            }}
          >
            Book a Discovery Call
          </a>
        </div>
      </section>

      {/* Book Placeholder */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '900px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <div style={{
          background: '#0E1017',
          border: '2px dashed rgba(255,255,255,0.15)',
          borderRadius: '16px',
          padding: '3rem',
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '0.5rem',
          }}>Coming Soon</h3>
          <p style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.8)',
          }}>
            "Well Shit" — The Book
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>
          &copy; 2026 Zander Systems LLC. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
```

**Step 2: Verify the page renders**

Run: `cd /Users/jonathanwhite/dev/zander-saas && pnpm dev`

Navigate to `http://localhost:3000/store`

Expected: Store page renders with product grid

**Step 3: Commit**

```bash
git add apps/web/app/store/page.tsx
git commit -m "feat(store): add public digital store page

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 2: Create Store Checkout API

**Files:**
- Create: `apps/web/app/api/store/checkout/route.ts`

**Step 1: Create the checkout API route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const { priceId, email } = await request.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID required' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://zanderos.com';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: `${baseUrl}/store/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/store`,
      metadata: {
        type: 'digital_product',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Store checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: 500 }
    );
  }
}
```

**Step 2: Verify API works**

Run:
```bash
curl -X POST http://localhost:3000/api/store/checkout \
  -H "Content-Type: application/json" \
  -d '{"priceId":"price_test"}'
```

Expected: Returns error about invalid price (since test price doesn't exist)

**Step 3: Commit**

```bash
git add apps/web/app/api/store/checkout/route.ts
git commit -m "feat(store): add checkout API for digital products

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 3: Create Store Success Page

**Files:**
- Create: `apps/web/app/store/success/page.tsx`

**Step 1: Create the success page**

```tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Fetch download URL from API
      fetch(`/api/store/download?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.downloadUrl) {
            setDownloadUrl(data.downloadUrl);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: '#080A0F',
      color: '#FFFFFF',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        maxWidth: '600px',
        textAlign: 'center',
        padding: '2rem',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(34, 197, 94, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          marginBottom: '1rem',
        }}>Purchase Complete!</h1>

        <p style={{
          fontSize: '1.1rem',
          color: 'rgba(255,255,255,0.7)',
          lineHeight: 1.7,
          marginBottom: '2rem',
        }}>
          Thank you for your purchase. A confirmation email with your download link
          has been sent to your email address.
        </p>

        {loading ? (
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading download link...</p>
        ) : downloadUrl ? (
          <a
            href={downloadUrl}
            style={{
              display: 'inline-block',
              background: '#00CFEB',
              color: '#000',
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '1.1rem',
              textDecoration: 'none',
              marginBottom: '1rem',
            }}
          >
            Download Now
          </a>
        ) : null}

        <div style={{ marginTop: '2rem' }}>
          <a
            href="/store"
            style={{
              color: '#00CFEB',
              textDecoration: 'none',
              fontSize: '1rem',
            }}
          >
            &larr; Back to Store
          </a>
        </div>
      </div>
    </div>
  );
}

export default function StoreSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{
        fontFamily: "'Inter', sans-serif",
        background: '#080A0F',
        color: '#FFFFFF',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p>Loading...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
```

**Step 2: Commit**

```bash
git add apps/web/app/store/success/page.tsx
git commit -m "feat(store): add purchase success page with download link

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 4: Create Store Download API

**Files:**
- Create: `apps/web/app/api/store/download/route.ts`

**Step 1: Create download API**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

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
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: error.message || 'Download failed' },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit**

```bash
git add apps/web/app/api/store/download/route.ts
git commit -m "feat(store): add download API for purchased products

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 5B — Consulting Tier (Schema + Backend + Support Admin)

### Task 5: Update Prisma Schema with Consulting Models

**Files:**
- Modify: `packages/database/prisma/schema.prisma`

**Step 1: Add consulting enums after existing enums**

```prisma
enum ConsultingStatus {
  ACTIVE
  COMPLETED
  PAUSED
}

enum DeliverableStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  DELIVERED
}

enum EngagementStatus {
  ACTIVE
  COMPLETED
  PAUSED
  EXPIRED
}
```

**Step 2: Add consulting fields to Tenant model**

Add these fields to the Tenant model (after existing fields, before relations):

```prisma
  // Consulting fields
  consultingStatus      ConsultingStatus?
  packageType           String?
  hoursRemaining        Float             @default(0)
  hoursUsed             Float             @default(0)
  packagePurchaseDate   DateTime?
  packageExpirationDate DateTime?
```

**Step 3: Add ConsultingEngagement model**

```prisma
model ConsultingEngagement {
  id              String            @id @default(cuid())
  tenantId        String
  packageType     String
  startDate       DateTime
  endDate         DateTime?
  status          EngagementStatus  @default(ACTIVE)
  totalHours      Float             @default(0)
  hoursUsed       Float             @default(0)
  billableHours   Float             @default(0)
  stripePaymentId String?
  notes           String?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  tenant       Tenant                  @relation(fields: [tenantId], references: [id])
  timeEntries  ConsultingTimeEntry[]
  deliverables ConsultingDeliverable[]

  @@index([tenantId])
  @@index([status])
  @@map("consulting_engagements")
}
```

**Step 4: Add ConsultingTimeEntry model**

```prisma
model ConsultingTimeEntry {
  id            String   @id @default(cuid())
  tenantId      String
  engagementId  String
  date          DateTime
  hours         Float
  billableHours Float    @default(0)
  description   String
  category      String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  tenant     Tenant               @relation(fields: [tenantId], references: [id])
  engagement ConsultingEngagement @relation(fields: [engagementId], references: [id])

  @@index([tenantId])
  @@index([engagementId])
  @@index([date])
  @@map("consulting_time_entries")
}
```

**Step 5: Add ConsultingDeliverable model**

```prisma
model ConsultingDeliverable {
  id           String            @id @default(cuid())
  tenantId     String
  engagementId String
  packageTier  String
  name         String
  description  String?
  status       DeliverableStatus @default(PENDING)
  deliveredAt  DateTime?
  documentUrl  String?
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt

  tenant     Tenant               @relation(fields: [tenantId], references: [id])
  engagement ConsultingEngagement @relation(fields: [engagementId], references: [id])

  @@index([tenantId])
  @@index([engagementId])
  @@index([status])
  @@map("consulting_deliverables")
}
```

**Step 6: Add relations to Tenant model**

Add to Tenant model relations section:

```prisma
  consultingEngagements ConsultingEngagement[]
  consultingTimeEntries ConsultingTimeEntry[]
  consultingDeliverables ConsultingDeliverable[]
```

**Step 7: Push schema changes to database**

CRITICAL: Open RDS security group first!

```bash
# Open security group
aws ec2 authorize-security-group-ingress \
  --group-id sg-03eb2fd7369bf002e \
  --protocol tcp \
  --port 5432 \
  --cidr $(curl -s ifconfig.me)/32

# Push schema
cd /Users/jonathanwhite/dev/zander-saas/packages/database
npx prisma db push

# Close security group immediately
aws ec2 revoke-security-group-ingress \
  --group-id sg-03eb2fd7369bf002e \
  --protocol tcp \
  --port 5432 \
  --cidr $(curl -s ifconfig.me)/32
```

**Step 8: Generate Prisma client**

```bash
cd /Users/jonathanwhite/dev/zander-saas/packages/database
npx prisma generate
```

**Step 9: Commit**

```bash
git add packages/database/prisma/schema.prisma
git commit -m "feat(db): add consulting module schema

- Add ConsultingEngagement model
- Add ConsultingTimeEntry model
- Add ConsultingDeliverable model
- Add consulting fields to Tenant model

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 6: Update Tier Config for CONSULTING Tier

**Files:**
- Modify: `apps/api/src/common/config/tier-config.ts`

**Step 1: Add CONSULTING tier configuration**

Find the token cap configuration and add:

```typescript
// Add to TIER_TOKEN_CAPS or equivalent
CONSULTING: 0, // No AI executive access for consulting tier
```

**Step 2: Update tier feature access**

Add CONSULTING tier feature flags:
- HQ access: full
- Documents: yes
- Surveys: yes
- AI executives: no (Pam, Jordan, Don locked)
- Email/calendar integration: no
- Communication module: no

**Step 3: Commit**

```bash
git add apps/api/src/common/config/tier-config.ts
git commit -m "feat(tiers): add CONSULTING tier with 0 AI token cap

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 7: Create Consulting Module Structure (Backend)

**Files:**
- Create: `apps/api/src/consulting/consulting.module.ts`
- Create: `apps/api/src/consulting/consulting.controller.ts`
- Create: `apps/api/src/consulting/consulting.service.ts`
- Create: `apps/api/src/consulting/dto/create-engagement.dto.ts`
- Create: `apps/api/src/consulting/dto/create-time-entry.dto.ts`
- Create: `apps/api/src/consulting/dto/create-deliverable.dto.ts`

**Step 1: Create DTOs**

`apps/api/src/consulting/dto/create-engagement.dto.ts`:
```typescript
import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateEngagementDto {
  @IsString()
  tenantId: string;

  @IsString()
  packageType: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  totalHours?: number;

  @IsString()
  @IsOptional()
  stripePaymentId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateEngagementDto {
  @IsString()
  @IsOptional()
  status?: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'EXPIRED';

  @IsNumber()
  @IsOptional()
  hoursUsed?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
```

`apps/api/src/consulting/dto/create-time-entry.dto.ts`:
```typescript
import { IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateTimeEntryDto {
  @IsString()
  tenantId: string;

  @IsString()
  engagementId: string;

  @IsDateString()
  date: string;

  @IsNumber()
  hours: number;

  @IsNumber()
  billableHours: number;

  @IsString()
  description: string;

  @IsString()
  category: string;
}

export class UpdateTimeEntryDto {
  @IsNumber()
  hours?: number;

  @IsNumber()
  billableHours?: number;

  @IsString()
  description?: string;

  @IsString()
  category?: string;
}
```

`apps/api/src/consulting/dto/create-deliverable.dto.ts`:
```typescript
import { IsString, IsOptional } from 'class-validator';

export class CreateDeliverableDto {
  @IsString()
  tenantId: string;

  @IsString()
  engagementId: string;

  @IsString()
  packageTier: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateDeliverableDto {
  @IsString()
  @IsOptional()
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELIVERED';

  @IsString()
  @IsOptional()
  documentUrl?: string;
}
```

**Step 2: Create consulting service**

`apps/api/src/consulting/consulting.service.ts`:
```typescript
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEngagementDto, UpdateEngagementDto } from './dto/create-engagement.dto';
import { CreateTimeEntryDto, UpdateTimeEntryDto } from './dto/create-time-entry.dto';
import { CreateDeliverableDto, UpdateDeliverableDto } from './dto/create-deliverable.dto';

@Injectable()
export class ConsultingService {
  constructor(private prisma: PrismaService) {}

  // ========== ENGAGEMENTS ==========

  async createEngagement(dto: CreateEngagementDto) {
    return this.prisma.consultingEngagement.create({
      data: {
        tenantId: dto.tenantId,
        packageType: dto.packageType,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        totalHours: dto.totalHours || 0,
        stripePaymentId: dto.stripePaymentId,
        notes: dto.notes,
      },
      include: { tenant: { select: { companyName: true } } },
    });
  }

  async listEngagements(tenantId?: string) {
    return this.prisma.consultingEngagement.findMany({
      where: tenantId ? { tenantId } : undefined,
      include: {
        tenant: { select: { companyName: true, email: true } },
        _count: { select: { timeEntries: true, deliverables: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEngagement(id: string) {
    const engagement = await this.prisma.consultingEngagement.findUnique({
      where: { id },
      include: {
        tenant: { select: { companyName: true, email: true } },
        timeEntries: { orderBy: { date: 'desc' } },
        deliverables: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!engagement) throw new NotFoundException('Engagement not found');
    return engagement;
  }

  async updateEngagement(id: string, dto: UpdateEngagementDto) {
    return this.prisma.consultingEngagement.update({
      where: { id },
      data: dto,
    });
  }

  // ========== TIME ENTRIES ==========

  async createTimeEntry(dto: CreateTimeEntryDto) {
    const entry = await this.prisma.consultingTimeEntry.create({
      data: {
        tenantId: dto.tenantId,
        engagementId: dto.engagementId,
        date: new Date(dto.date),
        hours: dto.hours,
        billableHours: dto.billableHours,
        description: dto.description,
        category: dto.category,
      },
    });

    // Auto-decrement hours remaining on engagement
    await this.prisma.consultingEngagement.update({
      where: { id: dto.engagementId },
      data: {
        hoursUsed: { increment: dto.billableHours },
      },
    });

    // Also update tenant hours
    await this.prisma.tenant.update({
      where: { id: dto.tenantId },
      data: {
        hoursUsed: { increment: dto.billableHours },
        hoursRemaining: { decrement: dto.billableHours },
      },
    });

    return entry;
  }

  async listTimeEntries(tenantId?: string, engagementId?: string) {
    return this.prisma.consultingTimeEntry.findMany({
      where: {
        ...(tenantId && { tenantId }),
        ...(engagementId && { engagementId }),
      },
      include: {
        tenant: { select: { companyName: true } },
        engagement: { select: { packageType: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async updateTimeEntry(id: string, dto: UpdateTimeEntryDto) {
    return this.prisma.consultingTimeEntry.update({
      where: { id },
      data: dto,
    });
  }

  async getTimeEntrySummary(engagementId: string) {
    const engagement = await this.prisma.consultingEngagement.findUnique({
      where: { id: engagementId },
    });
    if (!engagement) throw new NotFoundException('Engagement not found');

    const entries = await this.prisma.consultingTimeEntry.findMany({
      where: { engagementId },
    });

    const totalHoursLogged = entries.reduce((sum, e) => sum + e.hours, 0);
    const totalBillableHours = entries.reduce((sum, e) => sum + e.billableHours, 0);

    return {
      totalPurchased: engagement.totalHours,
      totalHoursLogged,
      totalBillableHours,
      hoursUsed: engagement.hoursUsed,
      hoursRemaining: engagement.totalHours - engagement.hoursUsed,
    };
  }

  // ========== DELIVERABLES ==========

  async createDeliverable(dto: CreateDeliverableDto) {
    return this.prisma.consultingDeliverable.create({
      data: {
        tenantId: dto.tenantId,
        engagementId: dto.engagementId,
        packageTier: dto.packageTier,
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async listDeliverables(tenantId?: string, engagementId?: string) {
    return this.prisma.consultingDeliverable.findMany({
      where: {
        ...(tenantId && { tenantId }),
        ...(engagementId && { engagementId }),
      },
      include: {
        tenant: { select: { companyName: true } },
        engagement: { select: { packageType: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateDeliverable(id: string, dto: UpdateDeliverableDto) {
    const update: any = { ...dto };
    if (dto.status === 'DELIVERED') {
      update.deliveredAt = new Date();
    }
    return this.prisma.consultingDeliverable.update({
      where: { id },
      data: update,
    });
  }

  async getDeliverable(id: string) {
    const deliverable = await this.prisma.consultingDeliverable.findUnique({
      where: { id },
      include: { tenant: true, engagement: true },
    });
    if (!deliverable) throw new NotFoundException('Deliverable not found');
    return deliverable;
  }
}
```

**Step 3: Create consulting controller**

`apps/api/src/consulting/consulting.controller.ts`:
```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ConsultingService } from './consulting.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateEngagementDto, UpdateEngagementDto } from './dto/create-engagement.dto';
import { CreateTimeEntryDto, UpdateTimeEntryDto } from './dto/create-time-entry.dto';
import { CreateDeliverableDto, UpdateDeliverableDto } from './dto/create-deliverable.dto';

@Controller('consulting')
@UseGuards(JwtAuthGuard)
export class ConsultingController {
  constructor(private readonly consultingService: ConsultingService) {}

  // Helper to check superadmin
  private checkSuperAdmin(req: any) {
    if (!req.user?.isSuperAdmin) {
      throw new ForbiddenException('Super admin access required');
    }
  }

  // ========== ENGAGEMENTS ==========

  @Post('engagements')
  async createEngagement(@Request() req: any, @Body() dto: CreateEngagementDto) {
    this.checkSuperAdmin(req);
    return this.consultingService.createEngagement(dto);
  }

  @Get('engagements')
  async listEngagements(@Request() req: any, @Query('tenantId') tenantId?: string) {
    if (req.user?.isSuperAdmin) {
      // Admin sees all or filtered by tenant
      return this.consultingService.listEngagements(tenantId);
    }
    // Regular user sees only their own tenant
    return this.consultingService.listEngagements(req.user.tenantId);
  }

  @Get('engagements/:id')
  async getEngagement(@Request() req: any, @Param('id') id: string) {
    const engagement = await this.consultingService.getEngagement(id);
    // Check access
    if (!req.user?.isSuperAdmin && engagement.tenantId !== req.user.tenantId) {
      throw new ForbiddenException('Access denied');
    }
    return engagement;
  }

  @Patch('engagements/:id')
  async updateEngagement(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateEngagementDto,
  ) {
    this.checkSuperAdmin(req);
    return this.consultingService.updateEngagement(id, dto);
  }

  // ========== TIME ENTRIES ==========

  @Post('time-entries')
  async createTimeEntry(@Request() req: any, @Body() dto: CreateTimeEntryDto) {
    this.checkSuperAdmin(req);
    return this.consultingService.createTimeEntry(dto);
  }

  @Get('time-entries')
  async listTimeEntries(
    @Request() req: any,
    @Query('tenantId') tenantId?: string,
    @Query('engagementId') engagementId?: string,
  ) {
    if (req.user?.isSuperAdmin) {
      return this.consultingService.listTimeEntries(tenantId, engagementId);
    }
    // Regular user sees only their own tenant
    return this.consultingService.listTimeEntries(req.user.tenantId, engagementId);
  }

  @Patch('time-entries/:id')
  async updateTimeEntry(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTimeEntryDto,
  ) {
    this.checkSuperAdmin(req);
    return this.consultingService.updateTimeEntry(id, dto);
  }

  @Get('time-entries/summary')
  async getTimeEntrySummary(
    @Request() req: any,
    @Query('engagementId') engagementId: string,
  ) {
    return this.consultingService.getTimeEntrySummary(engagementId);
  }

  // ========== DELIVERABLES ==========

  @Post('deliverables')
  async createDeliverable(@Request() req: any, @Body() dto: CreateDeliverableDto) {
    this.checkSuperAdmin(req);
    return this.consultingService.createDeliverable(dto);
  }

  @Get('deliverables')
  async listDeliverables(
    @Request() req: any,
    @Query('tenantId') tenantId?: string,
    @Query('engagementId') engagementId?: string,
  ) {
    if (req.user?.isSuperAdmin) {
      return this.consultingService.listDeliverables(tenantId, engagementId);
    }
    return this.consultingService.listDeliverables(req.user.tenantId, engagementId);
  }

  @Get('deliverables/:id')
  async getDeliverable(@Request() req: any, @Param('id') id: string) {
    const deliverable = await this.consultingService.getDeliverable(id);
    if (!req.user?.isSuperAdmin && deliverable.tenantId !== req.user.tenantId) {
      throw new ForbiddenException('Access denied');
    }
    return deliverable;
  }

  @Patch('deliverables/:id')
  async updateDeliverable(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDeliverableDto,
  ) {
    this.checkSuperAdmin(req);
    return this.consultingService.updateDeliverable(id, dto);
  }
}
```

**Step 4: Create consulting module**

`apps/api/src/consulting/consulting.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ConsultingController } from './consulting.controller';
import { ConsultingService } from './consulting.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConsultingController],
  providers: [ConsultingService],
  exports: [ConsultingService],
})
export class ConsultingModule {}
```

**Step 5: Register module in app.module.ts**

Add to imports in `apps/api/src/app.module.ts`:
```typescript
import { ConsultingModule } from './consulting/consulting.module';

// In @Module imports array:
ConsultingModule,
```

**Step 6: Commit**

```bash
git add apps/api/src/consulting/
git add apps/api/src/app.module.ts
git commit -m "feat(api): add consulting module with engagement, time, and deliverable APIs

- All management endpoints gated by isSuperAdmin
- Client endpoints return only their own tenant data
- Time entries auto-decrement hours remaining

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 8: Add Consulting Tab to Support Admin

**Files:**
- Create: `apps/web/app/admin/support-admin/components/ConsultingTab.tsx`
- Create: `apps/web/app/admin/support-admin/hooks/useConsulting.ts`
- Modify: `apps/web/app/admin/support-admin/page.tsx`

**Step 1: Create useConsulting hook**

`apps/web/app/admin/support-admin/hooks/useConsulting.ts`:
```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';

interface Engagement {
  id: string;
  tenantId: string;
  packageType: string;
  startDate: string;
  endDate?: string;
  status: string;
  totalHours: number;
  hoursUsed: number;
  billableHours: number;
  stripePaymentId?: string;
  notes?: string;
  tenant: { companyName: string; email?: string };
  _count: { timeEntries: number; deliverables: number };
}

interface TimeEntry {
  id: string;
  date: string;
  hours: number;
  billableHours: number;
  description: string;
  category: string;
  tenant: { companyName: string };
}

interface Deliverable {
  id: string;
  name: string;
  description?: string;
  status: string;
  deliveredAt?: string;
  documentUrl?: string;
  packageTier: string;
  tenant: { companyName: string };
}

export function useConsulting(token: string | null) {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

  const fetchEngagements = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/consulting/engagements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEngagements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch engagements:', err);
    }
  }, [token, apiUrl]);

  const fetchTimeEntries = useCallback(async (tenantId?: string) => {
    if (!token) return;
    try {
      const url = tenantId
        ? `${apiUrl}/consulting/time-entries?tenantId=${tenantId}`
        : `${apiUrl}/consulting/time-entries`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTimeEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch time entries:', err);
    }
  }, [token, apiUrl]);

  const fetchDeliverables = useCallback(async (tenantId?: string) => {
    if (!token) return;
    try {
      const url = tenantId
        ? `${apiUrl}/consulting/deliverables?tenantId=${tenantId}`
        : `${apiUrl}/consulting/deliverables`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDeliverables(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch deliverables:', err);
    }
  }, [token, apiUrl]);

  const createEngagement = useCallback(async (data: any) => {
    if (!token) return;
    const res = await fetch(`${apiUrl}/consulting/engagements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create engagement');
    await fetchEngagements();
    return res.json();
  }, [token, apiUrl, fetchEngagements]);

  const createTimeEntry = useCallback(async (data: any) => {
    if (!token) return;
    const res = await fetch(`${apiUrl}/consulting/time-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create time entry');
    await fetchEngagements(); // Refresh to get updated hours
    return res.json();
  }, [token, apiUrl, fetchEngagements]);

  const createDeliverable = useCallback(async (data: any) => {
    if (!token) return;
    const res = await fetch(`${apiUrl}/consulting/deliverables`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create deliverable');
    await fetchDeliverables();
    return res.json();
  }, [token, apiUrl, fetchDeliverables]);

  const updateDeliverableStatus = useCallback(async (id: string, status: string, documentUrl?: string) => {
    if (!token) return;
    const res = await fetch(`${apiUrl}/consulting/deliverables/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, documentUrl }),
    });
    if (!res.ok) throw new Error('Failed to update deliverable');
    await fetchDeliverables();
    return res.json();
  }, [token, apiUrl, fetchDeliverables]);

  useEffect(() => {
    if (token) {
      setLoading(true);
      Promise.all([fetchEngagements(), fetchTimeEntries(), fetchDeliverables()])
        .finally(() => setLoading(false));
    }
  }, [token, fetchEngagements, fetchTimeEntries, fetchDeliverables]);

  return {
    engagements,
    timeEntries,
    deliverables,
    loading,
    error,
    createEngagement,
    createTimeEntry,
    createDeliverable,
    updateDeliverableStatus,
    refetch: () => {
      fetchEngagements();
      fetchTimeEntries();
      fetchDeliverables();
    },
  };
}
```

**Step 2: Create ConsultingTab component**

`apps/web/app/admin/support-admin/components/ConsultingTab.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { useConsulting } from '../hooks/useConsulting';

interface ConsultingTabProps {
  token: string | null;
  tenants: any[];
}

const PACKAGE_TYPES = [
  { value: 'BUSINESS_ANALYSIS', label: 'Business Analysis', hours: 0, price: 500 },
  { value: 'COMPASS', label: 'Compass', hours: 20, price: 2500 },
  { value: 'FOUNDATION', label: 'Foundation', hours: 40, price: 4500 },
  { value: 'BLUEPRINT', label: 'Blueprint', hours: 80, price: 8000 },
];

const TIME_CATEGORIES = [
  'Strategy Session',
  'Document Creation',
  'Research & Analysis',
  'Implementation Support',
  'Training',
  'Review & Feedback',
  'Administrative',
];

export default function ConsultingTab({ token, tenants }: ConsultingTabProps) {
  const {
    engagements,
    timeEntries,
    deliverables,
    loading,
    createEngagement,
    createTimeEntry,
    createDeliverable,
    updateDeliverableStatus,
  } = useConsulting(token);

  const [showEngagementForm, setShowEngagementForm] = useState(false);
  const [showTimeEntryForm, setShowTimeEntryForm] = useState(false);
  const [selectedEngagement, setSelectedEngagement] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Filter only CONSULTING tier tenants for creating new engagements
  const consultingTenants = tenants.filter(t =>
    t.subscriptionTier === 'CONSULTING' || t.tierOverride === 'CONSULTING'
  );

  const handleCreateEngagement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const pkg = PACKAGE_TYPES.find(p => p.value === formData.packageType);
      await createEngagement({
        tenantId: formData.tenantId,
        packageType: formData.packageType,
        startDate: formData.startDate,
        totalHours: pkg?.hours || 0,
        stripePaymentId: formData.stripePaymentId,
        notes: formData.notes,
      });
      setShowEngagementForm(false);
      setFormData({});
    } catch (err) {
      alert('Failed to create engagement');
    }
  };

  const handleCreateTimeEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEngagement) return;
    const eng = engagements.find(e => e.id === selectedEngagement);
    if (!eng) return;
    try {
      await createTimeEntry({
        tenantId: eng.tenantId,
        engagementId: selectedEngagement,
        date: formData.date,
        hours: parseFloat(formData.hours),
        billableHours: parseFloat(formData.billableHours || formData.hours),
        description: formData.description,
        category: formData.category,
      });
      setShowTimeEntryForm(false);
      setFormData({});
    } catch (err) {
      alert('Failed to log time');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading consulting data...</div>;
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Consulting Management</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowEngagementForm(true)}
            style={{
              background: '#00CFEB',
              color: '#000',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + New Engagement
          </button>
        </div>
      </div>

      {/* Engagements Grid */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Active Engagements</h3>
        {engagements.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>No engagements yet</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
            {engagements.map((eng) => (
              <div
                key={eng.id}
                style={{
                  background: '#0E1017',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{eng.tenant.companyName}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{eng.packageType}</span>
                  </div>
                  <span style={{
                    background: eng.status === 'ACTIVE' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.1)',
                    color: eng.status === 'ACTIVE' ? '#22C55E' : 'rgba(255,255,255,0.5)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}>{eng.status}</span>
                </div>

                {/* Hours Progress */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span>Hours Used</span>
                    <span>{eng.hoursUsed} / {eng.totalHours}</span>
                  </div>
                  <div style={{
                    height: '6px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, (eng.hoursUsed / eng.totalHours) * 100)}%`,
                      background: eng.hoursUsed / eng.totalHours > 0.8 ? '#EF4444' : '#00CFEB',
                      borderRadius: '3px',
                    }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setSelectedEngagement(eng.id);
                      setShowTimeEntryForm(true);
                    }}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      color: '#00CFEB',
                      border: '1px solid #00CFEB',
                      padding: '0.4rem',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    Log Time
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Engagement Modal */}
      {showEngagementForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#13151E',
            borderRadius: '12px',
            padding: '2rem',
            width: '100%',
            maxWidth: '500px',
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Create Engagement</h3>
            <form onSubmit={handleCreateEngagement}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Client</label>
                <select
                  value={formData.tenantId || ''}
                  onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: '#0E1017',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    color: '#fff',
                  }}
                >
                  <option value="">Select client...</option>
                  {consultingTenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.companyName}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Package</label>
                <select
                  value={formData.packageType || ''}
                  onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: '#0E1017',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    color: '#fff',
                  }}
                >
                  <option value="">Select package...</option>
                  {PACKAGE_TYPES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label} - ${p.price} ({p.hours}hrs)
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Start Date</label>
                <input
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: '#0E1017',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    color: '#fff',
                  }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: '#0E1017',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    color: '#fff',
                    resize: 'vertical',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setShowEngagementForm(false); setFormData({}); }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#00CFEB',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#000',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Time Modal */}
      {showTimeEntryForm && selectedEngagement && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#13151E',
            borderRadius: '12px',
            padding: '2rem',
            width: '100%',
            maxWidth: '500px',
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Log Time</h3>
            <form onSubmit={handleCreateTimeEntry}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Date</label>
                <input
                  type="date"
                  value={formData.date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: '#0E1017',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    color: '#fff',
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Hours</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.hours || ''}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: '#0E1017',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '4px',
                      color: '#fff',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Billable Hours</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.billableHours || formData.hours || ''}
                    onChange={(e) => setFormData({ ...formData, billableHours: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: '#0E1017',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '4px',
                      color: '#fff',
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Category</label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: '#0E1017',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    color: '#fff',
                  }}
                >
                  <option value="">Select category...</option>
                  {TIME_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: '#0E1017',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    color: '#fff',
                    resize: 'vertical',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setShowTimeEntryForm(false); setSelectedEngagement(null); setFormData({}); }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#00CFEB',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#000',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Log Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 3: Add Consulting tab to Support Admin page**

Modify `apps/web/app/admin/support-admin/page.tsx`:

1. Import the new component:
```typescript
import ConsultingTab from './components/ConsultingTab';
```

2. Add 'consulting' to the tabs array
3. Add the tab button in the header
4. Add the tab content rendering

**Step 4: Commit**

```bash
git add apps/web/app/admin/support-admin/
git commit -m "feat(support-admin): add Consulting tab for engagement and time management

- Create useConsulting hook for API calls
- Create ConsultingTab component with engagement grid
- Add time entry logging with category tracking
- Integrate into Support Admin page

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 5C — Business Analysis Flow

### Task 9: Create Consulting Intake Survey

**Files:**
- Create: `apps/web/app/admin/support-admin/components/ConsultingIntakeSurvey.tsx`
- Modify: Prisma schema to add ConsultingIntake model

This task creates a structured intake survey flow that can be linked to from the ConsultingTab.

(Implementation details follow same pattern - create component, add API endpoint, integrate)

---

## Phase 5E — Consulting Billing Integration

### Task 10: Create Stripe Products Script

**Files:**
- Create: `scripts/create-consulting-stripe-products.ts`

This script creates all consulting products in Stripe if they don't exist.

---

### Task 11: Add Consulting Webhook Handler

**Files:**
- Modify: `apps/api/src/billing/webhook.controller.ts`

Add handler for consulting one-time payments to:
- Create ConsultingEngagement on successful payment
- Set tenant consultingStatus to ACTIVE
- Populate totalHours and packageExpirationDate

---

## Deployment Checklist

### Pre-Deploy
- [ ] Verify all schema changes pushed to RDS
- [ ] Verify Prisma client regenerated
- [ ] Verify all new API endpoints tested locally
- [ ] Verify Support Admin Consulting tab renders

### Deploy Backend
```bash
# Build and push to ECR
cd /Users/jonathanwhite/dev/zander-saas
docker build --no-cache -f Dockerfile.api -t 288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api:v57 .
docker tag 288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api:v57 288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api:latest
docker push 288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api:v57
docker push 288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api:latest

# Force ECS deployment
aws ecs update-service --cluster zander-cluster --service zander-api-service --force-new-deployment
```

### Deploy Frontend
Frontend auto-deploys via Vercel on push to master.

### Post-Deploy Verification
```bash
# Health check
curl https://api.zanderos.com/health

# Verify app loads
curl -s "https://app.zanderos.com" -o /dev/null -w "HTTP Status: %{http_code}\n"

# Verify store page loads
curl -s "https://zanderos.com/store" -o /dev/null -w "HTTP Status: %{http_code}\n"
```

---

## Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 5A - Digital Store | Tasks 1-4 | Pending |
| 5B - Schema + Backend | Tasks 5-7 | Pending |
| 5B - Support Admin | Task 8 | Pending |
| 5C - Business Analysis | Task 9 | Pending |
| 5E - Billing Integration | Tasks 10-11 | Pending |

**Total estimated tasks:** 11 major tasks with multiple steps each

---

Plan complete and saved to `docs/plans/2026-04-16-consulting-module-phase5.md`.

**Two execution options:**

1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

2. **Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
