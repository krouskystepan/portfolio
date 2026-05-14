# VFS internals — helpers, paths, MIME inference, invariants

**Factory:** `createVfsHelpers()` in `src/stores/vfs/actions.ts` — returned helpers are closed over by `useVfsStore` implementations.

---

## Filename and extension

**`splitBaseAndExt(name)`**

- Last `.` splits base vs extension.  
- Leading-dot-only names yield **empty ext** (e.g. `.gitignore` → ext `''`).  
- Extension returned **lowercased** without the dot.

---

## MIME inference (`inferMime`)

| Extension | MIME |
|-----------|------|
| `txt` | `MIME_TEXT_PLAIN` |
| `paint` | `MIME_PAINT` |
| `app`, `oslink` | `MIME_DESKTOP_SHORTCUT` |
| anything else | `MIME_OCTET_STREAM` |

Used when creating files without an explicit `mime` argument.

---

## Unique sibling names (`ensureUniqueSiblingName`)

- Trims; empty → **`UNTITLED`**.  
- Case-insensitive collision check among **non-deleted** siblings under the same `parentId`.  
- On clash, appends ` (2)`, ` (3)`, … before extension (`Report (2).txt` pattern).

---

## Paths (`buildPath` + `updatePathsRecursively`)

- **`buildPath`** walks `parentId` chain, skips synthetic null parent, builds **`/a/b/c`** style paths (leading slash).  
- **`updatePathsRecursively`** BFS-updates `path` for a subtree after renames or moves.

---

## Descendants (`getDescendantIds`)

Stack-based traversal from a root id — used by **`deleteNode`** (soft-delete subtree + desktop cleanup), **`purgeSubtree`**, and **`copyNode`** cloning.

---

## Invariants and guards

- **`createFile` / `createFolder`:** No-op (return `''`) if parent missing or not a folder.  
- **`deleteNode` / `moveNode`:** Refuse root (`parentId === null`).  
- **`purgeSubtree`:** Refuses **`id === rootId`** — cannot delete the synthetic filesystem root.  
- **`restoreNode`:** If parent missing or deleted, **reparents to `rootId`** and may rename on clash.  
- **`writeFile`:** No-op for missing file, deleted file.

---

## `resolveProgramByNode` (recap)

**File:** `useVfsStore.ts`

- Non-file → `'explorer'`.  
- `.app` / `.oslink` → parsed JSON `programId` or `'explorer'` if invalid; **`trash` disallowed** as shortcut target.  
- Else → `resolveProgramByExtension(ext)`.

---

_End of VFS internals reference._
