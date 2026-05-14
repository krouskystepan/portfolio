# Design tokens, theming, and appearance

---

## Global CSS and Tailwind v4

**File:** `src/app/globals.css`

- **`@import 'tailwindcss'`** and **`@theme inline`** map semantic Tailwind colors to CSS variables (`--background`, `--foreground`, `--primary`, …).  
- **`@custom-variant dark (&:is(.dark *));`** — class-based dark mode (shadcn-style): any ancestor with `.dark` switches subtree tokens.  
- **Shell z-index variables** (`--z-popover`, `--z-taskbar`, `--z-start-menu`, …) **must stay aligned** with `Z_INDEX` in `src/constants/shell/layers.ts` (documented in repo `constants/index.ts` header comment).  
- **Radius scale** (`--radius-sm` … `--radius-4xl`) derived from `--radius`.  
- **Light and dark** palettes use **oklch** color stops for backgrounds, borders, charts, sidebar, destructive, etc.

---

## Shell theme root (accent injection)

**File:** `src/components/shell/ShellThemeRoot.tsx`

- Reads `themeId` from `usePersonalizationStore` — applies **`dark` class** on the wrapper when `themeId === 'dark'`.  
- Injects inline **`style`** overrides: `--primary`, `--primary-foreground`, `--ring`, `--sidebar-primary`, `--sidebar-primary-foreground` from `accentColor`.  
- **`pickOnAccentForeground`** (`src/utils/personalization/accent.ts`) chooses readable text on top of the chosen accent.

---

## Window chrome classes

**`getWindowChrome()`** returns Tailwind class strings for:

- `frame`, `titlebar`, `titleText`, `controlHover`, `controlCloseHover`, `client`, `clientInner`

Used by `Window.tsx` so all windows share one visual system tied to semantic tokens.

---

## Wallpaper

**Resolver:** `wallpaperBackgroundCss` — `src/constants/personalization/wallpaper.ts` (re-exported through personalization store barrel).  
**Desktop:** `Desktop.tsx` sets `style={{ background: wallpaper }}` on the full desktop surface.

---

## Icon tiles (desktop + Explorer)

**Component:** `src/components/programIcon/ProgramIcon.tsx`  
**Tokens:** `src/constants/appearance/iconAppearance.ts` — per-`ProgramId` frame colors, per-`kind` (`app` / `file` / `folder`) tile behavior, trash dock cues (`DESKTOP_TRASH_DOCK_EMPHASIS`, `DESKTOP_FILE_TRASH_TARGET_CUE`), Explorer list row classes via `explorerRowListIconClass` (`src/utils/appearance/explorerRowListIconClass.ts`).

---

## Taskbar chrome

**`taskbarSkin`** — `src/components/taskbar/taskbarSkin.ts` — consolidated class strings for shell bar, Start button idle/open states, and Start icon color. Keeps `Taskbar.tsx` readable.

---

_End of design / theming reference._
