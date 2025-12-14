# Zander Development Handoff - December 14, 2025

## Current State Summary

### Technical Stack
- **Frontend:** Next.js 15.5.4 at `apps/web` (port 3002)
- **Backend:** NestJS at `apps/api` (port 3001)  
- **Database:** PostgreSQL with Prisma ORM
- **Monorepo:** Turborepo structure at `~/dev/zander-saas`
- **Branch:** `working-dashboard-dec13`

### Design System
- **Colors:** Red #BF0A30, Navy #0C2340, Gold #F0B323
- **Font:** Source Sans Pro
- **Style:** Clean, professional, minimal formatting

### Completed Features (CRO Module - Feature Complete)
1. **Dashboard** - Pipeline preview, KPIs, activity feed
2. **Pipeline** - Kanban with drag-and-drop, stage management
3. **Deal Detail** - 4 tabs (Overview, Communications, Proposals, Activity)
4. **Contacts** - Grid/list views, search, filtering
5. **Contact Detail** - 4 tabs (Overview, Deals, Communications, Forms)
6. **Analytics** - Charts, metrics, performance data
7. **Import Pages** - Contacts and Deals import interfaces
8. **Email Automation** - Templates, sequences, scheduling
9. **Forms Management** - Form library, industry packs
10. **AI Assistant** - Jordan (CRO) active, 6 executives coming soon
11. **New Deal/Contact Modals** - Working on Dashboard, Pipeline, Contacts pages

### Headquarters (Mission Control) - Just Completed
Location: `/headquarters`

**Hamilton-Inspired Terminology:**
- Keystones = Key metrics (1 per AI executive)
- Assembly = Meetings
- Campaigns = Goals/Priorities (My Campaign, Quarterly, Annual)
- Headwinds = Challenges/Issues
- Victories = Resolved issues
- The Horizon = Future items/parking lot
- Founding Principles = Vision, Mission, Values, Story
- The Legacy = 3-5 year vision
- The Ledger = Performance metrics/scoreboard

**Current HQ Layout:**
- HQ button in top nav (navy, always visible)
- Clean sidebar (no HQ items - just Sales & Revenue + Tools)
- Keystones row at top (7 AI executive metrics with trends)
- 6 Quick Nav buttons (Assembly, Campaigns, Headwinds, Founding Principles, Legacy, Ledger)
- Dashboard cards (Today's Assembly, Active Headwinds, My Campaign, Recent Victories)
- Modal system for each section (placeholder content)

**Philosophy:**
- "Everyone has a number" - each team member owns 1 keystone per module
- Founders see all 7 keystones, managers see their own + team visibility
- Minimize meetings - AI executives prepare reports automatically
- Simple and robust - avoid clutter and complexity

### File Structure
```
~/dev/zander-saas/
├── apps/
│   ├── web/app/
│   │   ├── page.tsx (Dashboard)
│   │   ├── pipeline/page.tsx
│   │   ├── contacts/page.tsx
│   │   ├── contacts/[id]/page.tsx (Contact Detail)
│   │   ├── deals/[id]/page.tsx (Deal Detail)
│   │   ├── analytics/page.tsx
│   │   ├── automation/page.tsx
│   │   ├── forms/page.tsx
│   │   ├── ai/page.tsx
│   │   ├── headquarters/page.tsx ← NEW
│   │   ├── import/contacts/page.tsx
│   │   ├── import/deals/page.tsx
│   │   ├── components/
│   │   │   ├── Sidebar.tsx ← SIMPLIFIED
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── AuthGuard.tsx
│   │   └── utils/auth.ts
│   └── api/ (NestJS backend)
└── packages/database/ (Prisma schema)
```

### Database Schema (Key Models)
- Contact: id, firstName, lastName, email, phone, company, title, source, notes, tags, tenantId
- Deal: id, dealName, dealValue, stage, probability, contactId, tenantId
- User: id, email, passwordHash, tenantId

### API Endpoints
- GET/POST /contacts
- GET/POST /deals
- GET/POST /users
- POST /auth/login

### Pending Work
- Build out modal content for each HQ section
- Add HQ button to all pages (currently only on Dashboard and HQ page)
- User authentication improvements (display logged-in user name)
- Real data connections for Keystones
- CSV import processing
- Email sending (Resend API)
- Form builder
- Other AI executive modules (CFO, COO, CMO, CPO, CIO, EA)

### Jonathan's Preferences
- Elementary-level terminal instructions
- Step-by-step guidance
- Complete file replacements over incremental edits
- nano editor, command-line tools
- Frequent Git commits
- Test with real data before expanding
- Simple and robust over complex
- Visual consistency with MCF brand

### Commands to Start Development
```bash
cd ~/dev/zander-saas
npm run dev --workspace=api &
npm run dev --workspace=web &
# API: http://localhost:3001
# Web: http://localhost:3002
```

### Git Workflow
```bash
git status
git add -A
git commit -m "descriptive message"
git push origin working-dashboard-dec13
```
