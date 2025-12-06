# Zander SaaS Platform

Multi-tenant SaaS platform providing AI-powered virtual executives for small businesses.

## What We Built (Day 1 - December 6, 2024)

### Database Layer ✅
- PostgreSQL database (zander_dev)
- Prisma ORM with migrations
- Multi-tenant architecture from day 1
- Tables: Tenant, User, Contact
- Seed data loaded

### API Layer ✅
- NestJS REST API
- Running on http://localhost:3001
- Connected to database with Prisma
- Endpoints:
  - GET / - Welcome message
  - GET /health - Health check
  - GET /contacts - List contacts (tenant-isolated)
  - GET /contacts/:id - Get single contact
  - POST /contacts - Create contact

### Project Structure
```
zander-saas/
├── apps/
│   └── api/              # NestJS API
├── packages/
│   └── database/         # Prisma + PostgreSQL
└── package.json          # Turborepo config
```

## Setup Instructions

### Prerequisites
- Node.js 20+
- PostgreSQL 16
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Setup database:
```bash
cd packages/database
npx prisma migrate dev
npx prisma db seed
```

3. Start API:
```bash
cd apps/api
npm start
```

4. Test endpoints:
- http://localhost:3001
- http://localhost:3001/health
- http://localhost:3001/contacts

### Database Management

View data in Prisma Studio:
```bash
cd packages/database
npx prisma studio
```

## Next Steps

- [ ] Add authentication (JWT)
- [ ] Add more CRUD endpoints
- [ ] Build frontend (Next.js)
- [ ] Add Deal model
- [ ] Implement proper multi-tenant auth

## Tech Stack

- **Backend:** NestJS, TypeScript
- **Database:** PostgreSQL, Prisma ORM
- **Monorepo:** Turborepo
- **Version Control:** Git

---

Built with ❤️ by Jonathan White
