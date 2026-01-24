# Claude Code Setup Guide for Jonathan
## Weekend Setup Checklist

**Time Required:** 1-2 hours  
**Date:** January 24, 2026

---

## Step 1: Install Claude Code (5 min)

Open Terminal and run:

```bash
# Install Claude Code globally
npm install -g @anthropic-ai/claude-code

# Verify installation
claude --version
```

If you get permission errors:
```bash
sudo npm install -g @anthropic-ai/claude-code
```

---

## Step 2: Authenticate (2 min)

```bash
# This will open browser for Anthropic authentication
claude auth

# Or if you have an API key:
export ANTHROPIC_API_KEY=your-key-here
```

---

## Step 3: Configure Opus 4.5 with Thinking (2 min)

Create or edit `~/.claude/config.json`:

```bash
mkdir -p ~/.claude
cat > ~/.claude/config.json << 'EOF'
{
  "model": "claude-opus-4-5-20250514",
  "thinking": true,
  "permissions": {
    "allowedDirectories": [
      "~/dev/zander-saas",
      "~/dev/mcfos"
    ]
  }
}
EOF
```

---

## Step 4: Add CLAUDE.md to Zander Repo (5 min)

```bash
# Navigate to Zander
cd ~/dev/zander-saas

# Copy the CLAUDE.md I created (you'll need to paste it)
# Or download from the outputs I provided

# Add to git
git add CLAUDE.md
git commit -m "Add CLAUDE.md for Claude Code workflow"
git push
```

---

## Step 5: Create Slash Commands Directory (10 min)

```bash
# Create commands directory
mkdir -p ~/dev/zander-saas/.claude/commands

# Create commit-push command
cat > ~/dev/zander-saas/.claude/commands/commit-push.md << 'EOF'
---
description: Commit all changes and push to remote
---

# Commit and Push

1. Stage all changes: `git add -A`
2. Create commit with message from user input or generate descriptive message
3. Push to current branch: `git push`
4. Show result: `git log --oneline -1`

If user provides a message, use it. Otherwise, analyze the changes and create a descriptive commit message.
EOF

# Create build-check command
cat > ~/dev/zander-saas/.claude/commands/build-check.md << 'EOF'
---
description: Run build and check for errors
---

# Build Check

Run builds for both frontend and backend, report any errors:

```bash
echo "=== Frontend Build ===" && \
cd ~/dev/zander-saas/apps/web && npm run build 2>&1 | grep -E "error|Error|failed" | head -20

echo "=== Backend Build ===" && \
cd ~/dev/zander-saas/apps/api && npm run build 2>&1 | grep -E "error|Error|failed" | head -20
```

If no errors, report success. If errors found, analyze and suggest fixes.
EOF

# Create db-backup command
cat > ~/dev/zander-saas/.claude/commands/db-backup.md << 'EOF'
---
description: Create a database backup
---

# Database Backup

Create timestamped backup of development database:

```bash
pg_dump -U zander_app -h localhost zander_dev > ~/Desktop/zander_backup_$(date +%Y%m%d_%H%M%S).sql && \
echo "Backup created: ~/Desktop/zander_backup_$(date +%Y%m%d_%H%M%S).sql"
```
EOF

# Create session-end command
cat > ~/dev/zander-saas/.claude/commands/session-end.md << 'EOF'
---
description: End of session protocol - commit, backup, update CLAUDE.md
---

# End of Session Protocol

Execute the complete end-of-session checklist:

1. **Check for uncommitted changes:**
   ```bash
   git status
   ```

2. **If changes exist, commit and push:**
   ```bash
   git add -A && git commit -m "Session end: [describe changes]" && git push
   ```

3. **Create database backup (if schema changed):**
   ```bash
   pg_dump -U zander_app -h localhost zander_dev > ~/Desktop/zander_backup_$(date +%Y%m%d_%H%M%S).sql
   ```

4. **Update CLAUDE.md** with:
   - What was completed this session
   - Current state
   - Next steps for next session

5. **Final commit for CLAUDE.md:**
   ```bash
   git add CLAUDE.md && git commit -m "Update CLAUDE.md with session progress" && git push
   ```

6. **Report summary** of what was accomplished.
EOF

# Commit the commands
cd ~/dev/zander-saas
git add .claude/
git commit -m "Add Claude Code slash commands"
git push
```

---

## Step 6: First Test Run (10 min)

```bash
# Navigate to project
cd ~/dev/zander-saas

# Start Claude Code
claude

# Claude will read CLAUDE.md automatically
# Try these commands:

# Check status
> What's the current state of the CMO module?

# Use Plan mode (shift+tab twice)
> I want to create the CMO sidebar component

# Use a slash command
> /build-check
```

---

## Step 7: Learn the Key Commands

| Shortcut | What It Does |
|----------|--------------|
| `shift+tab` (once) | Toggle auto-accept edits |
| `shift+tab` (twice) | Toggle Plan mode |
| `Ctrl+C` | Cancel current operation |
| `Ctrl+D` | Exit Claude Code |
| `/help` | Show available commands |
| `/clear` | Clear conversation history |
| `/commit-push` | Your custom command |

---

## Workflow Comparison

### Before (Claude.ai Chat)
1. Start chat, paste handoff document
2. Tell Claude what to do
3. Claude generates command
4. You copy command
5. You run in terminal
6. You copy output
7. You paste to Claude
8. Claude analyzes
9. Repeat...

### After (Claude Code)
1. Run `claude` in project directory
2. Claude reads CLAUDE.md automatically
3. Tell Claude what to do
4. Claude executes directly
5. Done

---

## Tips for Success

1. **Start in Plan Mode** — Let Claude think through the approach before executing
2. **Use descriptive prompts** — "Create the CMO sidebar matching the CRO pattern"
3. **Trust but verify** — Claude will show what it's doing, review before auto-accept
4. **Update CLAUDE.md** — When Claude makes a mistake, add it to pitfalls section
5. **One task at a time** — Don't overload, finish one thing before starting another

---

## Troubleshooting

**Claude can't find files:**
```bash
# Make sure you're in the project directory
cd ~/dev/zander-saas
claude
```

**Permission denied:**
```bash
# Run with explicit permission
claude --permission-mode=dontAsk
```

**Model errors:**
```bash
# Check your config
cat ~/.claude/config.json

# Verify API key
echo $ANTHROPIC_API_KEY
```

**Slow responses:**
- Opus 4.5 is larger but more accurate
- Worth the wait — less back-and-forth overall

---

## Ready to Go!

Once setup is complete:

1. Open Terminal
2. `cd ~/dev/zander-saas`
3. `claude`
4. Say: "Let's continue CMO Phase 2 - Frontend Foundation"

Claude will read CLAUDE.md, understand the context, and be ready to work.

---

## Next Steps After Setup

1. **Test the workflow** on a small task first
2. **Get comfortable with Plan mode** 
3. **Add more slash commands** as you find patterns
4. **Update CLAUDE.md** when things go wrong
5. **Start CMO Phase 2** with the new workflow

Welcome to the Boris workflow. 🚀


