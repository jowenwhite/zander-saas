---
description: End of session protocol - commit, backup, update CLAUDE.md
---

# End of Session Protocol

Execute the complete end-of-session checklist to ensure clean handoff.

## Steps

### 1. Check Git Status
```bash
cd ~/dev/zander-saas && git status
```

### 2. Commit Any Uncommitted Changes
If there are uncommitted changes:
```bash
git add -A && git commit -m "Session end: [describe what was done]" && git push
```

### 3. Database Backup (if schema changed)
Only if Prisma schema was modified this session:
```bash
pg_dump -U zander_app -h localhost zander_dev > ~/Desktop/zander_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 4. Update CLAUDE.md
Edit the "Current Priority" section of CLAUDE.md to reflect:
- What was completed this session
- Current state of the codebase
- Next steps for the next session
- Any blockers or decisions needed

### 5. Commit CLAUDE.md Update
```bash
git add CLAUDE.md && git commit -m "Update CLAUDE.md with session progress" && git push
```

### 6. Final Report
Provide a summary:
- ✅ Tasks completed
- 📍 Current state
- 🎯 Next session priorities
- ⚠️ Any blockers or notes

## Example Summary

```
=== Session End Summary ===

✅ Completed:
- Created CMO sidebar component
- Added route structure for /cmo pages
- Integrated with existing layout system

📍 Current State:
- CMO Phase 2: 40% complete
- All builds passing
- Committed: abc1234

🎯 Next Session:
- Build KPI card components
- Create dashboard grid layout
- Add responsive breakpoints

⚠️ Notes:
- Need to decide on chart library (Recharts vs Chart.js)
```


