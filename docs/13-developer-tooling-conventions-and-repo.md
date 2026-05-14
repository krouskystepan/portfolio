# Developer tooling, conventions, and repository layout

---

## Package manager and scripts

**File:** `package.json` (project uses **pnpm** in practice; `npm`/`yarn` also work per README).

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Next.js dev server (`next dev`) |
| `pnpm build` | Production build (`next build`) |
| `pnpm start` | Run production server (`next start`) |
| `pnpm lint` | ESLint on `.` |
| `pnpm lint:fix` | ESLint with `--fix` |
| `pnpm format` | Prettier **check** |
| `pnpm format:fix` | Prettier **write** |
| `pnpm validate` | `lint` + `format` |
| `pnpm validate:fix` | `lint:fix` + `format:fix` |

---

## TypeScript

**File:** `tsconfig.json`

- **Strict** mode enabled.  
- **`paths`:** `@/*` → `./src/*` (imports use `@/components/...`, `@/stores/...`, etc.).  
- **`jsx`:** `react-jsx` (no `React` default import required).  
- **`moduleResolution`:** `bundler` (Next 16 / modern toolchain).

---

## ESLint

**File:** `eslint.config.mjs`

- Extends **`eslint-config-next`** **core-web-vitals** + **typescript** presets.  
- **`@typescript-eslint/no-unused-vars`:** `warn`, ignores args/vars matching `^_`.  
- **Ignores:** `.next/**`, `out/**`, `build/**`, `next-env.d.ts`.

---

## Prettier

**Files:** `.prettierrc`, `.prettierignore` — project-wide formatting; CI/dev should run `validate` before merge.

---

## Cursor / workspace rule

**File:** `.cursor/rules/Arrow-Function.mdc` — project convention: **use arrow functions** for new code where applicable.

---

## Top-level `src/` layout (mental map)

| Area | Role |
|------|------|
| `src/app/` | Next.js App Router: `layout.tsx`, `page.tsx`, `globals.css`, `not-found.tsx` |
| `src/components/` | Shared shell UI: desktop, window, taskbar, explorer widgets, context menu, shell root |
| `src/programs/` | “Apps”: each program folder + `registry.ts` |
| `src/stores/` | Zustand stores (window, vfs, desktop, personalization, programs/trash, context menu, taskbar overlay) |
| `src/constants/` | Tunable numbers, ids, MIME, storage keys, appearance tokens |
| `src/utils/` | Pure helpers: window math, desktop bounds, vfs DnD, paint codecs, explorer bridges |

---

## Tests

There is **no** `__tests__`, `*.test.ts`, or Vitest/Jest config in this repository at time of writing — behavior is validated manually in the browser. If you add tests, document the runner choice here.

---

_End of tooling reference._
