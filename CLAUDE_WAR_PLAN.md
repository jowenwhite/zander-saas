# ZANDER LAUNCH MASTER PLAN
## Last Updated: March 27, 2026 | Beta Launch: April 14, 2026

---

## COMPLETED THIS SESSION (Mar 27)

- v27 LIVE: Gmail polling cron (every 5 min), Google Calendar + Meet
  link generation, Pam sync_gmail_inbox tool, calendar sync endpoint
- User migration complete: jonathan@zanderos.com, default tenant:
  tenant_zander
- Google OAuth published to production — no more manual test user adds
- Google Cloud billing upgraded (project: zander-481913)
- Georgia SOS: Zander Technologies LLC REJECTED — name conflict with
  Zander Technologies Inc. Refile required by April 25 with new name
  (Zander Systems LLC or similar). EIN 41-4979768 already issued —
  needs IRS name change letter after SOS approval.
- Google Workspace consolidation plan complete: mycabinetfactory.com,
  economycabinets.com, jonathan@sixtyfourwest.com all forwarding to
  jonathan@zanderos.com (configuration pending)
- Calendly setup pending

---

## IMMEDIATE — DO BEFORE ANY BUILD WORK

- [ ] Re-enable Anthropic API auto-reload: console.anthropic.com/Billing
- [ ] Raise Anthropic monthly spend limit above $100
- [ ] Submit Anthropic complaint: support.anthropic.com — invoices
      QIZMBHVH-0184, 0186, 0187. Request $2.62 refund.
- [ ] Downgrade Google Workspace before April 4 (Business Starter $6/mo)
- [ ] Refile Georgia SOS — ecorp.sos.ga.gov — by April 25
- [ ] Connect Google OAuth in Zander Settings with jonathan@zanderos.com

---

## GOOGLE WORKSPACE SETUP (Configuration — No Code)

- [ ] Add mycabinetfactory.com as secondary domain in Workspace
- [ ] Add economycabinets.com as secondary domain in Workspace
- [ ] Create email addresses:
      jonathan@mycabinetfactory.com
      info@mycabinetfactory.com
      support@mycabinetfactory.com
      info@economycabinets.com
      orders@economycabinets.com
- [ ] Set up Gmail forwarding:
      jowenwhite4@gmail.com → jonathan@zanderos.com
      jonathan@sixtyfourwest.com → jonathan@zanderos.com
      All MCF Outlook addresses → Workspace
      All Economy Cabinets Outlook addresses → Workspace
- [ ] Configure Send Mail As for each address
- [ ] Update Squarespace DNS for economycabinets.com MX → Google
- [ ] Set up Calendly (free tier) — connect to Google Calendar
      Create event types: Zander discovery call, MCF consultation
- [ ] Submit Google OAuth verification AFTER /privacy and /terms
      pages are live on zanderos.com

---

## PHASE 0 — BLOCKING (Must Complete Before Beta)

- [ ] 1. Token budget caps per tenant + 80% warning + Stripe credit packs
- [ ] 2. Subscription gating by tier (Starter/Pro/Business/Enterprise)
- [x] 3. Sentry SDK — LIVE
- [x] 4. PostHog SDK — LIVE
- [x] 5. Coming Soon pages for CFO, COO, CPO, CIO — LIVE
- [x] 6. EA/Pam Coming Soon locked state — LIVE
- [ ] 7. Mercury bank → Stripe live mode (BLOCKED on Mercury approval)
- [ ] 8. Stripe live keys in Vercel env vars (BLOCKED on #7)

---

## PHASE 1 — CORE PRODUCT (Solid for April 14)

- [ ] 9.  HQ — wire Headwinds modal to existing API endpoints
- [ ] 10. HQ — Goal model (Prisma) + CRUD API + wire to UI
- [ ] 11. HQ — Keystones: pull real data from CRO/CMO
- [ ] 12. Onboarding wizard — extend with new intake fields
- [ ] 13. First-login checklist modal — 5-step guided start
- [ ] 14. /waitlist route + $49 Stripe deposit + progress bar
- [ ] 15. Waitlist welcome email — automated on signup
- [ ] 16. Activation email flow — triggers on manual activation

---

## PHASE 2 — LANDING PAGE (Live Before Outreach)

- [ ] 17. Landing page — 4 Pillars messaging, broaden ICP
- [ ] 18. Landing page — hero + Loom embed
- [ ] 19. Landing page — 3-4 annotated screenshots from Summit demo
- [ ] 20. Landing page — AI executives section (all 7)
- [ ] 21. Landing page — pricing update
- [ ] 22. Landing page — FAQ section
- [ ] 23. Public /privacy page — REQUIRED for Google OAuth verification
- [ ] 24. Public /terms page — REQUIRED for Google OAuth verification
- [ ] 25. Record 3-minute Loom demo
- [ ] 26. Getting Started Guide (1 page)
- [ ] 27. Module user guides — CRO, CMO, HQ
- [ ] 28. Beta Expectations doc

---

## PHASE 3 — CMO BUILD (Don Checklist #8-30)

- [ ] 29. Schema sprint — campaign model fields
          (budget, startDate, endDate, goal, target_segment)
- [ ] 30. Email templates (remaining)
- [ ] 31. Funnels (remaining)
- [ ] 32. Workflows (remaining)
- [ ] 33. Calendar events (remaining)
- [ ] 34. Ad copy
- [ ] 35. Campaign brief

---

## PHASE 4 — INTEGRATIONS (Beta Weeks 2-3)

- [x] 36. Gmail integration — LIVE (v27)
- [x] 37. Google Calendar + Meet — LIVE (v27)
- [ ] 38. Outlook / Microsoft Graph
- [ ] 39. QuickBooks — CFO foundation
- [ ] 40. Google Ads — CMO reporting

---

## PHASE 5 — POST-BETA ROADMAP

- [ ] CFO module (Ben)
- [ ] COO module (Miranda)
- [ ] CPO module (Ted)
- [ ] CIO module (Jarvis)
- [ ] EA/Pam full build (Q3 2026)
- [ ] AI support bot
- [ ] Consulting page + Stripe products
- [ ] Digital product archive (/resources)
- [ ] Pam Gmail inbox management (post-launch)
- [ ] Pam multi-business calendar management (post-launch)
- [ ] Google OAuth verification submission (after landing page live)

---

## INFRASTRUCTURE REFERENCE

| Item | Value |
|------|-------|
| ECS cluster | zander-cluster |
| ECS service | zander-api-service |
| ECR repo | 288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api |
| Current image | v27 |
| Dockerfile | Dockerfile.api (repo root — NEVER apps/api/Dockerfile) |
| Vercel project | zander-web — app.zanderos.com |
| RDS | zander-prod-db.cavkq4gew6zt.us-east-1.rds.amazonaws.com |
| Demo tenant | mike@summithomeservices.com / SummitDemo2026! |
| Google Cloud project | zander-481913 (under jowenwhite4@gmail.com) |

---

## PERSISTENT RULES

| Rule | Detail |
|------|--------|
| Boris Method | Read working example FULLY before any changes |
| Auto-accept | UI/frontend/routes only |
| Manual review | DB/auth/security/payments/business logic |
| Zander backend | AWS ECS always — NEVER Railway |
| Zander rule | Jonathan exclusively — never shown to users |
| Draft-first | Email/SMS/comms = L3 DRAFT always |
| Tool mandate | Every UI input = corresponding AI executive tool |
| Array format | AI tools writing editable items: string[] → {id,text}[] |
| Railway | MCFOS only — never Zander |
| No widget | Never use ask_user_input widget with Jonathan |
