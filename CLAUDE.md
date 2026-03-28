# CLAUDE.md — Zander Institutional Memory

## Session Handoff — March 28, 2026

### v31 Deployed and Live
- **ECS**: zander-cluster/zander-api-service running task definition zander-api:37
- **ECR**: 288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api:v31
- **Health**: https://api.zanderos.com/health returns `{"status":"ok"}`
- **IntegrationsModule**: Working — `/integrations/twilio/status` returns 401 (route exists)

### Integration Status

#### Zander Inc Tenant (Jordan)
- **Twilio**: Connected via sub-account, phone +1 (844) 853-6236
- **Google Contacts**: Connected via OAuth
- **Calendly**: Account created at calendly.com/jonathan-zanderos
  - "Founding 50 Discovery Call" event type needs renaming and configuration
  - API key needs to be connected to tenant via `/integrations/calendly/connect`

#### MCF Tenant (Pam)
- **Twilio**: Sub-account NOT yet created (waiting on parent account access)
- **Calendly**: Account waiting on mycabinetfactory.com domain release from Railway

### Code Changes This Session
- `apps/api/tsconfig.json`: Added `rootDir: "./src"` and include/exclude patterns
  - Fixed TypeScript compilation outputting to `dist/src/` instead of `dist/`
  - This was causing ECS container crashes: "Cannot find module '/app/dist/main.js'"
- Prisma schema: `TwilioCredential` and `CalendlyCredential` models already present

### Next Session Priorities
1. Connect Calendly API key to Zander Inc tenant
2. Create MCF Twilio sub-account
3. Token caps and subscription gating
4. Don CMO checklist items 8-30

---

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
