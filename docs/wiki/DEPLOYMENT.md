# Deployment — Zander Platform

## Current Production State (v35)

- **ECS**: zander-cluster/zander-api-service running task definition zander-api:41
- **ECR**: 288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api:v35
- **Commit**: `01addac`
- **Health**: https://api.zanderos.com/health returns `{"status":"ok"}`

## Infrastructure

### API (NestJS)
- **Host:** AWS ECS Fargate
- **Registry:** AWS ECR
- **Dockerfile:** `Dockerfile.api` at repository root
- **Health Check:** GET /health

### Web (Next.js)
- **Host:** Vercel
- **Domain:** app.zanderos.com
- **Environment:** Vercel Environment Variables

### Database
- **Host:** AWS RDS PostgreSQL
- **ORM:** Prisma
- **Migration:** `prisma db push` only (never `migrate dev` in production)

## Deployment Commands

### API Deployment
```bash
# Build with no cache (ALWAYS use --no-cache)
docker build --no-cache -f Dockerfile.api -t zander-api:vXX .

# Tag for ECR
docker tag zander-api:vXX 288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api:vXX

# Push to ECR
docker push 288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api:vXX

# Update ECS service (force new deployment)
aws ecs update-service --cluster zander-cluster --service zander-api-service --force-new-deployment
```

### Web Deployment
```bash
# Vercel auto-deploys on push to master
git push origin master

# Manual deploy if needed
vercel --prod
```

### Database Changes
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (NEVER use migrate dev)
npx prisma db push
```

## Environment Variables

### API (ECS Task Definition)
- DATABASE_URL
- JWT_SECRET
- OPENAI_API_KEY
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- AWS credentials (via IAM role)

### Web (Vercel)
- NEXT_PUBLIC_API_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL

## Deployment Checklist

1. [ ] Run tests locally
2. [ ] Build Docker image with `--no-cache`
3. [ ] Push to ECR
4. [ ] Update ECS service
5. [ ] Verify health check: `curl https://api.zanderos.com/health`
6. [ ] Test critical flows in app
7. [ ] Update SESSION_LOG.md with deployment notes
