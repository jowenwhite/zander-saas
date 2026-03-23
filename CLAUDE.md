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

## AI Executive Tool Write Standard

### The Problem
NestJS ValidationPipe with `whitelist: true` and `forbidNonWhitelisted: true` strips ALL request body properties when controllers use inline types instead of class-validator decorated DTOs. This causes write operations to fail silently.

### The Rule
ALL NestJS controller methods that accept request bodies MUST use DTOs with class-validator decorators. NEVER use inline types like `@Body() data: { name: string; ... }`.

### Required Pattern
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
  items?: any[];  // Complex nested objects, validated at runtime

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}
```

### Checklist for New AI Executive Tools
1. Identify the NestJS endpoint the tool calls (e.g., `/cmo/personas`)
2. Verify the controller uses a DTO class (not inline type)
3. Verify the DTO has class-validator decorators on ALL properties
4. For complex nested objects, use `any[]` or `Record<string, any>`
5. Test the tool end-to-end after implementation
