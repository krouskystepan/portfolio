# Window manager, taskbar, and desktop

This document complements **`01-case-study-master.md`** with WM-specific bullets you can turn into diagrams or cards on your portfolio.

---

## Window model (conceptual)

**Store:** `useWindowStore` (`src/stores/window/useWindowStore.ts`)

Each **window** record (`WindowState` in `src/stores/window/state.ts`) includes:

- Stable **`id`** and **`programId`** (`ProgramId`).  
- **Geometry:** `x`, `y`, **`w`**, **`h`** (persisted dimensions).  
- **Chrome flags:** `isFocused`, `isMinimized`, `isMaximized`.  
- **Snapshots:** optional `prevState` / `preSnapState` for undoing maximize or snap.  
- **Program payload fields:** `activeNoteId`, `activePaintImageId`, `activeExplorerNodeId`, **`activeExplorerRequestAt`** (Explorer retarget), optional **title** override.

**Z-order:** Maintained as an ordered list of window ids; helpers in `src/utils/window/zOrder.ts` mutate ordering on focus changes.

---

## Creating and opening windows

**Factory:** `src/utils/window/createWindow.ts`

- Seeds **`x` / `y` / `w` / `h`** from `PROGRAM_WINDOW_SIZES` for the program (with global fallbacks from `src/constants/shell/window.ts`).  

**Lifecycle actions:** `src/stores/window/actions/lifecycle.ts`

- **`openWindow(programId, options?)`** merges optional caller options, applies **`OPEN_WINDOW_OFFSET`** stagger (capped modulo), and for single-instance programs may **focus** an existing window and update Explorer navigation fields instead of spawning duplicates.  
- Close path disposes window record, rewires focus to the top remaining z-order entry, and updates taskbar visibility.

**Floating clamp:** `src/utils/shell/clampFloatingWindowPosition.ts` — keeps part of the title bar on-screen; respects `TASKBAR_HEIGHT`, `TITLEBAR_HEIGHT`, and `WINDOW_HORIZONTAL_OFFSCREEN_RATIO`.

---

## Snapping

**Actions:** `src/stores/window/actions/snap.ts`  
**Math:** `src/utils/desktop/snap.ts`

**User-visible behavior:**

- Dragging a window near **left/right (and top)** edges shows a **`snapPreview`** overlay (`null | 'left' | 'right' | 'top'`) rendered on the **Desktop** layer above wallpaper but under windows (`Desktop.tsx` uses `z-(--z-overlay-high)`).  
- On release, window occupies the snapped region (`snapWindow`).  
- **Unsnap** restores floating geometry (`unsnapWindowToFloating`).

**Portfolio angle:** Snap preview is a polish feature that signals “real WM” rather than draggable dialogs only.

---

## Taskbar

**Component:** `src/components/taskbar/Taskbar.tsx`

**Contents (typical):**

- **Start** button → opens `StartMenu` (toggle); **`useTaskbarOverlayDismissStore`** closes Start + jump list when the shell requests dismiss (e.g. desktop pointer down outside overlays).  
- **Program groups** — `TaskbarProgramGroup.tsx`: one button per `programId` in `taskbarProgramRowKey(windows)` order. **Single window:** click runs **`toggleWindow`** (minimize when focused/active, else activate). **Multiple windows:** click opens **jump list** (`role="menu"`, `z-(--z-start-menu)`) listing each window title to focus; badge shows count.  
- **Clock** (`TaskbarClock.tsx`).

**Dismissal:** `useTaskbarOverlayDismissStore` ensures overlays close when clicking outside.

---

## Start menu vs Settings app

| Surface | Purpose |
|---------|---------|
| **Start menu** (`StartMenu.tsx`) | **Personalization** (wallpaper presets + custom image upload, theme chips, accent swatches), **pinned VFS** entries + **recent files** (limits in `src/constants/shell/ui.ts`), Explorer launcher; opens VFS nodes via `openVfsNodeFromShell`. |
| **Settings app** (`SettingsApp.tsx`) | **Data management**: storage size, export/import backup JSON, full reset, quota hit messaging. |

**Narrative for portfolio:** The product separates **“how it looks”** (Start) from **“what is stored and how to move it”** (Settings) — similar to consumer OS patterns.

---

## Desktop

**Component:** `src/components/desktop/Desktop.tsx`, `DesktopIcon.tsx`

**Features:**

- **Grid-aligned** icons with persisted positions (`useDesktopStore`).  
- **Drag** to reposition; **clamp** positions when the viewport changes (`src/utils/desktop/bounds.ts`, `layout.ts`).  
- **Marquee** rubber-band multi-select.  
- **Off-screen notice** — if stored icon positions lie outside current desktop bounds, show a dismissible banner (z-index token in `globals.css`).  
- **Trash drop target** — dragging eligible file shortcuts over Trash icon shows emphasis; drop removes shortcut and updates trash metadata.

**Desktop bounds:** `Desktop.tsx` installs a **`ResizeObserver`** on the desktop container to push `setDesktopBounds` — drives off-screen icon counting and clamp math.

**Input:** Pointer-down on empty wallpaper clears window focus (`clearFocus`), closes any open context menu, dismisses taskbar popups (`useTaskbarOverlayDismissStore`), and starts **marquee** selection; drops from Explorer use **`placeVfsNodeOntoDesktop`** when not over `[data-window-client]`.

**DnD between icons:** `DesktopIcon.tsx` implements trash-dock hover, **folder-target** hover for reparenting shortcuts, and **`pointerOverUiOccluder`** so highlights do not fire through overlapping UI.

**Context menus:** Right-click wallpaper → `type: 'desktop'`; right-click icon → `type: 'desktop-icon'` (`ContextMenu.tsx` — full matrix in `08` §9).

**Desktop ↔ VFS bridges:**

- `src/utils/vfs/placeVfsOnDesktop.ts` — `placeVfsNodeOntoDesktop`, `syncDesktopMirrorAfterVfsReparent`.  
- `src/utils/desktop/desktopRenameBridge.ts` — keep UI in sync when renaming underlying resources.

---

## Context menus

**Component:** `src/components/contextMenu/ContextMenu.tsx`  
**Store:** `useContextMenuStore`

Typed menu surfaces (`desktop`, `desktop-icon`, `explorer-folder`, `explorer-item`, `app`). Full behavior table: **`08-integrations-bridges-and-shell-polish.md` §9**.

---

## Window chrome component

**Component:** `src/components/window/Window.tsx` + `ResizeHandle.tsx` — detailed interaction (resize compass math, snap-from-drag): **`10-window-chrome-resize-and-interaction.md`**.

Responsible for title bar, window controls (min/max/close), resize handles, and embedding program content as children.

---

_End of window manager / desktop reference. Bridges + trash: `08`. Desktop store + grid: `09`. Window chrome detail: `10`._
