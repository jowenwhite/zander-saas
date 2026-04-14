# MCFOS — My Cabinet Factory Operations System

## Overview

MCFOS is a **separate platform** from Zander SaaS. It's an operations management system specifically built for My Cabinet Factory.

## Repository

**Location:** ~/dev/mcfos (NOT this repository)

## Technology Stack

- **Frontend:** Next.js 15.5.4 (App Router)
- **Backend:** NestJS API
- **Database:** Railway PostgreSQL
- **Deployment:** Railway (API + Web services)
- **Domain:** mcfapp.com

## Key Features

- Operator portal for production floor
- Time tracking and shift management
- SOP management
- HR functions (time off, documents)
- Production scheduling
- Inventory management

## Relationship to Zander

- MCF is a tenant in Zander (uses Pam as EA)
- MCFOS is MCF's internal operations system
- They share the same owner (Jonathan) but are separate codebases

## Credentials Policy

- MCFOS credentials: Railway → awake-reprieve → MCFOS-Web → Variables
- Zander credentials: Vercel → zander-web → Environment Variables

**NEVER commit connection strings, passwords, or API keys to either repo.**

## Working in MCFOS

If you need to work in MCFOS:
1. Switch to the mcfos repository: `cd ~/dev/mcfos`
2. Review that project's CLAUDE.md
3. Follow its specific conventions and deployment process

## Integration Points

- MCF tenant in Zander uses Pam for executive assistant functions
- Calendly integration pending (waiting on mycabinetfactory.com domain release from Railway)
- Twilio sub-account not yet created for MCF tenant
