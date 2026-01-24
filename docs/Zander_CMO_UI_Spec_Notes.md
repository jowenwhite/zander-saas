# Zander CMO UI Spec Notes
## Production Build Reference

**Document Version:** 1.0  
**Created:** January 24, 2026  
**Status:** Ready for Production Implementation  
**Prototype Reference:** `Zander_CMO_Dashboard_v3.html`

---

## 1. Structure Validated ✅

The prototype validates these structural decisions:

### Top Navigation (Uniform Across All Executives)
- Zander logo + bolt icon (left)
- Organization selector dropdown
- Executive tabs: CRO | CFO | COO | **CMO** | CPO | CIO | EA
- HQ button
- **Dark/Light mode toggle** ← needs placement top right
- User profile dropdown (right)

### Left Sidebar - 5 Pillars Structure
```
MARKETING (section header)
├── Production (default/home) ← active state
├── Projects (shared)
├── People (shared) — absorbs Contacts, Personas, Segments
└── Products (shared)

PROCESS (section header)
├── Communication — Email, Social, Content creation
├── Schedule — Calendar, Annual View, Idea Parking Lot
├── Forms — Forms, Landing Pages
└── Ask Don (CMO) — AI assistant

AUTOMATION (CMO-specific)
├── Workflows [badge: count]
├── Funnels
└── Sequences [badge: count]

INSIGHTS (CMO-specific)
├── Analytics
├── Reports
└── Attribution

ASSETS (CMO-specific)
├── Brand Library
├── Media
└── Templates

ADMIN (Jonathan only)
├── Treasury Admin
└── Support Admin
```

### Main Content - Dashboard Layout
1. Welcome header with user avatar + greeting
2. Action buttons (New Campaign, New Lead, Customize)
3. **Monthly Theme Banner** — navy gradient, shows current theme + stats
4. KPI Cards (4 across)
5. Campaign Pipeline (kanban: Planning → Creating → Review → Active → Completed → Archived)
6. **Don's Insights + Active Automations** (side by side, equal width)
7. Info Cards 2x2 (Recent Activity, Action Required, Upcoming Schedule, **Persona Card**)
8. Analytics row (4 metrics)
9. Funnel + Content Performance (2 column)

### Fixed Elements
- **Don Robot Button** — bottom right corner, red circle, opens AI assistant
- **Dark/Light Toggle** — top right header area

---

## 2. Production Polish Required

### 2.1 Icon System

**Current State:** Mixed emoji icons (📊, 🔀, 👥, etc.)

**Production Requirement:** Single icon library for consistency

**Recommended:** Lucide React (already used in Zander CRO)

| Section | Icons Needed |
|---------|--------------|
| Navigation | BarChart3, FolderKanban, Users, Package, MessageSquare, Calendar, FileText, Bot, GitBranch, Target, Mail, TrendingUp, FileBarChart, Link, Palette, Image, FileTemplate, Building, LifeBuoy |
| KPIs | Mail, Users, Target, TrendingUp |
| Status | Circle (with fill colors for status dots) |
| Actions | Plus, Settings, ChevronDown, ArrowRight |

**Icon Sizing:**
- Navigation: 18px
- KPI cards: 20px
- Inline/badges: 14px

---

### 2.2 Typography Scale

**Font Family:** Inter (already in use)

**Scale:**
```css
--text-xs: 0.75rem;    /* 12px - badges, sublabels */
--text-sm: 0.875rem;   /* 14px - body, nav items */
--text-base: 1rem;     /* 16px - default */
--text-lg: 1.125rem;   /* 18px - card titles */
--text-xl: 1.25rem;    /* 20px - section headers */
--text-2xl: 1.5rem;    /* 24px - page titles */
--text-3xl: 1.875rem;  /* 30px - KPI values */
--text-4xl: 2.25rem;   /* 36px - welcome greeting */
```

**Font Weights:**
- 400: Body text
- 500: Nav items, labels
- 600: Card titles, section headers
- 700: KPI values, emphasis

---

### 2.3 Spacing System

**Base Unit:** 4px

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
```

**Component Spacing:**
- Card padding: `--space-5` (20px)
- Card gap: `--space-4` (16px)
- Section margin-bottom: `--space-6` (24px)
- Nav item padding: `--space-2 --space-3` (8px 12px)

---

### 2.4 Color Tokens

**Already defined in prototype, formalize as:**

```css
/* Brand */
--color-primary: #BF0A30;        /* Zander Red */
--color-primary-hover: #A8092A;
--color-secondary: #0C2340;      /* Zander Navy */
--color-secondary-light: #1A3A5C;
--color-accent: #F0B323;         /* Zander Gold */
--color-accent-hover: #D19E1F;

/* Neutrals - Light Mode */
--color-bg-primary: #FFFFFF;
--color-bg-secondary: #F8F9FA;
--color-bg-tertiary: #E9ECEF;
--color-border: #DEE2E6;
--color-text-primary: #212529;
--color-text-secondary: #495057;
--color-text-muted: #6C757D;

/* Neutrals - Dark Mode */
--color-bg-primary-dark: #1A1A2E;
--color-bg-secondary-dark: #16213E;
--color-bg-tertiary-dark: #0F3460;
--color-border-dark: #2A2A4A;
--color-text-primary-dark: #FFFFFF;
--color-text-secondary-dark: #E9ECEF;
--color-text-muted-dark: #ADB5BD;

/* Status */
--color-success: #28A745;
--color-warning: #FD7E14;
--color-error: #DC3545;
--color-info: #17A2B8;
```

---

### 2.5 Dark Mode Implementation

**Toggle Location:** Top header, right side (before user profile)

**Toggle Style:** 
- Sun/Moon icon toggle
- Smooth 200ms transition on all color properties
- Persist preference in localStorage
- Respect system preference as default

**CSS Strategy:**
```css
[data-theme="dark"] {
  --color-bg-primary: var(--color-bg-primary-dark);
  /* ... map all tokens */
}
```

---

### 2.6 Component Sizing Uniformity

| Component | Height | Border Radius |
|-----------|--------|---------------|
| Nav item | 36px | 6px |
| Button (sm) | 32px | 6px |
| Button (md) | 40px | 6px |
| Input | 40px | 6px |
| KPI Card | auto | 10px |
| Info Card | auto | 10px |
| Badge | 20px | 10px (pill) |
| Avatar (sm) | 32px | 50% |
| Avatar (md) | 40px | 50% |
| Avatar (lg) | 56px | 50% |

---

### 2.7 Specific Fixes Noted

1. **Dark mode toggle** — Add to top right header
2. **Icon consistency** — Replace all emoji with Lucide icons
3. **KPI card values** — Standardize to `--text-3xl` (30px)
4. **Section headers** — Standardize to `--text-xl` (20px), weight 600
5. **Card titles** — Standardize to `--text-lg` (18px), weight 600
6. **Badge sizing** — Consistent 20px height, 10px border-radius
7. **Nav item spacing** — Consistent 8px vertical, 12px horizontal padding
8. **Don Robot button** — Ensure 56px, proper shadow, hover scale

---

## 3. CMO-Specific Components to Build

### 3.1 Monthly Theme Banner
- Full-width, navy gradient background
- Left: Theme icon + label + title
- Center: 3 stat cards (posts scheduled, emails planned, % complete)
- Right: "View Calendar" button
- Responsive: Stack on mobile

### 3.2 Don's Insights Card
- Gold/yellow highlight styling (differentiated from other cards)
- Header with Don avatar, title, status indicator (green pulse)
- List of insight items with:
  - Icon
  - Insight text
  - Action link
- Hover state on items

### 3.3 Active Automations Card
- Status dots: green (running), orange (paused), gray (stopped)
- Automation type badges: Workflow (blue), Sequence (orange), Funnel (purple)
- Live stats per automation

### 3.4 Persona Reference Card
- Blue header (differentiated from Don's gold)
- Avatar + name + tagline
- Quick tags (scrollable if overflow)
- "Ashley Test" button — opens persona validation modal

### 3.5 Campaign Pipeline
- Kanban-style columns
- Draggable cards (future)
- Stage counts in badges
- Card shows: title, value/status

---

## 4. Responsive Breakpoints

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

**Layout Changes:**
- `< 768px`: Hide sidebar, single column layout
- `< 1024px`: 2-column grids become single column
- `< 1280px`: 4-column KPI becomes 2-column
- `< 1536px`: Pipeline shows 3 stages (horizontal scroll for rest)

---

## 5. Animation & Transitions

```css
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
```

**Apply to:**
- Hover states: `--transition-fast`
- Color changes (dark mode): `--transition-base`
- Layout shifts: `--transition-slow`

**Pulse Animation (Don status, automation status):**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.9); }
}
```

---

## 6. Next Steps

1. [ ] Set up CMO route in Next.js app (`/cmo`)
2. [ ] Create shared layout component (matches CRO structure)
3. [ ] Implement design tokens as CSS variables
4. [ ] Build Production dashboard page with components
5. [ ] Add dark mode toggle and persistence
6. [ ] Connect to backend APIs for real data
7. [ ] Implement navigation between CMO sections

---

**End of Spec Notes**

*Reference prototype: `Zander_CMO_Dashboard_v3.html`*
