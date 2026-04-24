# Executive Context Awareness Rules (PERMANENT)

## Overview
Every AI executive's BFF route must inject tenant-specific data context into the system prompt before every Anthropic API call. This is what makes the executives aware of the user's business and each other. Without this, executives are useless.

## Architecture — Two Context Layers

### Layer 1: Domain-Specific Context
Each executive fetches their own domain data. Built as an async function in each BFF route file.

| Executive | Function | Data Fetched |
|-----------|----------|-------------|
| Don (CMO) | buildMarketingDataContext() | campaigns, personas, funnels, segments, workflows, templates, brand, marketing plan, calendar |
| Jordan (CRO) | buildSalesDataContext() | contacts, deals, activities, pipeline stages |
| Pam (EA) | buildExecutiveAssistantContext() | calendar events, tasks, emails, HQ dashboard |
| Ben (CFO) | TBD | financials, invoices, expenses, budgets, forecasts |
| Miranda (COO) | TBD | operations, processes, KPIs, team metrics |
| Ted (CPO) | TBD | products, features, roadmap, feedback |
| Jarvis (CIO) | TBD | systems, integrations, security, infrastructure |

### Layer 2: Cross-Executive Team Context
Shared utility imported by ALL executive BFF routes:
- File: `apps/web/app/api/shared/executive-context.ts`
- Function: `buildCrossExecutiveContext(authHeaders)`
- Provides: Summary of marketing activity, sales pipeline, schedule, tasks, HQ keystones/headwinds
- Purpose: Every executive knows what the other executives are working on

## MANDATORY: When Adding New Features

When ANY new feature, module, or data model is added to Zander:

1. **Identify which executive(s) own it** — who should know about this data?
2. **Update that executive's domain context builder** — add a fetch call for the new data and format it into the context string
3. **Update the shared cross-executive context** if the feature is relevant to team coordination (most are)
4. **Test** — open each affected executive in a fresh chat and verify they reference the new data without being asked

### Example: Adding a "Partnerships" module
1. Don and Jordan both need to know about partnerships
2. Add partnership fetch to Don's buildMarketingDataContext() and Jordan's buildSalesDataContext()
3. Add partnership summary to buildCrossExecutiveContext()
4. Test: Ask Don "What partnerships do we have?" — he should answer from context, not ask you to look it up

## File Locations

- Don: `apps/web/app/api/cmo/don/route.ts`
- Jordan: `apps/web/app/api/cro/jordan/route.ts`
- Pam: `apps/web/app/api/ea/pam/route.ts`
- Shared: `apps/web/app/api/shared/executive-context.ts`

## Rules

1. **NEVER** call Anthropic without injecting both domain context AND cross-executive context
2. **NEVER** build an executive BFF route that skips context injection
3. All context fetch calls must use try/catch with null fallback — a failed fetch must not crash the executive
4. Context is fetched fresh on EVERY message — no caching, no stale data
5. When building Ben, Miranda, Ted, or Jarvis — follow this exact pattern. Read Don's implementation as the reference.
