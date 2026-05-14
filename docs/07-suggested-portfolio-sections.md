# Suggested portfolio sections (mapped to your React case-study template)

This file is a **structural outline** only — no TSX. Copy headings and bullets into your portfolio’s `ProjectSubPage*` components.

---

## Header block

**`ProjectSubPageTag`**

- `Case Study`  
- or `Frontend`  
- or `Experimental UI`  

**`ProjectSubPageTitle`**

- `WEBOS NEXT — a desktop shell in the browser`  

**`ProjectSubPageDescription`** (multi-paragraph — use `\n` splits like your template)

Paragraph A: WEBOS NEXT is a **Next.js + React** desktop environment that runs entirely in the browser — wallpaper, themes, draggable windows, a taskbar, and a virtual file tree persisted in **localStorage**.

Paragraph B: Programs (**Explorer**, **Notepad** with TipTap, **Paint**, **Calculator**, **Trash**, **Settings**) register in a typed **program registry** with per-app window defaults and optional hooks that create default documents when a window opens.

Paragraph C: The implementation emphasizes **disciplined client architecture** — small Zustand stores, a dedicated VFS module, HTML5 drag-and-drop between Explorer and the desktop, edge snapping, and JSON backup/restore for user data.

---

## `Alert` blocks (suggested)

**Info — “Project overview”**

> The shell composes `ShellThemeRoot`, a full-viewport **Desktop**, and a **Taskbar**. State is split across focused stores (windows, vfs, desktop, personalization, trash, context menu) with selective Zustand persistence.

**Note — “Local-first”**

> There is no server-side database in the core design. All files and layout survive reloads via `localStorage`, and Settings can export/import a single JSON backup.

**Note — “Hybrid Explorer”**

> Explorer is not just a folder tree: it has virtual **System** and **Apps** locations, a real **Desktop** VFS root, CustomEvent navigation bridges, and deep-link fields on the window record so other surfaces can retarget an existing Explorer window.

**Warning — “Storage limits”**

> Large Paint documents embed PNG/JPEG data URLs in JSON; combined with other persisted slices, saves can hit **QuotaExceededError**. The VFS persist layer records quota hits so Settings can surface a banner.

---

## Table of contents (`ProjectSubPageTableOfContents`)

Suggested `items`:

1. Motivation and goals → `#motivation`  
2. User experience walkthrough → `#experience`  
3. System architecture → `#architecture`  
4. State management and stores → `#state`  
5. Virtual filesystem and Explorer → `#vfs`  
6. Programs deep dive → `#programs`  
7. Window manager and desktop → `#windows`  
8. Persistence and backup → `#persistence`  
9. Engineering trade-offs → `#tradeoffs`  
10. Future work → `#future`  
11. Integrations and edge cases → `#integrations` _(optional deep dive — source: `08-...md`)_  

---

## Section 1 — Motivation (`#motivation`)

**Icon suggestions (Lucide):** `Monitor`, `LayoutDashboard`, `Sparkles`

**Body bullets:**

- Explore **desktop metaphors** (spatial icons, parallel windows) on the web.  
- Practice **complex UI orchestration** without a backend: focus, z-order, snapping, DnD.  
- Build a **credible file abstraction** so programs share a unified document space (VFS).

---

## Section 2 — User experience (`#experience`)

**Icon:** `MousePointer2` or `AppWindow`

**Flow diagram steps (`ProjectSubPageFlowDiagram`):**

1. Page loads → hydrate persisted windows  
2. User opens Explorer from Start  
3. User opens / creates files  
4. User arranges desktop shortcuts and windows  
5. Reload → layout returns (local-first)  

---

## Section 3 — Architecture (`#architecture`)

**Icon:** `Layers` or `Box`

**Info cards (three columns):**

| Card | Icon suggestion | Bullets |
|------|-----------------|---------|
| **Shell** | `PanelBottom` | `ShellThemeRoot`; full-viewport `h-dvh`; Desktop + Taskbar composition. |
| **Program host** | `AppWindow` | Typed `ProgramId`; registry metadata; dynamic window chrome + resize handles. |
| **Data layer** | `HardDrive` | VFS graph; Zustand `persist`; JSON backup in Settings. |

---

## Section 4 — State (`#state`)

**Icon:** `GitBranch` or `Database`

**Numbered list ideas:**

1. Split stores by domain to limit rerenders and simplify persistence.  
2. Rehydrate windows with **focus cleared** to avoid phantom focus.  
3. Migrate legacy stored ids (`apps` → `explorer`) on load.  
4. Record VFS quota errors in sessionStorage for UX continuity.

---

## Section 5 — VFS (`#vfs`)

**Icon:** `FolderTree` or `FileText`

**Bullets:**

- Virtual **System / Apps** locations plus real VFS; **Enter / Delete / F2** in Explorer.  
- **`.app` / `.oslink`** shortcut files; **`WEBOS_VFS_DRAG_MIME`** in-app drag protocol.  
- **Trash** = program-store metadata + VFS `deleteNode` soft delete + desktop tile cleanup (`moveVfsNodeToTrash`).  
- **`openVfsNodeFromShell`** shared open helper (Start recents/pins).  
- Dedicated Paint **byte budget** before JSON hits `localStorage`.

---

## Section 6 — Programs (`#programs`)

**Icon:** `Component` or `Blocks`

**Sub-cards:**

- **Notepad** — TipTap, dynamic import without SSR, VFS-backed multi-doc.  
- **Paint** — tools: pencil, brush, eraser, fill, picker, line, rect; versioned file codec.  
- **Calculator** — single-instance utility.  
- **Trash** — coordinated restore/empty.  
- **Settings** — export/import, reset, storage meter.

---

## Section 7 — Windows & desktop (`#windows`)

**Icon:** `RectangleHorizontal` or `Move`

**Bullets:**

- **`ResizeObserver`** desktop bounds; wallpaper drop reparents VFS nodes via **`placeVfsNodeOntoDesktop`**.  
- Snap preview includes **top** maximize band; **`snapPreview`** rendered on Desktop under windows.  
- **`clampFloatingWindowPosition`** keeps windows grabbable; **`OPEN_WINDOW_OFFSET`** staggers new opens.

---

## Section 8 — Persistence (`#persistence`)

**Icon:** `Save` or `CloudDownload`

**Bullets:**

- Distinct localStorage keys per store; measured total against assumed 5 MiB budget.  
- `webos-backup.json` export contains parsed Zustand payloads for core slices.  
- Import writes keys and reloads after short delay.

---

## Section 9 — Trade-offs (`#tradeoffs`)

**Icon:** `Scale` or `AlertTriangle`

**Bullets:**

- String payloads simplify serialization but **inflate** storage for images.  
- Client-only model = **no multi-user security** — appropriate scope for a desk toy.  
- Constants-heavy configuration trades verbosity for **predictable tuning**.

---

## Section 10 — Future (`#future`)

**Icon:** `Rocket` or `Hammer`

**Bullets:**

- Enable **Browser** program with iframe + navigation UX + sandbox policy.  
- Move large blobs to **IndexedDB/OPFS** behind the same VFS API.  
- Optional **cloud sync** layer without forking the shell UI.

---

## Footer paragraph (plain section)

> WEBOS NEXT demonstrates that a **credible OS-like shell** can be implemented as a disciplined React application: composable stores, explicit constants, and user-owned persistence — suitable as a portfolio centerpiece for complex frontend engineering. For **implementation depth** (desktop grid, window chrome, VFS helpers, tooling, Paint/Notepad), use `docs/09`–`docs/15` alongside `02`–`06` and `08`.

---

_End of suggested section mapping._
