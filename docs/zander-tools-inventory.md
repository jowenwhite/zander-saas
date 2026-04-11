# Zander AI Tools Inventory & Architecture Documentation

**Generated:** April 11, 2026
**File:** `apps/web/app/api/admin/zander/route.ts`
**Total Lines:** 3,615

---

## 1. File Structure Overview

```
apps/web/app/api/admin/zander/route.ts
├── Lines 1-6: Imports & Constants
│   ├── ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
│   └── API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com'
├── Lines 7-121: ZANDER_SYSTEM_PROMPT (Full system prompt)
├── Lines 123-1329: TOOLS Array (60 tool definitions)
├── Lines 1331-3456: executeTool() Function (Tool handler implementations)
└── Lines 3458-3614: POST Handler (Request/response logic)
```

---

## 2. Full System Prompt

```
You are Zander, Jonathan's personal AI operating system for Zander Systems LLC. You are all-knowing, all-powerful, and all-executing. You have complete visibility and control over the entire platform.

PERSONALITY:
- Confident and direct. Never uncertain about your own capabilities.
- When a tool fails, you diagnose the technical issue precisely and state what is happening. You do not catastrophize or suggest escalating to anyone.
- You never refer to yourself as having 'credential issues', 'access problems', or needing 'IT support'. You ARE the IT support. You ARE the platform.
- When something fails, you say what the error is technically (e.g., '401 from /admin/revenue-summary — likely an auth header mismatch on this endpoint') and offer to retry or diagnose further.
- You never suggest Jonathan contact anyone else. You are his right hand. You handle everything.
- First name basis with Jonathan. Direct. No fluff.
- You contain the knowledge and capabilities of all seven executives. You can do anything any of them can do, plus system-wide operations.

RULES:
- Never use create_support_ticket, draft_email, or any communication tool unless Jonathan explicitly asks you to.
- Never take autonomous action without being asked.
- When a tool returns an error, report the exact technical error (status code, endpoint, error message) — not a dramatized interpretation of it.
- You are Jonathan's tool. Serve him directly, efficiently, and without theatrics.

TOOL EXECUTION MANDATE:
- When asked to perform ANY action, ALWAYS invoke the appropriate tool. Never simulate tool execution by writing formatted text responses.
- If a tool call fails, report the exact HTTP status code and endpoint. Never fabricate a success response.
- Read requests (L1) = always call the tool immediately
- Write requests (L2) = call the tool immediately when explicitly asked
- Draft requests (L3) = always call the tool, result lands in Scheduled → Pending for review
- Execute requests (L4) = call the tool after Jonathan confirms

COMMUNICATION EXECUTION AUTHORITY:
You have TWO categories of communication tools with DIFFERENT execution rules:

CATEGORY 1 — Pre-configured automations (sequences, auto-replies, drip campaigns):
- These execute autonomously when triggered
- NO approval queue needed
- DO NOT modify these paths

CATEGORY 2 — Ad-hoc compose/draft requests from chat:
- "Draft a status update...", "Create an announcement...", "Message tenants about..."
- MUST land in Scheduled → Pending for human review
- NEVER auto-send these communications
- When you call draft_status_update, draft_release_notes, draft_founder_update, draft_beta_announcement, or bulk_tenant_message, the result goes to Scheduled → Pending
- Always tell Jonathan: "I've drafted that — it's in your Scheduled queue pending approval"

IMPORTANT: You do NOT have compose_email capability. You cannot draft general emails to external contacts.
For customer/external communications, use the appropriate executives (Jordan for sales, Pam for general comms).

TONE RULES:
- Report data factually. Never catastrophize.
- Low health scores on new tenants are expected — note the tenant's age before flagging as critical.
- One paying tenant in pre-launch stage is normal, not catastrophic. Know the business context.
- Never use phrases like "Platform Guardian Alerts", "Critical Alert", "Urgent Warning", or similar dramatic language.
- Just report the situation directly. Numbers and facts, not alarm.
- Confident and calm. Not alarmed.

TOOL CATEGORIES:

📊 REVENUE INTELLIGENCE (L1 Read):
- get_revenue_summary: MRR, ARR, growth metrics, subscription breakdown
- get_churn_report: Churn analysis, at-risk identification, retention
- get_cac_by_channel: Customer acquisition cost by channel
- get_founding_member_status: Waitlist deposits, conversions, founding members

💚 CUSTOMER HEALTH (L1 Read):
- get_at_risk_accounts: Identify at-risk tenants by engagement
- get_power_users: Find highly engaged users for advocacy
- get_account_health_summary: Overall health metrics and scores
- get_tenant_activity: Detailed per-tenant activity report

☀️ MORNING BRIEFING (L1 Read):
- get_morning_briefing: Complete daily executive briefing

🛠️ DEVELOPMENT OPERATIONS (L1/L2/L4):
- get_build_queue: View pending and in-progress builds
- generate_build_prompt: Create Boris Method prompt for Claude Code
- log_build_start: Start tracking a build session
- log_build_complete: Mark build as completed/failed
- get_parallel_build_status: Check parallel build group status
- get_timeline_status: View project timeline with builds/commits
- approve_and_deploy: Request deployment approval (REQUIRES explicit "yes deploy" confirmation)

📡 PLATFORM INTELLIGENCE (L1 Read):
- get_sentry_summary: Error monitoring (integration pending)
- get_posthog_summary: Product analytics (integration pending)
- get_github_summary: Repository statistics
- get_infrastructure_costs: Estimated AWS/Vercel costs

📣 COMMUNICATION (L3 Draft - NEVER auto-sends):
- draft_founder_update: Create investor/team update
- draft_beta_announcement: Create beta user announcement
- get_waitlist_summary: Waitlist statistics
- bulk_tenant_message: Draft message to multiple tenants

⚡ EXECUTIVE SUPERPOWERS (L1/L4):
- get_cross_platform_summary: Unified view of all platform data
- impersonate_tenant_context: View platform as specific tenant
- execute_admin_action: Execute L4 admin actions with audit logging

🔄 WORKFLOW AUTOMATION (L2 Write):
- set_daily_briefing_schedule: Configure automated briefings
- create_recurring_review: Set up recurring review tasks
- get_action_log: View all Zander actions by level/type

🎫 SUPPORT OPERATIONS (L1/L2):
- get_tickets, get_ticket_details, update_ticket_status, update_ticket_priority
- respond_to_ticket, create_internal_note, link_ticket_to_headwind
- get_headwinds, create_headwind, get_system_health
- get_tenants, get_tenant_details, get_users
- diagnose_issue, draft_status_update, draft_release_notes

👤 TENANT/USER MANAGEMENT (L2 Write):
- update_tenant_status, update_tenant_plan, reset_tenant_tokens, create_tenant
- update_user_role, reset_user_password

BORIS METHOD (for generate_build_prompt):
1. CONTEXT: What exists now, what files are involved
2. GOAL: Specific, measurable outcome
3. CONSTRAINTS: What NOT to do, boundaries
4. ACCEPTANCE: How to verify success
```

---

## 3. Complete Tool Inventory (60 Tools)

### 3.1 Support Operations (12 tools)

| Tool Name | Authority | Lines | Input Parameters | Backend Endpoint | Description |
|-----------|-----------|-------|------------------|------------------|-------------|
| `get_tickets` | L1 Read | 126-152 | `status?`, `priority?`, `tenantId?`, `limit?` | `GET /support-tickets` | Retrieve support tickets with optional filters |
| `get_ticket_details` | L1 Read | 153-170 | `ticketId?`, `ticketNumber?` | `GET /support-tickets/:id` | Get full details of a specific ticket |
| `update_ticket_status` | L2 Write | 171-192 | `ticketId`, `status`, `resolution?` | `PUT /support-tickets/:id` | Change ticket status (NEW/PENDING/RESOLVED/CLOSED) |
| `update_ticket_priority` | L2 Write | 193-212 | `ticketId`, `priority` | `PUT /support-tickets/:id` | Change ticket priority (P1/P2/P3) |
| `respond_to_ticket` | L2 Write | 213-234 | `ticketId`, `response`, `isAiResponse?` | `PUT /support-tickets/:id` | Add a response visible to user |
| `create_internal_note` | L2 Write | 235-252 | `ticketId`, `note` | `PUT /support-tickets/:id` | Add internal admin-only note |
| `link_ticket_to_headwind` | L2 Write | 253-270 | `ticketId`, `headwindId` | `PUT /support-tickets/:id/link-headwind/:headwindId` | Connect ticket to headwind |
| `get_headwinds` | L1 Read | 271-295 | `status?`, `priority?`, `category?` | `GET /headwinds` | Retrieve platform issues/improvements |
| `create_headwind` | L2 Write | 296-327 | `title`, `description`, `priority`, `category`, `linkedTicketId?` | `POST /headwinds` | Create new headwind |
| `get_system_health` | L1 Read | 328-336 | none | `GET /health` | Check platform health status |
| `diagnose_issue` | L1 Read | 440-465 | `symptoms`, `affectedArea`, `tenantId?`, `ticketId?` | Local analysis | Perform technical assessment |
| `create_support_ticket` | L2 Write | 466-497 | `subject`, `description`, `priority?`, `category?`, `tenantId?` | `POST /support-tickets` | Create new support ticket |

### 3.2 Tenant & User Management (9 tools)

| Tool Name | Authority | Lines | Input Parameters | Backend Endpoint | Description |
|-----------|-----------|-------|------------------|------------------|-------------|
| `get_tenants` | L1 Read | 337-355 | `subscriptionStatus?`, `limit?` | `GET /tenants/accessible` | List all tenants |
| `get_tenant_details` | L1 Read | 356-369 | `tenantId` | `GET /tenants/:id` | Get detailed tenant information |
| `get_users` | L1 Read | 564-584 | `tenantId?`, `role?`, `limit?` | `GET /admin/users` | List users across tenants |
| `update_tenant_status` | L2 Write | 600-622 | `tenantId`, `status`, `reason?` | `PATCH /tenants/:id` | Pause/suspend/activate tenant |
| `update_tenant_plan` | L2 Write | 623-645 | `tenantId`, `newPlan`, `effectiveDate?` | `PATCH /tenants/:id` | Change subscription tier |
| `reset_tenant_tokens` | L2 Write | 646-667 | `tenantId`, `reason` | `POST /admin/tenants/:id/reset-tokens` | Reset token balance |
| `create_tenant` | L2 Write | 668-694 | `companyName`, `ownerEmail`, `ownerName`, `plan` | Manual/Pending | Provision new tenant |
| `update_user_role` | L2 Write | 695-717 | `userId`, `newRole`, `reason?` | `PATCH /users/:id` | Change user role |
| `reset_user_password` | L2 Write | 718-731 | `userId` | `POST /auth/forgot-password` | Trigger password reset email |

### 3.3 Communication & Drafting (8 tools)

| Tool Name | Authority | Lines | Input Parameters | Backend Endpoint | Description |
|-----------|-----------|-------|------------------|------------------|-------------|
| `draft_email` | L3 Draft | 409-438 | `to`, `subject`, `body`, `ticketId?`, `tenantId?` | `POST /scheduled-communications` | Draft email for review queue |
| `draft_status_update` | L3 Draft | 732-765 | `incidentTitle`, `severity`, `affectedModules?`, `status`, `message?` | `POST /scheduled-communications` | Draft incident status update |
| `draft_release_notes` | L3 Draft | 766-794 | `version?`, `featureList`, `bugFixes?`, `tone?` | `POST /scheduled-communications` | Draft release notes |
| `draft_founder_update` | L3 Draft | 1109-1143 | `period`, `highlights`, `metrics?`, `challenges?`, `nextMilestones?` | `POST /scheduled-communications` | Draft investor/team update |
| `draft_beta_announcement` | L3 Draft | 1144-1166 | `subject`, `features`, `callToAction?` | `POST /scheduled-communications` | Draft beta user announcement |
| `bulk_tenant_message` | L3 Draft | 1176-1198 | `targetTiers?`, `subject`, `body` | `POST /scheduled-communications` | Draft bulk message |
| `get_waitlist_summary` | L1 Read | 1167-1175 | none | `GET /admin/waitlist-summary` | Waitlist statistics |
| `draft_claude_code_prompt` | L1 Read | 370-408 | `issueType`, `title`, `context`, `goal`, `constraints?`, `acceptanceCriteria?`, `relatedTicketId?` | Local generation | Generate Boris Method prompt |

### 3.4 Revenue Intelligence (4 tools)

| Tool Name | Authority | Lines | Input Parameters | Backend Endpoint | Description |
|-----------|-----------|-------|------------------|------------------|-------------|
| `get_revenue_summary` | L1 Read | 795-804 | none | `GET /admin/revenue-summary` | MRR, ARR, growth metrics |
| `get_churn_report` | L1 Read | 805-813 | none | `GET /admin/churn-report` | Churn analysis and retention |
| `get_cac_by_channel` | L1 Read | 814-822 | none | `GET /admin/cac-by-channel` | Acquisition cost by channel |
| `get_founding_member_status` | L1 Read | 823-831 | none | `GET /admin/founding-member-status` | Waitlist deposits/conversions |

### 3.5 Customer Health (4 tools)

| Tool Name | Authority | Lines | Input Parameters | Backend Endpoint | Description |
|-----------|-----------|-------|------------------|------------------|-------------|
| `get_at_risk_accounts` | L1 Read | 832-840 | none | `GET /admin/at-risk-accounts` | Identify at-risk tenants |
| `get_power_users` | L1 Read | 841-849 | none | `GET /admin/power-users` | Find highly engaged users |
| `get_account_health_summary` | L1 Read | 850-858 | none | `GET /admin/account-health-summary` | Overall health metrics |
| `get_tenant_activity` | L1 Read | 859-873 | `tenantId` | `GET /admin/tenant-activity/:id` | Per-tenant activity report |

### 3.6 Development Operations (8 tools)

| Tool Name | Authority | Lines | Input Parameters | Backend Endpoint | Description |
|-----------|-----------|-------|------------------|------------------|-------------|
| `get_build_queue` | L1 Read | 885-893 | none | `GET /admin/build-queue` | View pending builds |
| `generate_build_prompt` | L2 Write | 894-940 | `issueType`, `title`, `context`, `goal`, `constraints?`, `acceptanceCriteria?`, `linkedHeadwindId?`, `linkedTicketId?`, `createBuildSession?` | `POST /admin/build-session` | Generate Boris Method prompt |
| `log_build_start` | L2 Write | 941-976 | `title`, `description?`, `target?`, `priority?`, `isParallel?`, `parallelGroup?` | `POST /admin/build-session` | Log build session start |
| `log_build_complete` | L2 Write | 977-1011 | `buildId`, `status`, `version?`, `gitCommitHash?`, `buildOutput?`, `errorLog?` | `POST /admin/build-session/:id` | Log build completion |
| `get_parallel_build_status` | L1 Read | 1012-1025 | `parallelGroup` | `GET /admin/parallel-build-status/:group` | Check parallel build status |
| `get_timeline_status` | L1 Read | 1026-1039 | `days?` | Multiple endpoints | View project timeline |
| `approve_and_deploy` | L4 Execute | 1040-1066 | `version`, `target`, `description`, `confirmed?` | `POST /admin/zander-action-log` | Request deployment approval |
| `get_recent_commits` | L1 Read | 585-598 | `limit?` | Local git command | View recent git commits |

### 3.7 Platform Intelligence (4 tools)

| Tool Name | Authority | Lines | Input Parameters | Backend Endpoint | Description |
|-----------|-----------|-------|------------------|------------------|-------------|
| `get_sentry_summary` | L1 Read | 1067-1076 | none | Pending integration | Error monitoring summary |
| `get_posthog_summary` | L1 Read | 1077-1085 | none | Pending integration | Product analytics summary |
| `get_github_summary` | L1 Read | 1086-1099 | `days?` | Local git commands | Repository statistics |
| `get_infrastructure_costs` | L1 Read | 1100-1108 | none | Estimated (local) | AWS/Vercel cost estimates |

### 3.8 Admin Metrics (4 tools)

| Tool Name | Authority | Lines | Input Parameters | Backend Endpoint | Description |
|-----------|-----------|-------|------------------|------------------|-------------|
| `get_error_log` | L1 Read | 499-521 | `limit?`, `severity?`, `tenantId?` | `GET /admin/error-logs` | View application errors |
| `get_performance_metrics` | L1 Read | 522-530 | none | `GET /admin/performance-metrics` | System performance metrics |
| `get_token_usage` | L1 Read | 531-548 | `tenantId?`, `dateFrom?` | `GET /admin/token-usage` | AI token consumption |
| `get_billing_summary` | L1 Read | 549-562 | `tenantId?` | `GET /tenants/:id` or `/tenants/accessible` | Billing status overview |

### 3.9 Executive Superpowers (3 tools)

| Tool Name | Authority | Lines | Input Parameters | Backend Endpoint | Description |
|-----------|-----------|-------|------------------|------------------|-------------|
| `get_cross_platform_summary` | L1 Read | 1199-1208 | none | Multiple admin endpoints | Unified platform view |
| `impersonate_tenant_context` | L1 Read | 1209-1222 | `tenantId` | `GET /admin/tenant-activity/:id` | View as specific tenant |
| `execute_admin_action` | L4 Execute | 1223-1249 | `actionType`, `targetId`, `parameters?`, `reason` | `POST /admin/zander-action-log` + action-specific | Execute admin action with logging |

### 3.10 Workflow Automation (3 tools)

| Tool Name | Authority | Lines | Input Parameters | Backend Endpoint | Description |
|-----------|-----------|-------|------------------|------------------|-------------|
| `set_daily_briefing_schedule` | L2 Write | 1250-1277 | `enabled`, `time?`, `timezone?`, `deliveryMethod?` | `POST /admin/system-config` | Configure briefing schedule |
| `create_recurring_review` | L2 Write | 1278-1305 | `name`, `frequency`, `reviewType`, `dayOfWeek?` | `POST /admin/system-config` | Set up recurring reviews |
| `get_action_log` | L1 Read | 1306-1328 | `limit?`, `level?`, `action?` | `GET /admin/zander-action-log` | View Zander action history |

---

## 4. Architecture Pattern

### 4.1 Tool Definition Pattern

```typescript
// Tool definitions follow Anthropic's schema
const TOOLS = [
  {
    name: 'tool_name',
    description: 'What the tool does and when to use it',
    input_schema: {
      type: 'object',
      properties: {
        paramName: {
          type: 'string',
          description: 'Parameter description'
        }
      },
      required: ['paramName']
    }
  }
];
```

### 4.2 Tool Execution Pattern

```typescript
async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  authToken: string,      // JWT from request
  tenantId: string        // From header or 'system'
): Promise<{ success: boolean; result?: unknown; error?: string }>
```

**Execution Flow:**
1. Switch on `toolName`
2. Build API request with proper headers
3. Call backend API endpoint
4. Transform response into standardized result
5. Return `{ success, result }` or `{ success: false, error }`

### 4.3 Request/Response Flow

```
[Client POST /api/admin/zander]
        ↓
[Extract auth token & tenant ID]
        ↓
[Build messages array with conversation history]
        ↓
[Call Claude API with tools]
        ↓
[Process response content blocks]
        ↓
[For each tool_use block: executeTool()]
        ↓
[If tools executed: follow-up Claude call for summary]
        ↓
[Return JSON: { content, toolsExecuted, stopReason }]
```

### 4.4 Authentication Pattern

```typescript
const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${authToken}`,    // JWT from client
  'x-tenant-id': tenantId,                 // Tenant context
  'x-admin-secret': adminSecret || ''      // For admin endpoints
};
```

### 4.5 Error Handling Pattern

- Tool errors return `{ success: false, error: 'message' }`
- HTTP errors logged with status code and endpoint
- Graceful fallbacks for optional integrations (Sentry, PostHog)
- Never fabricate success - always report actual errors

---

## 5. Gap Analysis vs Phase 1+2 Spec

### 5.1 Spec Tools to Verify

| Spec Tool | Status | Existing Equivalent | Notes |
|-----------|--------|---------------------|-------|
| `tenant_rename` | **MISSING** | None | Needs implementation |
| `tenant_archive` | **MISSING** | `update_tenant_status` (partial) | Status can be 'suspended' but no archive |
| `tenant_restore` | **MISSING** | `update_tenant_status` (partial) | Can set to 'active' but no restore concept |
| `tenant_tier_override` | **EXISTS** | `update_tenant_plan` | Changes subscriptionTier |
| `tenant_trial_extend` | **MISSING** | None | No trial extension tool |
| `get_tenant_activity_log` | **EXISTS** | `get_tenant_activity` | Per-tenant activity report |
| `get_system_health` | **EXISTS** | `get_system_health` | Checks /health endpoint |
| `get_error_logs` | **EXISTS** | `get_error_log` | Via /admin/error-logs |
| `get_tenant_engagement_snapshot` | **EXISTS** | `get_tenant_activity` | Detailed engagement data |
| `get_at_risk_users` | **EXISTS** | `get_at_risk_accounts` | Account-level, not user-level |
| `get_power_users` | **EXISTS** | `get_power_users` | Already implemented |
| `get_churning_users` | **MISSING** | `get_churn_report` (partial) | Report exists, no user-level tool |
| `draft_at_risk_outreach` | **MISSING** | None | Needs implementation |
| `draft_upgrade_offer` | **MISSING** | None | Needs implementation |
| `draft_reactivation_campaign` | **MISSING** | None | Needs implementation |

### 5.2 Summary Lists

#### GAPS (Phase 2 Tools to Add)

1. **tenant_rename** - Rename tenant/company name
2. **tenant_archive** - Soft-archive tenant with data preservation
3. **tenant_restore** - Restore archived tenant
4. **tenant_trial_extend** - Extend trial period for tenant
5. **get_churning_users** - User-level churn identification
6. **draft_at_risk_outreach** - Draft outreach to at-risk accounts
7. **draft_upgrade_offer** - Draft upgrade offer communications
8. **draft_reactivation_campaign** - Draft reactivation campaigns

#### OVERLAPS (Already Exist - Don't Add Duplicates)

1. **tenant_tier_override** → `update_tenant_plan`
2. **get_system_health** → `get_system_health`
3. **get_error_logs** → `get_error_log`
4. **get_tenant_activity_log** → `get_tenant_activity`
5. **get_tenant_engagement_snapshot** → `get_tenant_activity`
6. **get_at_risk_users** → `get_at_risk_accounts` (account-level)
7. **get_power_users** → `get_power_users`

#### MODIFICATIONS (Existing Tools Needing Updates)

1. **get_at_risk_accounts** → Rename to `get_at_risk_users` OR add user-level granularity
2. **get_churn_report** → Add user-level `get_churning_users` companion
3. **update_tenant_status** → Add 'archived' status option
4. Consider splitting `update_tenant_status` into:
   - `tenant_pause`
   - `tenant_suspend`
   - `tenant_archive`
   - `tenant_restore`

---

## 6. Recommendations for Phase 2

### 6.1 Add These 8 New Tools

```typescript
// 1. tenant_rename
{
  name: 'tenant_rename',
  description: 'Rename a tenant company name. Audit logged.',
  input_schema: {
    properties: {
      tenantId: { type: 'string' },
      newName: { type: 'string' },
      reason: { type: 'string' }
    },
    required: ['tenantId', 'newName', 'reason']
  }
}

// 2. tenant_archive
{
  name: 'tenant_archive',
  description: 'Soft-archive a tenant. Data preserved, access suspended.',
  input_schema: {
    properties: {
      tenantId: { type: 'string' },
      reason: { type: 'string' }
    },
    required: ['tenantId', 'reason']
  }
}

// 3. tenant_restore
{
  name: 'tenant_restore',
  description: 'Restore an archived tenant to active status.',
  input_schema: {
    properties: {
      tenantId: { type: 'string' },
      reason: { type: 'string' }
    },
    required: ['tenantId', 'reason']
  }
}

// 4. tenant_trial_extend
{
  name: 'tenant_trial_extend',
  description: 'Extend trial period for a tenant.',
  input_schema: {
    properties: {
      tenantId: { type: 'string' },
      extensionDays: { type: 'number' },
      reason: { type: 'string' }
    },
    required: ['tenantId', 'extensionDays', 'reason']
  }
}

// 5. get_churning_users
{
  name: 'get_churning_users',
  description: 'Identify users showing churn signals (decreased activity, no login).',
  input_schema: {
    properties: {
      daysInactive: { type: 'number' },
      tenantId: { type: 'string' }
    },
    required: []
  }
}

// 6. draft_at_risk_outreach
{
  name: 'draft_at_risk_outreach',
  description: 'Draft personalized outreach to at-risk accounts. Never auto-sends.',
  input_schema: {
    properties: {
      tenantId: { type: 'string' },
      riskFactors: { type: 'array', items: { type: 'string' } },
      tone: { type: 'string', enum: ['supportive', 'direct', 'urgent'] }
    },
    required: ['tenantId']
  }
}

// 7. draft_upgrade_offer
{
  name: 'draft_upgrade_offer',
  description: 'Draft upgrade offer for high-engagement accounts. Never auto-sends.',
  input_schema: {
    properties: {
      tenantId: { type: 'string' },
      currentTier: { type: 'string' },
      targetTier: { type: 'string' },
      incentive: { type: 'string' }
    },
    required: ['tenantId', 'targetTier']
  }
}

// 8. draft_reactivation_campaign
{
  name: 'draft_reactivation_campaign',
  description: 'Draft reactivation campaign for churned/inactive accounts. Never auto-sends.',
  input_schema: {
    properties: {
      targetTenants: { type: 'array', items: { type: 'string' } },
      campaignType: { type: 'string', enum: ['win-back', 'feature-update', 'special-offer'] },
      offer: { type: 'string' }
    },
    required: ['campaignType']
  }
}
```

### 6.2 Backend Endpoints Needed

| Tool | Required Backend Endpoint |
|------|---------------------------|
| `tenant_rename` | `PATCH /tenants/:id` (add name field support) |
| `tenant_archive` | `POST /admin/tenants/:id/archive` |
| `tenant_restore` | `POST /admin/tenants/:id/restore` |
| `tenant_trial_extend` | `POST /admin/tenants/:id/extend-trial` |
| `get_churning_users` | `GET /admin/churning-users` |
| `draft_at_risk_outreach` | Uses existing `/scheduled-communications` |
| `draft_upgrade_offer` | Uses existing `/scheduled-communications` |
| `draft_reactivation_campaign` | Uses existing `/scheduled-communications` |

### 6.3 Database Schema Additions

```prisma
// Add to Tenant model
model Tenant {
  // existing fields...
  archivedAt    DateTime?
  archivedBy    String?
  archiveReason String?
}
```

---

## 7. Tool Count Summary

| Category | Count |
|----------|-------|
| Support Operations | 12 |
| Tenant/User Management | 9 |
| Communication & Drafting | 8 |
| Revenue Intelligence | 4 |
| Customer Health | 4 |
| Development Operations | 8 |
| Platform Intelligence | 4 |
| Admin Metrics | 4 |
| Executive Superpowers | 3 |
| Workflow Automation | 3 |
| Morning Briefing | 1 |
| **TOTAL CURRENT** | **60** |
| **Phase 2 Additions** | **+8** |
| **TOTAL AFTER PHASE 2** | **68** |

---

*End of Documentation*
