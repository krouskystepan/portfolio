# Notepad — editor behavior and VFS wiring

**Main module:** `src/programs/notepad/NotepadApp.tsx`  
**Editor:** `src/programs/notepad/RichEditor.tsx` (TipTap)

---

## Loading strategy

- **`RichEditor`** is loaded with **`next/dynamic`** and **`{ ssr: false }`** so TipTap / ProseMirror never runs during SSR (`NotepadApp.tsx`).

---

## Document set

- **Source of truth:** VFS file nodes. The app builds a sorted list of text-like files (excludes `.paint` and shortcut-like extensions per filters).  
- **Active document:** `activeNoteId` on the **window** record (`useWindowStore`) — allows multiple Notepad windows with different active files.  
- **Registry `onCreateWindow`:** If no `activeNoteId` passed, picks the most recently updated eligible note (see `registry.ts`).

---

## Persistence and rename

- **Save** writes HTML or plain content through `writeFile` / `renameNode` on the VFS store.  
- **Desktop shortcuts:** Can add a tile for the current note; `updateFileTitlesByResource` keeps titles in sync when the underlying file renames.

---

## Trash integration

- Deleting a note from Notepad flows through **`moveToTrash`** + **`deleteNode`** patterns aligned with other surfaces (see Trash docs).

---

## UI chrome

- **Menu bar:** `File`, `Edit`, `View`, `Help` with cascading submenus (`fileOpenCascade`, etc.).  
- **Formatting toolbar:** Toggleable (`showFormattingToolbar`).  
- **Saved banner:** Timed dismiss (`NOTEPAD_SAVED_BANNER_MS`).  
- **About** dialog flag (`aboutOpen`).

---

## TipTap extensions (summary)

See **`04-programs-feature-reference.md`** and `RichEditor.tsx` for the authoritative extension list (`StarterKit` configuration, `Underline`, `CodeBlock`, `TextAlign`, `Placeholder`, toolbar actions).

---

_End of Notepad reference._
