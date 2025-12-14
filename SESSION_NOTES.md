# Zander SaaS Development Session - December 14, 2025

## Current Branch
`working-dashboard-dec13`

## Servers
- Frontend: `cd ~/dev/zander-saas && npm run dev` → http://localhost:3002
- Backend: `cd ~/dev/zander-saas/apps/api && npm run start:dev` → http://localhost:3001

## What We Completed This Session

### 1. Settings Page (`/settings`)
Created comprehensive 7-tab settings page at `apps/web/app/settings/page.tsx`:
- **Profile**: First/last name, email, phone, timezone, notification toggles (email, deal alerts, task reminders, assembly reminders, weekly digest)
- **Company**: Name, website, email, phone, industry dropdown, logo upload placeholder, address fields, fiscal year start, currency, tax rate
- **Team**: Team member table with roles (Owner/Admin/Manager/Member), keystones, status badges, invite functionality, roles & permissions grid
- **Pipeline**: Draggable stages with colors/probabilities, stale deal threshold, win/loss reason tags
- **Integrations**: 6 categories (Accounting, Email, CRM, Productivity, Calendar, Storage) with connection status
- **Billing**: Current plan display, payment method, invoice history
- **Data**: Export options (CSV/JSON), data retention, audit log, delete account danger zone

**Fixed syntax error**: Line 631 had `opacity: 0.8'` (stray quote)

### 2. Shared NavBar Component
Created `apps/web/app/components/NavBar.tsx` with:
- Zander logo linking to dashboard
- Module switcher (CRO, CFO, COO, CMO, CPO, CIO, EA) with color-coded active states
- HQ button linking to /headquarters
- **Clickable avatar + name** that opens dropdown menu:
  - User info header (name, email, avatar)
  - Settings link → /settings
  - My Profile link → /settings?tab=profile
  - Billing link → /settings?tab=billing
  - Logout button (calls logout function)
- Theme toggle
- Click-outside-to-close functionality

### 3. Updated All Pages to Use NavBar
Replaced inline nav code with `<NavBar activeModule="cro" />` in 13 pages:
- `app/page.tsx` (Dashboard)
- `app/pipeline/page.tsx`
- `app/contacts/page.tsx`
- `app/analytics/page.tsx`
- `app/automation/page.tsx`
- `app/forms/page.tsx`
- `app/ai/page.tsx`
- `app/settings/page.tsx`
- `app/headquarters/page.tsx`
- `app/deals/[id]/page.tsx`
- `app/contacts/[id]/page.tsx`
- `app/pipeline/import/page.tsx`
- `app/contacts/import/page.tsx`

## Git Status
All changes committed and pushed to `working-dashboard-dec13`

## File Structure Reference
```
apps/web/app/
├── components/
│   ├── AuthGuard.tsx
│   ├── NavBar.tsx          ← NEW: Shared navigation component
│   ├── Navigation.tsx      ← OLD: Can be deleted (unused)
│   ├── Sidebar.tsx
│   ├── ThemeProvider.tsx
│   └── ThemeToggle.tsx
├── settings/
│   └── page.tsx            ← NEW: 7-tab settings page
├── headquarters/
│   └── page.tsx
├── pipeline/
│   ├── page.tsx
│   └── import/page.tsx
├── contacts/
│   ├── page.tsx
│   ├── [id]/page.tsx
│   └── import/page.tsx
├── deals/
│   └── [id]/page.tsx
├── analytics/page.tsx
├── automation/page.tsx
├── forms/page.tsx
├── ai/page.tsx
└── page.tsx                ← Dashboard
```

## Key Technical Patterns

### NavBar Import Patterns
- Root level pages: `import NavBar from './components/NavBar';`
- One level deep: `import NavBar from '../components/NavBar';`
- Two levels deep: `import NavBar from '../../components/NavBar';`

### Workflow for Terminal-Based Editing
1. Use `grep -n` to find line numbers
2. Use `sed -n 'X,Yp'` to view specific lines
3. For large replacements: split file with sed, create new middle section, cat together
4. Always check for stray closing tags after nav replacement
5. Commit frequently after each working milestone

## Zander Brand Colors (CSS Variables)
```css
--zander-red: #BF0A30
--zander-navy: #0C2340
--zander-gold: #F0B323
--zander-off-white: #EAE6DB
--zander-gray: #6c757d
--zander-border-gray: #dee2e6
```

## Next Steps / Backlog
1. Connect Settings page to backend API (save/load user preferences)
2. Implement team invitation flow
3. Build CFO module (next AI executive)
4. User authentication improvements
5. Clean up unused Navigation.tsx component

## Commands to Start Development
```bash
cd ~/dev/zander-saas
git checkout working-dashboard-dec13
npm run dev
# In separate terminal:
cd ~/dev/zander-saas/apps/api && npm run start:dev
```

## Test URLs
- Dashboard: http://localhost:3002/
- Settings: http://localhost:3002/settings
- Pipeline: http://localhost:3002/pipeline
- Contacts: http://localhost:3002/contacts
- HQ: http://localhost:3002/headquarters
