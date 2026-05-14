# Window chrome — drag, resize, maximize, snap

**Shell component:** `src/components/window/Window.tsx`  
**Resize handles:** `src/components/window/ResizeHandle.tsx`  
**Chrome class bundles:** `src/utils/personalization/shellTheme.ts` → `getWindowChrome()`  
**Clamp helper:** `src/utils/shell/clampFloatingWindowPosition.ts`

---

## Geometry and limits

- Window state uses **`x`, `y`, `w`, `h`** (`WindowState` in `src/stores/window/state.ts`).  
- **Minimum** dimensions while resizing: `WINDOW_MIN_WIDTH`, `WINDOW_MIN_HEIGHT` from `@/constants` (re-exported shell constants).  
- **Taskbar / titlebar** constants (`TASKBAR_HEIGHT`, `TITLEBAR_HEIGHT`) feed into snap height and floating clamp.

**Per-program caps:** Defaults and minimums come from `PROGRAM_WINDOW_SIZES` (`src/constants/programs/programWindows.ts`) — registry spreads these into each `ProgramDefinition`.

---

## Title bar and controls

- **Drag:** Pointer on title bar moves the window via `moveWindow`; uses `clampFloatingWindowPosition` against `window.innerWidth/innerHeight`.  
- **Minimize / maximize / close:** Lucide icons (`Minus`, `Square`, `X`); maximize toggles `toggleMaximize`.  
- **Double-click maximize:** Title bar double-click toggles; ref `didUnSnap` / `skipNextTitlebarDblClickRef` coordination avoids conflicting with “grab to restore” from maximized state (see in-file comments in `Window.tsx`).  
- **Focus:** Clicking client raises `focusWindow`; `data-window-client` marks the client region for desktop DnD (drops ignored when over a window).

---

## Resize math (`calculateResize`)

**In-file helper** in `Window.tsx` — parameter `dir` is a string containing compass letters **`n` `e` `s` `w`**:

- **East** — grow width from east edge.  
- **South** — grow height from south edge.  
- **West** — shrink/grow width while **pinning the east edge** (adjust `x` when width changes).  
- **North** — shrink/grow height while **pinning the south edge** (adjust `y`).

All dimensions respect per-window **minimum** from `programs[programId].minSize` merged at resize start.

---

## Snapping from drag

- While dragging, `setSnapPreview` highlights **left**, **right**, or **top** regions (preview drawn in `Desktop.tsx`).  
- On pointer-up, `snapWindow` commits geometry; `unsnapWindowToFloating` restores from `preSnapState`.  
- Dragging a **maximized** window starts by restoring float geometry (`didUnSnap` flow) before tracking movement.

---

## ResizeHandle

**File:** `ResizeHandle.tsx` — eight-way (or edge) handles attach to the window frame; pointer capture drives `resizeWindow` with the same `calculateResize` rules.

---

## Taskbar integration

- **`activateWindowFromTaskbar`** — restores minimized, focuses, raises (never minimizes from taskbar click).  
- **`toggleWindow`** — used for taskbar button click semantics (minimize if focused, else activate) — verify call sites in `TaskbarProgramGroup` / related.

---

## Z-order rendering

`Desktop.tsx` maps `zOrder` to render `<Window zIndex={index + 1} />` so stacking order matches store order (bottom → top).

---

_End of window chrome reference._
