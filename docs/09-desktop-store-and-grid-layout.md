# Desktop store — grid, placement, persistence, and merge rules

**Store:** `src/stores/desktop/useDesktopStore.ts`  
**Types:** `src/stores/desktop/types.ts`  
**Initial layout:** `src/stores/desktop/defaultItems.ts` + `layoutItems` in `src/stores/desktop/layout.ts`  
**Constants:** `DESKTOP_GRID`, `DESKTOP_MAX_ROWS`, `DESKTOP_ICON_WIDTH` (`src/constants/shell/desktop.ts`)

---

## Data model (`DesktopItem`)

| Field | Meaning |
|-------|---------|
| `id` | Stable desktop tile id (string; patterns like `explorer-`, `file-vfs-node-…`) |
| `programId` | Which program opens when the tile is activated (`ProgramId`) |
| `kind` | Optional: `'app'` (launcher), `'file'` (VFS file shortcut), `'folder'` (VFS folder shortcut) |
| `title` | Optional label for file/folder tiles |
| `resource` | Optional `{ type: 'vfs-node', id }` for VFS-backed tiles |
| `x`, `y` | Pixel position in **desktop-local** coordinates, snapped to grid on move |

**Merge on rehydrate:** If persisted items omit `kind`, it is inferred as `resource ? 'file' : 'app'`. **`programId === 'apps'`** is migrated to **`'explorer'`** (parallel to window store migration).

---

## Grid and slotting

- **`DESKTOP_GRID`** = **80** px — one cell step; matches **`DESKTOP_ICON_WIDTH`** and Tailwind `w-20` rhythm.  
- **`DESKTOP_MAX_ROWS`** = **10** — vertical cap for auto-placement scan.  
- **`layoutItems`** — initial boot: assigns `x = col * GRID`, `y = row * GRID` by **enumeration order** of `defaultItems` (column-major: `col = floor(index / MAX_ROWS)`, `row = index % MAX_ROWS`).

---

## Store API (surface)

| Method | Behavior |
|--------|----------|
| `setDesktopBounds` | Written by `Desktop.tsx` `ResizeObserver` — drives clamp math |
| `fitDesktopIconsToBounds` | Clamps all icon positions into current bounds (`clampDesktopItemsOnResize`) |
| `moveItem` | Snaps `(x,y)` to grid, clamps to `maxX/maxY`, **rejects** move if target grid cell **occupied** by another item (multi-drag uses same rule per icon) |
| `addItem(programId)` | Adds **app launcher** if no existing non-file tile for that program; scans up to **20 cols × DESKTOP_MAX_ROWS** for first free slot |
| `addFileItem` | Adds **file** tile with `resource`; dedupes same `vfs-node` id; finds slot same as `addItem` |
| `addFolderItem` | Adds **folder** tile (`programId: 'explorer'`), dedupes by resource id |
| `updateFileTitlesByResource` | When a VFS file renames, syncs visible `title` on matching shortcuts |
| `removeByResource` | Removes all tiles pointing at a given `vfs-node` id (type + id) |
| `removeItem` | Deletes a tile by desktop id; **refuses** if `programId === 'trash'` (Trash dock cannot be removed this way) |
| `selectedIds` / `setSelectedIds` | Marquee / selection state (not persisted) |
| `trashDropHover` / `folderDropTargetId` | Transient DnD highlight state for `DesktopIcon` hit-testing |

---

## Default desktop icons

**`defaultItems`:** Settings, Explorer, Notepad, Paint, Trash, Calculator (browser entry commented out). Each starts at `(0,0)` in the record; **`layoutItems`** spreads them on first store creation.

---

## Persistence

- **`persist`** name: `STORAGE_KEY_DESKTOP` (`desktop-storage`).  
- **`partialize`:** only **`items`** — selection, bounds, and DnD hover flags are **session/ephemeral** (bounds recomputed on load via `ResizeObserver`).

---

## Interaction with VFS

- **`syncDesktopMirrorAfterVfsReparent`** (`placeVfsOnDesktop.ts`) adds/removes **vfs-node** tiles when a node’s parent is or is not the VFS root.  
- **`deleteNode`** in VFS walks descendants and calls **`removeByResource('vfs-node', id)`** for each — tiles stay consistent when subtrees are trashed.

---

_End of desktop store reference._
