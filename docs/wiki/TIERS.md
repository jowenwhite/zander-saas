# Subscription Tiers — Zander Platform

## Tier Structure

### FREE
- Limited AI interactions
- Basic CRM features
- Single user
- No integrations

### STARTER
- Increased AI token cap
- Full CRM access
- Up to 3 users
- Email integration

### PROFESSIONAL
- Higher token limits
- All integrations
- Up to 10 users
- Priority support

### ENTERPRISE
- Unlimited tokens (fair use)
- All features
- Unlimited users
- Dedicated support
- Custom integrations

## Token Management

### Current State
Token caps and subscription gating is a **Beta Blocker** — needs implementation.

### Planned Implementation
1. Track token usage per tenant per month
2. Enforce tier limits at API level
3. Provide usage dashboard in HQ
4. Grace period warnings before cutoff

## Feature Gating

| Feature | FREE | STARTER | PROFESSIONAL | ENTERPRISE |
|---------|------|---------|--------------|------------|
| AI Chat | 100/mo | 1000/mo | 5000/mo | Unlimited |
| Contacts | 100 | 1000 | 10000 | Unlimited |
| Users | 1 | 3 | 10 | Unlimited |
| Integrations | None | Email | All | All + Custom |
| Support | Docs | Email | Priority | Dedicated |

## Subscription Flow

1. New signup → FREE tier
2. Upgrade via billing page
3. Stripe handles payment processing
4. Webhook updates tenant tier in database
5. Features unlock immediately

## Test Accounts

For development and testing, use:
- **Email:** jonathan@zanderos.com
- **Tier:** ENTERPRISE (all features unlocked)
