# Session Log — Zander Platform

Use this file to record session handoffs and major changes.

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
