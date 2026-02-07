# RBAC Protected Endpoints - HIGH-4 Security Audit
Generated: 2026-02-08

## Role Requirements

| Role | Can Access |
|------|------------|
| owner | Everything including billing |
| admin | All CRUD, user management, no billing cancel |
| manager | Team data, approvals |
| member | Own data only (HIGH-3) |
| viewer | Read-only |

---

## CRITICAL: Owner-Only Endpoints

### Billing Operations
- `POST /billing/cancel` - Cancel subscription (owner only)
- `POST /billing/upgrade` - Change subscription (owner only)

---

## HIGH: Admin/Owner Required Endpoints

### User Management (users.controller.ts)
- `POST /users/invite` - Create new users
- `PATCH /users/:id` - Update user (including role changes)
- `DELETE /users/:id` - Remove users

### DELETE Operations - All Require admin/owner

#### Core CRM
- `DELETE /deals/:id` (deals.controller.ts:55)
- `DELETE /contacts/:id` (contacts.controller.ts:41)
- `DELETE /pipeline-stages/:id` (pipeline-stages.controller.ts:40)
- `DELETE /products/:id` (products.controller.ts:36)

#### Communication
- `DELETE /email-messages/:id` (email-messages.controller.ts - if exists)
- `DELETE /sms-messages/:id` (sms-messages.controller.ts:82)
- `DELETE /call-logs/:id` (call-logs.controller.ts:128)

#### CMO Module
- `DELETE /cmo/assets/:id` (cmo/assets.controller.ts:128)
- `DELETE /cmo/calendar/events/:id` (cmo-calendar.controller.ts:79)
- `DELETE /cmo/calendar/themes/:year/:month` (cmo-calendar.controller.ts:150)
- `DELETE /cmo/calendar/ideas/:id` (cmo-calendar.controller.ts:207)
- `DELETE /cmo/funnels/:id` (cmo/funnels.controller.ts:73)
- `DELETE /cmo/personas/:id` (cmo/personas.controller.ts:77)
- `DELETE /cmo/segments/:id` (cmo/segments.controller.ts:56)
- `DELETE /cmo/segments/:id/members/:contactId` (cmo/segments.controller.ts:75)
- `DELETE /cmo/templates/:id` (cmo/templates.controller.ts:90)
- `DELETE /cmo/workflows/:id` (cmo/workflows.controller.ts:76)

#### Marketing & Automation
- `DELETE /campaigns/:id` (campaigns.controller.ts:69)
- `DELETE /automation/templates/:id` (automation.controller.ts:32)
- `DELETE /automation/sequences/:id` (automation.controller.ts:59)
- `DELETE /automation/sequence-steps/:id` (automation.controller.ts:76)
- `DELETE /forms/:id` (forms.controller.ts:53)

#### Other Modules
- `DELETE /activities/:id` (activities.controller.ts:40)
- `DELETE /calendar-events/:id` (calendar-events.controller.ts:130)
- `DELETE /calendar-events/:id/attendees/:attendeeId` (calendar-events.controller.ts:166)
- `DELETE /headwinds/:id` (headwinds.controller.ts:121)
- `DELETE /knowledge/:id` (knowledge.controller.ts:120)
- `DELETE /support-tickets/:id` (support-tickets.controller.ts:244)
- `DELETE /treasury/:id` (treasury.controller.ts:140)

---

## Implementation Plan

### Priority 1: Critical
1. billing.controller.ts - owner only for cancel/upgrade

### Priority 2: User Management
2. users.controller.ts - admin/owner for invite/update/delete

### Priority 3: Core CRM DELETE
3. deals.controller.ts
4. contacts.controller.ts
5. pipeline-stages.controller.ts

### Priority 4: Communication DELETE
6. sms-messages.controller.ts
7. call-logs.controller.ts

### Priority 5: CMO Module DELETE
8. cmo/assets.controller.ts
9. cmo/calendar.controller.ts
10. cmo/funnels.controller.ts
11. cmo/personas.controller.ts
12. cmo/segments.controller.ts
13. cmo/templates.controller.ts
14. cmo/workflows.controller.ts

### Priority 6: Marketing DELETE
15. campaigns.controller.ts
16. automation.controller.ts
17. forms.controller.ts

### Priority 7: Other DELETE
18. activities.controller.ts
19. calendar-events.controller.ts
20. headwinds.controller.ts
21. knowledge.controller.ts
22. support-tickets.controller.ts
23. treasury.controller.ts
24. products.controller.ts

---

## Total Endpoints to Protect: 32
- Owner-only: 2 (billing)
- Admin/Owner: 30 (user management + all DELETE)
