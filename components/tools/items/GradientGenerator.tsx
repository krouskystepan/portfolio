'use client'

import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode
} from 'react'
import { createPortal } from 'react-dom'
import { HexColorPicker } from 'react-colorful'
import { Maximize2, Plus, X } from 'lucide-react'
import { useAchievementContext } from '@/context/AchievementContext'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  PrimaryButton,
  RemoveButton,
  SecondaryButton
} from '@/components/tools/_shared/ToolButtons'
import {
  toolCheckboxLabelClass,
  toolCompactInputClass,
  toolEmptyHintClass,
  toolHintMetaClass,
  toolIntroTextClass,
  toolNumberInputClass,
  toolPanelClass,
  toolPickerShellClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolValueRowClass,
  ToolChipButton,
  ToolChipRow,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import {
  ANGLE_PRESETS,
  EXPORT_FORMATS,
  GRADIENT_PRESETS,
  GRADIENT_TYPES,
  POSITION_CELLS,
  RADIAL_SHAPES,
  RADIAL_SIZES,
  gradientCssValue,
  gradientFromPreset,
  nudgePositionForRadialSize,
  presetMatches,
  radialExtentCollapsed,
  sortStops
} from '@/utils/gradientGenerator'
import { hexToRgb, rgbToHex } from '@/utils/colorUtils'
import { useGradientGenerator } from '@/hooks/tools/useGradientGenerator'

function ControlRow({
  label,
  children
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="w-20 shrink-0 text-sm font-medium text-neutral-300">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

const PICKER_W = 260
const PICKER_H = 292

function placePicker(anchor: DOMRect) {
  const pad = 8
  const vw = window.innerWidth
  const vh = window.innerHeight
  let left = anchor.right + pad
  if (left + PICKER_W > vw - pad) left = anchor.left - PICKER_W - pad
  if (left < pad) left = pad
  let top = anchor.top
  if (top + PICKER_H > vh - pad) top = vh - PICKER_H - pad
  if (top < pad) top = pad
  return { top, left }
}

function StopColorSwatch({
  hex,
  label,
  open,
  onToggle,
  onClose,
  onChange
}: {
  hex: string
  label: string
  open: boolean
  onToggle: () => void
  onClose: () => void
  onChange: (hex: string) => void
}) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (!open) return
    const update = () => {
      const el = btnRef.current
      if (!el) return
      setCoords(placePicker(el.getBoundingClientRect()))
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (btnRef.current?.contains(t) || panelRef.current?.contains(t)) return
      onClose()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [open, onClose])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        title="Pick color"
        aria-label={label}
        aria-expanded={open}
        className="size-8 shrink-0 rounded-md border border-white/20 shadow-inner"
        style={{ backgroundColor: hex }}
        onClick={onToggle}
      />
      {open &&
        createPortal(
          <div
            ref={panelRef}
            className={`fixed z-[200] w-[260px] shadow-2xl ${toolPickerShellClass} !bg-neutral-900`}
            style={{ top: coords.top, left: coords.left }}
          >
            <HexColorPicker color={hex} onChange={onChange} />
          </div>,
          document.body
        )}
    </>
  )
}

const PREVIEW_ASPECTS = [
  { id: '21:9', label: '21:9', w: 21, h: 9, hint: 'Ultrawide' },
  { id: '16:9', label: '16:9', w: 16, h: 9, hint: 'Landscape' },
  { id: '4:3', label: '4:3', w: 4, h: 3, hint: 'Classic' },
  { id: '1:1', label: '1:1', w: 1, h: 1, hint: 'Square' },
  { id: '3:4', label: '3:4', w: 3, h: 4, hint: 'Portrait' },
  { id: '9:16', label: '9:16', w: 9, h: 16, hint: 'Story' }
] as const

type PreviewAspectId = (typeof PREVIEW_ASPECTS)[number]['id']
type PreviewMode = 'all' | 'fill' | PreviewAspectId

function GradientSwatch({
  cssValue,
  className = '',
  style
}: {
  cssValue: string
  className?: string
  style?: CSSProperties
}) {
  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{ backgroundImage: cssValue, ...style }}
    />
  )
}

function GradientPreviewDialog({
  cssValue,
  onClose
}: {
  cssValue: string
  onClose: () => void
}) {
  const [mode, setMode] = useState<PreviewMode>('all')
  const selected =
    mode !== 'all' && mode !== 'fill'
      ? PREVIEW_ASPECTS.find((a) => a.id === mode)
      : undefined

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-[180] grid place-items-center bg-black/70 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gradient-preview-title"
        className={`flex w-full max-w-5xl flex-col rounded-2xl border border-white/15 bg-neutral-950 shadow-2xl ${
          mode === 'fill'
            ? 'h-[calc(100dvh-1.5rem)] overflow-hidden sm:h-[calc(100dvh-3rem)]'
            : 'h-auto'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-4 pt-3 sm:px-5">
          <div className="min-w-0">
            <h3 id="gradient-preview-title" className={toolSectionTitleClass}>
              Preview sizes
            </h3>
            <p className={toolHintMetaClass}>
              Same CSS, different boxes - radial size follows the frame.
            </p>
          </div>
          <button
            type="button"
            title="Close"
            aria-label="Close preview"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-neutral-800 text-neutral-300 transition hover:bg-neutral-700 hover:text-white"
            onClick={onClose}
          >
            <X className="size-3.5" />
          </button>
        </div>

        <div className="px-4 py-3 sm:px-5">
          <ToolChipRow>
            <ToolChipButton
              active={mode === 'all'}
              onClick={() => setMode('all')}
            >
              All
            </ToolChipButton>
            {PREVIEW_ASPECTS.map((a) => (
              <ToolChipButton
                key={a.id}
                active={mode === a.id}
                title={a.hint}
                onClick={() => setMode(a.id)}
              >
                {a.label}
              </ToolChipButton>
            ))}
            <ToolChipButton
              active={mode === 'fill'}
              title="Fill the preview area"
              onClick={() => setMode('fill')}
            >
              Fill
            </ToolChipButton>
          </ToolChipRow>
        </div>

        {mode === 'all' && (
          <div className="flex w-full items-end gap-2 px-4 pb-4 sm:gap-3 sm:px-5">
            {PREVIEW_ASPECTS.map((a) => (
              <button
                key={a.id}
                type="button"
                title={`${a.label} · ${a.hint}`}
                onClick={() => setMode(a.id)}
                className="flex min-w-0 flex-col items-center gap-1.5 border-0 bg-transparent p-0"
                style={{ flex: `${a.w / a.h} 1 0%` }}
              >
                <GradientSwatch
                  cssValue={cssValue}
                  className="w-full rounded-xl"
                  style={{ aspectRatio: `${a.w} / ${a.h}` }}
                />
                <span className="w-full text-center text-[11px] leading-tight text-neutral-400">
                  {a.label}
                  <span className="hidden text-neutral-600 sm:inline">
                    {' '}
                    · {a.hint}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}

        {mode === 'fill' && (
          <div className="min-h-0 flex-1 px-4 pb-4 sm:px-5">
            <GradientSwatch
              cssValue={cssValue}
              className="h-full w-full rounded-2xl"
            />
          </div>
        )}

        {selected && (
          <div className="flex flex-col items-center gap-2 px-4 pb-4 sm:px-5">
            <GradientSwatch
              cssValue={cssValue}
              className="rounded-2xl"
              style={{
                aspectRatio: `${selected.w} / ${selected.h}`,
                width: `min(100%, calc((100dvh - 13rem) * ${selected.w} / ${selected.h}))`,
                maxHeight: 'calc(100dvh - 13rem)'
              }}
            />
            <p className={toolHintMetaClass}>
              {selected.label} · {selected.hint}
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

function PositionPad({
  x,
  y,
  size,
  onChange
}: {
  x: number
  y: number
  size?: (typeof RADIAL_SIZES)[number]['id']
  onChange: (x: number, y: number) => void
}) {
  return (
    <div
      role="group"
      aria-label="Gradient position"
      className="grid grid-cols-3 gap-0.5 rounded-md border border-white/10 p-0.5"
    >
      {POSITION_CELLS.map((cell) => {
        const target = size
          ? nudgePositionForRadialSize(size, cell.x, cell.y)
          : { x: cell.x, y: cell.y }
        const active = target.x === x && target.y === y
        return (
          <button
            key={cell.label}
            type="button"
            title={cell.label}
            aria-label={cell.label}
            onClick={() => onChange(target.x, target.y)}
            className={`size-5 rounded-sm transition ${
              active ? 'bg-custom_blue' : 'bg-neutral-800 hover:bg-neutral-700'
            }`}
          />
        )
      })}
    </div>
  )
}

function GradientGeneratorInner() {
  const { unlockAchievement } = useAchievementContext()
  const {
    type,
    repeating,
    angle,
    shape,
    size,
    posX,
    posY,
    exportFormat,
    stops,
    hexFocusId,
    editDraft,
    copied,
    flash,
    cssValue,
    exportText,
    setType,
    setRepeating,
    setAngle,
    setShape,
    setSize,
    setPosX,
    setPosY,
    setPosition,
    setExportFormat,
    setEditDraft,
    handleRandomize,
    handleApplyPreset,
    handleAddStop,
    handleRemoveStop,
    handleStopHex,
    handleStopPosition,
    beginHexEdit,
    endHexEdit,
    MIN_STOPS,
    MAX_STOPS
  } = useGradientGenerator()

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    flash(key)
    unlockAchievement('clipboard-master')
  }

  const displayStops = sortStops(stops)
  const currentGradient = {
    type,
    repeating,
    angle,
    shape,
    size,
    posX,
    posY,
    stops
  }

  const [pickerId, setPickerId] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const closePreview = useCallback(() => setPreviewOpen(false), [])

  return (
    <ToolLayout title="Gradient generator">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Build linear, radial, or conic gradients - including repeating
            variants. Tune angle, position, and size, then export CSS or a
            Tailwind arbitrary class. The URL stays in sync so you can share the
            result.
          </p>
        }
      >
        <div className="space-y-4">
          <ControlRow label="Preset">
            {GRADIENT_PRESETS.map((preset) => {
              const active = presetMatches(preset, currentGradient)
              return (
                <button
                  key={preset.id}
                  type="button"
                  title={preset.label}
                  onClick={() => handleApplyPreset(preset)}
                  className={`h-8 min-w-[4.75rem] rounded-md px-2.5 text-xs font-medium text-white transition [text-shadow:0_1px_2px_rgb(0_0_0_/_75%)] ${
                    active
                      ? 'ring-2 ring-white/70'
                      : 'ring-1 ring-white/15 hover:ring-white/35'
                  }`}
                  style={{
                    backgroundImage: gradientCssValue(
                      gradientFromPreset(preset)
                    )
                  }}
                >
                  {preset.label}
                </button>
              )
            })}
          </ControlRow>

          <ControlRow label="Type">
            <ToolChipRow>
              {GRADIENT_TYPES.map((t) => (
                <ToolChipButton
                  key={t.id}
                  active={type === t.id}
                  onClick={() => setType(t.id)}
                >
                  {t.label}
                </ToolChipButton>
              ))}
            </ToolChipRow>
            <label className={toolCheckboxLabelClass}>
              <input
                type="checkbox"
                checked={repeating}
                onChange={() => setRepeating(!repeating)}
                className="size-4 accent-custom_blue"
              />
              Repeating
            </label>
            <PrimaryButton onClick={handleRandomize}>Randomize</PrimaryButton>
          </ControlRow>

          {(type === 'linear' || type === 'conic') && (
            <ControlRow label={type === 'conic' ? 'From' : 'Angle'}>
              <label className="flex shrink-0 items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={360}
                  value={angle}
                  onChange={(e) => {
                    const n = Number.parseInt(e.target.value, 10)
                    if (!Number.isFinite(n)) return
                    setAngle(n)
                  }}
                  className={toolNumberInputClass}
                  aria-label={
                    type === 'conic'
                      ? 'Starting angle in degrees'
                      : 'Gradient angle in degrees'
                  }
                />
                <span className={toolHintMetaClass}>°</span>
              </label>
              <ToolChipRow>
                {ANGLE_PRESETS.map((preset) => (
                  <ToolChipButton
                    key={preset}
                    active={angle === preset}
                    onClick={() => setAngle(preset)}
                  >
                    {preset}°
                  </ToolChipButton>
                ))}
              </ToolChipRow>
            </ControlRow>
          )}

          {type === 'radial' && (
            <>
              <ControlRow label="Shape">
                <ToolChipRow>
                  {RADIAL_SHAPES.map((s) => (
                    <ToolChipButton
                      key={s.id}
                      active={shape === s.id}
                      onClick={() => setShape(s.id)}
                    >
                      {s.label}
                    </ToolChipButton>
                  ))}
                </ToolChipRow>
              </ControlRow>
              <ControlRow label="Size">
                <div className="flex min-w-0 flex-col gap-1">
                  <ToolChipRow>
                    {RADIAL_SIZES.map((s) => (
                      <ToolChipButton
                        key={s.id}
                        active={size === s.id}
                        title={s.hint}
                        onClick={() => setSize(s.id)}
                      >
                        {s.label}
                      </ToolChipButton>
                    ))}
                  </ToolChipRow>
                  {radialExtentCollapsed(size, posX, posY) && (
                    <p className={toolHintMetaClass}>
                      {size === 'closest-side'
                        ? 'Closest side has radius 0 when the center sits on an edge, so the preview fills with the last stop. Nudge X/Y inward.'
                        : 'Closest corner has radius 0 when the center sits on a corner. Nudge X/Y inward.'}
                    </p>
                  )}
                </div>
              </ControlRow>
            </>
          )}

          {(type === 'radial' || type === 'conic') && (
            <ControlRow label="Position">
              <div className="flex flex-wrap items-center gap-2">
                <PositionPad
                  x={posX}
                  y={posY}
                  size={type === 'radial' ? size : undefined}
                  onChange={setPosition}
                />
                <label className="flex items-center gap-1.5">
                  <span className={toolHintMetaClass}>X</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={posX}
                    onChange={(e) => {
                      const n = Number.parseInt(e.target.value, 10)
                      if (!Number.isFinite(n)) return
                      setPosX(n)
                    }}
                    className={`${toolNumberInputClass} !w-[3.75rem] max-w-[3.75rem]`}
                    aria-label="Horizontal position percent"
                  />
                  <span className={toolHintMetaClass}>%</span>
                </label>
                <label className="flex items-center gap-1.5">
                  <span className={toolHintMetaClass}>Y</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={posY}
                    onChange={(e) => {
                      const n = Number.parseInt(e.target.value, 10)
                      if (!Number.isFinite(n)) return
                      setPosY(n)
                    }}
                    className={`${toolNumberInputClass} !w-[3.75rem] max-w-[3.75rem]`}
                    aria-label="Vertical position percent"
                  />
                  <span className={toolHintMetaClass}>%</span>
                </label>
              </div>
            </ControlRow>
          )}
        </div>
      </ToolInputPanel>

      <button
        type="button"
        title="Preview in other sizes"
        aria-haspopup="dialog"
        aria-expanded={previewOpen}
        aria-label="Open gradient size preview"
        onClick={() => setPreviewOpen(true)}
        className="group relative w-full overflow-hidden rounded-2xl border border-dashed border-white/15 text-left"
      >
        <GradientSwatch cssValue={cssValue} className="h-40 sm:h-48" />
        <span className="pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-md bg-black/45 px-2 py-1 text-xs font-medium text-white/90 opacity-90 transition group-hover:bg-black/60">
          <Maximize2 className="size-3.5" />
          Sizes
        </span>
      </button>
      {previewOpen && (
        <GradientPreviewDialog cssValue={cssValue} onClose={closePreview} />
      )}

      <div className={toolPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <div className="min-w-0">
            <h3 className={toolSectionTitleClass}>Stops</h3>
            {repeating && (
              <p className={toolHintMetaClass}>
                Pull the last stop below 100% to see the pattern repeat
              </p>
            )}
          </div>
          <SecondaryButton
            onClick={handleAddStop}
            disabled={stops.length >= MAX_STOPS}
          >
            <span className="inline-flex items-center gap-1.5">
              <Plus className="size-3.5" strokeWidth={2.5} />
              Add stop
            </span>
          </SecondaryButton>
        </div>
        <ul className="space-y-2">
          {displayStops.map((stop, index) => {
            const isHexFocused = hexFocusId === stop.id
            return (
              <li key={stop.id} className={toolValueRowClass}>
                <StopColorSwatch
                  hex={stop.hex}
                  label={`Color stop ${index + 1}`}
                  open={pickerId === stop.id}
                  onToggle={() =>
                    setPickerId((id) => (id === stop.id ? null : stop.id))
                  }
                  onClose={() => setPickerId(null)}
                  onChange={(hex) => handleStopHex(stop.id, hex)}
                />
                <input
                  type="text"
                  value={isHexFocused ? editDraft : stop.hex}
                  aria-label={`Hex for stop ${index + 1}`}
                  title="Edit hex"
                  spellCheck={false}
                  autoComplete="off"
                  className={`${toolCompactInputClass} !w-[7.25rem] max-w-[7.25rem] shrink-0 font-mono tracking-wide`}
                  onFocus={(e) => {
                    beginHexEdit(stop.id, stop.hex)
                    e.target.select()
                  }}
                  onChange={(e) => {
                    const v = e.target.value
                    setEditDraft(v)
                    handleStopHex(stop.id, v)
                  }}
                  onBlur={() => {
                    const raw = editDraft.trim()
                    const rgb = hexToRgb(raw.startsWith('#') ? raw : `#${raw}`)
                    if (rgb) {
                      handleStopHex(stop.id, rgbToHex(rgb.r, rgb.g, rgb.b))
                    }
                    endHexEdit()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur()
                    if (e.key === 'Escape') {
                      setEditDraft(stop.hex)
                      endHexEdit()
                      e.currentTarget.blur()
                    }
                  }}
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={stop.position}
                  aria-label={`Position slider for stop ${index + 1}`}
                  className="hidden min-w-0 flex-1 cursor-pointer accent-custom_blue sm:block"
                  onChange={(e) =>
                    handleStopPosition(stop.id, Number(e.target.value))
                  }
                />
                <label className="ml-auto flex shrink-0 items-center gap-1.5 sm:ml-0">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={stop.position}
                    aria-label={`Position for stop ${index + 1}`}
                    className={`${toolNumberInputClass} !w-[3.75rem] max-w-[3.75rem]`}
                    onChange={(e) => {
                      const n = Number.parseInt(e.target.value, 10)
                      if (!Number.isFinite(n)) return
                      handleStopPosition(stop.id, n)
                    }}
                  />
                  <span className={toolHintMetaClass}>%</span>
                </label>
                <RemoveButton
                  title={
                    stops.length <= MIN_STOPS
                      ? `Keep at least ${MIN_STOPS} stops`
                      : 'Remove stop'
                  }
                  aria-label={`Remove stop ${stop.hex}`}
                  disabled={stops.length <= MIN_STOPS}
                  onClick={() => handleRemoveStop(stop.id)}
                />
              </li>
            )
          })}
        </ul>
      </div>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h3 className={toolSectionTitleClass}>Export</h3>
          <ToolCopyButton
            copied={copied === 'export'}
            onClick={() => handleCopy(exportText, 'export')}
          />
        </div>
        <ToolChipRow className="mb-3">
          {EXPORT_FORMATS.map((f) => (
            <ToolChipButton
              key={f.id}
              active={exportFormat === f.id}
              onClick={() => setExportFormat(f.id)}
            >
              {f.label}
            </ToolChipButton>
          ))}
        </ToolChipRow>
        <pre className={toolPreOutputClass}>{exportText}</pre>
      </div>
    </ToolLayout>
  )
}

const GradientGenerator = () => (
  <Suspense
    fallback={
      <ToolLayout title="Gradient generator">
        <p className={toolEmptyHintClass}>Loading gradient…</p>
      </ToolLayout>
    }
  >
    <GradientGeneratorInner />
  </Suspense>
)

export default GradientGenerator
