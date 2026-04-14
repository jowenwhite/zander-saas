# Testing Protocol — Zander Platform

## Test Credentials

- **Email:** jonathan@zanderos.com
- **Password:** 4S@iling1979!
- **Default Tenant:** Zander Inc (ALWAYS verify tenant switcher before testing)

## Pre-Test Checklist

1. [ ] Verify API health: `curl https://api.zanderos.com/health`
2. [ ] Clear browser cache if testing UI changes
3. [ ] Confirm correct tenant in UI header
4. [ ] Check browser console is open for errors

## Testing Environments

### Local Development
- API: http://localhost:3001
- Web: http://localhost:3000
- Database: Local PostgreSQL or connect to RDS

### Staging
- Not currently deployed (use production with test data)

### Production
- API: https://api.zanderos.com
- Web: https://app.zanderos.com
- Database: AWS RDS PostgreSQL

## Test Scenarios

### Authentication
1. Login with valid credentials
2. Login with invalid credentials (should fail)
3. Session persistence after refresh
4. Logout clears session

### AI Executives
1. Chat with Jordan/Don/Pam
2. Verify tenant scoping
3. Test tool execution (L1-L4)
4. Verify drafts require manual send (L3)

### Communications
1. Compose email draft
2. Send scheduled communication
3. View sent/received emails
4. Verify Gmail sync

### Integrations
1. Google OAuth flow
2. Twilio SMS/Voice
3. Calendar events
4. Contacts sync

## RDS Security Group Protocol

For direct database access during testing:

1. **Open:** Add your IP to sg-03eb2fd7369bf002e
2. **Query:** Run your database commands
3. **Close:** Remove your IP immediately after

**Never leave the security group open.**

## Bug Reporting

When a test fails:
1. Document steps to reproduce
2. Capture screenshots/console logs
3. Note the tenant and user context
4. Add to docs/wiki/BUGS_AND_FIXES.md
