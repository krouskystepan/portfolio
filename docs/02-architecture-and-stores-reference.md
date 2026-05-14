# Architecture and stores — reference

Canonical paths use the repository root **`webos-next-engine`**.

---

## Route-level composition

**File:** `src/app/page.tsx`

| Step | Component / behavior |
|------|----------------------|
| Theme root | `ShellThemeRoot` wraps the shell; applies personalization-driven classes and CSS variables. |
| Hydration gate | Reads `hasHydrated` from `useWindowStore`; until true, shows `APP_SHELL_LOADING_MESSAGE`. |
| Main layout | Flex column: scroll-contained **Desktop** (`flex-1 min-h-0`) + fixed **Taskbar**. |

**File:** `src/app/layout.tsx`

- Document/body constraints: **`h-dvh overflow-hidden`** for full-viewport OS feel.
- Next font / metadata wired per Next.js defaults; app meta strings in `src/constants/app/meta.ts`.

---

## Layering and z-index

**Primary constants:** `src/constants/shell/layers.ts` (and related `src/constants/shell/ui.ts`, `src/constants/appearance/*`).

**Window stacking:** `useWindowStore` maintains `zOrder` (array of window ids). Rendering maps windows according to z-order so focused or recently touched windows paint above others.

**Numeric `Z_INDEX`:** `src/constants/shell/layers.ts` exports `popover`, `modal`, `modalRaised`, `desktopOffscreenNotice`, `desktopMarquee`, `overlayHigh`, `taskbar`, `startMenu` — mirrored as `--z-*` in `globals.css` for classes like `z-(--z-taskbar)`.

**Synchronization rule for contributors:** When adding new overlay layers, update **both** Tailwind/CSS (`globals.css` where `--z-*` tokens exist) **and** the constants so taskbar, context menus, snap preview, and desktop notices stay ordered predictably.

---

## Zustand stores (responsibilities)

| Store | Module | Responsibility |
|-------|--------|------------------|
| **Windows** | `src/stores/window/useWindowStore.ts` | Window entities, open/close, move/resize, minimize/maximize, focus, z-order, snap preview and snap actions, taskbar-visible ordering, hydration flag. |
| **VFS** | `src/stores/vfs/useVfsStore.ts` | Tree of `VfsNode`, CRUD, rename/move/copy, soft delete (`deletedAt`), restore, purge subtree, list children, read/write file, resolve which program opens a node. |
| **Desktop** | `src/stores/desktop/useDesktopStore.ts` | Desktop icon items, selection, measured desktop bounds, grid placement, layout helpers. |
| **Personalization** | `src/stores/personalization/usePersonalizationStore.ts` | Theme id, accent, wallpaper preset id, optional custom wallpaper data URL, **`startMenuPinnedVfsIds`** (persisted; max length `START_MENU_PINNED_MAX`). |
| **Programs (trash slice)** | `src/stores/programs/useProgramStore.ts` | Trash metadata and actions that coordinate with VFS for restore/empty flows. |
| **Context menu** | `src/stores/contextMenu/useContextMenuStore.ts` | Open/close/position for global context menus. |
| **Taskbar overlays** | `src/stores/taskbar/useTaskbarOverlayDismissStore.ts` | Coordinated dismissal when clicking outside Start / taskbar overlays. |

---

## Window manager — key implementation files

| Concern | Location |
|---------|----------|
| Create window geometry | `src/utils/window/createWindow.ts` |
| Map/focus helpers | `src/utils/window/mapWindows.ts`, `src/utils/window/focusHelpers.ts`, `src/utils/window/zOrder.ts` |
| Snap math / preview | `src/stores/window/actions/snap.ts`, `src/utils/desktop/snap.ts` |
| Lifecycle (open/close) | `src/stores/window/actions/lifecycle.ts` |
| Layout (move, resize) | `src/stores/window/actions/layout.ts` |
| Visibility (min/max) | `src/stores/window/actions/visibility.ts` |
| Types | `src/stores/window/types.ts`, `src/stores/window/state.ts` |

**Open window API shape:** Callers pass `ProgramId` and optional bag (`activeNoteId`, `activePaintImageId`, `activeExplorerNodeId`, `title`) depending on who opens the window (Explorer, desktop shortcut, or Start menu). Explorer deep-linking also stamps **`activeExplorerRequestAt`** so an existing Explorer window can react to a new target folder (`lifecycle.ts` + `Explorer.tsx` effect).

**Persisted window fields:** `useWindowStore` `partialize` persists `windows`, `taskbarOrder`, and `zOrder` only (`useWindowStore.ts`) — ephemeral UI like `snapPreview` is not written to disk.

**Per-window geometry keys:** `WindowState` uses **`w` / `h`** (not `width` / `height`); optional `prevState` / `preSnapState` snapshots for maximize and snap-undo (`state.ts`).

---

## Desktop — key implementation files

| Concern | Location |
|---------|----------|
| Desktop surface / icons | `src/components/desktop/Desktop.tsx`, `DesktopIcon.tsx` |
| Bounds clamping | `src/utils/desktop/bounds.ts` |
| Grid / slots | `src/utils/desktop/slots.ts` |
| Snap targets for icons | `src/utils/desktop/dropTargets.ts` |
| Rename bridge | `src/utils/desktop/desktopRenameBridge.ts` |
| Pointer hit-testing for UI occluders | `src/utils/desktop/pointerOverUiOccluder.ts` |

---

## Shell / taskbar — key implementation files

| Concern | Location |
|---------|----------|
| Taskbar chrome | `src/components/taskbar/Taskbar.tsx` |
| Start menu (wallpaper/theme/accent + Explorer launcher) | `src/components/taskbar/StartMenu.tsx` |
| Clock | `src/components/taskbar/TaskbarClock.tsx` |
| Program grouping | `src/components/taskbar/TaskbarProgramGroup.tsx` |
| Fingerprints for stable grouping | `src/components/taskbar/taskbarProgramFingerprint.ts` |
| Theme injection | `src/components/shell/ShellThemeRoot.tsx` |

---

## Explorer — key implementation files

| Concern | Location |
|---------|----------|
| Explorer app shell | `src/programs/explorer/Explorer.tsx` |
| Toolbar + breadcrumbs | `ExplorerToolbar.tsx`, `ExplorerBreadcrumbs.tsx` |
| List / rows / vfs DnD grip | `src/components/explorer/ExplorerList.tsx` |
| Types | `src/components/explorer/types.ts` |
| Navigation bridge | `src/utils/explorer/explorerNavBridge.ts` |
| Rename bridge | `src/utils/explorer/explorerRenameBridge.ts` |
| DnD hit testing | `src/utils/explorer/explorerDropHitTest.ts` |
| VFS DnD encoding | `src/utils/vfs/explorerDnd.ts` (`WEBOS_VFS_DRAG_MIME`) |

---

## Explorer location model (`ExplorerLocation`)

**Type:** `src/components/explorer/types.ts`

| `kind` | Meaning |
|--------|---------|
| `root` | Virtual top level: **System** + **Desktop** link into VFS `rootId` |
| `system` | Virtual **Apps** launcher parent |
| `system-apps` | Rows built from `programs` registry (`explorer` metadata required) |
| `vfs` | Real folder: `nodeId` is a `VfsFolderNode` id |

---

## App Router files

| File | Role |
|------|------|
| `src/app/page.tsx` | Client shell home |
| `src/app/layout.tsx` | Root `<html lang>`, metadata from `APP_*` constants, `h-dvh overflow-hidden` body |
| `src/app/not-found.tsx` | Branded 404 inside `ShellThemeRoot`, link to `/` |

---

## Program icon abstraction

**Component:** `src/components/programIcon/ProgramIcon.tsx` — renders per-`ProgramId` / per-`kind` (`app` \| `file` \| `folder`) tile styling using `src/constants/appearance/iconAppearance.ts` tokens (Explorer list + desktop icons share this).

---

## Constants index

**Entry:** `src/constants/index.ts` — barrel exports and notes for extending programs, MIME sync, etc.

**Domains:**

- `src/constants/app/` — labels, meta (`APP_HTML_TITLE`, `APP_DESCRIPTION`, `APP_HTML_LANG`).  
- `src/constants/shell/` — timing, layers, window chrome-related UI.  
- `src/constants/programs/` — `ProgramId`, **`PROGRAM_WINDOW_SIZES`** (default + min per program), `resolveProgramByExtension`, registry types.  
- `src/constants/vfs/` — root ids, MIME table, path helpers.  
- `src/constants/personalization/` — wallpaper presets, theme defaults, accent presets.  
- `src/constants/storage/` — persist key names, backup filename, warn/critical ratios, assumed storage budget for UI metering.  
- `src/constants/paint/` — canvas defaults, palette, persist chunking constants.  
- `src/constants/appearance/` — desktop/Explorer tile classes, trash dock emphasis tokens.

---

## Hydration and migration behaviors (portfolio-worthy details)

1. **Focus reset on reload:** All windows `isFocused: false` after rehydrate so focus is always explicit post-refresh.  
2. **Program id migration:** Legacy `'apps'` → `'explorer'` during window rehydration.  
3. **Quota errors on VFS persist:** Custom storage wrapper records quota hits for Settings UI (`src/stores/vfs/vfsPersistStorage.ts`).

---

_End of architecture reference. Desktop grid + store: `09-desktop-store-and-grid-layout.md`. Window chrome: `10-window-chrome-resize-and-interaction.md`. Theming: `11-design-tokens-theming-and-appearance.md`. VFS helpers: `12-vfs-helpers-invariants-and-mime-rules.md`. Tooling: `13-developer-tooling-conventions-and-repo.md`. Bridges: `08-integrations-bridges-and-shell-polish.md`. Paint/Notepad catalogs: `14`, `15`._
