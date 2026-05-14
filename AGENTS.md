<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

Next.js 16 has breaking changes from earlier versions. Read `node_modules/next/dist/docs/` before writing any new routing or data-fetching code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Technical Context for This Project

## Next.js 16 + App Router Patterns Used Here

**Server vs. client components:**
- All data fetching happens in server components (files without `"use client"`)
- `src/lib/workspace.ts` uses Node.js `fs` — only importable in server components or API routes
- Client components (marked `"use client"`) handle interactivity only — they receive data as props
- Pattern used: server component reads files → passes serializable data as props → client component renders interactively

**Route group `(dashboard)`:**
- The `(dashboard)` folder is a route group — it applies `layout.tsx` (sidebar) without affecting the URL path
- `/memory` resolves to `src/app/(dashboard)/memory/page.tsx`, not `src/app/(dashboard)/memory/page.tsx`

## Tailwind CSS v4 — No Config File

This project uses Tailwind v4. There is **no `tailwind.config.js`**. Custom colors and tokens live in `src/app/globals.css` under `@theme inline`:

```css
@theme inline {
  --color-mc-blue: #0080ff;  /* → bg-mc-blue, text-mc-blue, border-mc-blue */
}
```

The `--color-` prefix maps directly to Tailwind utility classes. Adding a new color:
1. Add `--color-mc-newcolor: #hexval;` to the `@theme inline` block in `globals.css`
2. Use it as `bg-mc-newcolor`, `text-mc-newcolor`, `border-mc-newcolor`

## shadcn/ui v4

Initialized with Tailwind v4 mode. Component source files are in `src/components/ui/`. Import path alias is `@/components/ui/component-name`. To add a component: `npx shadcn@latest add <component-name` from the app directory.

## Markdown Rendering

`marked` is used server-side to convert markdown to HTML strings, which are passed as props to client components and rendered with `dangerouslySetInnerHTML`. Styles for rendered markdown live in the `.mc-prose` class in `globals.css` — not Tailwind's typography plugin.

## Workspace Reads

All reads go through `src/lib/workspace.ts`. Functions return empty arrays/strings on error — never throw. The workspace root is `~/.openclaw/workspace` (`process.env.HOME + '/.openclaw/workspace'`). The OpenClaw config is one level up at `~/.openclaw/openclaw.json`.

## Agent Accent Colors

Each agent has an `accentColor` hex string in `src/lib/agents.ts`. Because these are dynamic (not static Tailwind classes), use inline styles for agent-specific coloring:

```tsx
style={{
  color: agent.accentColor,
  borderColor: agent.accentColor + "40",     // 25% opacity
  backgroundColor: agent.accentColor + "10", // ~6% opacity
}}
```

Do not try to generate Tailwind classes dynamically from these hex values — they won't be included in the build.

## Adding a New Screen

1. Create `src/app/(dashboard)/<screen-name>/page.tsx`
2. Add the route to `NAV_ITEMS` in `src/components/sidebar.tsx`
3. If the screen needs interactivity, split it: server `page.tsx` (data) + client `<Screen>Client.tsx` (UI)
4. Add any new workspace reads to `src/lib/workspace.ts`
