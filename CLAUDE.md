# Zander SaaS — Claude Code Context

## Quick Reference
- **Repo:** ~/dev/zander-saas | Branch: master
- **API:** https://api.zanderos.com | **App:** https://app.zanderos.com
- **Test as:** jonathan@zanderos.com (ENTERPRISE)

## Wiki — Read Before Working
Before starting any task, read the relevant wiki file(s):

| Working On | Read First |
|---|---|
| AI executives, tools, chat | docs/wiki/EXECUTIVES.md |
| Docker, ECS, Vercel deploys | docs/wiki/DEPLOYMENT.md |
| Tier gating, pricing, subscriptions | docs/wiki/TIERS.md |
| Tenant management, user access | docs/wiki/TENANTS.md |
| Bug investigation | docs/wiki/BUGS_AND_FIXES.md |
| Business context, consulting | docs/wiki/BUSINESS.md |
| Testing protocol | docs/wiki/TESTING.md |
| MCFOS (separate platform) | docs/wiki/MCFOS.md |
| Infrastructure, stack, services | docs/wiki/ARCHITECTURE.md |

## Mandatory Protocols
- **Boris Method:** Read all relevant files before writing any code. Confirm understanding before implementing.
- **End of Session:** git commit → push → append to docs/wiki/SESSION_LOG.md → health check
- **Deployment:** Always --no-cache. Dockerfile.api at root. See docs/wiki/DEPLOYMENT.md.
- **Database:** prisma db push only. Never migrate dev in production.
- **RDS SG:** Open, query, close in same operation. sg-03eb2fd7369bf002e.
- **Zander is Jonathan only.** Never surfaced to users. PEP superadmin-gated.
- **Communications:** All outbound = L3 DRAFT. Jonathan reviews and sends manually.
