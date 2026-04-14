# AI Executives — Zander Platform

## Overview
Zander uses AI executives to handle different business functions. Each executive has specific tools and operates under a strict execution framework.

## Executive Roster

### Jordan (CEO)
- **Role:** Strategic oversight, business intelligence
- **Tenant Scope:** Zander Inc
- **Tools:** Company-wide reporting, strategic planning

### Don (CMO)
- **Role:** Marketing, communications, brand strategy
- **Tenant Scope:** Zander Inc
- **Tools:** Marketing calendar, personas, campaigns, email composition

### Pam (Executive Assistant)
- **Role:** Scheduling, communications, administrative tasks
- **Tenant Scope:** MCF
- **Tools:** compose_email, calendar management, scheduling

### Zander (Super Admin)
- **Role:** Platform administration, system-wide operations
- **Tenant Scope:** System-wide (not tenant-scoped)
- **Access:** PEP only (superadmin-gated), never surfaced to users

## Execution Framework

This framework applies to ALL AI executives, now and forever.

### LEVEL 1 — INFORM
Read-only. Query the database, return data in chat. No side effects.
Always tenant-scoped for Jordan, Don, and Pam. System-wide for Zander.

### LEVEL 2 — WRITE
Creates or updates platform records. Data persists in the database.
Returns confirmation with the created/updated record ID.

### LEVEL 3 — DRAFT (External actions)
**MANDATORY for anything leaving the platform.**

Generates email drafts, SMS drafts, or any outbound communication and saves
to Communication as DRAFT status. NEVER auto-sends. NEVER auto-posts.
Human reviews and manually triggers send.

This applies to ALL executives, ALL outbound communication, with NO exceptions ever.

### LEVEL 4 — EXECUTE DIRECTLY (Internal platform actions)
Executes immediately with no draft step required.

**Applies to:**
- All internal record creation/updates
- HQ actions
- Scheduling via Google Calendar OAuth (calendar events are easily reversible)

**Does NOT apply to:**
- Email sends (always L3)
- SMS sends (always L3)
- Social posts (always L3)

## Tool Development Standard

### The Problem
NestJS ValidationPipe with `whitelist: true` and `forbidNonWhitelisted: true` strips ALL request body properties when controllers use inline types instead of class-validator decorated DTOs.

### The Rule
ALL NestJS controller methods that accept request bodies MUST use DTOs with class-validator decorators.

```typescript
// GOOD: Use decorated DTO
import { CreatePersonaDto } from './dto/create-persona.dto';

@Post()
async create(@Body() data: CreatePersonaDto) { ... }

// BAD: Inline type - properties will be stripped!
@Post()
async create(@Body() data: { name: string; age?: number }) { ... }
```

### DTO Template
```typescript
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsObject,
} from 'class-validator';

export class CreateExampleDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  items?: any[];

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}
```

### Checklist for New Tools
1. Identify the NestJS endpoint the tool calls
2. Verify the controller uses a DTO class (not inline type)
3. Verify the DTO has class-validator decorators on ALL properties
4. For complex nested objects, use `any[]` or `Record<string, any>`
5. Test the tool end-to-end after implementation
