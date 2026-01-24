# CLAUDE.md - Zander Development Guide

> **Owner:** Jonathan White  
> **Company:** 64 West Holdings LLC  
> **Last Updated:** January 24, 2026

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
- **Styling:** Tailwind CSS
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
- **Cloud:** AWS (ECS, RDS, ECR, Route53)
- **DNS:** Cloudflare
- **Email:** Resend API
- **SMS:** Twilio
- **Payments:** Stripe
- **AI:** Anthropic Claude API

### Repository Structure
```
zander-saas/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/                # App router pages
│   │   │   ├── (auth)/         # Auth pages
│   │   │   ├── (dashboard)/    # Main app pages
│   │   │   ├── cmo/            # CMO module (building)
│   │   │   ├── cro/            # CRO module (complete)
│   │   │   └── api/            # API routes
│   │   ├── components/         # React components
│   │   └── lib/                # Utilities
│   └── api/                    # NestJS backend
│       ├── src/
│       │   ├── auth/           # Authentication
│       │   ├── billing/        # Stripe integration
│       │   ├── cmo/            # CMO module (building)
│       │   ├── cro/            # CRO module
│       │   ├── email/          # Resend integration
│       │   └── prisma/         # Database service
│       └── prisma/
│           └── schema.prisma   # Database schema
├── packages/                   # Shared packages
└── CLAUDE.md                   # This file
```

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

# Run dev servers
cd apps/web && npm run dev  # Port 3002
cd apps/api && npm run start:dev  # Port 8080
```

**Database:**
```bash
# Generate Prisma client after schema changes
cd apps/api && npx prisma generate

# Create migration
cd apps/api && npx prisma migrate dev --name migration_name

# View database
cd apps/api && npx prisma studio

# Backup (always before major changes)
pg_dump -U zander_app -h localhost zander_dev > ~/Desktop/zander_backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## Module Status

| Module | Status | Notes |
|--------|--------|-------|
| **CRO** | 97% Complete | Sales pipeline, contacts, deals, automation templates |
| **CMO** | Phase 1 Complete | Database schema done, starting Phase 2 |
| **CFO** | Not Started | — |
| **COO** | Not Started | — |
| **CPO** | Not Started | — |
| **CIO** | Not Started | — |
| **EA** | Not Started | — |

### CRO Module (Reference)
- Location: `apps/web/app/cro/`
- Features: Pipeline kanban, contact management, deal tracking, The Treasury (templates), Schedule calendar
- Use as pattern for other modules

### CMO Module (Active Development)
- Location: `apps/web/app/cmo/` (frontend), `apps/api/src/cmo/` (backend)
- Spec: `/docs/Zander_CMO_Specification_v1.md`
- Build Plan: `/docs/Zander_CMO_Build_Plan.md`

**CMO 5 Pillars Structure:**
1. MARKETING: Production, Projects, People, Products
2. PROCESS: Communication, Schedule, Forms, Ask Don
3. AUTOMATION: Workflows, Funnels, Sequences
4. INSIGHTS: Analytics, Reports, Attribution
5. ASSETS: Brand Library, Media, Templates

**CMO Build Phases:**
- [x] Phase 1: Foundation & Database (16-20 hrs) — COMPLETE
- [ ] Phase 2: Frontend Foundation (18-22 hrs) — STARTING
- [ ] Phase 3: Dashboard Page (14-18 hrs)
- [ ] Phase 4: Core Feature Pages (32-40 hrs)
- [ ] Phase 5: Automation & AI (24-30 hrs)
- [ ] Phase 6: Analytics, Polish & Launch (16-20 hrs)

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
- Cards with consistent border-radius (8px)
- Buttons: Primary (red), Secondary (navy), Ghost (transparent)
- Forms: Label above input, error states in red
- Tables: Sticky headers, hover states, pagination

---

## API Patterns

### Endpoint Structure
```
/api/v1/{module}/{resource}
/api/v1/cmo/campaigns
/api/v1/cmo/campaigns/:id
/api/v1/cmo/calendar/events
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

### Next.js
- **'use client'** directive required for hooks, event handlers
- **API routes** go in `app/api/` with `route.ts` files
- **Dynamic routes** use `[param]` folder naming

### Deployment
- **Frontend:** Push to main → Vercel auto-deploys
- **Backend:** Build Docker image → Push to ECR → Update ECS task
- **Database:** Run migrations manually on production RDS

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
```

---

## Key Contacts & Resources

- **Production Frontend:** https://app.zanderos.com
- **Production API:** https://api.zanderos.com
- **GitHub:** github.com/jowenwhite/zander-saas
- **AWS Console:** (Jonathan's account)
- **Stripe Dashboard:** dashboard.stripe.com
- **Resend Dashboard:** resend.com/emails

---

## Current Priority

**CMO Module Phase 2: Frontend Foundation**

Next steps:
1. Create design system (CSS variables, tokens)
2. Build shared layout components (TopHeader, Sidebar, CMOLayout)
3. Build core UI components (Button, Card, KPICard, etc.)
4. Set up route structure (/cmo, /cmo/calendar, etc.)

Estimated time: 18-22 hours

---

*This file is checked into git. Update it whenever Claude does something incorrectly so it learns for next time.*


