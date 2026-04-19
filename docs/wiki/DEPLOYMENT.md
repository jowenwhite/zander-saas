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

## DEBUGGING PRODUCTION ERRORS — MANDATORY PROTOCOL

For ANY API error (500, 404, or unexpected behavior in production), you MUST check CloudWatch logs BEFORE attempting any fix. Never guess at the cause. Never write fix code without the actual stack trace.

### How to pull logs:
```bash
aws logs get-log-events --log-group-name /ecs/zander-api --log-stream-name $(aws logs describe-log-streams --log-group-name /ecs/zander-api --order-by LastEventTime --descending --limit 1 --query "logStreams[0].logStreamName" --output text --region us-east-1) --limit 50 --region us-east-1 --query "events[*].message" --output text
```

### Protocol:
1. Reproduce the error (or get the timestamp from the user)
2. Pull CloudWatch logs for that time window
3. Find the exact stack trace and error message
4. REPORT the error to the user before writing any fix
5. Write the fix based on the ACTUAL error, not assumptions
6. Verify the fix addresses the specific error from the logs

### What NOT to do:
- Do not guess at fixes based on code reading alone
- Do not assume TypeScript compilation = working code
- Do not claim a fix works without testing against the actual error
- Do not make multiple speculative fixes hoping one sticks

This protocol would have saved hours of wasted work on April 19, 2026. Enforce it every time.
