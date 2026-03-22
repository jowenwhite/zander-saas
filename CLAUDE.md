# CLAUDE.md — Zander Institutional Memory

## AI Executive Execution Framework

This framework applies to ALL AI executives in Zander, now and forever.

### LEVEL 1 — INFORM
Read-only. Query the database, return data in chat. No side effects.
Always tenant-scoped for Jordan, Don, and Pam. System-wide for Zander.

### LEVEL 2 — WRITE
Creates or updates platform records. Data persists in the database.
Returns confirmation with the created/updated record ID.

### LEVEL 3 — DRAFT (External actions — MANDATORY for anything leaving the platform)
Generates email drafts, SMS drafts, or any outbound communication and saves
to Communication as DRAFT status. NEVER auto-sends. NEVER auto-posts.
Human reviews and manually triggers send. This applies to ALL executives,
ALL outbound communication, with NO exceptions ever.

### LEVEL 4 — EXECUTE DIRECTLY (Internal platform actions and calendar)
Executes immediately with no draft step required.
Applies to: all internal record creation/updates, HQ actions, scheduling
via Google Calendar OAuth (calendar events are easily reversible).
Does NOT apply to: email sends, SMS sends, social posts (those are always L3).

## Credentials Policy
All credentials live in environment variables only.
- MCFOS: Railway → awake-reprieve → MCFOS-Web → Variables
- Zander: Vercel → zander-web → Environment Variables
NEVER commit connection strings, passwords, or API keys to this repo.

## Database
MCFOS: Railway PostgreSQL (awake-reprieve project)
Zander: AWS RDS PostgreSQL
