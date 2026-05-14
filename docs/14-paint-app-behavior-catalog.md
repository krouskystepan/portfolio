# Paint app — user-facing behavior catalog

**Main module:** `src/programs/paint/PaintApp.tsx` (~1400+ lines)  
**Supporting:** `src/utils/paint/paintFileCodec.ts`, `paintPersistRaster.ts`, `src/constants/paint/*`

This document lists **what the Paint program does in the product**, not every implementation detail.

---

## Document model

- Each **`.paint`** VFS file stores **`PaintFileV1`**: `{ v, dataUrl }` where `dataUrl` is PNG or JPEG (`paintFileCodec.ts`).  
- **On-screen:** HTML `<canvas>` raster editor; tools draw to the canvas, then **Save** serializes through **`rasterDataUrlForPaintPersist`** to respect byte budgets (`docs/06` + `12`).

---

## Tools (toolbar)

Union type `Tool` in `PaintApp.tsx`:

| Tool | Role |
|------|------|
| `pencil` | 1px-style hard pixel strokes |
| `brush` | Width from `BRUSH_SIZES` / zoom scaling |
| `eraser` | Uses secondary color channel behavior |
| `fill` | Flood fill with tolerance |
| `picker` | Sample color from canvas |
| `line` | Click-drag segment |
| `rect` | Click-drag rectangle stroke |

**Colors:** Primary + secondary; right-click behavior documented in source (right-click disabled for certain modes).

---

## File menu (high level)

- **Save to Desktop…** — runs raster persist pipeline, writes VFS via `writeFile`, shows success/error banner (`PAINT_SAVED_BANNER_MS` / error variant).  
- **Download PNG to this PC…** — `downloadPngToHostPc`: `toDataURL('image/png')`, `<a download>`, filename from active title or `image.png`.  
- **Resize canvas…** — modal: width/height inputs, preset sizes, **Apply** copies/scales pixels via canvas APIs (`applyCanvasResize`).  
- Typical **New** / open flows tie to `activePaintImageId` on the window record (from Explorer or registry `onCreateWindow`).

---

## Layout and scaling

- **`ResizeObserver`** on the paint workspace drives **fit-to-panel** scaling (`compute` / scale refs in `PaintApp.tsx`) so the canvas is usable inside the window client area.  
- Canvas dimensions are bounded by constants in `src/constants/paint/canvas.ts` (defaults / caps — tune there for portfolio “limits” story).

---

## Persistence errors

- If **`rasterDataUrlForPaintPersist`** returns `{ error }`, the UI surfaces the string (e.g. image too large for browser storage after all downscale attempts).

---

## Keyboard / UX polish

- See source for shortcuts (if any) beyond toolbar — grep `keydown` / `useEffect` listeners in `PaintApp.tsx` when extending docs.

---

_End of Paint behavior catalog._
