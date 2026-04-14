# Bugs and Fixes — Zander Platform

## v35 Bug Fixes Status

| Bug | Status | Notes |
|-----|--------|-------|
| Calendar Identity | FIXED in v35 | Google Calendar showing correct identity |
| Draft Routing | FIXED in v35 | Drafts route to Scheduled → Pending |
| Bulk Mark-Read | PENDING | Needs multi-select UI implementation |

## Common Issues and Solutions

### NestJS DTO Properties Stripped
**Symptom:** POST/PUT requests succeed but data not saved
**Cause:** ValidationPipe strips properties from inline types
**Fix:** Use class-validator decorated DTOs for all request bodies
**Reference:** See docs/wiki/EXECUTIVES.md for DTO template

### Prisma Schema Drift
**Symptom:** Database errors, missing columns
**Cause:** Schema out of sync with database
**Fix:** Run `npx prisma db push` (never `migrate dev` in production)

### Google OAuth State Parameter Invalid
**Symptom:** OAuth callback fails with state mismatch
**Cause:** Unsigned or expired state parameter
**Fix:** Implemented signed state parameter in v35

### Scheduled Communications Missing Contact
**Symptom:** Can't send ad-hoc emails
**Cause:** contactId was required
**Fix:** Made contactId nullable, added recipientEmail/Name fields in v35

## Debugging Checklist

1. Check API health: `curl https://api.zanderos.com/health`
2. Check ECS task logs in CloudWatch
3. Check browser console for frontend errors
4. Verify tenant context is correct
5. Check Prisma schema matches database
6. Verify environment variables are set

## Reporting New Bugs

When documenting a bug, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Environment (tenant, user, browser)
5. Screenshots/logs if available

Update this file when bugs are identified and resolved.
