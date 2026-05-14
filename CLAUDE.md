@AGENTS.md

# Mission Control

Real-time web dashboard for Soup's OpenClaw agent crew. Command center — not a status page. Gives complete visibility into what agents are doing, what's scheduled, and what they've learned.

**Always running on localhost:3000.**

## Purpose

Operational transparency. "Delegating vs. abdicating." Every screen pulls live data from the OpenClaw workspace so there's always a ground truth: did the agent actually do what it said it would?

## Tech Stack

- **Next.js 16** (App Router, server components by default)
- **Tailwind CSS v4** (CSS variables via `@theme inline`, no `tailwind.config.js`)
- **shadcn/ui** (components in `src/components/ui/`)
- **marked** (server-side markdown → HTML)
- **lucide-react** (icons)

## File Structure

```
src/
  app/
    globals.css              # Color system — ALL palette vars defined here
    layout.tsx               # Root layout (dark bg, fonts)
    page.tsx                 # Redirects to /memory
    (dashboard)/
      layout.tsx             # Sidebar + main content shell
      memory/
        page.tsx             # Server component — loads files, passes to client
        MemoryViewer.tsx     # Client component — interactive two-panel UI
      team/page.tsx          # Agent roster
      tasks/page.tsx         # Kanban board
      calendar/page.tsx      # Cron job viewer
      projects/page.tsx      # Project cards
  components/
    sidebar.tsx              # Client component (needs usePathname)
  lib/
    agents.ts                # 7-agent definitions (the source of truth for crew)
    workspace.ts             # All filesystem reads from ~/.openclaw/workspace
    utils.ts                 # shadcn cn() helper
```

## Color System

**Never use raw hex in components.** Use the Tailwind classes mapped to CSS variables in `globals.css`:

| Class | Value | Use |
|-------|-------|-----|
| `bg-mc-base` | `#07070e` | Page background |
| `bg-mc-card` | `#0d0d1a` | Card/panel background |
| `text-mc-blue` / `bg-mc-blue` | `#0080ff` | Primary accent, active states, links |
| `text-mc-pink` / `bg-mc-pink` | `#ff10f0` | Alerts, secondary accents |
| `text-mc-green` / `bg-mc-green` | `#00ffaa` | Online/success states |
| `text-mc-yellow` / `bg-mc-yellow` | `#ffb800` | Warnings, medium priority |
| `border-mc-border` | `#1a1a35` | Default card/panel borders |
| `border-mc-border-bright` | `#2a2a55` | Hover borders |
| `text-mc-muted` | `#5a5a7a` | Secondary text |
| `text-mc-subtle` | `#383860` | Tertiary text, version numbers |

**Always dark.** There is no light mode. No `dark:` variants needed.

## Design Rules

- **Monospace (`font-mono`) for:** timestamps, IDs, badges, status labels, technical values
- **Thin borders everywhere:** `border border-mc-border`, round with `rounded`
- **Status badges:** colored text + matching border + 10% opacity bg using inline styles with the agent's `accentColor`
- **Empty states:** always explain what to do, reference the file path or Telegram command to populate the screen
- **No mock data, ever.** If real data doesn't exist, show a clean empty state

## Data Sources (All Read-Only for Now)

All reads happen in server components via `src/lib/workspace.ts`.

| Screen | Source | Path |
|--------|--------|------|
| Memory | Markdown files | `~/.openclaw/workspace/memory/YYYY-MM-DD.md` |
| Memory long-term | Markdown file | `~/.openclaw/workspace/MEMORY.md` |
| Tasks | JSON array | `~/.openclaw/workspace/tasks.json` |
| Projects | Markdown files | `~/.openclaw/workspace/projects/*.md` |
| Calendar | JSON config | `~/.openclaw/openclaw.json` → `crons` key |
| Team | Hardcoded + live status | `src/lib/agents.ts` |

## Task Schema (`tasks.json`)

```json
[
  {
    "id": "task_001",
    "title": "string",
    "description": "string (optional)",
    "status": "backlog | in_progress | done",
    "priority": "high | medium | low",
    "agent": "nexus | sentinel | chronos | prioritizer | wayfinder | researcher | architect",
    "project": "project-id (optional)",
    "created": "ISO date string",
    "updated": "ISO date string"
  }
]
```

## Project Schema (`projects/<id>.md`)

```markdown
---
name: Project Name
domain: finance | wedding | career | general
status: active | paused | complete
description: One-line description
created: YYYY-MM-DD
---

Optional freeform notes here.
```

## Agent Definitions (`src/lib/agents.ts`)

The 7-agent crew is hardcoded here. Status values: `"online"` (always-on, Telegram-facing), `"active"` (named agent in openclaw.json, spawnable), `"planned"` (not yet built), `"offline"` (decommissioned). Set `workspaceName` for any active/online agent. Never remove agents — set to `"offline"` if decommissioned.

Current crew status:
- **The Nexus** — `online` (deployed as Maduso, workspace: `~/.openclaw/workspace`)
- **Architect** — `active` (workspace: `~/.openclaw/workspace-architect`, handles content creation)
- **Chronos** — `active` (workspace: `~/.openclaw/workspace-chronos`, handles scheduling/calendar)
- Sentinel, Prioritizer, Wayfinder, Researcher — `planned`

## Notifications

Telegram only (no Discord). The user's Telegram bot token is in `~/.openclaw/openclaw.json`. Do not hardcode tokens.

## What Not To Do

- No light mode, no `dark:` variants
- No SQLite or external databases — filesystem only
- No mock/seed data in components — use real workspace files or empty states
- No `tailwind.config.js` — Tailwind v4 uses `globals.css` `@theme` block
- Do not read workspace files in client components — always server components or API routes
