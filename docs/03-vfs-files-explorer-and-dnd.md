# Virtual filesystem, files, Explorer, and drag-and-drop

---

## Data model

**Types:** `src/stores/vfs/types.ts`

### `VfsNodeBase`

Shared fields for every node:

- `id: string`  
- `parentId: string | null` (null only for conceptual root handling in store APIs; tree uses synthetic root id from constants)  
- `name`, `path` — human name and display path string maintained by store actions  
- `createdAt`, `updatedAt` — epoch ms  
- `deletedAt: number | null` — **soft delete** marker for Trash flow  

### `VfsFileNode`

- `kind: 'file'`  
- `ext: string` — normalized extension **without** dot, lowercased in practice for comparisons  
- `mime: string` — logical MIME for handlers (`src/constants/vfs/mime.ts`)  
- `size: number` — maintained relative to `content`  
- `content: string` — **entire file payload as string** (plain text, JSON for structured formats, etc.)  

### `VfsFolderNode`

- `kind: 'folder'`  

**Union:** `VfsNode = VfsFileNode | VfsFolderNode`

---

## Store API (conceptual)

**Module:** `src/stores/vfs/useVfsStore.ts` (tree + actions) with **`createVfsHelpers`** from `src/stores/vfs/actions.ts` (path recompute, MIME inference, clone helpers).

| Method | Behavior |
|--------|----------|
| `createFile` | Creates file under optional `parentId` (defaults to root), assigns MIME/ext from name, initializes timestamps. |
| `createFolder` | Creates folder node. |
| `renameNode` | Updates `name`, recomputes `path`, bumps `updatedAt`. |
| `moveNode` | Reparents node, updates paths for subtree as needed. |
| `copyNode` | Duplicates subtree or node depending on rules; returns new id or null on failure. |
| `deleteNode` | Soft-deletes the node and **entire subtree** (`deletedAt`); removes desktop items pointing at any affected `vfs-node` id (`useVfsStore.ts`). |
| `restoreNode` | Clears `deletedAt`. |
| `purgeSubtree` | **Permanent** removal — frees persisted content for large documents. |
| `listChildren` | Lists children of folder; optional inclusion of deleted nodes for Trash UI. |
| `readFile` / `writeFile` | Read/write string content; updates `size`, `updatedAt`, MIME optional on write. |
| `resolveProgramByNode` | Determines which built-in program should open a given node (files, `.app` shortcuts, special cases). |

---

## MIME types and handlers

**File:** `src/constants/vfs/mime.ts`

| Constant | Typical use |
|----------|-------------|
| `MIME_TEXT_PLAIN` | Plain `.txt` and generic text. |
| `MIME_PAINT` | `application/x-webos-paint+json` — structured Paint document. |
| `MIME_DESKTOP_SHORTCUT` | Desktop tile referencing another VFS node. |
| `MIME_JSON` | JSON artifacts / backup-adjacent content. |
| `MIME_OCTET_STREAM` | Fallback binary-ish treatment where needed. |

**Portfolio angle:** Using a dedicated MIME for Paint documents lets the shell **treat drawings as first-class files** in Explorer (icons, rename, copy) while keeping a JSON codec versioned in `src/utils/paint/`.

---

## Extension routing

**File:** `src/constants/programs/fileAssociations.ts`

```text
.paint → paint program
.txt  → notepad program
*     → explorer (browse / unknown)
```

**Note:** `resolveProgramByNode` is richer than extension routing alone:

- **`.app` / `.oslink`** files contain JSON `serializeDesktopShortcut(programId)`; **`parseDesktopShortcutProgramId`** returns the target program (maps legacy `'apps'` → `'explorer'`; refuses `'trash'`).  
- Otherwise **`resolveProgramByExtension(node.ext)`** applies.

**Files:** `src/constants/programs/fileAssociations.ts`, `src/utils/vfs/desktopShortcut.ts`, `resolveProgramByNode` in `useVfsStore.ts`.

## Explorer UX (hybrid tree)

**Primary program:** `src/programs/explorer/Explorer.tsx`

**Virtual vs real:**

- **Root** location shows **System** (readonly) and **Desktop** — a link into the VFS tree at `rootId` (the synthetic root folder is **named** “Desktop” in data).  
- **System → Apps** lists every registered program that has `explorer` metadata (excluding Explorer itself).  
- **VFS** locations list real `listChildren` results with folders first, then files, case-insensitive name sort.

**Toolbar (`ExplorerToolbar.tsx`):** Back, Up, **in-folder search** filter, New folder, New file (prompted names), Rename, Delete.

**Navigation:** In-memory **history stack** + `historyIndex` for Back; Up walks to parent `ExplorerLocation`.

**Breadcrumbs:** `ExplorerBreadcrumbs.tsx` — includes virtual segments and full chain for `vfs` locations.

**Keyboard (Explorer container):** **Enter** open, **Delete** → `moveVfsNodeToTrash`, **F2** inline rename (ignored when focus is in inputs / `contenteditable`).

**Deep link:** Window fields `activeExplorerNodeId` + `activeExplorerRequestAt` force navigation when another surface opens or retargets Explorer (`08` §3).

**List / DnD:** `ExplorerList.tsx` — row grip starts drag with `WEBOS_VFS_DRAG_MIME`; rows can be drop targets for reparenting; fixed-position drag ghost in `Explorer.tsx` (`explorerDragPreviewRef`).

---

## Drag-and-drop (VFS MIME + desktop)

**Custom MIME:** `WEBOS_VFS_DRAG_MIME` = `application/x-webos-vfs+json` — payload `{ nodeId }` (`src/constants/vfs/ids.ts`, helpers in `src/utils/vfs/explorerDnd.ts`).

**Explorer internal moves:** Dragging from the row **grip** sets the custom MIME; dropping on another folder row or the folder pane background calls `moveNode` + **`syncDesktopMirrorAfterVfsReparent`** (`src/utils/vfs/placeVfsOnDesktop.ts`) so desktop mirrors stay aligned when `parentId` changes.

**Desktop wallpaper drop:** `Desktop.tsx` decodes the same MIME and calls **`placeVfsNodeOntoDesktop`**, which **reparents the node under `rootId`** then mirrors — this is how files “land on the desktop” in both VFS and tiles.

**Explorer ↔ desktop row hit-testing:** `src/utils/explorer/explorerDropHitTest.ts`.

**Trash dock on desktop:** Eligible **file** shortcuts show trash emphasis; behavior lives in `DesktopIcon.tsx` (see `05` and `08` §13).

---

## Trash and restore (VFS + program store)

**Move to trash (canonical):** `moveVfsNodeToTrash` (`src/utils/vfs/moveVfsNodeToTrash.ts`) — builds a `TrashItem` for `useProgramStore.trash.moveToTrash` (with `payload.nodeId`), then calls **`deleteNode`** on the VFS.

**Trash app (`TrashApp.tsx`):** Lists **`useProgramStore` trash `items`**, sorted by `deletedAt`. **Restore** calls `restoreFromTrash` then re-adds a desktop tile for the restored node (folder vs file). **Empty** calls `emptyTrash` → **`purgeSubtree`** per unique node id, then clears trash entries.

**Explorer / menu delete:** Toolbar Delete, **Delete** key, and Explorer item context menu use **`moveVfsNodeToTrash`** (with confirm in context menu path). Some desktop context-menu branches inline the same three steps (`moveToTrash` + `deleteNode` + `removeByResource`).

**Permanent delete:** `purgeSubtree` removes graph nodes and desktop references (see `useVfsStore` implementation).

---

## Path and id constants

**File:** `src/constants/vfs/ids.ts`

| Export | Role |
|--------|------|
| `VFS_ROOT_ID` | Persisted synthetic root folder id (`vfs-root`) |
| `VFS_ROOT_LINK_ID` | Synthetic Explorer row id for the “Desktop” link at Explorer root (`vfs-root-link`) |
| `WEBOS_VFS_DRAG_MIME` | DataTransfer type for in-app VFS drags |

**Folder:** `src/constants/vfs/` — MIME table, re-exports; keep drag MIME, backup formats, and Explorer UI in sync when adding file types.

---

## Shell entry for opening nodes

**`openVfsNodeFromShell`** (`src/utils/shell/openVfsNodeFromShell.ts`) — shared open semantics for Start menu recents/pins and any other caller that has a `nodeId`.

---

_End of VFS / Explorer deep dive. Bridges: `08`. VFS helper rules: `12`. Paint file UX: `14`._
