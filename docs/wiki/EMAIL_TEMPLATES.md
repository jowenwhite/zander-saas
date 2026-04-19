# Email Templates

This document catalogs all email templates used in the Zander platform.

## Transactional Emails

### Beta Welcome Email
- **File:** `apps/api/src/email/templates/beta-welcome.ts`
- **Trigger:** User registration (first signup)
- **Subject:** "Welcome to Zander — and thank you for taking the leap"
- **From:** jonathan@zanderos.com
- **Documentation:** [BETA_WELCOME_EMAIL.md](./BETA_WELCOME_EMAIL.md)

### Password Reset
- **File:** `apps/api/src/auth/auth.service.ts` (inline)
- **Trigger:** Forgot password request
- **Subject:** "Reset Your Password"
- **From:** noreply@zanderos.com

## Consulting Lifecycle Emails

All consulting emails are in `apps/api/src/consulting/consulting-email.service.ts`

| Email | Trigger | Subject Pattern |
|-------|---------|-----------------|
| Welcome | Payment confirmed | "Welcome to Zander Consulting — Your {Package} Engagement" |
| Contract Ready | Contract generated | "Your {Package} Contract is Ready" |
| Contract Signed | DocuSign completed | "Contract Signed — Welcome to Zander Consulting" |
| Intake Available | Engagement starts | "Your Intake Survey is Ready" |
| Deliverable Ready | Deliverable submitted | "New Deliverable Ready for Review" |
| Hours Low | <10 hours remaining | "Hours Running Low — {Package}" |
| Engagement Expiring | <30 days to expiration | "Your Engagement is Expiring Soon" |

## Brand Standards

### Dark Theme (Default)
- Background: `#0D1117` / `#080A0F`
- Text: `#FFFFFF` / `rgba(255, 255, 255, 0.85)`
- Accent: `#00D4FF` (cyan) / `#00CFEB`
- Red accent: `#BF0A30`

### Email Signature
Use `getEmailSignatureDark()` from `apps/api/src/shared/email-signature.ts`

### Logo
```
https://app.zanderos.com/brand/zander-logo.svg
```

## Testing

### Local Testing
```bash
# Send test email via API
curl -X POST https://api.zanderos.com/auth/test-welcome-email \
  -H "Content-Type: application/json" \
  -d '{"email": "jonathan@zanderos.com", "firstName": "Jonathan"}'
```

### Email Preview
For development, emails are logged to console when RESEND_API_KEY is not configured.

---

**Last Updated:** April 2026
