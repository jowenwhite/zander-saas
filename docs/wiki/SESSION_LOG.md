# Session Log — Zander Platform

Use this file to record session handoffs and major changes.

---

## 2026-04-14 — Wiki Restructure

**Changes:**
- Created docs/wiki/ directory structure
- Moved CLAUDE.md content to searchable wiki files:
  - EXECUTIVES.md — AI executive framework and tools
  - DEPLOYMENT.md — Docker, ECS, Vercel deployment
  - TIERS.md — Subscription and pricing
  - TENANTS.md — Multi-tenant management
  - BUGS_AND_FIXES.md — Known issues and solutions
  - BUSINESS.md — Business context and strategy
  - TESTING.md — Test protocols and credentials
  - MCFOS.md — Separate MCF operations platform
  - ARCHITECTURE.md — System architecture
  - SESSION_LOG.md — This file
- Updated CLAUDE.md to lightweight index

**Status:** All wiki files created

---

## 2026-03-29 — v35 Deployment

**What Shipped:**
1. Email Signatures Module: Full CRUD API, UI integration
2. ScheduledCommunication: contactId nullable, recipientEmail/Name for ad-hoc
3. Pam (EA): compose_email tool, draft routing clarification
4. Google Auth: Signed state parameter, calendar scope improvements

**Deployment:**
- ECS: zander-cluster/zander-api-service running task definition zander-api:41
- ECR: 288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api:v35
- Commit: 01addac

**Bug Fixes:**
- Calendar Identity: FIXED
- Draft Routing: FIXED
- Bulk Mark-Read: PENDING

---

## Template for New Entries

```markdown
## YYYY-MM-DD — Session Title

**Changes:**
- List of changes made

**Deployment:**
- Version deployed (if any)
- Commit hash

**Bug Fixes:**
- Issues resolved

**Known Issues:**
- Outstanding problems

**Next Priorities:**
- What to work on next
```
