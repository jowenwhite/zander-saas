# Architecture — Zander Platform

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
├─────────────────────────────────────────────────────────────┤
│  Web App (Next.js)    │    Mobile (Future)    │   API Clients│
│  app.zanderos.com     │                       │              │
└───────────────────────┴───────────────────────┴──────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API GATEWAY                              │
│                  api.zanderos.com                            │
├─────────────────────────────────────────────────────────────┤
│  NestJS Application (ECS Fargate)                           │
│  - Authentication (JWT)                                      │
│  - Tenant Middleware                                         │
│  - AI Executives (Jordan, Don, Pam, Zander)                 │
│  - REST Endpoints                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL (AWS RDS)  │  Redis (Future)  │  S3 (File Storage)│
│  - Prisma ORM          │  - Caching       │  - Documents      │
│  - Multi-tenant        │  - Sessions      │  - Media          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                          │
├─────────────────────────────────────────────────────────────┤
│  OpenAI        │  Twilio      │  Google APIs  │  Calendly   │
│  - GPT-4       │  - SMS       │  - Gmail      │  - Scheduling│
│  - Embeddings  │  - Voice     │  - Calendar   │              │
│                │              │  - Contacts   │              │
└─────────────────────────────────────────────────────────────┘
```

## Repository Structure

```
zander-saas/
├── apps/
│   ├── api/                 # NestJS API
│   │   ├── src/
│   │   │   ├── auth/        # Authentication
│   │   │   ├── cmo/         # Don's marketing module
│   │   │   ├── communications/  # Email, SMS handling
│   │   │   ├── contacts/    # CRM contacts
│   │   │   ├── executives/  # AI executive core
│   │   │   └── ...
│   │   └── prisma/          # Database schema
│   └── web/                 # Next.js web app
│       ├── app/             # App router pages
│       ├── components/      # React components
│       └── lib/             # Utilities
├── packages/                # Shared packages
├── docs/                    # Documentation
│   └── wiki/                # This wiki
├── Dockerfile.api           # API container
└── CLAUDE.md                # Project context
```

## Key Services

### Authentication
- JWT-based authentication
- NextAuth on frontend
- Tenant-scoped sessions

### AI Executives
- LangChain for orchestration
- OpenAI GPT-4 for reasoning
- Custom tools per executive
- Execution framework (L1-L4)

### Communications
- Gmail integration (OAuth)
- Twilio for SMS/Voice
- Scheduled communications
- Draft system for human review

### CRM
- Multi-tenant contact management
- Company and contact relationships
- Activity tracking
- Tags and segmentation

## Infrastructure

### AWS Services
- **ECS Fargate:** API containers
- **ECR:** Docker image registry
- **RDS:** PostgreSQL database
- **S3:** File storage
- **CloudWatch:** Logging

### Vercel
- Next.js web application
- Edge functions
- Environment variables

### Security Groups
- RDS: sg-03eb2fd7369bf002e (open/close for access)
- ECS: Managed by AWS

## Database

### ORM
- Prisma for type-safe queries
- Schema in apps/api/prisma/schema.prisma

### Migration
- Use `prisma db push` only
- Never use `migrate dev` in production
- Always backup before schema changes

### Multi-Tenancy
- All tables have tenantId
- Queries automatically scoped
- No cross-tenant data leakage
