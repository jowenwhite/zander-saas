# Zander CMO Module Specification
## Complete Development Guide & Single Source of Truth

**Document Version:** 1.0  
**Created:** January 24, 2026  
**Author:** Jonathan White / 64 West Holdings  
**Status:** Phase 4 Ready — UI/UX Design  

---

# Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Vision & Philosophy](#2-vision--philosophy)
3. [Design Principles](#3-design-principles)
4. [User Personas & Target Market](#4-user-personas--target-market)
5. [Feature Requirements](#5-feature-requirements)
6. [UI/UX Specifications](#6-uiux-specifications)
7. [Data Architecture](#7-data-architecture)
8. [Integration Requirements](#8-integration-requirements)
9. [Don AI Specifications](#9-don-ai-specifications)
10. [Marketing Structure Framework](#10-marketing-structure-framework)
11. [Implementation Roadmap](#11-implementation-roadmap)
12. [Reference Materials](#12-reference-materials)

---

# 1. Executive Summary

## What is Zander CMO?

Zander CMO is one of seven AI-powered virtual executives in the Zander business operating system. The CMO (Chief Marketing Officer) module handles all marketing functions for small businesses (1-50 employees), replacing the need for multiple disconnected marketing tools while providing AI-driven strategy, execution, and optimization.

## Core Value Proposition

**"Upload key information and press Go!"**

Zander CMO transforms marketing from a chaotic collection of tools and sporadic efforts into a structured, automated system that executes your marketing plan while you focus on your business.

## First Users

- **My Cabinet Factory (MCF)** — 32-year custom cabinet manufacturer, 24 employees
- **64 West Holdings** — Finance, Consulting, and Zander SaaS platform

## Key Differentiators

| Competitor Approach | Zander CMO Approach |
|---------------------|---------------------|
| Features bolted together | Unified AI executive |
| AI added as afterthought | AI-native design (Don) |
| Manual execution required | "Set it and forget it" automation |
| Disconnected from sales | Native CRO pipeline integration (Stage 0) |
| Reactive posting | Calendar-first annual planning |
| Generic targeting | Persona-centered ("Ashley Brown test") |
| Multiple subscriptions | One platform, 7 executives |

---

# 2. Vision & Philosophy

## The Problem We're Solving

Small business owners lose their passion to administrative chaos. They drown in 12+ disconnected software tools costing $500-1,600/month plus 15-20 hours/week managing them. Marketing specifically suffers from:

- **Tool fatigue** — Too many platforms, none talk to each other
- **Inconsistent execution** — Random posting when inspired, not strategic
- **Great idea distraction** — Chasing trends instead of executing plans
- **No accountability** — No structure means no measurement
- **Disconnected from sales** — Marketing generates leads that fall into a void

## The Zander Solution

Seven AI-powered virtual executives replace fragmented software while integrating seamlessly with essential tools. The CMO specifically provides:

- A complete marketing function in one unified interface
- AI that plans, executes, and optimizes automatically
- Direct pipeline integration with CRO (sales)
- Structure that enables creativity, not restricts it

## Founding Philosophy (from Zander Manifesto)

> "Not features, but EXECUTIVES. Full C-suite for $299-599/month vs $700K+ annual payroll."

> "Hamilton principle: Everything must connect."

## Marketing Philosophy Influences

These books shaped the CMO module's approach:

| Book | Author | Applied Principle |
|------|--------|-------------------|
| Start with Why | Simon Sinek | Lead with purpose, not features |
| Delivering Happiness | Tony Hsieh | Customer experience drives everything |
| Tribes | Seth Godin | Build communities, lead movements |
| 22 Immutable Laws of Marketing | Al Ries | Positioning fundamentals |
| Influence | Robert Cialdini | Psychology of persuasion |
| How to Win Friends | Dale Carnegie | Relationship-first approach |
| Permission Marketing | Seth Godin | Earn attention, don't interrupt |
| Getting Everything You Can | Jay Abraham | Leverage existing assets |
| Purple Cow | Seth Godin | Be remarkable or be invisible |

**Applied to CMO:**
- Purpose-driven messaging (not feature lists)
- Permission-based lead capture (value exchange)
- Tribe building (community, not just audience)
- Remarkable positioning (differentiation)
- Relationship nurturing (not transactional blasts)

---

# 3. Design Principles

## Universal Zander Principles

These apply to ALL 7 executives, ensuring uniformity:

| Principle | Implementation |
|-----------|----------------|
| **Uniformity** | All 7 executives share consistent layout, navigation, visual language |
| **Familiarity** | Switching CRO → CMO → CFO feels like same system, not different apps |
| **Day 1 Usability** | No training required, start producing value immediately |
| **Progressive Disclosure** | Surface = key actions, Depth = granular control |
| **Automation Default** | Everything runs unless you choose to intervene |
| **Adaptable Tools** | Generators produce usable output, editable if desired |

## CMO-Specific Principles

| Principle | Implementation |
|-----------|----------------|
| **Organization Over Inspiration** | Structure first, creativity within the rails |
| **Discipline Over Distraction** | "Great ideas" go to parking lot, not execution queue |
| **Measured Change** | Strategy shifts require leadership decision, not whim |
| **Calendar-First** | Set the plan in advance, Don executes automatically |
| **Persona-Centered** | Every decision filtered through target customer |
| **Simple KPIs** | Countable, visual, easy to understand |

## Anti-Patterns We're Solving

Most small business marketing fails because:

- ❌ Random posting when inspired → no consistency
- ❌ Chasing trends → no cohesion
- ❌ "Great idea!" interrupts current plan → nothing gets finished
- ❌ No structure → no accountability
- ❌ Too many tools → paralysis

Zander CMO solves this with:

- ✅ Calendar set in advance → execution happens automatically
- ✅ Ideas captured safely → reviewed at scheduled intervals
- ✅ Don executes the plan → owner focuses on business
- ✅ Simple dashboards → know if it's working without analysis paralysis

---

# 4. User Personas & Target Market

## Target Market

- **Company Size:** 1-50 employees
- **Revenue:** $100K - $10M annually
- **Industries:** Service businesses, manufacturing, professional services, local businesses
- **Pain Point:** Too many tools, too little time, inconsistent marketing

## Primary Persona: Ashley Brown

**The "Ashley Brown Test"** — Every feature, every piece of content, every campaign should pass through this filter:

> "That's a great idea, but how would it resonate with Ashley Brown?"

### Ashley Brown Profile (Example Persona)

**Demographics:**
- 35 years old, Acworth GA
- Marketing consultant (remote work)
- Husband Matt (contractor), son Mason (9)
- UGA graduate, lives in Bentwater subdivision
- Household income: $150K-200K

**Psychographics:**
- Values: authenticity, relationships, quality, family time
- Brands she loves: Apple, Lululemon, Louis Vuitton, Starbucks
- Social media: Instagram (primary), Pinterest, Houzz
- TV: HGTV, Bravo
- Shopping: Amazon, Target, Publix

**Behavior Patterns:**
- Morning coffee + Instagram scroll
- Barre class with friends
- Picks up son at 3:30pm
- Values warm, personal relationships with businesses
- Wants to feel like a place is "hers"

**What Resonates:**
- Personal recognition (knows her name, remembers her preferences)
- Warm, energetic but not overwhelming atmosphere
- Quality she can trust
- Community feeling
- Convenience without sacrificing quality

### Persona Hub Requirements

The CMO should help users build rich customer stories like Ashley Brown, not just demographic bullet points. Features:

- Guided persona interview builder
- Demographics + psychographics capture
- Daily routine mapping
- Fear/aspiration identification
- Brand affinity tracking
- Don references persona when making recommendations

---

# 5. Feature Requirements

## 5.1 Visual Workflow & Automation

### Visual Workflow Builder
- Drag-and-drop automation creation
- Conditional branching logic (if/then/else)
- Time delays and scheduling
- Trigger types: form submission, email open, link click, page visit, date, score threshold
- Action types: send email, send SMS, add tag, update score, move to CRO stage, notify team

### Active Visual Maps
- Real-time display showing leads flowing through automations
- Visual indicators of current position in workflow
- Bottleneck identification
- Performance metrics per node

### Editable Live Workflows
- Modify running automations without disruption
- Version history
- A/B path testing
- Pause/resume capabilities

### Funnel Builder
- Visual funnel creation: Landing Page → Form → Email → SMS → CRO Stage 0
- Template funnels for common use cases
- Conversion tracking at each stage
- Drop-off analysis

### Site Tracking
- JavaScript snippet for website tracking
- Page view tracking
- Time on site
- Scroll depth
- Button/link clicks
- Form interactions
- Behavioral triggers to automations

### Attribution Reporting
- First touch attribution
- Last touch attribution
- Multi-touch attribution
- Channel performance comparison
- ROI by campaign
- Connected to CRO for revenue attribution

## 5.2 Email & SMS Marketing

### Email Campaigns
- Campaign creation wizard
- Template library (customizable)
- Drag-and-drop email builder
- HTML/code editor option
- Preview across devices
- Send immediately or schedule
- Segment targeting

### Deep Email Automation
- Complex branching sequences
- Conditional logic (if opened, if clicked, if not)
- Wait steps (time-based, behavior-based)
- Goal completion triggers
- Exit conditions
- Lead scoring integration

### Email Sequences (Pre-built Templates)
- Welcome sequence
- Nurture sequence
- Re-engagement sequence
- Post-purchase sequence
- Event follow-up sequence
- Custom sequence builder

### SMS Campaigns
- Via Twilio integration (already built in EA)
- Campaign creation
- Automation integration
- Compliance features (opt-out handling)
- Character count/segment tracking

### A/B Testing
- Subject line testing
- Content testing
- Send time testing
- Statistical significance calculation
- Auto-winner selection

### Send Time Optimization
- AI-powered best time to send
- Per-contact optimization based on engagement history
- Time zone handling

## 5.3 Calendar & Planning

### Annual Marketing Calendar
- Month/quarter/year view
- Theme-based planning (per Economy Cabinets calendar example)
- Campaign scheduling
- Content planning
- Budget allocation by period
- Holiday/seasonal markers

### Campaign Planning
- Campaign creation wizard
- Goal setting
- Budget assignment
- Channel selection
- Timeline definition
- Asset checklist
- Team assignment

### Auto-Execute
- Don executes plan without manual intervention
- Scheduled posts publish automatically
- Email sequences trigger automatically
- Alerts only for exceptions or approvals needed

### Idea Parking Lot
- Safe place for "great ideas"
- Capture quickly without disrupting current plan
- Review at scheduled intervals (weekly/monthly)
- Evaluate against persona and strategy
- Promote to plan or archive

### Team Calendar View
- Shared schedule visible to relevant team members
- Role-based visibility
- Assignment tracking
- Deadline notifications

## 5.4 Social Media

### Multi-Platform Posting
- Connect accounts: Facebook, Instagram, LinkedIn, X, Pinterest, YouTube
- Post once to multiple channels
- Platform-specific formatting
- Optimal image sizing per platform

### Content Calendar
- Visual drag-drop scheduling
- Grid view for Instagram
- Queue management
- Bulk scheduling
- Content categories/tags

### AI Content Generation
- Don drafts posts based on plan
- Tone matching to brand voice
- Hashtag suggestions
- Caption variations
- Image prompt generation (for Canva/AI image tools)

### Best Time Scheduling
- AI-optimized post timing per platform
- Audience engagement analysis
- Automatic scheduling to optimal slots

## 5.5 Lead Management

### Lead Capture Forms
- Form builder (drag-drop)
- Field types: text, email, phone, dropdown, checkbox, file upload
- Conditional fields
- Multi-step forms
- Embed code generation
- Popup/slide-in options
- Thank you page/message customization

### Landing Pages
- Page builder (drag-drop)
- Template library
- Mobile responsive
- A/B testing
- Form integration
- Analytics tracking
- Custom domains

### Lead Scoring
- Point assignment rules
- Behavioral scoring (opens, clicks, visits)
- Demographic scoring (title, company size, location)
- Score thresholds for actions
- Score decay over time

### CRO Stage 0 Handoff
- Automatic placement in CRO sales pipeline
- Lead data passed to CRO
- Source/campaign attribution preserved
- Score passed for sales prioritization
- Notification to sales team

### Lead Source Tracking
- UTM parameter capture
- Referral source tracking
- Campaign attribution
- Channel categorization

## 5.6 Brand & Assets

### Brand Asset Library
- Single location for all brand assets
- Folder organization
- Logo versions (full, icon, white, black)
- Color palette with hex codes
- Typography specifications
- Photo library
- Template library
- Brand guidelines document
- Search and filter
- Version control

### Content Generator
- AI-assisted content creation
- Blog post drafts
- Email copy
- Social media posts
- Ad copy
- Landing page copy
- Tone/voice customization

### Canva Integration
- Design inside Zander via Canva API
- Access Canva templates
- Brand kit sync
- Direct publish to campaigns

### Adobe Integration
- Adobe Creative Cloud connection
- Adobe Express integration
- Asset import/export

## 5.7 Analytics & Reporting

### Dashboard
- Simple, visual, countable KPIs
- Customizable widgets
- Date range selection
- Comparison periods
- Export capabilities

### Key Metrics
- **Email:** Open rate, click rate, unsubscribe rate, deliverability
- **Social:** Followers, engagement rate, reach, impressions
- **Website:** Traffic, bounce rate, time on site, conversions
- **Leads:** New leads, lead sources, conversion rate, cost per lead
- **Revenue:** Marketing-attributed revenue, ROI by campaign

### Attribution Reporting
- Which channels drive revenue
- Campaign performance
- Content performance
- Full-funnel visibility (marketing → sales → revenue)

### Campaign Performance
- Email campaign analytics
- Social post analytics
- Ad campaign analytics
- Landing page analytics

### AI Insights
- Don provides recommendations
- Performance anomaly alerts
- Optimization suggestions
- Trend identification

### Monthly Research Updates
- Automated market intelligence
- Competitor monitoring
- Industry trends
- Keyword ranking changes

## 5.8 SEO Tools

### Keyword Tracking
- Rank tracking for target keywords
- Search volume data
- Difficulty scores
- SERP feature tracking

### Content Optimization
- SEO recommendations for content
- Keyword density analysis
- Meta tag optimization
- Internal linking suggestions

### Site Health
- Basic technical SEO monitoring
- Page speed insights
- Mobile friendliness
- Indexation status

### Integration with SEMrush/Ahrefs
- Pull data from professional SEO tools
- Unified dashboard view

## 5.9 Advertising

### Ad Campaign Management
- Google Ads integration
- Meta Ads integration
- LinkedIn Ads integration
- Campaign overview dashboard
- Budget tracking
- Performance metrics

### Ad Creation Assistance
- AI ad copy generation
- Audience suggestions
- Budget recommendations

---

# 6. UI/UX Specifications

## 6.1 Layout Structure

### Universal Navigation (All 7 Executives)

```
┌─────────────────────────────────────────────────────────────────┐
│ [Zander Logo]  [Executive Selector ▼]  [Search]  [Notifications] [Profile] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌─────────────────────────────────────────────┐ │
│  │          │  │                                             │ │
│  │  Left    │  │              Main Content Area              │ │
│  │  Sidebar │  │                                             │ │
│  │          │  │                                             │ │
│  │  - Nav   │  │                                             │ │
│  │  - Items │  │                                             │ │
│  │          │  │                                             │ │
│  │          │  │                                             │ │
│  └──────────┘  └─────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### CMO Sidebar Navigation

```
CMO
├── Dashboard
├── Calendar
│   ├── Annual View
│   ├── Monthly View
│   └── Idea Parking Lot
├── Campaigns
│   ├── Active
│   ├── Drafts
│   ├── Completed
│   └── Templates
├── Automations
│   ├── Workflows
│   ├── Funnels
│   └── Sequences
├── Content
│   ├── Email
│   ├── Social
│   ├── Landing Pages
│   └── Forms
├── Assets
│   ├── Brand Library
│   ├── Media
│   └── Templates
├── Audience
│   ├── Contacts
│   ├── Segments
│   ├── Personas
│   └── Lead Scoring
├── Analytics
│   ├── Dashboard
│   ├── Reports
│   └── Attribution
├── Integrations
│   ├── Connected
│   └── Available
└── Settings
```

## 6.2 Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  CMO Dashboard                                    [Date Range ▼] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │
│  │ New Leads   │ │ Email Rate  │ │ Social Eng  │ │ Pipeline $ │ │
│  │    127      │ │   24.5%     │ │   3.2%      │ │  $45,200   │ │
│  │   ▲ 12%     │ │   ▲ 2.1%    │ │   ▼ 0.3%    │ │   ▲ 8%     │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘ │
│                                                                  │
│  ┌────────────────────────────────┐ ┌──────────────────────────┐│
│  │  This Week's Schedule          │ │  Top Performing          ││
│  │  ─────────────────────────     │ │  ─────────────────────   ││
│  │  Mon: Blog post publish        │ │  Email: Welcome Series   ││
│  │  Tue: Social: 3 posts          │ │  Social: Product Launch  ││
│  │  Wed: Email: Newsletter        │ │  Landing: Free Guide     ││
│  │  Thu: Social: 2 posts          │ │                          ││
│  │  Fri: Review & plan            │ │                          ││
│  └────────────────────────────────┘ └──────────────────────────┘│
│                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  Marketing Funnel Overview                                   ││
│  │  ═══════════════════════════════════════════════════════     ││
│  │  [Visitors: 2,450] → [Leads: 127] → [MQLs: 43] → [CRO: 12]  ││
│  │       100%              5.2%           1.8%         0.5%     ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌────────────────────────────────┐ ┌──────────────────────────┐│
│  │  Don's Recommendations         │ │  Quick Actions           ││
│  │  ─────────────────────────     │ │  ─────────────────────   ││
│  │  💡 Email open rates are up.   │ │  [+ New Campaign]        ││
│  │     Consider increasing        │ │  [+ Schedule Post]       ││
│  │     send frequency.            │ │  [+ Create Email]        ││
│  │                                │ │  [View Calendar]         ││
│  │  💡 Blog traffic down 15%.     │ │                          ││
│  │     SEO audit recommended.     │ │                          ││
│  └────────────────────────────────┘ └──────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 6.3 Visual Workflow Builder

```
┌─────────────────────────────────────────────────────────────────┐
│  Workflow: New Lead Welcome Series                   [Save] [▶] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │        ┌─────────────┐                                   │   │
│  │        │  TRIGGER    │                                   │   │
│  │        │ Form Submit │                                   │   │
│  │        │  (127 ⚡)   │                                   │   │
│  │        └──────┬──────┘                                   │   │
│  │               │                                          │   │
│  │               ▼                                          │   │
│  │        ┌─────────────┐                                   │   │
│  │        │   ACTION    │                                   │   │
│  │        │ Send Email  │                                   │   │
│  │        │ "Welcome"   │                                   │   │
│  │        │  (98% ✓)    │                                   │   │
│  │        └──────┬──────┘                                   │   │
│  │               │                                          │   │
│  │               ▼                                          │   │
│  │        ┌─────────────┐                                   │   │
│  │        │   DELAY     │                                   │   │
│  │        │  Wait 2 days│                                   │   │
│  │        │  (45 ⏳)    │                                   │   │
│  │        └──────┬──────┘                                   │   │
│  │               │                                          │   │
│  │        ┌──────┴──────┐                                   │   │
│  │        ▼             ▼                                   │   │
│  │  ┌──────────┐  ┌──────────┐                              │   │
│  │  │ CONDITION│  │ CONDITION│                              │   │
│  │  │Opened: Y │  │Opened: N │                              │   │
│  │  │  (38)    │  │  (7)     │                              │   │
│  │  └────┬─────┘  └────┬─────┘                              │   │
│  │       │             │                                    │   │
│  │       ▼             ▼                                    │   │
│  │  ┌─────────┐  ┌──────────┐                               │   │
│  │  │ ACTION  │  │  ACTION  │                               │   │
│  │  │Email #2 │  │ Re-send  │                               │   │
│  │  └─────────┘  └──────────┘                               │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────┐                                                │
│  │ + Add Node  │  [Trigger] [Action] [Delay] [Condition] [Goal] │
│  └─────────────┘                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 6.4 Marketing Calendar

```
┌─────────────────────────────────────────────────────────────────┐
│  Marketing Calendar                    [◀ Jan 2026 ▶] [+ Event] │
├─────────────────────────────────────────────────────────────────┤
│  Theme: "New Year, New Look" — Fresh starts, home makeovers     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐                    │
│  │ Sun │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │                    │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                    │
│  │     │     │     │  1  │  2  │  3  │  4  │                    │
│  │     │     │     │ 🗓️  │     │ 📧  │     │                    │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                    │
│  │  5  │  6  │  7  │  8  │  9  │ 10  │ 11  │                    │
│  │     │ 📱  │ 📱  │ 📝  │ 📱  │ 📧  │     │                    │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                    │
│  │ 12  │ 13  │ 14  │ 15  │ 16  │ 17  │ 18  │                    │
│  │     │ 📱  │ 📱  │ 📝  │ 📱  │ 📧  │     │                    │
│  └─────┴─────┴─────┴─────┴─────┴─────┴─────┘                    │
│                                                                  │
│  Legend: 📧 Email  📱 Social  📝 Blog  🗓️ Campaign Start        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  January Content Plan                                    │   │
│  │  ────────────────────                                    │   │
│  │  • 2 posts/week: 1 showcase, 1 project inspiration       │   │
│  │  • Google Ads: "DIY home remodel", "unfinished cabinets" │   │
│  │  • Email: Monthly newsletter + welcome series active     │   │
│  │  • Blog: "Start Your Project Now" article                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 6.5 Color Palette & Typography

### Colors (Zander Brand)

```
Primary:
- Navy:     #0C2340  (headers, primary actions)
- Gold:     #F0B323  (accents, highlights, CTAs)
- Red:      #BF0A30  (alerts, important, MCF brand)

Secondary:
- Blue:     #005687  (links, secondary actions)
- Tan:      #B79A81  (warm accents)

Neutrals:
- White:    #FFFFFF
- Off-white:#F8F9FA  (backgrounds)
- Light gray:#E9ECEF (borders, dividers)
- Gray:     #6C757D  (secondary text)
- Dark:     #212529  (primary text)

Status:
- Success:  #28A745
- Warning:  #FD7E14
- Error:    #DC3545
- Info:     #17A2B8
```

### Typography

```
Font Family: Inter (primary), system-ui fallback

Headings:
- H1: 2.5rem (40px), weight 700
- H2: 2rem (32px), weight 600
- H3: 1.5rem (24px), weight 600
- H4: 1.25rem (20px), weight 600

Body:
- Large: 1.125rem (18px), weight 400
- Regular: 1rem (16px), weight 400
- Small: 0.875rem (14px), weight 400
- Tiny: 0.75rem (12px), weight 400

Line Heights:
- Headings: 1.2
- Body: 1.6
```

## 6.6 Component Library

### Buttons

```
Primary:   Navy background, white text, gold hover
Secondary: White background, navy border, navy text
Danger:    Red background, white text
Ghost:     Transparent, navy text, subtle hover
```

### Cards

```
- White background
- 12px border radius
- Subtle shadow (0 2px 8px rgba(0,0,0,0.08))
- 1px light gray border
- 1.5rem padding
- Hover: lift effect (translateY -2px), deeper shadow
```

### Form Elements

```
Inputs:
- 2px border, light gray
- 4px border radius
- Focus: Navy border, subtle glow
- Error: Red border

Selects:
- Same styling as inputs
- Custom dropdown indicator

Checkboxes/Radios:
- Custom styling with navy/gold accent
```

---

# 7. Data Architecture

## 7.1 Core Entities

### Contact
```
Contact {
  id: UUID
  email: String (unique)
  phone: String
  firstName: String
  lastName: String
  company: String
  title: String
  source: String
  sourceDetail: String
  leadScore: Integer
  tags: String[]
  customFields: JSON
  createdAt: DateTime
  updatedAt: DateTime
  lastActivityAt: DateTime
  crmContactId: UUID (link to CRO)
}
```

### Campaign
```
Campaign {
  id: UUID
  name: String
  type: Enum (email, social, ads, multi-channel)
  status: Enum (draft, scheduled, active, paused, completed)
  goal: String
  budget: Decimal
  startDate: DateTime
  endDate: DateTime
  targetSegmentId: UUID
  createdBy: UUID
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Email
```
Email {
  id: UUID
  campaignId: UUID
  name: String
  subject: String
  preheader: String
  fromName: String
  fromEmail: String
  replyTo: String
  bodyHtml: Text
  bodyText: Text
  status: Enum (draft, scheduled, sent)
  scheduledAt: DateTime
  sentAt: DateTime
  stats: JSON (opens, clicks, etc.)
}
```

### Workflow
```
Workflow {
  id: UUID
  name: String
  description: String
  status: Enum (draft, active, paused)
  triggerType: Enum (form, tag, score, date, manual)
  triggerConfig: JSON
  nodes: JSON (workflow definition)
  stats: JSON (entries, completions, etc.)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Persona
```
Persona {
  id: UUID
  name: String
  avatar: String (URL)
  demographics: JSON
  psychographics: JSON
  behaviors: JSON
  painPoints: String[]
  goals: String[]
  preferredChannels: String[]
  brandAffinities: String[]
  interview: Text (full narrative)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Asset
```
Asset {
  id: UUID
  type: Enum (logo, image, video, document, template)
  name: String
  description: String
  url: String
  thumbnailUrl: String
  tags: String[]
  folder: String
  metadata: JSON
  createdAt: DateTime
  updatedAt: DateTime
}
```

### CalendarEvent
```
CalendarEvent {
  id: UUID
  type: Enum (campaign, email, social, blog, ad, meeting, reminder)
  title: String
  description: String
  startDate: DateTime
  endDate: DateTime
  allDay: Boolean
  recurring: JSON
  linkedEntityType: String
  linkedEntityId: UUID
  status: Enum (planned, scheduled, published, completed)
  assignedTo: UUID[]
  createdAt: DateTime
  updatedAt: DateTime
}
```

## 7.2 CRO Integration

### Stage 0 Handoff

When a lead qualifies (score threshold, form type, or manual trigger):

```
1. CMO creates/updates Contact record
2. CMO triggers "handoff to CRO" event
3. CRO creates Deal at Stage 0
4. Deal linked to Contact
5. Attribution data passed (source, campaign, score)
6. Sales team notified
7. CMO continues nurturing until Deal moves to Stage 1+
```

### Shared Data

```
Shared between CMO and CRO:
- Contact records
- Activity history
- Tags
- Custom fields
- Communication preferences

CMO-specific:
- Email engagement
- Lead score
- Marketing campaigns
- Automation enrollment

CRO-specific:
- Deal records
- Pipeline stage
- Sales activities
- Revenue data
```

---

# 8. Integration Requirements

## 8.1 Priority Integrations (Launch)

| Integration | Type | Purpose | Status |
|-------------|------|---------|--------|
| Resend | Email sending | Transactional + marketing email | Exists |
| Twilio | SMS | SMS campaigns + notifications | Exists in EA |
| Meta Business Suite | Social | Facebook, Instagram posting + ads | Build |
| Google Analytics | Analytics | Website traffic, conversions | Build |
| Canva | Design | Graphics creation inside Zander | Build |
| Calendly | Scheduling | Meeting booking | Exists |

## 8.2 Phase 2 Integrations

| Integration | Type | Purpose |
|-------------|------|---------|
| Mailchimp | Email platform | For users with existing Mailchimp |
| Google Ads | Advertising | Search, display, YouTube ads |
| Meta Ads | Advertising | Facebook, Instagram ads |
| Adobe Express | Design | Professional design tools |
| LinkedIn | Social | B2B posting, company pages |

## 8.3 Phase 3 Integrations

| Integration | Type | Purpose |
|-------------|------|---------|
| WordPress | CMS | Blog publishing |
| Squarespace | CMS | Website forms, content |
| SEMrush | SEO | Keyword data, site audits |
| Google Search Console | SEO | Search rankings, indexing |
| ActiveCampaign | Email | For power users |

## 8.4 Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       ZANDER CMO                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 Integration Layer                        │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│  │  │ OAuth   │ │ Webhook │ │   API   │ │  Embed  │       │   │
│  │  │ Manager │ │ Handler │ │ Client  │ │ Handler │       │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              External Services                           │   │
│  │                                                          │   │
│  │  [Resend] [Twilio] [Meta] [Google] [Canva] [Mailchimp]  │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# 9. Don AI Specifications

## 9.1 Don's Personality

**Don embodies:**
- The confidence of Don Draper
- The strategic thinking of a world-class CMO
- The approachability of a trusted advisor
- The efficiency of an AI assistant

**Don's voice:**
- Confident but not arrogant
- Strategic but not academic
- Direct but not cold
- Proactive but not pushy

**Example Don interactions:**

```
"Your email open rates are up 12% this month. I'd recommend 
increasing send frequency from weekly to twice weekly. Want me 
to adjust the calendar?"

"I notice the 'Free Guide' landing page is converting at 8.2% — 
that's strong. Consider creating similar offers for your other 
services. I can draft some options."

"Before you post this, let's run the Ashley test: Would this 
resonate with a busy professional mom who values quality and 
authenticity? The promotional tone might feel pushy. Here's 
a warmer version..."
```

## 9.2 Don's Capabilities

### Strategic Planning
- Annual marketing calendar generation
- Campaign strategy recommendations
- Budget allocation suggestions
- Goal setting guidance

### Content Creation
- Blog post drafts
- Email copy
- Social media posts
- Ad copy
- Landing page copy
- Subject lines
- CTAs

### Execution
- Automated workflow management
- Scheduled post publishing
- Email sequence management
- A/B test management

### Analysis
- Performance reporting
- Trend identification
- Anomaly detection
- Optimization recommendations

### Persona Validation
- "Ashley Brown test" for content
- Tone/voice matching
- Audience resonance scoring

### Research
- Monthly market updates
- Competitor monitoring
- Industry trend tracking
- SEO opportunity identification

## 9.3 Don's Limitations

Don should NOT:
- Make final decisions on budget allocation without approval
- Change live campaigns without confirmation
- Access sensitive financial data beyond marketing budget
- Represent the company externally without review
- Override human-set strategies without explicit permission

---

# 10. Marketing Structure Framework

## 10.1 The 15-Category Marketing Model

Based on the folder structure and Marketing.docx template:

### 1. Strategy and Planning
- Marketing plans
- Market research
- KPIs and goals
- Budget planning
- Competitive analysis

### 2. Branding and Messaging
- Brand guidelines
- Key messaging
- Reputation management
- Brand voice documentation

### 3. Content Marketing
- Content strategy
- Content creation
- Content distribution
- Editorial calendar

### 4. Digital Marketing
- SEO
- Paid advertising
- Email marketing

### 5. Social Media Marketing
- Social media strategy
- Content creation
- Scheduling and automation

### 6. Advertising and Media Buying
- Ad campaign development
- Media buying
- Performance analysis

### 7. Lead Generation and Nurturing
- Lead capture
- Lead management
- Nurturing campaigns

### 8. Sales Enablement
- Sales collateral
- CRM integration
- Training resources

### 9. Analytics and Reporting
- Web analytics
- Campaign performance
- Customer insights

### 10. Event Marketing
- Event planning
- Promotions
- Follow-up

### 11. Public Relations
- Press releases
- Thought leadership
- Crisis communication

### 12. Marketing Automation
- Tools and platforms
- Workflow automation
- Trigger-based campaigns

### 13. Partnerships and Affiliate Marketing
- Affiliate programs
- Partnership marketing
- Tracking and payouts

### 14. Product Marketing
- Product positioning
- Launch campaigns
- Customer feedback

### 15. Customer Experience and Retention
- Loyalty programs
- Retention campaigns
- Customer feedback

## 10.2 Annual Calendar Framework

Based on Economy Cabinets calendar example:

| Month | Theme | Focus Areas |
|-------|-------|-------------|
| January | New Year, New Look | Fresh starts, home makeovers, quick availability |
| February | Valentine's for the Home | "Love your space," quality materials |
| March | Spring Refresh | Spring projects, color inspiration |
| April | Tax Refund Remodeling | Upgrade timing, value messaging |
| May | Pre-Summer Makeover | Outdoor projects, durability |
| June | Father's Day Workshop | DIY projects, fast shipping |
| July | Made in the USA | Independence, local manufacturing |
| August | Back-to-School Organization | Storage solutions, organization |
| September | Fall Refresh | Pre-holiday updates, quality focus |
| October | DIY Season | Customization, creative finishes |
| November | Holiday Hosting Prep | Quick upgrades, in-stock items |
| December | Year-End Project Deals | Promotions, customer showcases |

---

# 11. Implementation Roadmap

## Phase 1: Foundation (Weeks 1-4)

- [ ] Database schema implementation
- [ ] Basic CRUD operations for all entities
- [ ] CRO integration (Stage 0 handoff)
- [ ] Contact management
- [ ] Basic email sending (Resend)

## Phase 2: Core Features (Weeks 5-8)

- [ ] Visual workflow builder
- [ ] Email campaign creator
- [ ] Marketing calendar
- [ ] Basic dashboard
- [ ] Form builder

## Phase 3: Automation (Weeks 9-12)

- [ ] Automation engine
- [ ] Site tracking implementation
- [ ] Lead scoring
- [ ] Email sequences
- [ ] Social media scheduling

## Phase 4: Intelligence (Weeks 13-16)

- [ ] Don AI integration
- [ ] Analytics dashboard
- [ ] Attribution reporting
- [ ] Persona hub
- [ ] Content generator

## Phase 5: Integrations (Weeks 17-20)

- [ ] Meta Business Suite
- [ ] Google Analytics
- [ ] Canva
- [ ] Additional integrations

## Phase 6: Polish (Weeks 21-24)

- [ ] UI/UX refinement
- [ ] Performance optimization
- [ ] Documentation
- [ ] Beta testing with MCF + 64W
- [ ] Launch preparation

---

# 12. Reference Materials

## 12.1 Source Documents

| Document | Purpose |
|----------|---------|
| Zander Manifesto (186 pages) | Complete vision, 7 executives, business model |
| Marketing.docx | 15-category marketing structure |
| marketing-plan-outline.docx | Annual plan template |
| 64W_Marketing_Funnel_Session_Handoff.md | Complete funnel architecture for 64W |
| MCF Brand Guidelines (PDF) | Visual brand identity |
| Economy Cabinets Calendar | Example annual calendar |
| MCF_EC_Complete_Marketing_SOP | SEO, Local, Google Ads SOP |
| Ashley Brown Interview | Persona interview example |

## 12.2 Strategy Templates

Available templates for CMO users:
- Annual marketing budget template
- Marketing strategy template
- Content marketing strategy template
- Email marketing strategy template
- Social media strategy template
- Customer persona template

## 12.3 Competitive Intelligence

| Competitor | Key Features to Match | Key Features to Beat |
|------------|----------------------|---------------------|
| HubSpot | Visual workflow builder, attribution | Price, complexity, unified executives |
| ActiveCampaign | Deep email automation, site tracking | CRM integration, AI-native |
| GoHighLevel | Funnel builder, unified inbox | White-label complexity, pricing |
| Mailchimp | Ease of use, templates | Automation depth, pipeline integration |

---

# Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Stage 0** | First stage in CRO pipeline, where marketing hands off qualified leads |
| **Don** | AI assistant persona for CMO module |
| **Ashley Brown Test** | Validating marketing against target persona |
| **MQL** | Marketing Qualified Lead |
| **Attribution** | Tracking which marketing efforts drive revenue |
| **Workflow** | Automated sequence of marketing actions |
| **Funnel** | Visual representation of customer journey stages |

---

# Appendix B: Quick Reference

## CMO Module URL Structure

```
/cmo                     - Dashboard
/cmo/calendar            - Marketing calendar
/cmo/calendar/annual     - Annual view
/cmo/calendar/ideas      - Idea parking lot
/cmo/campaigns           - Campaign list
/cmo/campaigns/:id       - Campaign detail
/cmo/automations         - Workflow list
/cmo/automations/:id     - Workflow builder
/cmo/content/email       - Email list
/cmo/content/social      - Social content
/cmo/content/pages       - Landing pages
/cmo/content/forms       - Forms
/cmo/assets              - Brand library
/cmo/audience            - Contacts
/cmo/audience/segments   - Segments
/cmo/audience/personas   - Personas
/cmo/analytics           - Analytics dashboard
/cmo/analytics/reports   - Reports
/cmo/settings            - CMO settings
```

## Key Keyboard Shortcuts

```
Cmd/Ctrl + K     - Quick search
Cmd/Ctrl + N     - New (context-aware)
Cmd/Ctrl + S     - Save
Cmd/Ctrl + E     - Edit mode
Esc              - Cancel/Close
```

---

**End of Specification Document**

*Last updated: January 24, 2026*
*Version: 1.0*
