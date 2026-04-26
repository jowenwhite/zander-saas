# Deployment — Zander Platform

## Current Production State (v90)

- **ECS**: zander-cluster/zander-api-service running task definition zander-api:77
- **ECR**: 288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api:v90
- **Commit**: `ed2b2a2`
- **Health**: https://api.zanderos.com/health returns `{"status":"ok"}`
- **Deployed**: 2026-04-26 — Contact Import: vCard/CSV/Excel parsing, 5-step wizard, field mapping, dedup, executive context updates

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

## LOCAL TESTING MANDATE — MANDATORY

NO code change ships to ECS without local verification first. This rule is permanent and non-negotiable.

### Before ANY Docker build or deployment:
1. Clean and rebuild: `rm -rf apps/api/dist && cd apps/api && npx tsc`
2. Start local API: `cd apps/api && npm run start:dev`
3. Start local web: `cd apps/web && npm run dev`
4. Open browser at localhost and test EVERY fix against the local server
5. Verify the fix works visually and functionally
6. Only THEN proceed to Docker build and deploy

### Why this exists:
The April 19-20, 2026 weekend burned 5+ Docker build/ECR push/ECS deploy cycles (hours of time, real AWS costs) deploying code that was never tested locally. Compiled JS did not include source changes. Every deployment "succeeded" (health check passed, TypeScript compiled) but the actual bugs remained because the fixes never made it into the running code.

### The rule:
- TypeScript compiling does NOT mean the fix works
- Docker --no-cache does NOT guarantee fresh compiled output
- Health check passing does NOT mean your fix is deployed
- The ONLY proof is: run it locally, see it work in the browser

## Deployment Commands

### API Deployment

**CRITICAL:** `aws ecs update-service --force-new-deployment` does NOT update the image if the task definition is pinned to a specific image tag. You MUST register a new task definition revision pointing to the new image, then update the service to use the new task definition.

```bash
# 1. Build with no cache (ALWAYS use --no-cache)
docker build --no-cache -f Dockerfile.api -t zander-api:vXX .

# 2. Tag for ECR (both version and latest)
docker tag zander-api:vXX 288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api:vXX
docker tag zander-api:vXX 288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api:latest

# 3. ECR login + push both
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 288720721534.dkr.ecr.us-east-1.amazonaws.com
docker push 288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api:vXX
docker push 288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api:latest

# 4. Register NEW task definition revision with the new image
aws ecs describe-task-definition --task-definition zander-api --region us-east-1 --query "taskDefinition" > /tmp/task-def.json
cat /tmp/task-def.json | jq 'del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy) | .containerDefinitions[0].image = "288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api:vXX"' > /tmp/new-task-def.json
aws ecs register-task-definition --cli-input-json file:///tmp/new-task-def.json --region us-east-1

# 5. Update service with NEW task definition (note the new revision number from step 4)
aws ecs update-service --cluster zander-cluster --service zander-api-service --task-definition zander-api:NEW_REVISION --force-new-deployment --region us-east-1

# 6. Wait for stability
aws ecs wait services-stable --cluster zander-cluster --services zander-api-service --region us-east-1

# 7. Health check
curl https://api.zanderos.com/health

# 8. Pull CloudWatch logs to verify new code is running
aws logs get-log-events --log-group-name /ecs/zander-api --log-stream-name $(aws logs describe-log-streams --log-group-name /ecs/zander-api --order-by LastEventTime --descending --limit 1 --query "logStreams[0].logStreamName" --output text --region us-east-1) --limit 30 --region us-east-1 --query "events[*].message" --output text
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
