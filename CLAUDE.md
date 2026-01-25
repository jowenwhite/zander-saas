# CLAUDE.md - Zander Development Guide

> **Owner:** Jonathan White
> **Company:** 64 West Holdings LLC
> **Last Updated:** January 25, 2026

---

## Project Overview

**Zander** is an AI-powered business operating system SaaS platform providing "7 AI Executives" (CRO, CFO, COO, CMO, CPO, CIO, EA) to help small business owners escape software chaos and run their businesses more effectively.

**My Cabinet Factory (MCF)** is the flagship tenant — a 32-year custom cabinet manufacturing company with 24 employees. Zander was born from MCFOS, the internal operating system built for MCF.

### Vision
Create unified business operating systems that help small business owners reclaim their passion for their core business by eliminating manual processes, reducing errors, and providing AI-powered guidance.

### Core Values
- **Simplicity Over Complexity** — Simple and robust beats feature-heavy
- **Execution Beats Perfection** — Ship working software, iterate
- **Empowerment Through Ownership** — Users control their data and processes
- **Relentless Resourcefulness** — Solve real problems with available tools

---

## Tech Stack

### Frontend
- **Framework:** Next.js 15.x (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Inline CSS (CMO module)
- **Icons:** Lucide React
- **State:** React hooks, localStorage for client state
- **Deployment:** Vercel → app.zanderos.com

### Backend
- **Framework:** NestJS
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL (AWS RDS in production)
- **Deployment:** AWS ECS → api.zanderos.com

### Infrastructure
- **Cloud:** AWS (ECS, RDS, ECR, S3, Route53)
- **S3 Bucket:** zander-assets
- **DNS:** Cloudflare
- **Email:** Resend API
- **SMS:** Twilio
- **Payments:** Stripe
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)

### Repository Structure
```
zander-saas/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/                # App router pages
│   │   │   ├── (auth)/         # Auth pages
│   │   │   ├── (dashboard)/    # Main app pages
│   │   │   ├── cmo/            # CMO module (COMPLETE)
│   │   │   ├── cro/            # CRO module (complete)
│   │   │   └── api/            # API routes
│   │   ├── components/         # React components
│   │   └── lib/                # Utilities
│   └── api/                    # NestJS backend
│       └── src/
│           ├── admin/          # Admin endpoints (seed, etc.)
│           ├── auth/           # Authentication
│           ├── billing/        # Stripe integration
│           ├── cmo/            # CMO module (COMPLETE)
│           ├── cro/            # CRO module
│           ├── email/          # Resend integration
│           └── prisma/         # Database service
├── packages/
│   └── database/               # Shared Prisma schema
│       └── prisma/
│           ├── schema.prisma   # Database schema
│           └── seed-marketing.ts # Marketing seed script
└── CLAUDE.md                   # This file
```

---

## Production URLs

| Service | URL |
|---------|-----|
| Frontend | https://app.zanderos.com |
| API | https://api.zanderos.com |
| CMO Module | https://app.zanderos.com/cmo |

---

## Module Status

| Module | Status | Notes |
|--------|--------|-------|
| **CRO** | 97% Complete | Sales pipeline, contacts, deals, automation templates |
| **CMO** | **100% Complete** | All 12 phases done, deployed to production |
| **CFO** | Not Started | — |
| **COO** | Not Started | — |
| **CPO** | Not Started | — |
| **CIO** | Not Started | — |
| **EA** | Not Started | — |

### CRO Module (Reference)
- Location: `apps/web/app/cro/`
- Features: Pipeline kanban, contact management, deal tracking, The Treasury (templates), Schedule calendar
- Use as pattern for other modules

### CMO Module (COMPLETE - Deployed to Production)
- Frontend: `apps/web/app/cmo/`
- Backend: `apps/api/src/cmo/`
- Spec: `/docs/Zander_CMO_Specification_v1.md`

**CMO 5 Pillars Structure:**
1. MARKETING: Dashboard, Projects, People, Products
2. PROCESS: Communication, Schedule, Marketing Calendar, Forms, Ask Don
3. AUTOMATION: Workflows, Funnels
4. INSIGHTS: Analytics, Personas
5. ASSETS: Brand Library, Templates

**CMO Build Phases (ALL COMPLETE):**
- [x] Phase 1: Foundation & Database
- [x] Phase 2: Frontend Foundation (Layout, Sidebar, Components)
- [x] Phase 3: Dashboard Page
- [x] Phase 4: Marketing Calendar
- [x] Phase 5: Funnels Module
- [x] Phase 6: Workflows Module
- [x] Phase 7: Ask Don AI (Claude API integration)
- [x] Phase 8: Brand Assets
- [x] Phase 9: Email Template Builder (drag-drop editor)
- [x] Phase 10: Persona Testing (Claude API for content evaluation)
- [x] Phase 11: Sidebar Navigation Fixes
- [x] Phase 12: Seed Marketing Data (64 West Holdings)

**CMO API Endpoints:**
- `/cmo/dashboard` - Dashboard stats
- `/cmo/calendar` - Marketing calendar events
- `/cmo/funnels` - Funnel management with stages
- `/cmo/workflows` - Workflow automation
- `/cmo/personas` - Customer personas + testing
- `/cmo/brand` - Brand profile management
- `/cmo/templates` - Email template CRUD
- `/cmo/ai/ask-don` - Claude AI integration

---

## Development Workflow

### Golden Rules

1. **Never manually edit files** — Use `sed`, `grep`, or Node.js scripts
2. **Verify before changing** — Always `grep -n` to find exact line numbers first
3. **One command at a time** — Unless commands are safely batchable
4. **Commit after every milestone** — Not at the end of session, after each working feature
5. **Test on both environments** — localhost AND production
6. **Preserve working systems** — Never break what's already deployed

### Command Patterns

**Finding code:**
```bash
# Find text with line numbers
grep -n "searchTerm" path/to/file.ts

# Find across multiple files
grep -rn "searchTerm" apps/web/app/

# Show context around match
grep -n -A 3 -B 3 "searchTerm" path/to/file.ts
```

**Editing code:**
```bash
# Replace text (macOS)
sed -i '' 's/oldText/newText/g' path/to/file.ts

# Replace with special characters - use different delimiter
sed -i '' 's|/old/path|/new/path|g' path/to/file.ts

# Multi-line or complex edits - use Node.js script
node -e "
const fs = require('fs');
let content = fs.readFileSync('path/to/file.ts', 'utf8');
content = content.replace(/pattern/g, 'replacement');
fs.writeFileSync('path/to/file.ts', content);
"
```

**Git workflow:**
```bash
# After each milestone
git add -A && git commit -m "descriptive message" && git push

# Check status
git status && git log --oneline -3
```

**Build and test:**
```bash
# Frontend
cd apps/web && npm run build 2>&1 | grep -E "error|Error" | head -20

# Backend
cd apps/api && npm run build 2>&1 | grep -E "error|Error" | head -20

# Type check without building
cd apps/api && npx tsc --noEmit
cd apps/web && npx tsc --noEmit

# Run dev servers
cd apps/web && npm run dev  # Port 3002
cd apps/api && npm run start:dev  # Port 8080
```

**Database:**
```bash
# Generate Prisma client after schema changes
cd packages/database && npx prisma generate

# Push schema changes (dev)
cd packages/database && npx prisma db push

# Create migration
cd packages/database && npx prisma migrate dev --name migration_name

# View database
cd packages/database && npx prisma studio

# Run marketing seed (local)
cd packages/database && npm run seed:marketing

# Backup (always before major changes)
pg_dump -U zander_app -h localhost zander_dev > ~/Desktop/zander_backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## Deployment

### Frontend (Vercel - Automatic)
Push to main branch → Vercel auto-deploys to app.zanderos.com

### Backend (AWS ECS - Manual)

**Full deployment process:**
```bash
# 1. Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 288720721534.dkr.ecr.us-east-1.amazonaws.com

# 2. Build Docker image (from repo root)
cd /Users/jonathanwhite/dev/zander-saas
docker build -f Dockerfile.api -t zander-api:latest .

# 3. Tag and push to ECR
docker tag zander-api:latest 288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api:v6
docker push 288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api:v6

# 4. Update ECS task definition (if env vars changed)
# - Get current: aws ecs describe-task-definition --task-definition zander-api
# - Modify JSON, register new revision
# - aws ecs register-task-definition --cli-input-json file://task-def.json

# 5. Update ECS service
aws ecs update-service \
  --cluster zander-cluster \
  --service zander-api-service \
  --task-definition zander-api:17 \
  --force-new-deployment

# 6. Monitor deployment
aws ecs describe-services --cluster zander-cluster --services zander-api-service \
  --query 'services[0].deployments' --output table
```

**Run marketing seed on production:**
```bash
curl -X POST https://api.zanderos.com/admin/seed-marketing \
  -H "x-admin-secret: 1a10d78ea77ff45e4cc49d415fd506a62bc6613597f9e1722848777f34982021"
```

### AWS Resources
- **Account:** 288720721534
- **ECS Cluster:** zander-cluster
- **ECS Service:** zander-api-service
- **ECR:** 288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api
- **RDS:** zander-prod-db.cavkq4gew6zt.us-east-1.rds.amazonaws.com
- **S3:** zander-assets

---

## UI/UX Standards

### Zander Executive Structure (Mandatory)
All 7 executives follow identical layout:
- **Top Nav:** Executive tabs (CRO|CFO|COO|CMO|CPO|CIO|EA), HQ button, user profile
- **Left Sidebar:** 5 Pillars with consistent naming
- **Bottom Right:** Red robot circle for executive switching (Don AI)

### Design Tokens
```css
/* Colors */
--zander-red: #BF0A30;
--zander-navy: #0C2340;
--zander-gold: #F0B323;
--zander-blue: #005687;
--zander-orange: #F57C00;  /* CMO accent color */

/* Typography */
font-family: 'Inter', sans-serif;

/* Spacing - 4px base */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
```

### Component Patterns
- Use Lucide React for icons
- Cards with consistent border-radius (8px or 12px)
- Buttons: Primary (orange for CMO), Secondary (navy), Ghost (transparent)
- Forms: Label above input, error states in red
- Tables: Sticky headers, hover states, pagination

---

## API Patterns

### Endpoint Structure
```
/{module}/{resource}
/cmo/campaigns
/cmo/campaigns/:id
/cmo/calendar/events
/admin/seed-marketing
```

### Response Format
```typescript
// Success
{
  data: T | T[],
  meta?: { total, page, limit, totalPages }
}

// Error
{
  statusCode: number,
  message: string,
  error: string
}
```

### Auth
- JWT tokens in Authorization header
- TenantId extracted from token
- UserId extracted from token
- Admin endpoints use `x-admin-secret` header

---

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8080  # or https://api.zanderos.com
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
RESEND_API_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
ANTHROPIC_API_KEY=...
S3_BUCKET_NAME=zander-assets
ADMIN_SECRET_KEY=1a10d78ea77ff45e4cc49d415fd506a62bc6613597f9e1722848777f34982021
```

---

## Common Pitfalls (Learn from Our Mistakes)

### TypeScript
- **NEVER use `any`** — Define proper types
- **Prefer `type` over `interface`** — More flexible
- **NEVER use `enum`** — Use string literal unions instead
- **Always handle null/undefined** — Use optional chaining

### Prisma
- **Always run `prisma generate`** after schema changes
- **Use transactions** for multi-table operations
- **Include relations explicitly** — They don't auto-load
- **Schema location:** `packages/database/prisma/schema.prisma`

### Next.js
- **'use client'** directive required for hooks, event handlers
- **API routes** go in `app/api/` with `route.ts` files
- **Dynamic routes** use `[param]` folder naming

### CMO Module Patterns
- Uses inline CSS with `CSSProperties` type (not Tailwind)
- Claude API: raw fetch to `api.anthropic.com`, model `claude-sonnet-4-20250514`
- Button component uses `fullWidth` prop, not `style={{ width: '100%' }}`

### Deployment
- **Frontend:** Push to main → Vercel auto-deploys
- **Backend:** Build Docker image → Push to ECR → Update ECS task
- **Database:** Schema changes auto-apply via `prisma db push` in Dockerfile CMD

---

## Session Protocol

### Starting a Session
1. Check git status: `git status && git log --oneline -3`
2. Verify servers running (if needed)
3. Review current task from this file or handoff doc

### During Session
1. Make changes using sed/grep/node scripts
2. Test changes locally
3. Commit after each working milestone
4. Push to remote

### Ending a Session
1. Ensure all changes committed and pushed
2. Run database backup if schema changed
3. Update this CLAUDE.md with:
   - What was completed
   - Current state
   - Next steps
4. Note any blockers or decisions needed

---

## Key Contacts & Resources

- **Production Frontend:** https://app.zanderos.com
- **Production API:** https://api.zanderos.com
- **GitHub:** github.com/jowenwhite/zander-saas
- **AWS Console:** (Jonathan's account - 288720721534)
- **Stripe Dashboard:** dashboard.stripe.com
- **Resend Dashboard:** resend.com/emails

---

## Current Priority

**Testing CMO Module & Bug Fixes**

The CMO module is deployed to production. Current focus:
1. Test all CMO features on production (app.zanderos.com/cmo)
2. Fix any bugs discovered during testing
3. Gather user feedback

**Next Major Task: Client → Projects Data Model for MCFOS**

After CMO stabilization, the next priority is updating the data model to support:
- Client entities (companies/organizations)
- Projects linked to clients
- Better organization for My Cabinet Factory operations

---

## Seeded Data (64 West Holdings)

The production database includes seeded marketing data for 64 West Holdings:
- **6 Campaigns** (2 each for zander, finance, consulting business units)
- **3 Funnels** with stages (Zander SaaS, Finance Loan, Consulting Engagement)
- **4 Personas** (Sam Martinez, Regional Developer, Growing Founder, Multi-Service Prospect)
- **Monthly Theme** for current month
- **8 Calendar Events** (marketing tasks and meetings)

---

*This file is checked into git. Update it whenever Claude does something incorrectly so it learns for next time.*
