# WEBOS NEXT — portfolio documentation bundle

This folder is **source material for your portfolio case study**, not in-app product documentation. Use it to build a sub-page (for example with `ProjectSubPageTitle`, `ProjectSubPageSectionLayout`, `Alert`, and `ProjectSubPageTableOfContents`).

## Files in this bundle

### Narrative and portfolio scaffolding

| File | Purpose |
|------|---------|
| [`01-case-study-master.md`](./01-case-study-master.md) | **Start here (story).** Motivation → product → architecture → VFS → programs → windows → persistence → trade-offs → future. |
| [`07-suggested-portfolio-sections.md`](./07-suggested-portfolio-sections.md) | Copy/paste scaffolding for a portfolio sub-page: tags, alerts, TOC, section bullets. |

### System maps and product behavior

| File | Purpose |
|------|---------|
| [`02-architecture-and-stores-reference.md`](./02-architecture-and-stores-reference.md) | Routes, stores table, WM/Explorer file map, `ExplorerLocation`, `Z_INDEX`, hydration, `ProgramIcon`, App Router files. |
| [`03-vfs-files-explorer-and-dnd.md`](./03-vfs-files-explorer-and-dnd.md) | VFS model, store API, Explorer hybrid UI, DnD MIME, desktop mirror, trash flow, ids. |
| [`04-programs-feature-reference.md`](./04-programs-feature-reference.md) | Program registry contract, each shipped app summary, Browser/NotImplemented, Start menu limits. |
| [`05-window-manager-taskbar-desktop.md`](./05-window-manager-taskbar-desktop.md) | Window state, open/close, snap, taskbar, desktop input, context menu pointer to `08`. |
| [`06-persistence-backup-quotas.md`](./06-persistence-backup-quotas.md) | `localStorage` keys (including naming caveats), backup JSON, quotas, Paint persist byte caps. |
| [`08-integrations-bridges-and-shell-polish.md`](./08-integrations-bridges-and-shell-polish.md) | Bridges, deep-link fields, context menu matrix, `openVfsNodeFromShell`, desktop DnD polish, 404, etc. |

### Technical deep dives (implementation truth)

| File | Purpose |
|------|---------|
| [`09-desktop-store-and-grid-layout.md`](./09-desktop-store-and-grid-layout.md) | `useDesktopStore` API, grid/slotting, `defaultItems`, persist + merge migrations, VFS mirror interaction. |
| [`10-window-chrome-resize-and-interaction.md`](./10-window-chrome-resize-and-interaction.md) | `Window.tsx` drag/resize/maximize/snap math, `ResizeHandle`, `getWindowChrome`, clamps. |
| [`11-design-tokens-theming-and-appearance.md`](./11-design-tokens-theming-and-appearance.md) | `globals.css` tokens, dark variant, `ShellThemeRoot`, wallpaper, `ProgramIcon` / appearance constants, `taskbarSkin`. |
| [`12-vfs-helpers-invariants-and-mime-rules.md`](./12-vfs-helpers-invariants-and-mime-rules.md) | `createVfsHelpers`: paths, MIME inference, unique names, descendants, store guards, `resolveProgramByNode`. |
| [`13-developer-tooling-conventions-and-repo.md`](./13-developer-tooling-conventions-and-repo.md) | Scripts, TS path alias, ESLint/Prettier, `src/` layout, tests note, Cursor arrow-fn rule. |
| [`14-paint-app-behavior-catalog.md`](./14-paint-app-behavior-catalog.md) | Paint tools, file menu (save / download PNG / resize), layout `ResizeObserver`, persist errors. |
| [`15-notepad-editor-and-vfs-wiring.md`](./15-notepad-editor-and-vfs-wiring.md) | Dynamic import, menus, VFS save/rename/desktop wiring, trash alignment. |

## Project facts (quick)

- **Name (UI):** WEBOS NEXT (`src/constants/app/meta.ts` — `APP_HTML_TITLE`).
- **Stack:** Next.js **16**, React **19**, TypeScript, Tailwind **4**, Zustand **5**, TipTap **3**, Lucide icons.
- **Concept:** A browser-based **desktop shell** — wallpaper, theme, accent, floating windows, taskbar, virtual file tree, and multiple “programs” that open from Explorer, the Start menu, or file associations.

## How to use this in your portfolio repo

1. Read **`01-case-study-master.md`** top to bottom once for the story arc.
2. For **implementation accuracy**, use **`02`–`06`**, **`08`**, and **`09`–`15`** as needed (desktop grid, window chrome, VFS helpers, tooling, Paint/Notepad catalogs).
3. Pick 4–7 sections for the first published portfolio version; park long tables in appendices or tooltips.
4. For **icons** (Lucide), reuse suggestions in **`07`** or swap for your visual language.
5. When you quote **paths or APIs**, cite files from this table so the write-up stays verifiable against the repo.

---

_Last generated for repository **webos-next-engine** as portfolio source material._
