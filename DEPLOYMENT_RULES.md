# Zander Deployment Rules — Mandatory

## Vercel Deployment Verification (EVERY COMMIT)

After EVERY git push origin master, you MUST:

1. Wait 90 seconds for Vercel to pick up the push
2. Check deployment status by running: curl -s "https://app.zanderos.com" -o /dev/null -w "HTTP Status: %{http_code}\n"
3. Verify the commit hash deployed matches what was pushed
4. If deployment FAILS:
   - Read the full Vercel build error log
   - Fix the issue immediately
   - Push again and re-verify
   - Do NOT move on to other work until Vercel is green
5. NOTHING is complete until Vercel deployment is confirmed successful

## No False Success Reports

- "Code looks correct" is NOT verification
- "Should work" is NOT verification
- A passing local build is NOT deployment confirmation
- ONLY a confirmed live Vercel deployment with green/Ready status counts as complete

## ECS Deployment Verification

After every ECS deploy, confirm with:
aws ecs describe-services --cluster zander-cluster --services zander-api-service --query 'services[0].deployments[*].{status:status,running:runningCount,desired:desiredCount,taskDef:taskDefinition}'

Then health check: curl -s https://api.zanderos.com/health

## Standing Rules

- Docker builds always --no-cache
- prisma db push only — never migrate dev in production
- Boris Method mandatory — read all code before writing
- RDS security group sg-03eb2fd7369bf002e — open before push, close immediately after
- Fix root causes across ALL affected files simultaneously
- All outbound comms route through ScheduledCommunication model
- Vercel auto-deploys on push to master — ALWAYS verify it succeeded
