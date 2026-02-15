# Summit Home Services - Demo Tenant Guide

> **Demo tenant for Zander SaaS sales demonstrations**
> **Last Updated:** February 2026

---

## Quick Access

| Field | Value |
|-------|-------|
| **URL** | https://app.zanderos.com |
| **Primary Login** | mike@summithomeservices.com |
| **Password** | SummitDemo2026! |
| **Tenant ID** | cmlnlxxhj00001ptlu5sy3qdd |

---

## About the Demo Company

**Summit Home Services** is a fictional multi-trade home services contractor based in Denver, Colorado. This demo tenant showcases Zander's capabilities for service-based businesses.

### Company Profile
- **Industry:** Home Services (HVAC, Plumbing, Electrical)
- **Location:** Denver, Colorado
- **Employees:** 8 team members
- **Annual Revenue:** ~$1.1M
- **Using Zander:** 4 months (simulated history)

---

## Demo User Accounts

All accounts use the same password: **SummitDemo2026!**

| Name | Email | Role | Best For Demonstrating |
|------|-------|------|------------------------|
| **Mike Sullivan** | mike@summithomeservices.com | Admin (Owner) | Full platform access, owner perspective |
| **Jessica Reyes** | jessica@summithomeservices.com | Manager | Office manager view, team oversight |
| **Tyler Brooks** | tyler@summithomeservices.com | Sales | CRO module, pipeline, deals |
| **Amanda Foster** | amanda@summithomeservices.com | Marketing | CMO module, campaigns, personas |

---

## Demo Data Summary

### Phase 1: Foundation
| Data Type | Count | Details |
|-----------|-------|---------|
| Tenant | 1 | Summit Home Services |
| Users | 4 | Admin, Manager, Sales, Marketing |
| Products | 20 | 10 HVAC, 6 Plumbing, 4 Electrical |
| Pipeline Stages | 6 | Lead → Qualified → Proposal → Negotiation → Closed Won/Lost |

### Phase 2: CRO Data (Contacts & Deals)
| Data Type | Count | Details |
|-----------|-------|---------|
| Contacts | 25 | 15 homeowners, 5 property managers, 3 realtors, 2 vendors |
| Deals | 10 | Spread across all pipeline stages |

### Phase 3: Communications & Tasks
| Data Type | Count | Details |
|-----------|-------|---------|
| Emails | 25 | 9 inbound, 16 outbound |
| Phone Calls | 15 | Mix of completed, voicemail, no answer |
| SMS Messages | 10 | 5 inbound, 5 outbound |
| Tasks | 20 | 8 completed, 7 pending, 5 overdue |

### Phase 4: CMO Marketing Data
| Data Type | Count | Details |
|-----------|-------|---------|
| Brand Profile | 1 | Colors, voice guidelines, mission statement |
| Personas | 3 | Sarah (Homeowner), Mike (Property Mgr), Lisa (Realtor) |
| Campaigns | 4 | Spring AC, Referral, Reviews, Winter Furnace |
| Workflows | 3 | Lead Nurture, Post-Service, Maintenance Reminder |
| Calendar Events | 10 | Mix of past and upcoming marketing activities |
| Monthly Themes | 4 | Feb-May 2026 planning |
| Funnels | 2 | Service Call, Maintenance Plan |
| Email Templates | 4 | Confirmation, Quote, Reminder, Thank You |

---

## 30-Minute Demo Script

### Opening (2 min)
1. Log in as Mike Sullivan (owner perspective)
2. Show the executive dashboard overview
3. Point out the multi-module navigation (CRO, CMO, etc.)

### CRO Module - Sales Pipeline (10 min)
1. **Pipeline View**
   - Show kanban board with deals across stages
   - Drag a deal from Qualified to Proposal
   - Point out the deal values and probability

2. **Contact Management**
   - Open a contact (e.g., "Jennifer Morrison" - homeowner)
   - Show communication history (emails, calls)
   - Show linked deals and activities

3. **Deal Deep Dive**
   - Open "Morrison AC Replacement" deal
   - Show all deal details, linked products
   - Point out the activity timeline

### CMO Module - Marketing (12 min)
1. **Dashboard**
   - Switch to Amanda's account (marketing perspective)
   - Show marketing dashboard metrics

2. **Campaigns**
   - Show the "Spring AC Tune-Up Special" campaign
   - Walk through the email sequence/steps
   - Point out automation capabilities

3. **Personas**
   - Open "Sarah the Homeowner" persona
   - Show demographics, pain points, goals
   - Explain how this drives messaging

4. **Workflows**
   - Show "New Lead Nurture Sequence"
   - Walk through the automation flow
   - Point out the entry count vs completion rate

5. **Marketing Calendar**
   - Show upcoming marketing events
   - Point out monthly themes

### Wrap-Up (6 min)
1. Return to Mike's account (owner view)
2. Show how modules connect (contact in CRO → campaign enrollment in CMO)
3. Highlight key differentiators:
   - All-in-one platform (no switching apps)
   - AI-powered insights (when available)
   - Built for small business operations

---

## Resetting Demo Data

After presentations, the demo data may be modified. To reset to a clean state:

```bash
cd packages/database
npm run seed:demo-summit-reset
```

This will:
1. Delete all data for the Summit tenant (preserving users)
2. Re-run all 4 seed phases
3. Restore the demo to its original state

### Reset Options

```bash
# Interactive mode (will prompt for confirmation)
npm run seed:demo-summit-reset

# Force mode (no confirmation prompt)
npm run seed:demo-summit-reset -- --force
```

### Individual Phase Seeds

If you need to re-run specific phases:

```bash
# Phase 1: Foundation (Tenant, Users, Products)
npm run seed:demo-summit

# Phase 2: Contacts & Deals
npm run seed:demo-summit-phase2

# Phase 3: Communications & Tasks
npm run seed:demo-summit-phase3

# Phase 4: CMO Marketing Data
npm run seed:demo-summit-phase4
```

---

## Product Catalog

### HVAC Services (10)
| Product | Price | Description |
|---------|-------|-------------|
| AC Tune-Up | $149 | 21-point AC inspection and maintenance |
| Furnace Tune-Up | $129 | Complete furnace inspection |
| AC Repair | $350 | Standard repair (parts additional) |
| Furnace Repair | $325 | Standard repair (parts additional) |
| AC Replacement Entry | $6,500 | Entry-level AC with installation |
| AC Replacement Premium | $9,500 | High-efficiency AC with installation |
| Furnace Replacement Entry | $4,500 | Entry-level furnace with installation |
| Furnace Replacement Premium | $7,200 | High-efficiency furnace with installation |
| Ductwork Repair | $800 | Inspection, sealing, and repair |
| Smart Thermostat Install | $350 | Smart thermostat setup |

### Plumbing Services (6)
| Product | Price | Description |
|---------|-------|-------------|
| Drain Cleaning | $175 | Professional drain cleaning |
| Water Heater Flush | $150 | Maintenance and flush |
| Water Heater Replacement | $2,650 | Standard replacement with installation |
| Fixture Replacement | $425 | Faucet or fixture replacement |
| Leak Repair | $350 | Standard leak repair |
| Whole House Repipe | $11,500 | Complete home repiping |

### Electrical Services (4)
| Product | Price | Description |
|---------|-------|-------------|
| Panel Inspection | $125 | Safety inspection |
| Outlet/Switch Repair | $225 | Repair or replacement |
| Panel Upgrade | $3,500 | Upgrade to 200 amp service |
| Whole House Surge Protection | $450 | Surge protector installation |

---

## Key Contacts for Demo Storytelling

### Homeowners
- **Jennifer Morrison** - AC replacement prospect, in Proposal stage ($9,500 deal)
- **David Chen** - Furnace tune-up completed, great for showing service history
- **Rachel Thompson** - New lead, perfect for showing lead nurture workflow

### Property Managers
- **Marcus Williams** - Manages 25 units, good for volume/relationship story
- **Patricia Santos** - Active deal for multi-unit maintenance contract

### Realtors
- **Lisa Chen** - Real estate agent, perfect for referral partnership story
- **Robert Kim** - Has referred clients, shows referral tracking

---

## Tenant Switcher Access

For Super Admin users:
1. Log in with Super Admin credentials
2. Summit Home Services appears in the tenant dropdown
3. Switch to Summit to view/demo their data
4. Switch back to your tenant when done

---

## Troubleshooting

### "Invalid credentials" on login
- Ensure using exact email (case-insensitive)
- Password is: SummitDemo2026!
- Run reset script if passwords were changed

### Data looks different than expected
- Run the reset script to restore original demo data
- Check that all 4 phases completed successfully

### Missing CMO data
- CMO data is in Phase 4
- Run: `npm run seed:demo-summit-phase4`

### Reset script fails
- Ensure you're in the `packages/database` directory
- Check database connection is working
- Run phases individually to identify the issue

---

## Technical Notes

- **Tenant ID:** `cmlnlxxhj00001ptlu5sy3qdd`
- **Seed Scripts Location:** `packages/database/prisma/seed-demo-summit*.ts`
- **Password Hashing:** bcrypt with 10 rounds
- **Timestamps:** Realistic distribution over past 4 months

---

*This demo tenant is maintained by the Zander development team. Report issues to the engineering channel.*
