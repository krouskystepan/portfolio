# Persistence, backup, export/import, and storage quotas

---

## Persistence technology

**Library:** Zustand `persist` middleware  
**Backend:** Browser **`localStorage`** (JSON serialized store snapshots)

The project is intentionally **client-only** for core state: no database, no sync server.

---

## Storage keys (single source of truth)

**File:** `src/constants/storage/persistence.ts`

| Constant | Typical contents |
|----------|------------------|
| `STORAGE_KEY_VFS` | Entire VFS graph |
| `STORAGE_KEY_DESKTOP` | Desktop icon **`items`** only (`partialize` in `useDesktopStore`) |
| `STORAGE_KEY_WINDOW` | Open windows, z-order, taskbar order (`partialize` drops `snapPreview`, `hasHydrated`) |
| `STORAGE_KEY_PERSONALIZATION` | Theme, accent, wallpaper, **`startMenuPinnedVfsIds`** |
| `STORAGE_KEY_TRASH` | **`useProgramStore`** persisted state — today this store **only** contains the `trash` slice, and `persist({ name: STORAGE_KEY_TRASH })` writes it to the **`trash-storage`** localStorage key. |
| `STORAGE_KEY_PROGRAMS` | Literal **`programs-storage`** — included in **reset** and **size measurement** so orphaned keys can be cleared. **No active `persist` middleware** currently writes this key (do not assume it holds data). |

### Export/import subset

**`PERSIST_STORAGE_KEYS`** — keys included in Settings **export** and **import** (order matches `persistence.ts`: **`trash-storage` first**, then vfs, desktop, window, personalization):

- `STORAGE_KEY_TRASH`, `STORAGE_KEY_VFS`, `STORAGE_KEY_DESKTOP`, `STORAGE_KEY_WINDOW`, `STORAGE_KEY_PERSONALIZATION`  

**Note:** `STORAGE_KEY_TRASH` / `trash-storage` holds the **Zustand program store** snapshot (trash slice), not a second copy of VFS trash flags.

**`RESET_STORAGE_KEYS`** — removed on full reset:

- All of the above **plus** `STORAGE_KEY_PROGRAMS`

**`MEASURE_STORAGE_KEYS`** — included in Settings **size breakdown**:

- Persisted keys **plus** program store key

---

## Backup file contract

| Field | Value |
|-------|-------|
| Filename | `webos-backup.json` (`SETTINGS_BACKUP_FILENAME`) |
| MIME | `application/json` (`SETTINGS_BACKUP_MIME`) |
| File input accept | `application/json` (`SETTINGS_IMPORT_ACCEPT`) |

**Export shape:** Object whose top-level keys are localStorage key strings; values are **parsed JSON** when possible, else raw string fallback (defensive parsing loop in Settings).

**Import behavior:** For each key in `PERSIST_STORAGE_KEYS`, if present in uploaded JSON, `localStorage.setItem(key, JSON.stringify(parsed[key]))`, then schedule reload.

**Reload delay:** `SETTINGS_RELOAD_DELAY_MS` from `src/constants/shell/timing.ts` (**600 ms**) so status text can flash before hard reload.

---

## Storage pressure UI

**Assumed budget:** `LOCAL_STORAGE_ASSUMED_BUDGET_BYTES` = **5 MiB** (approximate per-origin string quota — varies by browser).

**Ratios:**

- `STORAGE_WARN_RATIO` = **0.7** — “getting full” styling  
- `STORAGE_CRITICAL_RATIO` = **0.9** — stronger destructive styling  

**Measurement:** `src/utils/storage/measurePersistedBytes.ts` — async measurement used by Settings on mount and window **focus** (user returning to tab refreshes the estimate).

---

## Quota errors (VFS)

**File:** `src/stores/vfs/vfsPersistStorage.ts`

Custom `createJSONStorage` wrapper around `localStorage`:

- On successful write of the VFS key, clears `STORAGE_QUOTA_HIT_SESSION_KEY` from `sessionStorage`.  
- On `QuotaExceededError` (DOMException name/code 22) for the VFS key, records **timestamp** string in `sessionStorage` under `STORAGE_QUOTA_HIT_SESSION_KEY`, then rethrows.

**Settings UI:** Reads that session flag to show a **quota hit** banner (user-visible explanation that large documents — especially Paint data URLs — can exhaust localStorage).

---

## Paint persistence budgets (linked to VFS size)

**File:** `src/constants/paint/persist.ts`

| Constant | Value | Role |
|----------|-------|------|
| `PAINT_PERSIST_MAX_EDGE` | 1600 px | Starting max long edge when rasterizing for storage |
| `PAINT_PERSIST_MIN_EDGE` | 256 px | Give-up floor while iterating downscale |
| `PAINT_PERSIST_MAX_ENCODED_DOC_BYTES` | 1_200_000 | Max UTF-8 bytes of the full `encodePaintDocument(dataUrl)` string |

**Implementation:** `src/utils/paint/paintPersistRaster.ts` — scales canvas, tries PNG then JPEG quality steps, shrinks edge by ~0.72 until under budget or error string returned to Paint’s save UI.

---

## Portfolio talking points

1. **Portability:** JSON backup turns an ephemeral demo into something users can **move between machines** (manually).  
2. **Honest limits:** The shell acknowledges **browser storage ceilings** instead of pretending infinite disk.  
3. **Slice isolation:** Separate persist names reduce the blast radius of rehydration bugs and allow partial future migration (e.g. move only VFS to IndexedDB).

---

_End of persistence reference. Program-store trash key: `STORAGE_KEY_TRASH` (included in export). Shell bridges: `08`._
