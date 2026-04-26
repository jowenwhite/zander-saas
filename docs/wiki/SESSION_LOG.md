# Session Log — Zander Platform

Use this file to record session handoffs and major changes.

---

## 2026-04-21 — CMO Email Template Blank Email Fix

**Problem:**
CMO "Send Test Email" feature was sending blank emails. Email arrived (from noreply@zanderos.com) but body was completely empty — no visible content.

**Root Cause:**
Production templates stored body in legacy `{html, text}` format:
```json
{"html": "Hi {{first_name}}...", "text": "Hi..."}
```

But `generateEmailHtml()` expected block-based format:
```json
{"version": "1.0", "settings": {...}, "blocks": [...]}
```

When `template.blocks` was undefined, it fell back to empty array → blank email wrapper generated with zero content.

**Fix:**
Updated `apps/api/src/cmo/templates/html-generator.ts` to detect and handle both formats:
1. Block-based (visual editor): render blocks as before
2. Legacy {html,text}: wrap html content directly in standard email container
3. Empty: log warning, return empty email

**Testing:**
1. Local test script confirmed fix generates correct HTML
2. Local email sent via Resend to jowenwhite4@gmail.com — arrived with visible content
3. Production deployment verified via CloudWatch logs

**Deployment:**
- Commit: 2d2032f
- Docker: v81
- ECS Task Definition: zander-api:67
- CloudWatch confirmed: `[html-generator] Using legacy html/text format, html length: 1123`

---

## 2026-04-19 — Email Template Fix: Gmail/Outlook Width Compatibility

**What Shipped:**

1. **Base Layout Template System**
   - Created `apps/api/src/email/templates/base-layout.ts`
   - Uses HTML `width="600"` attribute instead of CSS max-width (Gmail/Outlook strip CSS max-width on divs)
   - MSO conditionals for Outlook compatibility
   - Reusable helpers: `wrapInBaseLayout()`, `createSectionHeader()`, `createParagraph()`, `createHeadline()`
   - Consistent branding: dark background #0D1117, cyan accents #00D4FF

2. **Refactored Beta Welcome Email**
   - `apps/api/src/email/templates/beta-welcome.ts` now uses base layout
   - Body content only — no inline layout HTML
   - Preheader text support for email previews

**Technical Details:**
- HTML table with `width="600"` attribute is reliable across all email clients
- 40px side padding = 520px content area
- MSO conditional comments for Outlook rendering

**Deployment:**
- Commit: 120fc92
- ECS: zander-api:64 (v71 image)
- Test email sent to jonathan@zanderos.com

---

## 2026-04-18 — Phase 5B Consulting Lead Pipeline (Deployment Verified)

**What Shipped:**

1. **Consulting Lead Pipeline Models (B1)**
   - `ConsultingLead` — Full lead lifecycle tracking (NEW → MEETING_SCHEDULED → WON/LOST)
   - `ConsultingProposal` — Proposal management with status tracking
   - `SignedDocument` — E-signature audit trail with signer IP/timestamp
   - `ConsultingEvent` — Activity logging for Zander briefings
   - New enums: LeadSource, LeadStatus, ProposalStatus, DocumentType, ConsultingEventType

2. **API Controllers (B2-B4)**
   - `ConsultingLeadController` — Full CRUD + convert-to-engagement endpoint
   - `ConsultingDocumentController` — Document creation and e-signature capture
   - `ConsultingEventController` — Event logging + stats for dashboard

3. **Pipeline Wiring (B5)**
   - Inquiry form now creates ConsultingLead + logs INQUIRY_RECEIVED event
   - Calendly webhook updates lead status to MEETING_SCHEDULED + logs event
   - Existing leads updated (deduplication by email)

**New API Endpoints:**
| Endpoint | Description |
|----------|-------------|
| `POST /consulting/leads` | Create new lead |
| `GET /consulting/leads` | List leads (filter by status/source) |
| `GET /consulting/leads/:id` | Get lead details |
| `PATCH /consulting/leads/:id` | Update lead |
| `POST /consulting/leads/:id/convert` | Convert to engagement |
| `POST /consulting/documents` | Create document |
| `GET /consulting/documents` | List documents |
| `PATCH /consulting/documents/:id/sign` | Record signature |
| `GET /consulting/events` | List events |
| `GET /consulting/events/recent` | Recent events for Zander briefing |
| `GET /consulting/events/stats` | Dashboard stats |

**Files Changed:**
- `packages/database/prisma/schema.prisma` — New models and enums
- NEW: `apps/api/src/consulting/dto/create-lead.dto.ts`
- NEW: `apps/api/src/consulting/dto/create-document.dto.ts`
- NEW: `apps/api/src/consulting/dto/create-event.dto.ts`
- NEW: `apps/api/src/consulting/consulting-lead.controller.ts`
- NEW: `apps/api/src/consulting/consulting-document.controller.ts`
- NEW: `apps/api/src/consulting/consulting-event.controller.ts`
- `apps/api/src/consulting/consulting-inquiry.controller.ts` — Lead creation
- `apps/api/src/webhooks/calendly-webhook.controller.ts` — Lead status updates
- `apps/api/src/consulting/consulting.module.ts` — Controller registration
- `apps/api/src/webhooks/webhooks.module.ts` — PrismaModule import

**Deployment:**
- Docker image: `v63`
- ECS task definition: revision `58`
- Deployment: COMPLETED ✅
- All endpoints verified (401 Unauthorized = correct, auth required)
- Public inquiry tested: creates lead + event successfully

**Commit:** `c8aa5de feat(consulting): add ConsultingLead, SignedDocument, ConsultingEvent models and APIs`

---

## 2026-04-17 — Phase 5F Premium PDF Generation + Download Flow

**What Shipped:**

1. **Premium PDF Generation System**
   - Created Puppeteer-based PDF generator with McKinsey/Bain quality styling
   - Generated 6 premium branded PDFs from markdown content:
     - operations-playbook.pdf (680 KB)
     - startup-foundations-kit.pdf (712 KB)
     - sales-marketing-kit.pdf (703 KB)
     - hiring-team-building-kit.pdf (706 KB)
     - financial-clarity-kit.pdf (651 KB)
     - industry-pack-construction.pdf (660 KB)
   - Premium design features: Dark cover pages (#0A0A0F), cyan accents (#00D4FF), styled TOC, section dividers, back covers with CTA

2. **Download Endpoint Wired**
   - Updated `/api/store/download` to serve local PDFs
   - Stripe price IDs mapped to PDF filenames
   - Success page integration complete

3. **PDF Generation Infrastructure**
   - Created `scripts/generate-pdfs/generate-pdfs.js` - Main generation script
   - Created `scripts/generate-pdfs/styles.css` - Premium CSS styling
   - Output: `apps/web/public/downloads/`

**Files Changed:**
- NEW: `scripts/generate-pdfs/generate-pdfs.js`
- NEW: `scripts/generate-pdfs/styles.css`
- NEW: `apps/web/public/downloads/*.pdf` (6 files)
- `apps/web/app/api/store/download/route.ts` — Wired to local PDFs
- `docs/digital-products/README.md` — Updated status

**Stripe Price ID → PDF Mapping:**
| Price ID | Product | Filename |
|----------|---------|----------|
| price_1TN9EjCryiiyM4ce1JuVPzP7 | Operations Playbook | operations-playbook.pdf |
| price_1TN9KECryiiyM4ce4GUDL3G0 | Startup Foundations Kit | startup-foundations-kit.pdf |
| price_1TN9LdCryiiyM4cedyseEGCe | Sales and Marketing Kit | sales-marketing-kit.pdf |
| price_1TN9NfCryiiyM4ceJhjP9acm | Hiring and Team Building Kit | hiring-team-building-kit.pdf |
| price_1TN9OeCryiiyM4ceegNAxeI5 | Financial Clarity Kit | financial-clarity-kit.pdf |
| price_1TN9PrCryiiyM4cetv9u1wIM | Industry Starter Pack | industry-pack-construction.pdf |

**Dependencies Added:**
- puppeteer (dev)
- marked (dev)

**To Regenerate PDFs:**
```bash
node scripts/generate-pdfs/generate-pdfs.js
```

**Next Steps:**
1. Test end-to-end purchase flow with test Stripe card
2. Deploy to production (Vercel)
3. Optional: Move PDFs to S3/CDN for better delivery

---

## 2026-04-17 — Phase 5E Digital Products + Branding Audit

**What Shipped:**

1. **Branding Audit (Phase 5 Files)**
   - Audited all Phase 5 files for incorrect brand colors
   - Fixed old gold (#F0B429) → violet (#7C3AED) in:
     - `apps/web/app/components/Sidebar.tsx` — Lock icon color
     - `apps/web/app/components/UpgradeModal.tsx` — Lock badge and accent colors
     - `docs/digital-products/README.md` — Color palette documentation
   - Verified Scorecard.tsx and ScorecardComparison.tsx use correct colors
   - Verified store pages use correct Zander brand colors

2. **Digital Products Content (Complete)**
   - Created full content for all 6 digital products (~22,000 words total)
   - Each product has 8-12 pages of professional business content
   - Content ready for PDF conversion

   **Products Created:**
   | Product | File | Content Summary |
   |---------|------|-----------------|
   | Operations Playbook ($79) | operations-playbook.md | Daily/weekly/monthly frameworks, SOPs, metrics |
   | Startup Foundations Kit ($99) | startup-foundations-kit.md | Business plans, legal, financials, go-to-market |
   | Sales & Marketing Kit ($99) | sales-marketing-kit.md | Email sequences, social calendar, lead scoring, scripts |
   | Hiring & Team Building Kit ($99) | hiring-team-building-kit.md | Job descriptions, interviews, onboarding, performance |
   | Financial Clarity Kit ($79) | financial-clarity-kit.md | Cash flow, budgeting, pricing, dashboards |
   | Industry Pack (Construction) ($149) | industry-pack-construction.md | Estimating, project mgmt, safety, subs, growth |

3. **Consulting Client Guide**
   - Created `docs/wiki/CONSULTING_CLIENT_GUIDE.md`
   - 8-section comprehensive guide for consulting clients
   - Covers HQ access, packages, scorecard, deliverables, FAQ

**Files Changed:**
- `apps/web/app/components/Sidebar.tsx` — Branding fix (#F0B429 → #7C3AED)
- `apps/web/app/components/UpgradeModal.tsx` — Branding fix (3 locations)
- `docs/digital-products/README.md` — Updated palette, added content section
- NEW: `docs/digital-products/content/operations-playbook.md`
- NEW: `docs/digital-products/content/startup-foundations-kit.md`
- NEW: `docs/digital-products/content/sales-marketing-kit.md`
- NEW: `docs/digital-products/content/hiring-team-building-kit.md`
- NEW: `docs/digital-products/content/financial-clarity-kit.md`
- NEW: `docs/digital-products/content/industry-pack-construction.md`
- NEW: `docs/wiki/CONSULTING_CLIENT_GUIDE.md`

**Commits:**
- 761ec48 — fix(branding): replace old gold #F0B429 with violet #7C3AED
- b7f7dd8 — feat(store): add complete content for 6 digital products
- eab0a84 — docs: add consulting client user guide

**Correct Brand Colors (Reference):**
- Primary Cyan: #00CCEE / #00D4FF
- Dark Background: #0A0A0F / #09090F / #1C1C26
- Violet Accent: #7C3AED (sparingly)
- Success Green: #22C55E / #10B981
- Warning Amber: #F59E0B
- Text Light: #F0F0F5
- Text Muted: #8888A0

**Next Steps:**
1. Convert markdown content to branded PDFs (Pandoc/Canva)
2. Upload PDFs to S3 bucket `zander-digital-products`
3. Set `placeholder: false` in download route
4. Test end-to-end purchase and download flow

---

## 2026-04-16 — Phase 4 Marketing Execution (Session 2)

**What Shipped:**

1. **Phase 4B: Social Media Integration Architecture**
   - Added Prisma models: SocialAccount, SocialPost, SocialEngagement, DesignAsset
   - Created SocialMediaService with platform adapters (LinkedIn, Facebook, Instagram, Twitter, YouTube, TikTok)
   - Created DesignService with Canva and Adobe adapter scaffolds
   - Added 6 social media tools to Don: schedule_social_post, draft_social_reply, get_social_analytics, connect_social_account, get_pending_engagements, get_social_posts
   - Added 3 design tools to Don: create_design_asset, get_brand_assets, generate_social_graphic
   - Implemented social media agent escalation rules (auto-execute vs L3 draft vs escalate)
   - Added CRITICAL tool execution mandate to Don's system prompt

2. **Phase 4C: Marketing Content Build-Out**
   - Created seed-phase4c-marketing.ts with comprehensive marketing content
   - Seeded 5 additional campaigns (total 11): Thought Leadership, CFO Office Hours, Case Studies, Workshops, Referral Program
   - Seeded 10 email templates: Welcome, Discovery Follow-up, Proposal, Webinar series, Newsletter, Case Study, Re-engagement, Referral
   - Seeded 22 additional calendar events (total 30-day calendar)
   - Seeded 10 social post drafts across LinkedIn, Facebook, Instagram, Twitter

3. **Phase 4D: Integration Roadmap**
   - Created docs/wiki/INTEGRATION_ROADMAP.md
   - Documented all scaffolded integrations: social platforms, Canva, Adobe CC, AI image generation
   - Added priority matrix and implementation requirements
   - Documented OAuth callback routes needed

4. **Phase 4E: Backup Verification**
   - Confirmed RDS backup: 7-day retention, daily snapshots running
   - Latest restorable: 2026-04-16T09:44:30 UTC

**Files Changed:**
- `apps/api/src/cmo/cmo.module.ts` — Added SocialModule, DesignModule
- `apps/web/app/api/cmo/don/route.ts` — 9 new tools, escalation rules, execution mandate
- `packages/database/prisma/schema.prisma` — 4 new models
- NEW: `apps/api/src/cmo/social/social.module.ts`
- NEW: `apps/api/src/cmo/social/social.service.ts`
- NEW: `apps/api/src/cmo/design/design.module.ts`
- NEW: `apps/api/src/cmo/design/design.service.ts`
- NEW: `packages/database/prisma/seed-phase4c-marketing.ts`
- NEW: `docs/wiki/INTEGRATION_ROADMAP.md`

**Commits:**
- 3498487 — Phase 4B social media architecture
- 43798d4 — Phase 4C/D marketing content and roadmap

**Next Priorities:**
- LinkedIn OAuth implementation (P1)
- Facebook/Instagram OAuth (P2)
- AI image generation integration (P2)
- Production email service configuration (P3)

---

## 2026-04-16 — Phase 3 Support Admin Complete

**What Shipped:**

1. **3A: Tenant CRUD**
   - Create Tenant dialog: company name, auto-subdomain, starting tier
   - Backend: POST /admin/tenants endpoint with subdomain uniqueness check
   - Added createTenant to useTenants hook

2. **3B: Tier & Trial Management UI**
   - Token usage column in Tenants table (with reset button)
   - Token Reset dialog with reason/note
   - Backend: Enhanced resetTenantTokens updates monthlyTokensUsed + logs activity
   - Tenant list now returns monthlyTokensUsed, tokenResetDate

3. **3C: User Management Tab**
   - New UserManagementTab replaces engagement-focused UsersTab
   - Lists all users across tenants with search, filter by tenant/role
   - Edit modal to reassign user to different tenant or change role
   - Backend: GET /admin/all-users, PATCH /admin/users/:id endpoints
   - useAllUsers hook with pagination

**Files Changed:**
- `apps/api/src/admin/admin.controller.ts` — New endpoints for tenants, users
- `apps/api/src/admin/admin.service.ts` — createTenant, getAllUsers, updateUser, enhanced listTenants
- `apps/web/app/admin/support-admin/page.tsx` — Swapped UserManagementTab for UsersTab
- `apps/web/app/admin/support-admin/components/TenantsTab.tsx` — Create button, token column
- `apps/web/app/admin/support-admin/hooks/useTenants.ts` — createTenant, resetTokens
- NEW: `apps/web/app/admin/support-admin/components/CreateTenantDialog.tsx`
- NEW: `apps/web/app/admin/support-admin/components/TokenResetDialog.tsx`
- NEW: `apps/web/app/admin/support-admin/components/UserManagementTab.tsx`
- NEW: `apps/web/app/admin/support-admin/hooks/useAllUsers.ts`

**Commit:** 9b35a1d

---

## 2026-04-16 — Bug Fixes + Activity Feed Tab

**What Shipped:**
1. **Bug Fix: Bulk Mark-Read** — Changed HTTP method from PUT to PATCH in Pam route
2. **Activity Feed Tab** — New Support Admin tab showing cross-tenant platform activity
   - Backend: GET /admin/activity-feed endpoint
   - Frontend: ActivityFeedTab component + useActivityFeed hook
   - Shows: signups, tier changes, token spikes, errors, Zander actions
   - Filterable by event type and time range
3. **64 West Cleanup** — Archived 64 West Consulting and Finance tenants

**Files Changed:**
- `apps/api/src/admin/admin.controller.ts` — Added activity-feed endpoint
- `apps/api/src/admin/admin.service.ts` — Added getActivityFeed method
- `apps/web/app/api/ea/pam/route.ts` — Fixed mark-read HTTP method
- `apps/web/app/admin/support-admin/page.tsx` — Added activity tab
- NEW: `apps/web/app/admin/support-admin/components/ActivityFeedTab.tsx`
- NEW: `apps/web/app/admin/support-admin/hooks/useActivityFeed.ts`

**Bug Investigation:**
- Calendar booking tenant identity issue — Implementation is correct. Events use tenant from JWT, Google Calendar syncs to user's primary calendar.

**Commit:** 5dfb102

---

## 2026-04-14 — Wiki Restructure

**Changes:**
- Created docs/wiki/ directory structure
- Moved CLAUDE.md content to searchable wiki files:
  - EXECUTIVES.md — AI executive framework and tools
  - DEPLOYMENT.md — Docker, ECS, Vercel deployment
  - TIERS.md — Subscription and pricing
  - TENANTS.md — Multi-tenant management
  - BUGS_AND_FIXES.md — Known issues and solutions
  - BUSINESS.md — Business context and strategy
  - TESTING.md — Test protocols and credentials
  - MCFOS.md — Separate MCF operations platform
  - ARCHITECTURE.md — System architecture
  - SESSION_LOG.md — This file
- Updated CLAUDE.md to lightweight index

**Status:** All wiki files created

---

## 2026-03-29 — v35 Deployment

**What Shipped:**
1. Email Signatures Module: Full CRUD API, UI integration
2. ScheduledCommunication: contactId nullable, recipientEmail/Name for ad-hoc
3. Pam (EA): compose_email tool, draft routing clarification
4. Google Auth: Signed state parameter, calendar scope improvements

**Deployment:**
- ECS: zander-cluster/zander-api-service running task definition zander-api:41
- ECR: 288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api:v35
- Commit: 01addac

**Bug Fixes:**
- Calendar Identity: FIXED
- Draft Routing: FIXED
- Bulk Mark-Read: PENDING

---

## Template for New Entries

```markdown
## YYYY-MM-DD — Session Title

**Changes:**
- List of changes made

**Deployment:**
- Version deployed (if any)
- Commit hash

**Bug Fixes:**
- Issues resolved

**Known Issues:**
- Outstanding problems

**Next Priorities:**
- What to work on next
```

---

## 2026-04-16 — Phase 5 Consulting Module (Session 3)

**What Shipped:**

1. **Phase 5A: Digital Store**
   - Created /store page with 6 digital products
   - Stripe checkout integration
   - Success page with download link
   - All products live with real Stripe price IDs

2. **Phase 5B: Consulting Backend**
   - ConsultingModule (NestJS) with DTOs, Service, Controller
   - ConsultingEngagement, ConsultingTimeEntry, ConsultingDeliverable models
   - ConsultingIntake model for intake surveys
   - Prisma schema updated and synced to RDS
   - CONSULTING tier added with 0 AI token cap

3. **Phase 5C: Support Admin Integration**
   - ConsultingTab component with engagement management
   - Time entry logging with category tracking
   - Deliverable management interface
   - ConsultingIntakeSurvey component
   - useConsulting hook for API interactions

4. **Phase 5D: Billing Integration**
   - Webhook handlers for consulting one-time payments
   - Webhook handlers for digital store purchases
   - Auto-create ConsultingEngagement on successful payment
   - Welcome and admin notification emails

5. **Stripe Products Created:**
   - Consulting: Business Analysis ($500), Compass ($2,500), Foundation ($4,500), Blueprint ($8,000), Extension ($250)
   - Store: Operations Playbook ($79), Startup Foundations ($99), Sales/Marketing ($99), Hiring/Team ($99), Financial Clarity ($79), Industry Starter ($149)

**Version Numbers:**
- API Docker Image: v56
- Git Commit: 3fb6983
- Prisma: 5.22.0
- Stripe: 17.7.0

**Files Changed:**
- NEW: `apps/api/src/consulting/` (entire module)
- `apps/api/src/billing/webhook.controller.ts` — consulting/store handlers
- `apps/api/src/app.module.ts` — import ConsultingModule
- NEW: `apps/web/app/admin/support-admin/components/ConsultingTab.tsx`
- NEW: `apps/web/app/admin/support-admin/components/ConsultingIntakeSurvey.tsx`
- NEW: `apps/web/app/admin/support-admin/hooks/useConsulting.ts`
- `apps/web/app/admin/support-admin/page.tsx` — consulting tab
- `apps/web/app/store/page.tsx` — live price IDs
- `packages/database/prisma/schema.prisma` — consulting models
- NEW: `scripts/create-consulting-stripe-products.ts`

**Commits:**
- ef0c2d3 — feat(consulting): complete Phase 5 consulting module implementation
- 3fb6983 — feat: Phase 5 consulting module complete — store, tier, admin, intake, billing

**Deployment:**
- ECS: zander-api-service deployed v56
- Health check: OK
- App: 200 OK
- Store: 200 OK

**Outstanding:**
- Digital product download files need upload
- Consulting Stripe webhook endpoint registration
- Client-facing HQ consulting dashboard
- Public intake survey form

**Next Session Priorities:**
1. Test end-to-end consulting purchase flow
2. Test digital store purchase/download flow
3. Build client-facing consulting HQ view
4. Add public intake survey
5. Create actual downloadable store content


---

## 2026-04-16 — Phase 5 Hours Fix (Session 3 Addendum)

**Quick Fix Applied:**

Corrected consulting package hours per PRD:
- Business Analysis: 3 hours (was 0)
- Compass: 10 hours (was 20)
- Foundation: 20 hours (was 40)
- Blueprint: 40 hours (was 80)
- Extension: 3-month time extension (was 10 hours)

Added `handlePackageExtension()` method for Extension purchases that adds 3 months to `packageExpirationDate` instead of creating a new engagement.

Updated Stripe product descriptions to reflect correct hours.

**Commit:** 6faba4d
**Docker Image:** v57
**Deployment:** ECS force deployed, health OK


---

## Session: 2026-04-25 — Microsoft Outlook OAuth Integration

### What Shipped (git: 0e969b0)
- **Microsoft Outlook OAuth** — tenant-scoped via `IntegrationConnection` (separate from user-scoped `auth/microsoft/`)
  - `apps/api/src/integrations/microsoft/microsoft-oauth.service.ts` — JWT-signed state, full OAuth flow
  - `apps/api/src/integrations/microsoft/microsoft-graph.service.ts` — Graph API wrapper (mail + calendar)
  - `apps/api/src/integrations/microsoft/microsoft-oauth.controller.ts` — GET /integrations/microsoft/auth, callback, status, disconnect
  - `apps/api/src/integrations/microsoft/microsoft.module.ts`
- **Email/Calendar Provider Abstraction** — `integrations/email-calendar/`
  - `EmailCalendarProviderService` routes sync/calendar operations to Microsoft or Google based on active connection
- **Provider-aware Gmail Controller** — `POST /gmail/sync` transparently routes to Outlook or Gmail; `GET /gmail/status` returns active provider + account
- **Calendar sync to Outlook** — CalendarEventsService syncs to Outlook Calendar on event creation when Microsoft is connected and Google is not
- **Integrations UI** — Microsoft Outlook card with:
  - GET redirect connect handler (JWT in query param, not POST)
  - Connected account email display from `metadata.email`
  - Mutual exclusion note for email providers
  - Disabled Connect button when another email provider is active
  - Success/error banners on OAuth return
- **Pam Executive Context** — `buildExecutiveAssistantContext` now includes active email provider + account email

### Local Test Results
- `GET /integrations/microsoft/auth?token=invalid` → 302 to `/settings/integrations?error=invalid_token` ✓
- `GET /integrations/microsoft/auth?token=<valid>` → 302 to `login.microsoftonline.com/...?client_id=b1ffa2d0...` ✓
- `GET /integrations/all` → 7 integrations including Microsoft Outlook (disconnected) ✓
- `GET /gmail/status` → `{connected: true, provider: 'google', email: 'jowenwhite4@gmail.com'}` ✓
- `GET /integrations/microsoft/status` → `{connected: false, email: null}` ✓

### Production DB
- `integration_connections` table already existed in prod RDS (from prior work) ✓

### Deploy Status
- **Task def JSON prepared:** `/tmp/new-task-def-v88.json` (25 env vars, image: v88, adds `MICROSOFT_INTEGRATION_CALLBACK_URL`)
- **Blocked on:** Docker Desktop not running — need manual start to build/push v88
- **Web deploy:** Auto-deployed to Vercel on git push ✓

### IMPORTANT: Azure AD Configuration Required
Before Microsoft OAuth will work in production, add these Redirect URIs to Azure app `b1ffa2d0-77c2-439a-9fbd-8517fefd01b0`:
- `https://api.zanderos.com/integrations/microsoft/callback` (production, tenant-scoped)
- `http://localhost:3001/integrations/microsoft/callback` (local dev)

(The existing `https://api.zanderos.com/auth/microsoft/callback` is for user-scoped auth and must remain.)

### Key Architecture Notes
- Two Microsoft OAuth flows coexist: `auth/microsoft/` (user-scoped, MicrosoftToken) and `integrations/microsoft/` (tenant-scoped, IntegrationConnection) — different purposes, different redirect URIs
- `sync_gmail_inbox` Pam tool unchanged — provider routing is transparent at the controller level
- Microsoft Calendar sync only fires if `isConnected(tenantId)=true` AND user has no GoogleToken — prevents double-sync

### Session 2 Additions (same date, post-deploy)
- **Credential fix:** Updated to correct Zander Azure AD app (`c7588ee7`, not MCFOS `b1ffa2d0`)
- **Deploy:** v88 image built and pushed; task def :75 registered with corrected env vars (MICROSOFT_CLIENT_ID, MICROSOFT_CALLBACK_URL, RESEND_WEBHOOK_SECRET, CANVA_CLIENT_ID, CANVA_CLIENT_SECRET); ECS service updated; health check confirmed ✓
- **Phase 2 verifications:** Conversation persistence (Pam + Don via sessionStorage) confirmed ✓; CMO dashboard all 3 endpoints 200 OK ✓
- **Bug fixes:** Removed `<style jsx>` from `apps/web/app/cmo/ai/page.tsx` (don-pulse, don-spin) and `apps/web/app/ea/page.tsx` (pam-pulse) — commit c7c29ff
- **Handoff doc:** `Microsoft_OAuth_Handoff_v88.docx` generated at repo root

---

## Session: 2026-04-26 — Fix Microsoft OAuth "jwt malformed" (v89)

**Commit**: `03459a1`
**Deploy**: v89 / task def zander-api:76
**Health**: `{"status":"ok"}`

### Problem
CloudWatch showed "jwt malformed" on every Microsoft OAuth callback. Two conflicting controllers were live simultaneously:
- **OLD** `MicrosoftAuthController` (`/auth/microsoft/`) — set raw userId as OAuth state
- **NEW** `MicrosoftOAuthController` (`/integrations/microsoft/`) — expected JWT-signed state

After `MICROSOFT_CALLBACK_URL` was updated to point at the new callback (`/integrations/microsoft/callback`), any OAuth flow initiated through the old controller arrived at the new callback with a raw userId as state. `jwt.verify(rawUserId, secret)` threw "jwt malformed".

### Fix
Removed `MicrosoftAuthController` from the `controllers` array in `microsoft-auth.module.ts`. One import removed, one array entry removed. `OutlookController`, `MicrosoftAuthService`, and `OutlookService` retained.

### Verified correct (no changes needed)
- Frontend already called `/integrations/microsoft/auth` (new controller) via `connectPath` from `/integrations/all`
- `MICROSOFT_CALLBACK_URL` already pointed to `/integrations/microsoft/callback`
- Status reads from `integrationConnection` table via `/integrations/all`
