# Zander CMO Production Build Plan
## Complete Development Roadmap

**Document Version:** 1.0  
**Created:** January 24, 2026  
**Target:** Production-ready CMO module  
**Tech Stack:** Next.js 15 + NestJS + PostgreSQL + Prisma

---

## Executive Summary

| Metric | Estimate |
|--------|----------|
| **Total Phases** | 6 |
| **Total Steps** | 47 |
| **Total Estimated Hours** | 120-160 hours |
| **Recommended Timeline** | 6-8 weeks (part-time) |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    Next.js 15 (Vercel)                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  /cmo (CMO Module Routes)                                │   │
│  │  ├── /cmo (Dashboard)                                    │   │
│  │  ├── /cmo/calendar                                       │   │
│  │  ├── /cmo/campaigns                                      │   │
│  │  ├── /cmo/automations                                    │   │
│  │  ├── /cmo/content                                        │   │
│  │  ├── /cmo/analytics                                      │   │
│  │  └── /cmo/settings                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          BACKEND                                 │
│                    NestJS API (Railway)                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  CMO Module                                              │   │
│  │  ├── CampaignController / CampaignService               │   │
│  │  ├── AutomationController / AutomationService           │   │
│  │  ├── ContentController / ContentService                 │   │
│  │  ├── CalendarController / CalendarService               │   │
│  │  ├── AnalyticsController / AnalyticsService             │   │
│  │  └── DonAIController / DonAIService                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Prisma ORM
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE                                 │
│                    PostgreSQL (Railway)                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  CMO Tables                                              │   │
│  │  ├── Campaign, CampaignStage, CampaignAsset             │   │
│  │  ├── Automation, AutomationStep, AutomationTrigger      │   │
│  │  ├── EmailTemplate, EmailCampaign, EmailSend            │   │
│  │  ├── SocialPost, SocialAccount, SocialSchedule          │   │
│  │  ├── LandingPage, Form, FormSubmission                  │   │
│  │  ├── Persona, PersonaAttribute                          │   │
│  │  ├── MarketingCalendar, CalendarEvent, MonthlyTheme     │   │
│  │  └── MarketingAnalytics, Attribution                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Shared Tables (extend existing)                         │   │
│  │  ├── Contact → add marketing fields, lead score         │   │
│  │  ├── Project → link to campaigns                        │   │
│  │  └── User → CMO permissions                             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ External Services
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       INTEGRATIONS                               │
│  ├── Resend (Email sending) ✅ Already built                   │
│  ├── Twilio (SMS) ✅ Already built                             │
│  ├── Anthropic Claude (Don AI)                                  │
│  ├── Meta Business Suite (Social - Future)                      │
│  └── Google Analytics (Tracking - Future)                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Foundation & Database
**Estimated Time: 16-20 hours**

### 1.1 Database Schema Design
**Time: 4-5 hours**

| Step | Task | Hours |
|------|------|-------|
| 1.1.1 | Design CMO entity relationship diagram | 1 |
| 1.1.2 | Define Campaign & CampaignStage models | 0.5 |
| 1.1.3 | Define Automation, Step & Trigger models | 1 |
| 1.1.4 | Define Email & Social content models | 0.5 |
| 1.1.5 | Define Persona & PersonaAttribute models | 0.5 |
| 1.1.6 | Define Calendar & Theme models | 0.5 |
| 1.1.7 | Define Analytics & Attribution models | 0.5 |
| 1.1.8 | Review & finalize schema relationships | 0.5 |

### 1.2 Prisma Schema Implementation
**Time: 3-4 hours**

| Step | Task | Hours |
|------|------|-------|
| 1.2.1 | Add CMO models to schema.prisma | 1.5 |
| 1.2.2 | Define relations to existing models (Contact, Project, User) | 0.5 |
| 1.2.3 | Add indexes for query optimization | 0.5 |
| 1.2.4 | Generate migration files | 0.5 |
| 1.2.5 | Run migration on dev database | 0.5 |
| 1.2.6 | Seed test data for development | 0.5 |

### 1.3 Backend Module Setup
**Time: 4-5 hours**

| Step | Task | Hours |
|------|------|-------|
| 1.3.1 | Create CMO module structure in NestJS | 0.5 |
| 1.3.2 | Set up CampaignModule (controller, service, DTOs) | 1 |
| 1.3.3 | Set up AutomationModule | 1 |
| 1.3.4 | Set up ContentModule | 0.5 |
| 1.3.5 | Set up CalendarModule | 0.5 |
| 1.3.6 | Set up AnalyticsModule | 0.5 |
| 1.3.7 | Set up DonAIModule | 0.5 |
| 1.3.8 | Configure module imports and exports | 0.5 |

### 1.4 API Endpoints - Core CRUD
**Time: 5-6 hours**

| Step | Task | Hours |
|------|------|-------|
| 1.4.1 | Campaign CRUD endpoints | 1 |
| 1.4.2 | Automation CRUD endpoints | 1 |
| 1.4.3 | Email template CRUD endpoints | 0.5 |
| 1.4.4 | Social post CRUD endpoints | 0.5 |
| 1.4.5 | Persona CRUD endpoints | 0.5 |
| 1.4.6 | Calendar event CRUD endpoints | 0.5 |
| 1.4.7 | Monthly theme CRUD endpoints | 0.5 |
| 1.4.8 | API validation and error handling | 1 |

**Phase 1 Deliverables:**
- [ ] Complete database schema with all CMO tables
- [ ] Prisma migrations applied
- [ ] NestJS CMO module with basic CRUD for all entities
- [ ] Seeded test data
- [ ] API endpoints tested with Postman/Thunder Client

---

## Phase 2: Frontend Foundation
**Estimated Time: 18-22 hours**

### 2.1 Design System Setup
**Time: 4-5 hours**

| Step | Task | Hours |
|------|------|-------|
| 2.1.1 | Create CSS variables file (tokens) | 1 |
| 2.1.2 | Set up Lucide React icons | 0.5 |
| 2.1.3 | Create typography component/styles | 0.5 |
| 2.1.4 | Create spacing utilities | 0.5 |
| 2.1.5 | Implement dark mode CSS variables | 1 |
| 2.1.6 | Create dark mode toggle component | 0.5 |
| 2.1.7 | Add dark mode persistence (localStorage) | 0.5 |

### 2.2 Shared Layout Components
**Time: 6-8 hours**

| Step | Task | Hours |
|------|------|-------|
| 2.2.1 | Create TopHeader component (matches CRO) | 1.5 |
| 2.2.2 | Create ExecutiveTabs component | 1 |
| 2.2.3 | Create Sidebar component (5 Pillars structure) | 1.5 |
| 2.2.4 | Create SidebarNavItem component | 0.5 |
| 2.2.5 | Create CMOLayout wrapper component | 1 |
| 2.2.6 | Create DonRobotButton (floating) | 0.5 |
| 2.2.7 | Implement responsive sidebar behavior | 1 |
| 2.2.8 | Add layout transitions/animations | 0.5 |

### 2.3 Core UI Components
**Time: 5-6 hours**

| Step | Task | Hours |
|------|------|-------|
| 2.3.1 | Create Button component (variants) | 0.5 |
| 2.3.2 | Create Card component (base) | 0.5 |
| 2.3.3 | Create KPICard component | 0.5 |
| 2.3.4 | Create Badge component | 0.25 |
| 2.3.5 | Create Avatar component | 0.25 |
| 2.3.6 | Create Input/Select components | 0.5 |
| 2.3.7 | Create Modal component | 0.5 |
| 2.3.8 | Create Dropdown component | 0.5 |
| 2.3.9 | Create Table component | 0.5 |
| 2.3.10 | Create EmptyState component | 0.25 |
| 2.3.11 | Create LoadingSpinner component | 0.25 |
| 2.3.12 | Create StatusDot component (animated) | 0.25 |

### 2.4 Route Structure Setup
**Time: 3-4 hours**

| Step | Task | Hours |
|------|------|-------|
| 2.4.1 | Create /cmo route folder structure | 0.5 |
| 2.4.2 | Create /cmo/page.tsx (Dashboard) | 0.5 |
| 2.4.3 | Create /cmo/calendar route | 0.5 |
| 2.4.4 | Create /cmo/campaigns route | 0.5 |
| 2.4.5 | Create /cmo/automations route | 0.5 |
| 2.4.6 | Create /cmo/content route | 0.5 |
| 2.4.7 | Create /cmo/analytics route | 0.5 |
| 2.4.8 | Create /cmo/settings route | 0.5 |

**Phase 2 Deliverables:**
- [ ] Complete design system with dark mode
- [ ] Shared layout matching CRO structure
- [ ] Reusable component library
- [ ] All CMO routes created (placeholder pages)
- [ ] Navigation between routes working

---

## Phase 3: Dashboard Page (Production Home)
**Estimated Time: 14-18 hours**

### 3.1 Dashboard Layout
**Time: 3-4 hours**

| Step | Task | Hours |
|------|------|-------|
| 3.1.1 | Create WelcomeHeader component | 0.5 |
| 3.1.2 | Create ActionButtons component | 0.5 |
| 3.1.3 | Create MonthlyThemeBanner component | 1 |
| 3.1.4 | Set up dashboard grid layout | 0.5 |
| 3.1.5 | Implement responsive breakpoints | 0.5 |
| 3.1.6 | Add loading states | 0.5 |

### 3.2 KPI Section
**Time: 2-3 hours**

| Step | Task | Hours |
|------|------|-------|
| 3.2.1 | Create KPIGrid component | 0.5 |
| 3.2.2 | Implement KPI data fetching | 0.5 |
| 3.2.3 | Add change indicators (up/down) | 0.5 |
| 3.2.4 | Create mini sparkline component (optional) | 1 |

### 3.3 Campaign Pipeline
**Time: 3-4 hours**

| Step | Task | Hours |
|------|------|-------|
| 3.3.1 | Create CampaignPipeline component | 1 |
| 3.3.2 | Create PipelineStage component | 0.5 |
| 3.3.3 | Create PipelineCard component | 0.5 |
| 3.3.4 | Implement pipeline data fetching | 0.5 |
| 3.3.5 | Add click-through to campaign detail | 0.5 |

### 3.4 Don's Insights Card
**Time: 2-3 hours**

| Step | Task | Hours |
|------|------|-------|
| 3.4.1 | Create DonInsightsCard component | 1 |
| 3.4.2 | Create InsightItem component | 0.5 |
| 3.4.3 | Implement insight data fetching | 0.5 |
| 3.4.4 | Add insight action handlers | 0.5 |

### 3.5 Active Automations Card
**Time: 2 hours**

| Step | Task | Hours |
|------|------|-------|
| 3.5.1 | Create ActiveAutomationsCard component | 1 |
| 3.5.2 | Create AutomationItem component | 0.5 |
| 3.5.3 | Implement automation status fetching | 0.5 |

### 3.6 Info Cards Row
**Time: 2-3 hours**

| Step | Task | Hours |
|------|------|-------|
| 3.6.1 | Create RecentActivityCard component | 0.5 |
| 3.6.2 | Create ActionRequiredCard component | 0.5 |
| 3.6.3 | Create UpcomingScheduleCard component | 0.5 |
| 3.6.4 | Create PersonaReferenceCard component | 1 |

### 3.7 Analytics Section
**Time: 2-3 hours**

| Step | Task | Hours |
|------|------|-------|
| 3.7.1 | Create AnalyticsGrid component | 0.5 |
| 3.7.2 | Create FunnelChart component | 1 |
| 3.7.3 | Create ContentPerformanceCard component | 0.5 |
| 3.7.4 | Implement analytics data fetching | 0.5 |

**Phase 3 Deliverables:**
- [ ] Fully functional dashboard page
- [ ] All dashboard components built
- [ ] Real data from API displayed
- [ ] Responsive on all screen sizes
- [ ] Loading and empty states handled

---

## Phase 4: Core Feature Pages
**Estimated Time: 32-40 hours**

### 4.1 Calendar Module
**Time: 8-10 hours**

| Step | Task | Hours |
|------|------|-------|
| 4.1.1 | Create CalendarHeader component | 0.5 |
| 4.1.2 | Create MonthView component | 2 |
| 4.1.3 | Create WeekView component | 1.5 |
| 4.1.4 | Create DayCell component | 0.5 |
| 4.1.5 | Create CalendarEvent component | 0.5 |
| 4.1.6 | Create EventModal (create/edit) | 1.5 |
| 4.1.7 | Create IdeaParkingLot component | 1 |
| 4.1.8 | Implement calendar data fetching | 0.5 |
| 4.1.9 | Add event CRUD operations | 1 |
| 4.1.10 | Add monthly theme display | 0.5 |

### 4.2 Campaigns Module
**Time: 8-10 hours**

| Step | Task | Hours |
|------|------|-------|
| 4.2.1 | Create CampaignList page | 1 |
| 4.2.2 | Create CampaignCard component | 0.5 |
| 4.2.3 | Create CampaignDetail page | 1.5 |
| 4.2.4 | Create CampaignForm (create/edit) | 2 |
| 4.2.5 | Create CampaignTimeline component | 1 |
| 4.2.6 | Create CampaignMetrics component | 0.5 |
| 4.2.7 | Implement campaign CRUD operations | 1 |
| 4.2.8 | Add campaign filtering and search | 0.5 |
| 4.2.9 | Add campaign status transitions | 0.5 |

### 4.3 Content Module
**Time: 8-10 hours**

| Step | Task | Hours |
|------|------|-------|
| 4.3.1 | Create ContentTabs component (Email/Social/Pages/Forms) | 0.5 |
| 4.3.2 | Create EmailList component | 0.5 |
| 4.3.3 | Create EmailEditor component (basic) | 2 |
| 4.3.4 | Create SocialPostList component | 0.5 |
| 4.3.5 | Create SocialPostEditor component | 1.5 |
| 4.3.6 | Create LandingPageList component | 0.5 |
| 4.3.7 | Create FormList component | 0.5 |
| 4.3.8 | Create FormBuilder component (basic) | 2 |
| 4.3.9 | Implement content CRUD operations | 1 |

### 4.4 People/Audience Module
**Time: 6-8 hours**

| Step | Task | Hours |
|------|------|-------|
| 4.4.1 | Create ContactList page | 1 |
| 4.4.2 | Create ContactDetail page | 1 |
| 4.4.3 | Create SegmentList component | 0.5 |
| 4.4.4 | Create SegmentBuilder component | 1.5 |
| 4.4.5 | Create PersonaList page | 0.5 |
| 4.4.6 | Create PersonaDetail page (full Ashley view) | 1.5 |
| 4.4.7 | Create PersonaForm (create/edit) | 1 |
| 4.4.8 | Create AshleyTest modal | 0.5 |

**Phase 4 Deliverables:**
- [ ] Calendar with month/week views and events
- [ ] Campaign list and detail pages
- [ ] Content management for email/social
- [ ] People/Audience management
- [ ] All CRUD operations working

---

## Phase 5: Automation & AI
**Estimated Time: 24-30 hours**

### 5.1 Workflow Builder
**Time: 12-15 hours**

| Step | Task | Hours |
|------|------|-------|
| 5.1.1 | Create WorkflowCanvas component | 2 |
| 5.1.2 | Create WorkflowNode component (base) | 1 |
| 5.1.3 | Create TriggerNode component | 1 |
| 5.1.4 | Create ActionNode component | 1 |
| 5.1.5 | Create ConditionNode component | 1 |
| 5.1.6 | Create DelayNode component | 0.5 |
| 5.1.7 | Create NodeConnector component | 1 |
| 5.1.8 | Create NodePalette component | 0.5 |
| 5.1.9 | Implement drag-and-drop (basic) | 2 |
| 5.1.10 | Create WorkflowToolbar component | 0.5 |
| 5.1.11 | Implement workflow save/load | 1 |
| 5.1.12 | Add workflow execution status display | 1 |

### 5.2 Automation Engine (Backend)
**Time: 6-8 hours**

| Step | Task | Hours |
|------|------|-------|
| 5.2.1 | Create automation execution service | 2 |
| 5.2.2 | Implement trigger handlers | 1 |
| 5.2.3 | Implement action handlers (email, tag, score) | 1.5 |
| 5.2.4 | Implement condition evaluators | 1 |
| 5.2.5 | Implement delay/scheduling | 1 |
| 5.2.6 | Add automation logging | 0.5 |
| 5.2.7 | Add CRO Stage 0 handoff action | 0.5 |

### 5.3 Don AI Integration
**Time: 6-8 hours**

| Step | Task | Hours |
|------|------|-------|
| 5.3.1 | Set up Claude API integration | 1 |
| 5.3.2 | Create Don system prompt for CMO context | 1 |
| 5.3.3 | Create DonChat component (floating panel) | 1.5 |
| 5.3.4 | Implement insight generation endpoint | 1 |
| 5.3.5 | Implement content suggestions endpoint | 1 |
| 5.3.6 | Implement Ashley Test endpoint | 1 |
| 5.3.7 | Add Don recommendations to dashboard | 0.5 |

**Phase 5 Deliverables:**
- [ ] Visual workflow builder (basic)
- [ ] Automation execution engine
- [ ] Don AI chat interface
- [ ] AI-powered insights on dashboard
- [ ] Ashley Test functionality

---

## Phase 6: Analytics, Polish & Launch
**Estimated Time: 16-20 hours**

### 6.1 Analytics Dashboard
**Time: 6-8 hours**

| Step | Task | Hours |
|------|------|-------|
| 6.1.1 | Create AnalyticsDashboard page | 1 |
| 6.1.2 | Create MetricCard component | 0.5 |
| 6.1.3 | Create LineChart component (Recharts) | 1 |
| 6.1.4 | Create BarChart component | 0.5 |
| 6.1.5 | Create FunnelVisualization component | 1 |
| 6.1.6 | Create AttributionTable component | 1 |
| 6.1.7 | Implement analytics data aggregation (backend) | 1.5 |
| 6.1.8 | Add date range filtering | 0.5 |

### 6.2 Reports Module
**Time: 4-5 hours**

| Step | Task | Hours |
|------|------|-------|
| 6.2.1 | Create ReportList page | 0.5 |
| 6.2.2 | Create ReportBuilder component | 2 |
| 6.2.3 | Create report export (PDF/CSV) | 1 |
| 6.2.4 | Add scheduled report feature | 1 |

### 6.3 Settings & Configuration
**Time: 3-4 hours**

| Step | Task | Hours |
|------|------|-------|
| 6.3.1 | Create CMO Settings page | 0.5 |
| 6.3.2 | Create integration settings (email, social) | 1 |
| 6.3.3 | Create notification preferences | 0.5 |
| 6.3.4 | Create brand settings (colors, logo) | 1 |
| 6.3.5 | Create team permissions settings | 0.5 |

### 6.4 Testing & Polish
**Time: 4-5 hours**

| Step | Task | Hours |
|------|------|-------|
| 6.4.1 | Cross-browser testing | 1 |
| 6.4.2 | Mobile responsive testing | 1 |
| 6.4.3 | Fix UI inconsistencies | 1 |
| 6.4.4 | Performance optimization | 0.5 |
| 6.4.5 | Error handling review | 0.5 |
| 6.4.6 | Loading state polish | 0.5 |

**Phase 6 Deliverables:**
- [ ] Complete analytics dashboard
- [ ] Report generation
- [ ] CMO settings page
- [ ] Tested and polished UI
- [ ] Production-ready deployment

---

## Summary: Time by Phase

| Phase | Description | Hours | Priority |
|-------|-------------|-------|----------|
| **Phase 1** | Foundation & Database | 16-20 | 🔴 Critical |
| **Phase 2** | Frontend Foundation | 18-22 | 🔴 Critical |
| **Phase 3** | Dashboard Page | 14-18 | 🔴 Critical |
| **Phase 4** | Core Feature Pages | 32-40 | 🟡 High |
| **Phase 5** | Automation & AI | 24-30 | 🟡 High |
| **Phase 6** | Analytics & Polish | 16-20 | 🟢 Medium |
| **TOTAL** | | **120-150 hrs** | |

---

## Recommended Build Order

### Sprint 1: MVP Dashboard (Weeks 1-2)
**~35 hours**
- Phase 1: All (Foundation)
- Phase 2: All (Frontend Foundation)
- Phase 3: 3.1-3.3 (Dashboard layout, KPIs, Pipeline)

**Outcome:** Working dashboard with real data, proper structure

### Sprint 2: Core Features (Weeks 3-4)
**~35 hours**
- Phase 3: 3.4-3.7 (Remaining dashboard components)
- Phase 4: 4.1 (Calendar)
- Phase 4: 4.2 (Campaigns)

**Outcome:** Calendar and campaign management working

### Sprint 3: Content & People (Weeks 5-6)
**~30 hours**
- Phase 4: 4.3 (Content Module)
- Phase 4: 4.4 (People/Audience)
- Phase 5: 5.3 (Don AI - basic)

**Outcome:** Content management, personas, Don chat

### Sprint 4: Automation & Launch (Weeks 7-8)
**~40 hours**
- Phase 5: 5.1-5.2 (Workflow Builder & Engine)
- Phase 6: All (Analytics, Reports, Polish)

**Outcome:** Production-ready CMO module

---

## Dependencies & Prerequisites

### Before Starting
- [ ] Zander API running (NestJS)
- [ ] PostgreSQL database accessible
- [ ] Prisma ORM configured
- [ ] Next.js app structure in place
- [ ] CRO module as reference for patterns

### External Services Needed
- [ ] Anthropic API key (for Don AI)
- [ ] Resend API key (already have)
- [ ] Twilio credentials (already have)

### Design Assets Needed
- [ ] Lucide React installed
- [ ] Inter font loaded
- [ ] Color palette finalized (from spec notes)

---

## Risk Factors & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Workflow builder complexity | High | Start with basic linear flows, add branching later |
| Don AI integration scope | Medium | Limit to 3 core functions first |
| Schema changes mid-build | High | Finalize schema in Phase 1, avoid changes |
| Time underestimation | Medium | Build MVP features first, polish later |
| Integration with CRO | Medium | Define Stage 0 handoff contract early |

---

## Success Criteria

### Phase 1 Complete When:
- [ ] All CMO tables exist in database
- [ ] API returns data for all entities
- [ ] Seed data visible in database

### Phase 2 Complete When:
- [ ] Can navigate to /cmo and see layout
- [ ] Dark mode toggle works
- [ ] Sidebar matches CRO structure

### Phase 3 Complete When:
- [ ] Dashboard displays real KPIs
- [ ] Pipeline shows campaigns by stage
- [ ] Don's Insights card populated

### MVP Complete When (End of Sprint 2):
- [ ] Dashboard fully functional
- [ ] Calendar shows events
- [ ] Can create/edit campaigns
- [ ] Navigation works throughout

### Production Complete When:
- [ ] All 6 phases delivered
- [ ] No critical bugs
- [ ] Mobile responsive
- [ ] Don AI responding
- [ ] Automations executing

---

**Ready to begin Phase 1?**
