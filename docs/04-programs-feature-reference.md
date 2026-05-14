# Programs — feature reference for portfolio copy

All built-in programs are registered in **`src/programs/registry.ts`**. Each entry is a `ProgramDefinition` with:

- `id` — must match `ProgramId` in `src/constants/programs/programId.ts`  
- `title`, `icon` (Lucide), `component`  
- `defaultSize` / `minSize` from `PROGRAM_WINDOW_SIZES` (`src/constants/programs/programWindows.ts`)  
- `singleInstance` — optional; Settings, Trash, Calculator use it where noted  
- `onCreateWindow` — optional hook returning initial window state fields (e.g. default document)  
- `explorer` — optional metadata (`category`, `description`, `tags`) for Explorer search/grouping  

---

## Program ID inventory

**File:** `src/constants/programs/programId.ts`

| `ProgramId` | Shipped |
|-------------|---------|
| `explorer` | Yes |
| `notepad` | Yes |
| `paint` | Yes |
| `calculator` | Yes |
| `trash` | Yes |
| `settings` | Yes |
| `browser` | **Commented out** in registry (stub exists: `src/programs/browser/BrowserApp.tsx`) |

---

## Explorer

**Path:** `src/programs/explorer/Explorer.tsx`  
**Icon:** `Computer` (Lucide)  
**Role:** Primary file manager — navigates the VFS, opens files in other programs, supports rename and drag-and-drop.

**Case-study bullets:**

- **Hybrid navigator:** virtual **System / Apps** + real VFS (`Explorer.tsx` — see `03` / `08`).  
- Central place where **file associations** surface as user actions.  
- Integrates with **desktop** via HTML5 DnD (`WEBOS_VFS_DRAG_MIME`) and `placeVfsNodeOntoDesktop`.  
- Uses **navigation + rename bridges** (`explorerNavBridge`, `explorerRenameBridge`).

## Notepad

**Path:** `src/programs/notepad/NotepadApp.tsx` + `RichEditor.tsx`  
**Icon:** `FileText`  
**Loading:** `RichEditor` is loaded with **`dynamic(() => import('./RichEditor'), { ssr: false })`** in `NotepadApp.tsx` to avoid SSR issues with TipTap.  
**Deeper doc:** [`15-notepad-editor-and-vfs-wiring.md`](./15-notepad-editor-and-vfs-wiring.md)  
**Tech:** **TipTap** — `StarterKit` (with `codeBlock` / `underline` disabled in kit in favor of extensions), plus **`Underline`**, **`CodeBlock`**, **`TextAlign`** (headings + paragraphs), **`Placeholder`**. `immediatelyRender: false` on the editor instance. Toolbar icons: bold, italic, underline, strike, H1/H2, align left/center/right, bullet/ordered lists, blockquote, code, undo/redo (`RichEditor.tsx`).

**Document model:**

- Notes are **VFS files**; the note list filters non-deleted files and **excludes** `.paint` (and registry-driven exclusions such as `.app` / `.oslink` where applicable — see `onCreateWindow` / Notepad filters).  
- **Per-window** `activeNoteId` stored on the window record (`useWindowStore`).  
- **Save** flows write through `writeFile` / `renameNode`; integrates with Trash slice `moveToTrash` when deleting.  
- **Desktop integration:** can add a desktop shortcut tile for a note and listens for renames to update shortcut titles (`useDesktopStore`).

**UX details worth mentioning:**

- Menu bar (`File`, `Edit`, `View`, `Help`) with cascade menus.  
- Optional **formatting toolbar** toggle.  
- **Saved** banner with timed dismissal (`NOTEPAD_SAVED_BANNER_MS`).  
- “New file” flow via `FilePlus2` affordance.

---

## Paint

**Deeper catalog:** [`14-paint-app-behavior-catalog.md`](./14-paint-app-behavior-catalog.md)

**Path:** `src/programs/paint/PaintApp.tsx` (large surface area)  
**Icon:** `Palette`  
**MIME / disk format:** `MIME_PAINT` — JSON document **`PaintFileV1`** (`src/utils/paint/paintFileCodec.ts`):

```json
{ "v": <version>, "dataUrl": "data:image/png;base64,..." }
```

**Tools (`Tool` union in PaintApp):**

- `pencil` — fine pixel strokes  
- `brush` — sized brush (`BRUSH_SIZES` / scaled width)  
- `eraser`  
- `fill` — flood fill with tolerance against target color  
- `picker` — color sampling from canvas  
- `line`, `rect` — vector-style drag gestures rendered to raster  

**Color model:** Primary / secondary colors; eraser uses secondary channel behavior; right-click is intentionally constrained (see in-file comment).

**Persistence:**

- `encodePaintDocument` / `decodePaintDocument` round-trip between editor state and VFS string.  
- **`rasterDataUrlForPaintPersist`** — see **`14-paint-app-behavior-catalog.md`** and `06-persistence-backup-quotas.md` for byte caps and UX errors.

**Window bootstrap:**

- `onCreateWindow` in registry: if caller did not pass `activePaintImageId`, creates a new file via `createFile({ name: DEFAULT_NEW_PAINT_FILE, mime: MIME_PAINT, content: '' })` and returns `{ activePaintImageId: id }`.

---

## Calculator

**Path:** `src/programs/calculator/CalculatorApp.tsx`  
**Icon:** `Calculator`  
**Flags:** `singleInstance: true`  

**Expression engine:**

- Builds a **token list** (`num` / `op`) from button input; display string uses Unicode symbols (`−`, `×`, `÷`).  
- **Validation:** `isValidExprTokens` enforces alternating number/operator; `stripTrailingOps` trims dangling operators before evaluation.  
- **Evaluation:** `toRpn` converts to **RPN** with **shunting-yard** precedence (`PREC`: `*`/`/` > `+`/`-`); `shouldPopStack` compares precedence; division by zero yields **NaN** surfaced as **“Error”** in `formatDisplay`.  
- **Formatting:** `formatDisplay` trims trailing zeros, handles `-0`, switches to exponential for huge/tiny magnitudes.

**Memory (non-persisted):** `useState(0)` — **MC** clear, **MR** recall into tokens, **M+** / **M−** add/subtract evaluated operand from display, **MS** store operand. Indicator when `memory !== 0`.

**Window chrome:** Reads `windowId` for title / persistence of calculator-specific window state if added later (currently minimal `useWindowStore` coupling for dimensions).

---

## Trash

**Path:** `src/programs/trash/TrashApp.tsx`  
**Icon:** `Trash2` (switches to `Trash` Lucide icon when non-empty)  
**Flags:** `singleInstance: true`  

**Role:** UI over **`useProgramStore.trash.items`** (not raw VFS iteration). **Empty trash** purges subtrees via VFS `purgeSubtree`. **Restore** calls `restoreFromTrash` (VFS `restoreNode`) and recreates desktop shortcuts for the restored resource.

**State:** `src/stores/programs/trash/state.ts`, actions `src/stores/programs/trash/actions.ts`.

## Settings

**Path:** `src/programs/settings/SettingsApp.tsx`  
**Icon:** `Settings`  
**Flags:** `singleInstance: true`  

**Features:**

- **Quota banner** — when `sessionStorage` has `STORAGE_QUOTA_HIT_SESSION_KEY`, shows destructive callout + dismiss (copy explains last save failed).  
- **Storage card** — “Estimated local data” total with warn/critical color classes vs assumed budget; **per-key** monospace list from `measurePersistedBytesAsync`; optional **`navigator.storage.estimate()`** usage/quota line; **Refresh** clears dismiss flag and re-measures.  
- **Export** — `handleExport`: builds JSON object of parsed `localStorage` values for `PERSIST_STORAGE_KEYS`, downloads `webos-backup.json`.  
- **Import** — hidden file input `accept: SETTINGS_IMPORT_ACCEPT`; parses JSON, `JSON.stringify` per key back into `localStorage`, reload after delay.  
- **Reset** — removes all `RESET_STORAGE_KEYS`, reload after delay.  
- **Status line** — ephemeral `status` string (`Exported`, `Invalid file`, etc.).

**Explorer metadata:** Describes backup/restore/reset value prop (`tags`: `preferences`, `storage`, `export`, `import`).

---

## Browser (stub)

**Path:** `src/programs/browser/BrowserApp.tsx`  
**Status:** Not registered in `programs` (comment block in registry).  

**Implementation:** Controlled URL string, **`<iframe src={url}>`** without `sandbox` — fine for a local demo, **not** safe for arbitrary untrusted URLs in production.

**Portfolio use:** Ship behind **`sandbox` allowlist**, address bar validation, and maybe `referrerPolicy` / CSP before enabling in registry.

---

## NotImplemented placeholder

**Path:** `src/programs/NotImplemented.tsx`  

Alert-style empty state when a window points at a program that has no real UI yet.

---

## Start menu–specific personalization

**File:** `src/components/taskbar/StartMenu.tsx` (UI) + `usePersonalizationStore` (persisted pins)

- **Pinned VFS entries:** `startMenuPinnedVfsIds` (max **`START_MENU_PINNED_MAX`** = 8 from `src/constants/shell/ui.ts`).  
- **Recent files:** most recently updated VFS files, excluding pins and shortcut extensions `.app` / `.oslink`, capped at **`START_MENU_RECENTS_LIMIT`** = 4.  
- Opens files/folders via **`openVfsNodeFromShell`** (`src/utils/shell/openVfsNodeFromShell.ts`).

**Taskbar skin tokens:** `src/components/taskbar/taskbarSkin.ts` — class bundles for Start panel chrome (localized design tokens).

---

## Explorer categories (for search UX)

**Type:** `ExplorerCategory` in `registry.ts`

- `system` — Settings, Trash  
- `productivity` — Notepad  
- `internet` — reserved (Browser)  
- `utilities` — Calculator, Paint  

---

_End of programs reference. Shell bridges, context menus, and deep-linking: `08-integrations-bridges-and-shell-polish.md`._
