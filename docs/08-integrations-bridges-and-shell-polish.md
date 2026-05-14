# Integrations: bridges, context menus, routing, and shell polish

This document captures **cross-cutting behavior** that does not fit a single store or program file. Use it for portfolio “how it really works” depth and for verifying edge cases against the repo.

---

## 1. Unified “open this node” path (`openVfsNodeFromShell`)

**File:** `src/utils/shell/openVfsNodeFromShell.ts`

**Purpose:** One code path for “double-click / activate this VFS node” — same semantics as Explorer row open and desktop icon open (where applicable).

**Behavior:**

- If the node is a **folder** → `openWindow('explorer', { activeExplorerNodeId: nodeId })` (Explorer navigates into that folder via `activeExplorerRequestAt`; see §3).  
- If the node is a **file** → resolve target with `resolveProgramByNode`, then:
  - **Paint** → `openWindow('paint', { activePaintImageId, title })`  
  - **Notepad** → `openWindow('notepad', { activeNoteId, title })`  
  - Else → `openWindow(programId)` (e.g. Settings, Calculator, Trash, Explorer for unknown types)

**Call sites:** Start menu recents / pinned entries call this helper when the user activates a file or folder (`StartMenu.tsx`).

---

## 2. Explorer navigation bridges (CustomEvents)

Decoupling list rows from store navigation avoids prop-drilling and keeps Explorer’s list implementation simpler.

| Bridge | File | Event name constant | Payload idea |
|--------|------|---------------------|--------------|
| Navigate to location | `explorerNavBridge.ts` | `EXPLORER_NAV_EVENT` | `{ windowId, location: ExplorerLocation }` |
| Inline rename in Explorer | `explorerRenameBridge.ts` | `EXPLORER_INLINE_RENAME_EVENT` | `{ windowId, nodeId }` |
| Desktop icon rename | `desktopRenameBridge.ts` | `DESKTOP_INLINE_RENAME_EVENT` | `{ desktopItemId }` |

**Explorer listeners:** `Explorer.tsx` subscribes on mount, filters by `windowId`, then calls `navigateTo` or enters inline rename state for the matching row.

**Context menu → Explorer:** `ContextMenu.tsx` uses `requestExplorerNavigate` / `requestExplorerInlineRename` so menu actions can drive a **specific** Explorer window (`explorerWindowId` stored in the menu state).

---

## 3. Explorer deep-linking (`activeExplorerNodeId` + `activeExplorerRequestAt`)

**Window fields:** Set by `openWindow` when opening Explorer with a folder target, or when focusing an existing single-instance Explorer with a new target (`lifecycle.ts`).

**Mechanism:**

- `openWindow` sets `activeExplorerNodeId` and stamps **`activeExplorerRequestAt: Date.now()`** (including when an **existing** Explorer window is refocused with a new folder id — single-instance behavior).  
- `Explorer.tsx` runs an effect: if `requestAt` differs from `lastConsumedExplorerRequestRef`, it resolves the node and `navigateTo` either the folder itself or the **parent folder** (for files), then records the consumed timestamp.

**Portfolio angle:** This is a small **command/event** pattern layered on top of Zustand — the same window can be “told” to jump to a new location without closing it.

---

## 4. Explorer virtual locations (not only VFS)

**File:** `src/programs/explorer/Explorer.tsx`  
**Type:** `ExplorerLocation` in `src/components/explorer/types.ts`

| Location `kind` | User-facing meaning | Row source |
|-----------------|---------------------|------------|
| `root` | Top of Explorer | Synthetic rows: **System**, link row **Desktop** → enters VFS at `rootId` |
| `system` | Built-in views | Row: **Apps** → `system-apps` |
| `system-apps` | App launcher grid | One row per registered program that has `explorer` metadata (excludes Explorer itself) |
| `vfs` | Real folder | `listChildren(location.nodeId)` mapped to rows |

**Naming nuance:** The VFS synthetic root folder node is created with **display name `Desktop`** (`createRootNode` in `useVfsStore.ts`), while Explorer’s top level labels the entry into that tree **“Desktop”** with subtitle “Your files and folders”. The separate **“System”** row is a virtual launcher, not a VFS folder.

---

## 5. Explorer keyboard shortcuts

**Handler:** `handleExplorerKeyDown` on the outer Explorer container (`tabIndex={0}`) plus the inner scroll pane for file-pane focus.

| Key | Action (when focus not in inputs / contenteditable) |
|-----|-----------------------------------------------------|
| **Enter** | Open selected row (`openSelected`) |
| **Delete** | Delete selected VFS item via `moveVfsNodeToTrash` |
| **F2** | Start inline rename for selected row |

---

## 6. In-app VFS drag MIME

**Constant:** `WEBOS_VFS_DRAG_MIME` = `application/x-webos-vfs+json` (`src/constants/vfs/ids.ts` exports usage via `explorerDnd.ts`)

**Payload:** JSON `{ nodeId: string }` (`encodeVfsDragPayload` / `decodeVfsDragPayload`).

**Explorer:** Drag-over/drop on the **folder pane background** (only when `location.kind === 'vfs'`) calls `moveNode` + `syncDesktopMirrorAfterVfsReparent` so desktop mirrors stay correct when files are reparented inside Explorer.

**Desktop:** `Desktop.tsx` decodes the same MIME when accepting drops from Explorer onto the wallpaper.

---

## 7. Desktop–VFS mirror (`syncDesktopMirrorAfterVfsReparent`)

**File:** `src/utils/vfs/placeVfsOnDesktop.ts`

**Rules:**

- If a node’s `parentId` is **not** the VFS root → remove any desktop item whose `resource` is `{ type: 'vfs-node', id }`.  
- If the node **is** under the VFS root and not deleted → ensure a desktop tile exists (`addFolderItem` / `addFileItem` with resolved program for files).

**`placeVfsNodeOntoDesktop`:** `moveNode(nodeId, rootId)` then `syncDesktopMirrorAfterVfsReparent(nodeId)` — used when the user drops a file onto the desktop canvas to “pin” it under the desktop root in the VFS **and** surface an icon.

---

## 8. Trash: two coordinated layers

**A. VFS `deleteNode`:** Soft-deletes the node and **all descendants** (`deletedAt` timestamp). Also walks descendant ids and calls **`useDesktopStore.removeByResource('vfs-node', id)`** so desktop shortcuts disappear when something is trashed.

**B. Program store trash slice:** `moveToTrash` records a **`TrashItem`** (`src/stores/programs/trash/state.ts`) with `resource: { type: 'vfs-node', id }`, `payload: { nodeId }`, `programId`, `displayName`, `deletedAt`.

**Unified helper:** `moveVfsNodeToTrash` (`src/utils/vfs/moveVfsNodeToTrash.ts`) — resolves `programId` from `resolveProgramByNode`, appends trash metadata, then calls `deleteNode`.

**Trash app UI:** Reads **`useProgramStore` trash `items`**, not the VFS graph directly. **Restore** calls `restoreFromTrash` (which invokes `restoreNode` when `payload.nodeId` exists) and re-adds a desktop shortcut via `addFolderItem` / `addFileItem`. **Empty** calls `purgeSubtree` per unique `nodeId` then clears trash items.

**Desktop / Explorer delete divergence:** `ContextMenu.tsx` sometimes duplicates `moveToTrash` + `deleteNode` + `removeByResource` inline for desktop icon delete, while Explorer’s toolbar/Delete key uses `moveVfsNodeToTrash`. Outcome is aligned; the portfolio point is **multiple entry points, shared invariants**.

---

## 9. Context menu surface matrix

**Store:** `useContextMenuStore` — `type` is `ContextMenuType` (`src/stores/contextMenu/useContextMenuStore.ts`).

| `type` | When opened | Representative actions (`ContextMenu.tsx`) |
|--------|----------------|---------------------------------------------|
| `desktop` | Right-click wallpaper | New Notepad, New Paint, New Folder (creates VFS folder under root + desktop tile) |
| `desktop-icon` | Right-click a desktop tile | Open (program or vfs-backed file/folder), Rename (bridge), Delete (vfs + trash metadata + remove shortcuts), or “Remove from Desktop” for pure `.app` launchers |
| `explorer-folder` | Right-click empty area in vfs folder view | New folder / New file under `explorerFolderId` (+ mirror to desktop if created at root) |
| `explorer-item` | Right-click a VFS file/folder row (`ExplorerList` — requires `row.node`) | **Open**, **Rename** (inline rename bridge), **Delete** (confirm + `moveVfsNodeToTrash`). Read-only / synthetic rows skip the menu. |
| `app` | Declared in `ContextMenuType` | **`ContextMenu.tsx`** contains an **Open** + **Add to Desktop** branch (with a source TODO). At time of writing there is **no** `openMenu({ type: 'app', ... })` call site in `src/` — Explorer **Apps** rows do not open a context menu (`onContextMenu` bails when `row.node` is missing). Treat as **stub / future hook** unless you wire it up. |

**Z-index:** Menu renders at `z-(--z-overlay-high)` per `globals.css` / `Z_INDEX.overlayHigh` (`src/constants/shell/layers.ts`).

---

## 10. Start menu: pins, recents, limits

**Persisted:** `startMenuPinnedVfsIds: string[]` in `usePersonalizationStore` (`partialize` + `merge` handles migration if the key is missing).

**Limits** (`src/constants/shell/ui.ts`):

- `START_MENU_RECENTS_LIMIT` = **4** (most recently updated files, excluding `.app` / `.oslink` and excluding pins)  
- `START_MENU_PINNED_MAX` = **8** (`toggleStartMenuPinVfs` prepends and slices)

**Pin UI:** Pin control on eligible Start rows (`Pin` icon); toggles membership in `startMenuPinnedVfsIds`.

---

## 11. Window open stagger and clamp

**Stagger:** `OPEN_WINDOW_OFFSET` = **30** px (`src/constants/shell/window.ts`). New windows offset by `(count % OFFSET_LIMIT) * offset` where `OFFSET_LIMIT = 10` (`lifecycle.ts`) so rapid opens stay on-screen-ish.

**Clamp:** `clampFloatingWindowPosition` (`src/utils/shell/clampFloatingWindowPosition.ts`) keeps a **strip** of the title bar grabbable: horizontal slack via `WINDOW_HORIZONTAL_OFFSCREEN_RATIO`, vertical clamp respects `TITLEBAR_HEIGHT` and `TASKBAR_HEIGHT`.

---

## 12. Single-instance programs + Explorer retarget

**Registry:** `singleInstance: true` on Settings, Trash, Calculator (and others per `registry.ts`).

**Behavior (`lifecycle.ts`):** If `openWindow` targets a single-instance program that **already** has a window, the store **focuses and raises** that window instead of creating a duplicate.

**Explorer special case:** If `options.activeExplorerNodeId` is passed when focusing an existing Explorer, the window’s `activeExplorerNodeId` / `activeExplorerRequestAt` fields update so the **Explorer navigates** to the requested folder without spawning a second Explorer window.

---

## 13. Desktop DnD polish (`DesktopIcon.tsx`)

Beyond trash dock emphasis:

- **`pointerOverUiOccluder`** — suppresses trash/folder drop hover highlights when the pointer is over higher UI (windows/taskbar), avoiding false positives.  
- **Folder drop targets** — desktop tiles that represent VFS folders can accept drops; `isDesktopItemDroppableIntoFolder` / `resolveExplorerVfsDropTarget` centralize eligibility.  
- **`.app` / `.oslink` shortcuts** — `serializeDesktopShortcut` / `parseDesktopShortcutProgramId` (`desktopShortcut.ts`); legacy `programId: 'apps'` in JSON maps to `'explorer'`. Trash cannot be launched from a shortcut file (`parseDesktopShortcutProgramId` returns null for `trash`).

---

## 14. `NotImplemented` placeholder

**File:** `src/programs/NotImplemented.tsx`

Generic “This app is not implemented” surface for windows that reference a missing UI — useful if the registry grows faster than program UIs.

---

## 15. Browser stub (implemented UI, not shipped)

**File:** `src/programs/browser/BrowserApp.tsx`

Minimal **iframe** browser: URL state, text field, **Go** button, Enter-to-navigate, auto-`https://` prefix. **Not registered** in `programs` (commented block in `registry.ts`). Portfolio note: iframe needs **sandbox** / CSP hardening before shipping as untrusted web content.

---

## 16. App Router 404 (`not-found.tsx`)

**File:** `src/app/not-found.tsx`

Branded **404** card wrapped in `ShellThemeRoot` with link **“Back to Desktop”** → `href="/"`. Shows the shell aesthetic applies beyond the home route.

---

## 17. `Z_INDEX` mirror discipline

**File:** `src/constants/shell/layers.ts` — exported `Z_INDEX` object (popover, modal, desktop notices, marquee, overlay high, taskbar, start menu).

**Rule (also in `src/constants/index.ts` comment):** Keep **TypeScript constants** and **`globals.css` `--z-*`** tokens aligned when changing stacking — taskbar above desktop, Start above taskbar, context menus in overlay tier.

---

_End of integrations / bridges reference. Desktop store grid: `09`. Window chrome: `10`. Theming: `11`. VFS helpers: `12`. Tooling: `13`._
