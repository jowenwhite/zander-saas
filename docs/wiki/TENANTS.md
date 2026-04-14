# Tenant Management — Zander Platform

## Multi-Tenant Architecture

Zander is a multi-tenant SaaS platform. Each tenant is a separate company with isolated data.

## Active Tenants

### Zander Inc (Jordan)
- **Type:** Demo/Test tenant
- **Executive:** Jordan (CEO)
- **Integrations:**
  - Twilio: Connected via sub-account, phone +1 (844) 853-6236
  - Google Contacts: Connected via OAuth
  - Gmail: Connected, auto-sync every 5 min
  - Calendly: Account at calendly.com/jonathan-zanderos, needs API key connection

### MCF (Pam)
- **Type:** Client tenant (My Cabinet Factory)
- **Executive:** Pam (Executive Assistant)
- **Integrations:**
  - Twilio: Sub-account NOT yet created (waiting on parent account access)
  - Calendly: Account waiting on mycabinetfactory.com domain release from Railway

## Tenant Isolation

### Database Level
- All tables have `tenantId` foreign key
- Queries are automatically scoped to current tenant
- No cross-tenant data access

### API Level
- JWT contains tenantId
- Middleware validates tenant access
- Executives are scoped to their tenant (except Zander)

### UI Level
- Tenant switcher for admin users
- Data displays only for active tenant

## User Access

### User-Tenant Relationship
- Users can belong to multiple tenants
- One tenant is "active" at a time
- Tenant switcher in UI header

### Roles
- OWNER: Full access, billing, user management
- ADMIN: Full access except billing
- MEMBER: Standard access
- VIEWER: Read-only

## Creating New Tenants

1. Create tenant record in database
2. Assign owner user
3. Set subscription tier (default: FREE)
4. Configure integrations as needed

## Test Credentials

- **Email:** jonathan@zanderos.com
- **Password:** 4S@iling1979!
- **Default Tenant:** Zander Inc

**ALWAYS verify tenant switcher before testing to ensure correct tenant context.**
