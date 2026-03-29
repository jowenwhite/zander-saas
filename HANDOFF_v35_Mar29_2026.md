# Zander Session Handoff — March 29, 2026

## Deployment Summary

| Item | Value |
|------|-------|
| **Version** | v35 |
| **ECR Image** | `288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api:v35` |
| **Task Definition** | `zander-api:41` |
| **Commit** | `01addac` |
| **Health Check** | `{"status":"ok"}` |
| **Database** | Schema in sync, `email_signatures` table exists |

---

## What Shipped in v35

### 1. Email Signatures Module (New Feature)
- **API**: Full CRUD at `/email-signatures`
- **Schema**: `EmailSignature` model with tenant/user scoping
- **UI**: Signature picker integrated into Communications page compose modal
- **Features**: Per-user default signature, multiple signatures per tenant

### 2. ScheduledCommunication Enhancements
- `contactId` now **nullable** for ad-hoc recipients (vendors, support, external parties)
- Added `recipientEmail` and `recipientName` fields for non-contact communications
- Added `createdBy` field to track which AI executive created the draft

### 3. AI Executive Updates
- **Pam (EA)**: Added `compose_email` tool, clarified all drafts route to Scheduled → Pending
- **Jordan (CRO)**: Enhanced tool descriptions
- **Don (CMO)**: Enhanced tool descriptions
- **Zander (Admin)**: Enhanced admin capabilities

### 4. Google Auth Improvements
- Signed state parameter for OAuth security
- Calendar scope handling improvements

---

## Pam Bug Fixes Status

| Bug | Status | Notes |
|-----|--------|-------|
| **Calendar Identity** | IN v35 | Google auth controller updated with signed state params |
| **Bulk Mark-Read** | NOT IN v35 | Needs implementation - multi-select checkbox UI |
| **Draft Routing** | IN v35 | Pam route updated: drafts go to Scheduled → Pending |

### Still Pending: Bulk Mark-Read
The Communications page needs:
1. Multi-select checkboxes on email/SMS list items
2. "Mark Selected as Read" button
3. Backend endpoint for bulk mark-read operation

---

## Integration Status

### Zander Inc Tenant (Jordan)
| Integration | Status | Details |
|-------------|--------|---------|
| Twilio | Connected | Sub-account, +1 (844) 853-6236 |
| Google Contacts | Connected | OAuth active |
| Gmail | Connected | Auto-sync every 5 min |
| Calendly | Pending | Account created at calendly.com/jonathan-zanderos, needs API key connection |

### MCF Tenant (Pam)
| Integration | Status | Details |
|-------------|--------|---------|
| Twilio | Not Started | Waiting on parent account access |
| Calendly | Blocked | Waiting on mycabinetfactory.com domain release from Railway |

---

## Next Session Priorities (In Order)

### 1. Verify and Test All Pam Fixes in Live App
- [ ] Test compose_email flow → verify drafts appear in Scheduled tab
- [ ] Test calendar booking → verify Google Calendar integration
- [ ] Confirm email signatures appear in compose modal
- [ ] Test draft approval workflow

### 2. Token Caps + Subscription Gating (Beta Blocker #1)
- Implement per-tenant token usage tracking
- Add subscription tier limits (Starter/Growth/Scale)
- Gate AI executive calls by remaining tokens
- Add usage dashboard in admin

### 3. Landing Page Build Session
- Use the landing page brief document
- Hero section with value prop
- Feature highlights for AI executives
- Pricing tiers display
- CTA to waitlist/signup

### 4. /privacy and /terms Pages
- Privacy policy page
- Terms of service page
- Link from footer/signup flows

---

## Files Changed in v35

```
apps/api/src/app.module.ts                           (+2)
apps/api/src/auth/google/google-auth.controller.ts   (+117 --)
apps/api/src/auth/google/google-auth.service.ts      (+4 --)
apps/api/src/automation/automation.service.ts        (+5 --)
apps/api/src/automation/dto/scheduled-communication.dto.ts (+28 --)
apps/api/src/email-signatures/                       (NEW MODULE)
apps/web/app/api/admin/zander/route.ts               (+254 --)
apps/web/app/api/cmo/don/route.ts                    (+223 --)
apps/web/app/api/cro/jordan/route.ts                 (+339 --)
apps/web/app/api/ea/pam/route.ts                     (+259 --)
apps/web/app/communication/page.tsx                  (+238 --)
packages/database/prisma/schema.prisma               (+61 --)
```

---

## Quick Commands

```bash
# Health check
curl https://api.zanderos.com/health

# View ECS logs
aws logs tail /ecs/zander-api --follow --region us-east-1

# Deploy new version (from repo root)
docker build --no-cache -f Dockerfile.api -t zander-api:vXX .
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 288720721534.dkr.ecr.us-east-1.amazonaws.com
docker tag zander-api:vXX 288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api:vXX
docker push 288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api:vXX
```

---

## Known Issues / Tech Debt

1. **Bulk mark-read** not implemented for Communications page
2. **Calendly integration** needs API key connection for Zander Inc
3. **MCF integrations** blocked on domain/account access
4. **Token tracking** not yet implemented - AI executives have no usage limits

---

**Session End: March 29, 2026 @ 5:00 PM EST**
**Next Session: Continue with priorities above**
