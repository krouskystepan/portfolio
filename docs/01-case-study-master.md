# WEBOS NEXT — case study master (portfolio source)

Use this document as the **primary narrative** when authoring your portfolio page. Supporting detail lives in `02`–`06` and **`08-integrations-bridges-and-shell-polish.md`**; structural hints for your React template live in `07-suggested-portfolio-sections.md`.

---

## Suggested portfolio metadata

**Tag (eyebrow):** `Case Study` or `Frontend / UX` or `Experimental OS`

**Working title (H1 options):**

- **WEBOS NEXT — a web-based desktop shell in Next.js**
- **WEBOS NEXT — windows, files, and apps in the browser**

**One-line pitch:** A single-page **desktop operating environment** that runs entirely in the browser: draggable desktop icons, a taskbar with Start menu, a window manager with snap-to-edge, a persisted **virtual filesystem**, and multiple first-party apps (Notepad, Paint, Calculator, Trash, Settings).

**Elevator description (2–3 short paragraphs for `ProjectSubPageDescription`):**

WEBOS NEXT is a **client-only “web OS” experiment** built on the modern React stack. It treats the viewport as a full-screen shell: wallpaper and theme personalization, stacked draggable windows, and a persistent tree of user files and folders—without a traditional backend for core state.

The project explores how far you can push **local-first UX** using Zustand persistence in `localStorage`: open windows restore after reload, the file tree survives sessions, and Settings offers JSON backup/restore for portability. Programs are registered in a central **program registry** with typed IDs, default window geometry, and optional hooks that seed state when a window opens (for example, creating a new Paint document).

The codebase is intentionally **constants-driven**: shell timing, z-index layers, MIME types, file-extension routing, and storage keys live under `src/constants/` so tuning and cross-cutting rules stay in one place. That keeps the shell coherent as features grow.

---

## Suggested table of contents (anchor IDs)

Use these `id`s if you mirror the Gambling BOT style TOC:

1. `#motivation` — Motivation and goals  
2. `#product` — What the user experiences  
3. `#architecture` — High-level architecture  
4. `#state` — Client state and stores  
5. `#vfs` — Virtual filesystem and Explorer  
6. `#programs` — Built-in programs  
7. `#windows` — Window manager, taskbar, desktop  
8. `#persistence` — Persistence, backup, storage pressure  
9. `#engineering` — Engineering choices and trade-offs  
10. `#future` — Future work and open questions  

---

## 1. Motivation and goals (`#motivation`)

**Problem space:** Most “web app” UIs are single-surface SPAs. Real desktop OS affordances—**spatial layout** (icons stay where you put them), **parallel tasks** (several windows), and **files as the unit of work**—are rare on the web outside specialized creative tools.

**Goals for this project:**

- Ship a **credible miniature desktop**: taskbar, clock, Start menu, window chrome, focus and z-order, minimize/maximize/close.  
- Implement a **virtual filesystem** with create/rename/move/copy, soft delete to Trash, and file-type associations that launch the right program.  
- Keep everything **offline-capable** at the data layer: no server required for files, layout, or personalization.  
- Stay **maintainable** as programs multiply: a typed registry, shared constants, and small focused Zustand stores instead of one god object.

**Non-goals (today):** Real multi-user sync, native file system access as the primary store (could be a future enhancement), or a production security model—the surface is a personal toy shell.

---

## 2. What the user experiences (`#product`)

**Boot flow:** The home route shows a loading line until the window store reports hydration (`hasHydrated`), then renders the **Desktop** and **Taskbar** inside `ShellThemeRoot`, which applies light/dark classes and CSS variables for accent from the personalization store.

**Personalization:** From the **Start menu**, users can pick wallpaper presets, upload a custom wallpaper (`image/*` stored as a data URL), choose light/dark theme chips, and select accent swatches. `ShellThemeRoot` and `Desktop` consume those values.

**Start menu file affordances:** Pinned VFS files/folders and a short **Recent files** list (limits in `src/constants/shell/ui.ts`) open through the same helper as double-click — `openVfsNodeFromShell` — so Start, Explorer, and desktop shortcuts stay consistent.

**Work style:**

- Launch **Explorer** to browse folders, open files, rename, and drag items.  
- Drag files from Explorer onto the **desktop** to create shortcuts (with MIME-tagged payloads for HTML5 DnD).  
- Open **Notepad** for rich text (TipTap), **Paint** for bitmap-style drawing stored as structured JSON under a dedicated MIME, **Calculator** as a single-instance utility, **Trash** to review soft-deleted items, and **Settings** for storage breakdown, export/import, and reset.

**Quality touches:** Edge **snap** with preview, **marquee** multi-select on the desktop, a banner when icons drift **off-screen** after resize, and taskbar **grouping** of open windows.

**Routing:** Unknown URLs render a branded **`not-found`** page (`src/app/not-found.tsx`) still wrapped in `ShellThemeRoot`, with a link back to `/` (“Back to Desktop”).

---

## 3. High-level architecture (`#architecture`)

**Framework:** Next.js App Router (`src/app/page.tsx` is the shell entry). **Rendering:** client components for interactive shell. **Styling:** Tailwind v4 with global tokens in `src/app/globals.css`.

**Major subsystems:**

| Subsystem | Role |
|-----------|------|
| **Shell composition** | `ShellThemeRoot` + `Desktop` + `Taskbar`; `layout.tsx` pins `h-dvh overflow-hidden` for full-viewport behavior. |
| **Program registry** | `src/programs/registry.ts` maps `ProgramId` → React component, icon, window sizing, Explorer metadata, optional `onCreateWindow`. |
| **Window manager** | `useWindowStore` + helpers under `src/utils/window/` and `src/stores/window/actions/`. |
| **VFS** | `useVfsStore` tree of `VfsNode` records (helpers in `src/stores/vfs/actions.ts`); persistence via custom JSON storage wrapper. |
| **Desktop surface** | `useDesktopStore` for icon positions, selection, bounds; bridges for rename and Explorer drops. |
| **Personalization** | `usePersonalizationStore` for theme, accent, wallpaper. |
| **Trash coordination** | `useProgramStore` trash slice coordinates metadata with VFS restore/purge. |
| **Context menus** | `useContextMenuStore` + `ContextMenu` for contextual actions. |

**Constants as architecture:** `src/constants/` aggregates shell timing, z-layers, program window defaults, MIME types, storage keys, and appearance tokens—document this as a deliberate pattern for portfolio readers who care about scalability.

---

## 4. Client state and stores (`#state`)

State is split into **focused Zustand stores** with selective `persist` middleware. Stores that must survive reload use **distinct** `name` keys (see `06-persistence-backup-quotas.md`).

**Hydration note (good portfolio detail):** On rehydrate, windows are forced **not** focused—focus is not restored from disk; the user must click again. That avoids confusing “invisible focus” after reload.

**Legacy migration:** `programId === 'apps'` is migrated to `'explorer'` on hydration—shows attention to backward compatibility for stored layouts.

For a tabular breakdown of every store, read `02-architecture-and-stores-reference.md`.

---

## 5. Virtual filesystem and Explorer (`#vfs`)

The VFS is a **directed tree** of nodes keyed by id, with a synthetic **root folder** (`VFS_ROOT_ID`). The root node’s display name is **Desktop** — this is the canonical “disk” for user files; the **on-screen wallpaper** is separate (desktop **tiles** are shortcuts, app launchers, and mirrored VFS children of that root).

**Soft delete:** `deleteNode` sets `deletedAt` on the node and its subtree and strips matching **desktop** `vfs-node` tiles. The **Trash app** lists **`useProgramStore` trash items** (metadata written before delete via `moveVfsNodeToTrash`); **restore** / **empty** coordinate `restoreNode`, `purgeSubtree`, and desktop re-add.

**Opening files:** `resolveProgramByExtension` routes `.txt` → Notepad, `.paint` → Paint, default → Explorer. **`.app` / `.oslink`** files store JSON `{ programId }` and resolve like Windows shortcuts (`parseDesktopShortcutProgramId`).

**Explorer is a hybrid navigator:** a virtual **root** (System + link into the VFS Desktop), a virtual **Apps** catalog built from the program registry, and real **VFS folders** with Back/Up, in-folder search filter, toolbar CRUD, breadcrumbs, **Enter / Delete / F2** keyboard shortcuts, row DnD (`WEBOS_VFS_DRAG_MIME`), and deep-link fields on the window record when another surface opens Explorer into a specific folder.

Deep dive: `03-vfs-files-explorer-and-dnd.md` and `08-integrations-bridges-and-shell-polish.md`.

---

## 6. Built-in programs (`#programs`)

| Program | Highlights |
|---------|------------|
| **Explorer** | File/folder UI, navigation, DnD, program launcher surface. |
| **Notepad** | TipTap rich editor; multiple documents backed by VFS where applicable. |
| **Paint** | Large client module: pencil/brush/eraser/fill/picker/line/rect, palette, `PaintFileV1` JSON codec; **persist path** downscales to JPEG/PNG under byte caps (`PAINT_PERSIST_*` in `src/constants/paint/persist.ts`, `rasterDataUrlForPaintPersist`). |
| **Calculator** | Single-instance four-function calculator with expression building. |
| **Trash** | Single-instance **trash bin UI** over program-store trash entries + VFS restore/purge; restore can recreate desktop shortcuts. |
| **Settings** | Storage meter (assumed localStorage budget), warn/critical ratio styling, JSON export/import of persisted keys, full reset, quota-hit banner via session flag from VFS storage wrapper. |

**Registry pattern:** `onCreateWindow` can inspect the VFS at open time—for example Notepad picks a recent non-binary note if none specified; Paint creates a new `.paint` file when opening without an id.

**Commented future:** `BrowserApp` is a working **iframe + URL bar** prototype but **commented out** of the registry — enable alongside iframe **sandbox** policy before calling it production-safe.

**Placeholder:** `NotImplemented.tsx` exists for “shell opened a program that has no UI yet” scenarios.

Program-by-program bullets: `04-programs-feature-reference.md`.

---

## 7. Window manager, taskbar, and desktop (`#windows`)

**Window lifecycle:** `createWindow` seeds `x`, `y`, `w`, `h` from `PROGRAM_WINDOW_SIZES` and global fallbacks. `openWindow(programId, options?)` merges options and applies a **cascaded pixel offset** (`OPEN_WINDOW_OFFSET`, capped) so rapid opens stay readable; floating positions are **clamped** so title bars stay grabbable (`clampFloatingWindowPosition`).

**Single-instance + Explorer:** Re-opening Settings/Trash/Calculator focuses the existing window. Passing **`activeExplorerNodeId`** to an **existing** Explorer window bumps **`activeExplorerRequestAt`** so Explorer **navigates** without spawning a second instance.

**Snapping:** Edge snap with **`snapPreview`** (`null | 'left' | 'right' | 'top'`), commit via `snapWindow`, restore via `unsnapWindowToFloating`.

**Taskbar:** Start button opens Start menu; program buttons reflect open windows; clock shows date/time. Grouping logic lives in taskbar components (`TaskbarProgramGroup`, fingerprints for stable grouping).

**Desktop:** Icons on a grid, drag reposition, marquee selection, bounds clamping on resize, optional off-screen notice, trash drop target emphasis when dragging eligible shortcuts.

Details: `05-window-manager-taskbar-desktop.md`.

---

## 8. Persistence, backup, and storage pressure (`#persistence`)

**Mechanism:** Zustand `persist` → `localStorage` under stable keys (`STORAGE_KEY_*`).

**Portability:** Settings **export** gathers parsed JSON for keys in `PERSIST_STORAGE_KEYS` and downloads `webos-backup.json`. **Import** writes those keys back and reloads after a short delay.

**Quota awareness:** Custom VFS persist storage catches `QuotaExceededError`, records a timestamp in `sessionStorage`, and Settings can surface a **quota hit** banner—useful “production-minded toy” narrative.

Full key list and ratios: `06-persistence-backup-quotas.md`.

---

## 9. Engineering choices and trade-offs (`#engineering`)

**Why Zustand over React Context alone:** Many independent domains (windows, vfs, desktop, personalization) each with high-frequency updates; persist middleware per slice is cleaner than one mega-reducer.

**String-based file content:** Entire file bodies live in memory/localStorage—simple for a demo, but **O(n)** growth and quota risk for huge assets. Paint mitigates with **`rasterDataUrlForPaintPersist`**: downscale long edge (max **1600** → min **256** px), try PNG then JPEG quality steps, until `encodePaintDocument` UTF-8 size ≤ **1_200_000** bytes or fail with a user-visible error (`src/constants/paint/persist.ts`).

**Client-only security model:** No auth; treat as a personal desk toy, not multi-tenant software.

**TypeScript + explicit ProgramId union:** Reduces wiring bugs between registry, window records, and Explorer.

**Czech UI language default:** `APP_HTML_LANG = 'cs'` — small authenticity detail if your portfolio audience cares.

---

## 10. Future work and open questions (`#future`)

**Near-term product ideas:**

- Finish or replace **Browser** as a real iframe/webview program with navigation controls.  
- **Import/export** individual files as downloads/uploads beyond full backup JSON.  
- **Accessibility pass** on window chrome, Explorer list, and context menus (focus rings, ARIA).  
- **IndexedDB** or OPFS backend for larger Paint and attachments while keeping the same VFS API.  
- Wire **`ContextMenu` `type: 'app'`** (Open / Add to Desktop) to Explorer **Apps** rows or remove dead branch.  
- **Touch** gestures and reduced-motion polish for marquee / window drag.

**Engineering hard problems already partially addressed:**

- localStorage **size limits** and graceful degradation.  
- **Z-order** and focus correctness across overlapping windows.  
- **Drag-and-drop** fidelity between Explorer and desktop without broken references.

---

## Closing line for your portfolio footer

> WEBOS NEXT is a structured playground for **desktop metaphors on the web**: spatial icons, parallel windows, and a user-owned file tree—implemented with modern React patterns and disciplined client persistence.

---

_End of master narrative. Cross-reference `02`–`08` and **`09`–`15`** for full implementation coverage._
