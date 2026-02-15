# Comprehensive Codebase Architecture Overview
## For AI-Powered Hedge Fund Management Platform Design

**Prepared for:** Claude on claude.ai
**Date:** February 8, 2026
**Source Projects:** MCFOS & Zander
**Author:** Jonathan White / 64 West Holdings LLC

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture & Patterns](#3-architecture--patterns)
4. [Key Components](#4-key-components)
5. [Automation Workflows](#5-automation-workflows)
6. [Development Practices](#6-development-practices)
7. [AI/LLM Integration](#7-aillm-integration)
8. [Lessons Learned](#8-lessons-learned)

---

## 1. PROJECT OVERVIEW

### 1.1 Zander - AI-Powered Business Operating System

**Purpose:** Multi-tenant SaaS platform providing "7 AI Executives" (CRO, CFO, COO, CMO, CPO, CIO, EA) to help small business owners run their businesses more effectively.

**Production URLs:**
- Frontend: https://app.zanderos.com
- API: https://api.zanderos.com

**Scale:**
- 50+ Prisma database models
- Full production deployment on AWS ECS
- Multi-tenant architecture with complete data isolation

**Modules:**
| Module | Purpose | Status |
|--------|---------|--------|
| CRO | Sales pipeline, contacts, deals, automation | 97% Complete |
| CMO | Marketing campaigns, funnels, personas, AI content | 100% Complete |
| CFO | Financial management | Planned |
| COO | Operations management | Planned |
| CPO | Product management | Planned |
| CIO | IT/Technology management | Planned |
| EA | Executive assistant | Planned |

### 1.2 MCFOS - Manufacturing Operations Platform

**Purpose:** Internal operating system for My Cabinet Factory, a 32-year custom cabinet manufacturing company with 24 employees. Zander was born from MCFOS.

**Production URLs:**
- Frontend: https://mcfapp.com
- API: https://api.mcfapp.com

**Scale:**
- 90+ Prisma database models
- 184 AI tools via Sawyer
- 11-stage CRM pipeline
- Cabinet Vision integration for production

**Key Features:**
- Employee time tracking and shift management
- 11-stage sales pipeline (Cabinet Vision to Install Complete)
- Production workflow with Cabinet Vision file import
- HR/PTO management
- SOP (Standard Operating Procedures) system
- Real-time AI assistant (Sawyer) with extensive tool access

---

## 2. TECHNOLOGY STACK

### 2.1 Shared Stack (Both Projects)

| Layer | Technology | Notes |
|-------|------------|-------|
| **Frontend Framework** | Next.js 15.x | App Router pattern |
| **Frontend Language** | TypeScript | Strict mode enabled |
| **Backend Framework** | NestJS | Modular architecture |
| **Backend Language** | TypeScript | Strict mode enabled |
| **Database** | PostgreSQL | Via Prisma ORM |
| **ORM** | Prisma | Shared package in monorepo |
| **AI Provider** | Anthropic Claude | claude-sonnet-4-20250514 |
| **Package Manager** | npm | With turborepo for monorepo |

### 2.2 Zander-Specific Stack

| Component | Technology |
|-----------|------------|
| **Deployment (Frontend)** | Vercel |
| **Deployment (Backend)** | AWS ECS Fargate |
| **Container Registry** | AWS ECR |
| **Database Hosting** | AWS RDS PostgreSQL |
| **Asset Storage** | AWS S3 (zander-assets) |
| **Email Service** | Resend API |
| **SMS Service** | Twilio |
| **Payments** | Stripe |
| **DNS/CDN** | Cloudflare |

### 2.3 MCFOS-Specific Stack

| Component | Technology |
|-----------|------------|
| **Deployment (Frontend)** | Railway |
| **Deployment (Backend)** | Railway |
| **Database Hosting** | Railway PostgreSQL |
| **File Storage** | Local/Railway volumes |
| **Email Service** | Resend API |
| **AI Tools** | 184 custom tools via Sawyer |

### 2.4 Key Dependencies

**Backend (NestJS):**
```json
{
  "@nestjs/core": "^10.x",
  "@nestjs/platform-express": "^10.x",
  "@nestjs/jwt": "^10.x",
  "@prisma/client": "^5.22.0",
  "helmet": "^8.0.0",
  "class-validator": "^0.14.x",
  "class-transformer": "^0.5.x",
  "bcryptjs": "^2.4.3",
  "stripe": "^17.x"
}
```

**Frontend (Next.js):**
```json
{
  "next": "^15.x",
  "react": "^19.x",
  "lucide-react": "^0.x",
  "tailwindcss": "^3.x"
}
```

---

## 3. ARCHITECTURE & PATTERNS

### 3.1 Monorepo Structure

Both projects use a monorepo structure with Turborepo:

```
project-root/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/                # App Router pages
│   │   │   ├── (auth)/         # Auth-related pages
│   │   │   ├── (dashboard)/    # Main app pages
│   │   │   ├── api/            # Next.js API routes
│   │   │   └── [module]/       # Module-specific pages
│   │   ├── components/         # Shared React components
│   │   └── lib/                # Utilities, hooks
│   └── api/                    # NestJS backend
│       └── src/
│           ├── [module]/       # Feature modules
│           ├── common/         # Shared utilities
│           ├── auth/           # Authentication
│           └── prisma/         # Database service
├── packages/
│   └── database/               # Shared Prisma schema
│       └── prisma/
│           ├── schema.prisma   # Database schema
│           └── seed.ts         # Seed scripts
├── turbo.json                  # Turborepo config
└── package.json                # Root package.json
```

### 3.2 Multi-Tenant Architecture (Zander)

**Tenant Isolation Pattern:**
```typescript
// Every tenant-scoped query includes tenantId filter
async findAll(tenantId: string) {
  return this.prisma.deal.findMany({
    where: { tenantId },  // Always filter by tenant
    include: { contact: true, pipeline: true }
  });
}

// JWT contains tenantId, extracted via decorator
@Get()
async findAll(@TenantId() tenantId: string) {
  return this.dealsService.findAll(tenantId);
}
```

**Data Model Pattern:**
```prisma
model Deal {
  id        String   @id @default(cuid())
  tenantId  String   // Every model has tenantId
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  // ... other fields

  @@index([tenantId])  // Index for query performance
}
```

### 3.3 NestJS Module Pattern

**Standard Module Structure:**
```
module/
├── module.module.ts        # Module definition
├── module.controller.ts    # HTTP endpoints
├── module.service.ts       # Business logic
├── dto/
│   ├── create-module.dto.ts
│   └── update-module.dto.ts
└── entities/
    └── module.entity.ts    # Response types
```

**Module Definition Example:**
```typescript
@Module({
  imports: [PrismaModule],
  controllers: [DealsController],
  providers: [DealsService],
  exports: [DealsService],
})
export class DealsModule {}
```

### 3.4 Authentication & Authorization

**JWT-Based Auth:**
```typescript
// Auth guard applied globally or per-route
@UseGuards(JwtAuthGuard)
@Controller('deals')
export class DealsController {
  // Routes protected by JWT
}

// Custom decorators extract user context
@Get()
async findAll(
  @TenantId() tenantId: string,
  @UserId() userId: string,
  @UserRole() role: string
) {
  // Access user context
}
```

**Role-Based Access Control:**
```typescript
// RBAC Guard for sensitive operations
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'OWNER')
@Delete(':id')
async remove(@Param('id') id: string) {
  // Only admins/owners can delete
}
```

### 3.5 API Response Patterns

**Standard Success Response:**
```typescript
// Single item
{
  "id": "clxyz...",
  "name": "Example",
  "createdAt": "2026-02-08T..."
}

// List with pagination
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

**Error Response:**
```typescript
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 3.6 DTO Validation Pattern

```typescript
import { IsString, IsEmail, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDealDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  title: string;

  @IsNumber()
  @Min(0)
  @Max(1000000000)
  value: number;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;
}
```

---

## 4. KEY COMPONENTS

### 4.1 Database Schema Patterns

**Zander Core Models (50+):**
```prisma
// Multi-tenant base
model Tenant {
  id            String   @id @default(cuid())
  name          String
  subdomain     String   @unique
  plan          String   @default("free")
  // Relations to all tenant-scoped data
  users         User[]
  deals         Deal[]
  contacts      Contact[]
  campaigns     Campaign[]
}

// CRM Models
model Contact {
  id          String   @id @default(cuid())
  tenantId    String
  email       String
  firstName   String?
  lastName    String?
  company     String?
  phone       String?
  source      String?
  deals       Deal[]
  activities  Activity[]

  @@unique([tenantId, email])
}

model Deal {
  id          String   @id @default(cuid())
  tenantId    String
  title       String
  value       Decimal  @db.Decimal(12, 2)
  stage       String
  probability Int      @default(0)
  contactId   String?
  contact     Contact? @relation(...)
  pipelineId  String
  pipeline    Pipeline @relation(...)
}

// Marketing Models
model Campaign {
  id          String   @id @default(cuid())
  tenantId    String
  name        String
  type        String   // email, social, content, etc.
  status      String   @default("draft")
  budget      Decimal?
  startDate   DateTime?
  endDate     DateTime?
}

model Funnel {
  id          String   @id @default(cuid())
  tenantId    String
  name        String
  stages      FunnelStage[]
}
```

**MCFOS Core Models (90+):**
```prisma
// Manufacturing-specific
model Project {
  id              String   @id @default(cuid())
  projectNumber   String   @unique
  name            String
  client          Client   @relation(...)
  stage           String   // 11-stage pipeline
  cabinetVisionId String?
  cvImportDate    DateTime?
  installDate     DateTime?
  components      Component[]
  cutLists        CutList[]
}

model Component {
  id          String   @id @default(cuid())
  projectId   String
  name        String
  width       Decimal
  height      Decimal
  depth       Decimal
  material    String
  status      String
  station     Station? @relation(...)
}

// HR/Time Tracking
model ShiftClock {
  id          String   @id @default(cuid())
  userId      String
  clockIn     DateTime
  clockOut    DateTime?
  breakMinutes Int     @default(0)
  notes       String?
}

model TimeOffRequest {
  id          String   @id @default(cuid())
  userId      String
  type        String   // PTO, Sick, Personal
  startDate   DateTime
  endDate     DateTime
  status      String   @default("pending")
  approvedBy  String?
}
```

### 4.2 Frontend Component Patterns

**Page Component Structure:**
```typescript
// app/[module]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';

export default function ModulePage() {
  const { user, tenantId } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await fetch(`${API_URL}/module`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json();
    setData(json.data);
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <Header title="Module" />
      <DataTable data={data} />
    </div>
  );
}
```

**Reusable Component Pattern:**
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  children,
  onClick
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-md font-medium transition-colors',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        loading && 'opacity-50 cursor-not-allowed'
      )}
      onClick={onClick}
      disabled={loading}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}
```

### 4.3 Service Layer Patterns

**Standard Service Methods:**
```typescript
@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, options?: QueryOptions) {
    const { page = 1, limit = 20, search, sortBy, sortOrder } = options || {};

    const where = {
      tenantId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { contact: { email: { contains: search, mode: 'insensitive' } } }
        ]
      })
    };

    const [data, total] = await Promise.all([
      this.prisma.deal.findMany({
        where,
        include: { contact: true, pipeline: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortOrder || 'desc' } : { createdAt: 'desc' }
      }),
      this.prisma.deal.count({ where })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(tenantId: string, id: string) {
    const deal = await this.prisma.deal.findFirst({
      where: { id, tenantId },
      include: { contact: true, activities: true }
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    return deal;
  }

  async create(tenantId: string, userId: string, dto: CreateDealDto) {
    return this.prisma.deal.create({
      data: {
        ...dto,
        tenantId,
        createdBy: userId
      },
      include: { contact: true }
    });
  }

  async update(tenantId: string, id: string, dto: UpdateDealDto) {
    await this.findOne(tenantId, id); // Verify ownership

    return this.prisma.deal.update({
      where: { id },
      data: dto,
      include: { contact: true }
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id); // Verify ownership

    return this.prisma.deal.delete({
      where: { id }
    });
  }
}
```

---

## 5. AUTOMATION WORKFLOWS

### 5.1 Zander Workflow Engine (CMO Module)

**Workflow Model:**
```prisma
model Workflow {
  id          String   @id @default(cuid())
  tenantId    String
  name        String
  description String?
  isActive    Boolean  @default(true)
  trigger     Json     // { type: 'event', event: 'contact.created' }
  actions     WorkflowAction[]
}

model WorkflowAction {
  id          String   @id @default(cuid())
  workflowId  String
  type        String   // 'email', 'delay', 'condition', 'update'
  config      Json     // Action-specific configuration
  order       Int
  workflow    Workflow @relation(...)
}
```

**Workflow Execution:**
```typescript
@Injectable()
export class WorkflowService {
  async executeWorkflow(workflowId: string, context: WorkflowContext) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { actions: { orderBy: { order: 'asc' } } }
    });

    for (const action of workflow.actions) {
      await this.executeAction(action, context);
    }
  }

  private async executeAction(action: WorkflowAction, context: WorkflowContext) {
    switch (action.type) {
      case 'email':
        await this.emailService.send(action.config, context);
        break;
      case 'delay':
        await this.scheduleDelayedExecution(action, context);
        break;
      case 'update':
        await this.updateRecord(action.config, context);
        break;
      case 'condition':
        if (this.evaluateCondition(action.config, context)) {
          // Continue to next action
        } else {
          // Skip remaining actions or branch
        }
        break;
    }
  }
}
```

### 5.2 MCFOS Production Workflow

**11-Stage Pipeline:**
```typescript
const PRODUCTION_STAGES = [
  'CABINET_VISION',      // Design in Cabinet Vision
  'SUBMITTED',           // Order submitted
  'PROCESSING',          // Processing order
  'CUT_LIST_READY',      // Cut lists generated
  'CUTTING',             // Material being cut
  'PRIMARY_ASSEMBLY',    // Boxes being assembled
  'FINAL_ASSEMBLY',      // Hardware, hinges, etc.
  'FINISHING',           // Stain/paint
  'QUALITY_CHECK',       // QC inspection
  'READY_TO_SHIP',       // Staged for delivery
  'INSTALL_COMPLETE'     // Installed at client site
];
```

**Cabinet Vision Import Automation:**
```typescript
@Injectable()
export class CabinetVisionService {
  async importProject(cvFile: Buffer, projectId: string) {
    // Parse Cabinet Vision XML/CSV export
    const cvData = await this.parseCABFile(cvFile);

    // Create components from CV data
    const components = cvData.cabinets.map(cab => ({
      projectId,
      name: cab.name,
      width: cab.width,
      height: cab.height,
      depth: cab.depth,
      material: cab.material,
      doorStyle: cab.doorStyle,
      status: 'PENDING'
    }));

    // Bulk create components
    await this.prisma.component.createMany({ data: components });

    // Generate cut lists
    await this.cutListService.generate(projectId);

    // Update project stage
    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        stage: 'CUT_LIST_READY',
        cvImportDate: new Date()
      }
    });
  }
}
```

### 5.3 Background Job Processing

**Scheduled Tasks:**
```typescript
// Using NestJS Schedule module
@Injectable()
export class ScheduledTasks {
  @Cron('0 0 * * *') // Daily at midnight
  async dailyDigest() {
    const tenants = await this.prisma.tenant.findMany({
      where: { digestEnabled: true }
    });

    for (const tenant of tenants) {
      await this.notificationService.sendDailyDigest(tenant.id);
    }
  }

  @Cron('0 */15 * * * *') // Every 15 minutes
  async processScheduledEmails() {
    const emails = await this.prisma.scheduledEmail.findMany({
      where: { sendAt: { lte: new Date() }, sent: false }
    });

    for (const email of emails) {
      await this.emailService.send(email);
      await this.prisma.scheduledEmail.update({
        where: { id: email.id },
        data: { sent: true, sentAt: new Date() }
      });
    }
  }
}
```

---

## 6. DEVELOPMENT PRACTICES

### 6.1 Git Workflow

**Commit Convention:**
```bash
# Format: type(scope): description
feat(cmo): Add funnel stage drag-and-drop
fix(auth): Resolve token refresh race condition
chore(deps): Update prisma to 5.22.0
docs(api): Add OpenAPI annotations to deals endpoint
security(api): Implement rate limiting and CORS
```

**Branch Strategy:**
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches
- `security/*` - Security patches

### 6.2 Testing Strategy

**Backend Tests:**
```typescript
// Unit test example
describe('DealsService', () => {
  let service: DealsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DealsService,
        { provide: PrismaService, useValue: mockPrisma }
      ]
    }).compile();

    service = module.get<DealsService>(DealsService);
  });

  it('should create a deal', async () => {
    const dto = { title: 'Test Deal', value: 10000 };
    const result = await service.create('tenant-1', 'user-1', dto);
    expect(result.title).toBe('Test Deal');
  });
});
```

### 6.3 Environment Management

**Development:**
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/dev_db
NEXT_PUBLIC_API_URL=http://localhost:8080
NODE_ENV=development
```

**Production:**
```env
DATABASE_URL=postgresql://user:pass@rds-host:5432/prod_db
NEXT_PUBLIC_API_URL=https://api.zanderos.com
NODE_ENV=production
```

### 6.4 Deployment Pipeline

**Zander Backend (AWS ECS):**
```bash
# 1. Build Docker image
docker build -f Dockerfile.api -t zander-api:vN .

# 2. Push to ECR
aws ecr get-login-password | docker login --username AWS ...
docker tag zander-api:vN ECR_URL/zander-api:vN
docker push ECR_URL/zander-api:vN

# 3. Update ECS (scale-to-zero method for safety)
aws ecs update-service --cluster zander-cluster --service zander-api-service --desired-count 0
sleep 90
aws ecs update-service --cluster zander-cluster --service zander-api-service \
  --task-definition zander-api:NEW_REVISION --desired-count 1
```

**Zander Frontend (Vercel):**
```bash
# Automatic on push to main branch
git push origin main
# Vercel webhook triggers build and deploy
```

---

## 7. AI/LLM INTEGRATION

### 7.1 Zander - Claude API Direct Integration

**Ask Don AI (CMO Module):**
```typescript
// Raw HTTP fetch to Anthropic API
@Post('ask-don')
async askDon(@Body() dto: AskDonDto, @TenantId() tenantId: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: `You are Don, the Chief Marketing Officer AI for Zander.
               You help with marketing strategy, campaigns, and content.`,
      messages: [{ role: 'user', content: dto.question }]
    })
  });

  const data = await response.json();
  return { answer: data.content[0].text };
}
```

**Persona Testing (CMO):**
```typescript
@Post('personas/:id/test')
async testContent(
  @Param('id') personaId: string,
  @Body() dto: TestContentDto,
  @TenantId() tenantId: string
) {
  const persona = await this.prisma.persona.findUnique({
    where: { id: personaId }
  });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: `You are evaluating marketing content from the perspective of:
               Name: ${persona.name}
               Role: ${persona.role}
               Goals: ${persona.goals}
               Pain Points: ${persona.painPoints}

               Evaluate the content and provide:
               1. Relevance Score (1-10)
               2. Emotional Impact Score (1-10)
               3. Likelihood to Engage (1-10)
               4. Specific feedback from this persona's perspective`,
      messages: [{
        role: 'user',
        content: `Evaluate this content:\n\n${dto.content}`
      }]
    })
  });

  const data = await response.json();
  return {
    personaName: persona.name,
    evaluation: data.content[0].text
  };
}
```

### 7.2 MCFOS - Sawyer AI with Tool Use

**Sawyer Architecture (184 Tools):**
```typescript
// Sawyer has access to 184 custom tools organized by category
const SAWYER_TOOLS = {
  // Project Management (25 tools)
  projects: [
    'get_project', 'list_projects', 'create_project', 'update_project',
    'get_project_components', 'update_component_status', 'assign_station',
    // ... more project tools
  ],

  // HR/Time Tracking (30 tools)
  hr: [
    'get_employee', 'list_employees', 'clock_in', 'clock_out',
    'get_timesheet', 'approve_pto', 'submit_pto_request',
    // ... more HR tools
  ],

  // Production (40 tools)
  production: [
    'import_cabinet_vision', 'generate_cut_list', 'get_station_queue',
    'update_component_status', 'log_production_issue',
    // ... more production tools
  ],

  // CRM (35 tools)
  crm: [
    'get_client', 'list_clients', 'create_lead', 'update_deal_stage',
    'log_activity', 'schedule_followup',
    // ... more CRM tools
  ],

  // Analytics (20 tools)
  analytics: [
    'get_production_metrics', 'get_sales_report', 'get_employee_productivity',
    'get_inventory_levels', 'forecast_demand',
    // ... more analytics tools
  ],

  // Communications (15 tools)
  communications: [
    'send_notification', 'send_email', 'send_sms', 'schedule_reminder',
    // ... more communication tools
  ],

  // System (19 tools)
  system: [
    'get_settings', 'update_settings', 'manage_user_roles',
    'get_audit_log', 'backup_database',
    // ... more system tools
  ]
};
```

**Tool Use Pattern:**
```typescript
@Injectable()
export class SawyerService {
  async chat(userId: string, message: string, conversationHistory: Message[]) {
    const tools = this.getAvailableTools(userId);

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: this.getSawyerSystemPrompt(userId),
      tools: tools.map(t => ({
        name: t.name,
        description: t.description,
        input_schema: t.inputSchema
      })),
      messages: conversationHistory
    });

    // Handle tool use
    if (response.stop_reason === 'tool_use') {
      const toolUse = response.content.find(c => c.type === 'tool_use');
      const toolResult = await this.executeTool(toolUse.name, toolUse.input);

      // Continue conversation with tool result
      return this.chat(userId, '', [
        ...conversationHistory,
        { role: 'assistant', content: response.content },
        { role: 'user', content: [{ type: 'tool_result', tool_use_id: toolUse.id, content: toolResult }] }
      ]);
    }

    return response.content[0].text;
  }

  private async executeTool(name: string, input: any) {
    // Route to appropriate service based on tool name
    switch (name) {
      case 'get_project':
        return this.projectService.findOne(input.projectId);
      case 'clock_in':
        return this.shiftService.clockIn(input.userId);
      case 'update_component_status':
        return this.productionService.updateStatus(input.componentId, input.status);
      // ... handle all 184 tools
    }
  }
}
```

---

## 8. LESSONS LEARNED

### 8.1 Architecture Decisions

**What Worked Well:**

1. **Monorepo with Shared Database Package**
   - Single source of truth for Prisma schema
   - Easy to keep frontend/backend types in sync
   - Turborepo caching speeds up builds

2. **NestJS Modular Architecture**
   - Clean separation of concerns
   - Easy to add new features without affecting existing code
   - Built-in dependency injection simplifies testing

3. **Multi-Tenant by Default**
   - TenantId on every model from day one
   - Avoids painful migration later
   - Clear data isolation patterns

4. **Direct Anthropic API Integration**
   - More control than wrapper libraries
   - Easy to add new models/features
   - Better error handling and retry logic

**What Could Be Improved:**

1. **Start with TypeScript Strict Mode**
   - Some tech debt from initial loose typing
   - Stricter from start prevents bugs

2. **API Versioning Earlier**
   - Should have versioned endpoints from start
   - `/api/v1/deals` instead of `/api/deals`

3. **Better Error Taxonomy**
   - More specific error codes
   - Better error messages for debugging

### 8.2 Security Best Practices

**Implemented:**
- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Tenant isolation on all queries
- Input validation with class-validator
- CORS configuration with domain whitelist
- Rate limiting (60 requests/minute)
- Security headers via Helmet
- Audit logging for sensitive operations
- Request size limits
- SQL injection prevention via Prisma

**Recommendations for New Project:**
```typescript
// Always validate input
@UsePipes(new ValidationPipe({
  whitelist: true,      // Strip unknown properties
  forbidNonWhitelisted: true,  // Throw on unknown properties
  transform: true       // Auto-transform types
}))

// Always scope queries to tenant
async findAll(tenantId: string) {
  return this.prisma.record.findMany({
    where: { tenantId }  // NEVER omit this
  });
}

// Use transactions for multi-step operations
await this.prisma.$transaction(async (tx) => {
  await tx.fund.update({ ... });
  await tx.position.create({ ... });
  await tx.transaction.create({ ... });
});
```

### 8.3 Performance Optimizations

**Database:**
```prisma
// Index frequently queried fields
model Position {
  @@index([fundId, symbol])
  @@index([fundId, createdAt])
}

// Use select to fetch only needed fields
await prisma.position.findMany({
  where: { fundId },
  select: { id: true, symbol: true, quantity: true }  // Not *
});
```

**Caching:**
```typescript
// Cache frequently accessed data
@Injectable()
export class CacheService {
  private cache = new Map<string, { data: any; expires: number }>();

  async getOrSet<T>(key: string, factory: () => Promise<T>, ttlMs = 60000): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    const data = await factory();
    this.cache.set(key, { data, expires: Date.now() + ttlMs });
    return data;
  }
}
```

### 8.4 Recommendations for Hedge Fund Platform

Based on learnings from both projects:

1. **Data Model First**
   - Define comprehensive Prisma schema before coding
   - Include audit fields (createdAt, updatedAt, createdBy)
   - Plan for multi-fund/multi-tenant from start

2. **Compliance by Design**
   - Audit logging built into every mutation
   - Role-based access control from day one
   - Data retention policies in schema

3. **Real-Time Considerations**
   - WebSocket support for live data
   - Event-driven architecture for updates
   - Consider event sourcing for trade history

4. **AI Integration Pattern**
   - Use tool-use for agentic capabilities
   - Structured outputs for consistent responses
   - Clear context windows and token management

5. **Financial Calculations**
   - Use Decimal type for all monetary values
   - Never use floating point for money
   - Consider dedicated calculation service

---

## Appendix A: File Reference

### Key Files to Study

**Zander:**
- `apps/api/src/main.ts` - Application bootstrap, middleware
- `apps/api/src/cmo/` - Complete CMO module implementation
- `apps/api/src/auth/` - Authentication patterns
- `packages/database/prisma/schema.prisma` - Database schema
- `apps/web/app/cmo/` - Frontend CMO module

**MCFOS:**
- `apps/api/src/sawyer/` - AI assistant with 184 tools
- `apps/api/src/production/` - Manufacturing workflow
- `packages/db/prisma/schema.prisma` - 90+ model schema
- `apps/web/app/operations/` - Operator portal

### Quick Command Reference

```bash
# Start development
cd apps/web && npm run dev    # Frontend: localhost:3002
cd apps/api && npm run start:dev  # Backend: localhost:8080

# Database
cd packages/database && npx prisma studio    # Visual DB browser
cd packages/database && npx prisma generate  # Regenerate client
cd packages/database && npx prisma db push   # Push schema changes

# Build and type check
cd apps/api && npm run build
cd apps/web && npm run build
```

---

**End of Document**

*This document provides comprehensive context for designing a new AI-powered hedge fund management platform based on proven patterns from MCFOS and Zander.*
