'use client'

import { Suspense } from 'react'
import { AnimatePresence, Reorder } from 'framer-motion'
import { HexColorPicker } from 'react-colorful'
import { Lock, Plus, Unlock, X } from 'lucide-react'
import { useAchievementContext } from '@/context/AchievementContext'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  PrimaryButton,
  SecondaryButton
} from '@/components/tools/_shared/ToolButtons'
import {
  toolEmptyHintClass,
  toolHintMetaClass,
  toolIntroTextClass,
  toolNumberInputClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarBetweenClass,
  ToolChipButton,
  ToolChipRow,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import {
  BLINDNESS_MODES,
  HARMONY_MODES,
  contrastingText,
  contrastRatio,
  exportPalette,
  shadeRamp,
  simulateBlindness,
  wcagLevel,
  type ExportFormat
} from '@/utils/paletteGenerator'
import { hexToRgb, rgbToHex } from '@/utils/colorUtils'
import { useColorPalette } from '@/hooks/tools/useColorPalette'

const SWATCH_TRANSITION = {
  layout: { type: 'spring' as const, stiffness: 520, damping: 40, mass: 0.4 },
  opacity: { duration: 0.14 },
  scaleX: { duration: 0.14 }
}

const EXPORT_FORMATS: { id: ExportFormat; label: string }[] = [
  { id: 'css', label: 'CSS' },
  { id: 'tailwind', label: 'Tailwind' },
  { id: 'json', label: 'JSON' },
  { id: 'svg', label: 'SVG' },
  { id: 'hex', label: 'HEX list' }
]

const pickerShellClass =
  // Clip handles to the rounded shell; padding keeps them fully visible inside.
  'overflow-hidden rounded-xl border border-white/10 bg-neutral-900/90 p-4 shadow-xl ' +
  '[&_.react-colorful]:!h-[160px] [&_.react-colorful]:!w-full ' +
  '[&_.react-colorful__saturation]:!mb-2 [&_.react-colorful__saturation]:!rounded-lg [&_.react-colorful__saturation]:!border-b-0 ' +
  '[&_.react-colorful__hue]:!h-3 [&_.react-colorful__hue]:!rounded-lg ' +
  '[&_.react-colorful__pointer]:!h-3.5 [&_.react-colorful__pointer]:!w-3.5 ' +
  '[&_.react-colorful__hue-pointer]:!h-3 [&_.react-colorful__hue-pointer]:!w-3'

function ColorPaletteInner() {
  const { unlockAchievement } = useAchievementContext()
  const {
    state,
    dispatch,
    editPanelRef,
    colorsRef,
    dragSnapshotRef,
    copied,
    flash,
    commitColors,
    setSwatchHex,
    handleReorder,
    clonePalette,
    insertMidpointBetween,
    removeColorAt,
    generatePalette,
    MIN_PALETTE,
    MAX_PALETTE
  } = useColorPalette()

  const {
    mode,
    count,
    colors,
    blindness,
    exportFormat,
    past,
    future,
    selectedIndex,
    hexFocusIndex,
    pickerIndex,
    editDraft,
    draggingId,
    motionReady
  } = state

  const handleGenerate = () => {
    commitColors(
      generatePalette({
        count,
        mode,
        existing: colors.length === count ? colors : undefined
      })
    )
  }

  const handleInsertBetween = (afterIndex: number) => {
    const next = insertMidpointBetween(colorsRef.current, afterIndex)
    if (!next) return
    commitColors(next, {
      selectedIndex: afterIndex + 1,
      clearEditUi: true
    })
  }

  const handleRemoveColor = (index: number) => {
    const next = removeColorAt(colorsRef.current, index)
    if (!next) return
    commitColors(next, { clearEditUi: true })
  }

  const finishReorder = () => {
    const snapshot = dragSnapshotRef.current
    dragSnapshotRef.current = null
    dispatch({ type: 'finishReorder', snapshot })
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    flash(key)
    unlockAchievement('clipboard-master')
  }

  const hexes = colors.map((c) => c.hex)
  const displayHexes = hexes.map((h) => simulateBlindness(h, blindness))
  const selectedHex = colors[selectedIndex]?.hex ?? '#000000'
  const ramp = shadeRamp(selectedHex, 10)
  const exportText = exportPalette(exportFormat, hexes)

  const adjacentPairs = colors.slice(0, -1).map((c, i) => {
    const next = colors[i + 1]
    const ratio = contrastRatio(c.hex, next.hex)
    return {
      a: c.hex,
      b: next.hex,
      ratio,
      level: wcagLevel(ratio)
    }
  })

  return (
    <ToolLayout title="Color palette generator">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Generate a palette, lock colors you like, then press{' '}
            <kbd className="rounded border border-white/15 bg-neutral-900 px-1.5 py-0.5 font-mono text-[12px]">
              Space
            </kbd>{' '}
            to refresh unlocked colors. Drag to reorder. Hover a border between
            two colors to insert the midpoint. Export as CSS / Tailwind when
            ready.
          </p>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <span className="shrink-0 text-sm font-medium text-neutral-300">
                Harmony
              </span>
              <ToolChipRow>
                {HARMONY_MODES.map((m) => (
                  <ToolChipButton
                    key={m.id}
                    active={mode === m.id}
                    onClick={() => dispatch({ type: 'setMode', mode: m.id })}
                  >
                    {m.label}
                  </ToolChipButton>
                ))}
              </ToolChipRow>
            </div>
            <label className="flex shrink-0 items-center gap-2">
              <span className="text-sm font-medium text-neutral-300">
                Colors
              </span>
              <input
                type="number"
                min={MIN_PALETTE}
                max={MAX_PALETTE}
                value={count}
                onChange={(e) =>
                  dispatch({
                    type: 'setCountAndGenerate',
                    count: Number.parseInt(e.target.value, 10) || MIN_PALETTE
                  })
                }
                className={toolNumberInputClass}
                aria-label={`Colors ${MIN_PALETTE} to ${MAX_PALETTE}`}
              />
            </label>
          </div>

          <div className={toolToolbarBetweenClass}>
            <p className={toolHintMetaClass}>
              <kbd className="rounded border border-white/10 px-1 font-mono">
                L
              </kbd>{' '}
              locks selected · drag to reorder
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <SecondaryButton
                onClick={() => dispatch({ type: 'undo' })}
                disabled={past.length === 0}
              >
                Undo
              </SecondaryButton>
              <SecondaryButton
                onClick={() => dispatch({ type: 'redo' })}
                disabled={future.length === 0}
              >
                Redo
              </SecondaryButton>
              <SecondaryButton
                onClick={() =>
                  commitColors(colors.map((c) => ({ ...c, locked: false })))
                }
              >
                Clear locks
              </SecondaryButton>
              <PrimaryButton onClick={handleGenerate}>Generate</PrimaryButton>
            </div>
          </div>
        </div>
      </ToolInputPanel>

      {/* overflow-visible so the floating HexColorPicker isn’t clipped at the strip edge */}
      <div className="rounded-2xl border border-dashed border-white/15">
        <Reorder.Group
          axis="x"
          values={colors}
          onReorder={handleReorder}
          as="div"
          className="relative flex min-h-[220px] w-full overflow-visible rounded-2xl sm:min-h-[280px]"
        >
          <AnimatePresence initial={false}>
            {colors.map((color, index) => {
              const shown = displayHexes[index]
              const text = contrastingText(shown)
              const isSelected = selectedIndex === index
              const isHexFocused = hexFocusIndex === index
              const isPickerOpen = pickerIndex === index
              const canInsertAfter =
                colors.length < MAX_PALETTE &&
                index < colors.length - 1 &&
                draggingId === null
              const isDragging = draggingId === color.id
              return (
                <Reorder.Item
                  key={color.id}
                  value={color}
                  as="div"
                  layout={
                    motionReady && draggingId === null ? 'position' : undefined
                  }
                  initial={motionReady ? { opacity: 0, scaleX: 0.85 } : false}
                  animate={{ opacity: 1, scaleX: 1 }}
                  exit={motionReady ? { opacity: 0, scaleX: 0.85 } : undefined}
                  transition={SWATCH_TRANSITION}
                  dragListener={!isHexFocused && !isPickerOpen}
                  dragElastic={0.08}
                  whileDrag={{ zIndex: 30 }}
                  onDragStart={() => {
                    dragSnapshotRef.current = clonePalette(colorsRef.current)
                    dispatch({ type: 'setDragging', id: color.id })
                    dispatch({ type: 'endHexEdit' })
                    dispatch({ type: 'setPickerIndex', index: null })
                  }}
                  onDragEnd={finishReorder}
                  className={`relative flex min-w-0 flex-1 cursor-grab flex-col justify-between overflow-visible p-3 active:cursor-grabbing ${
                    index === 0 ? 'rounded-l-2xl' : ''
                  } ${index === colors.length - 1 ? 'rounded-r-2xl' : ''} ${
                    isSelected ? 'ring-2 ring-inset ring-white/40' : ''
                  } ${isDragging ? 'z-30 shadow-2xl' : ''} ${
                    isPickerOpen ? 'z-40' : ''
                  }`}
                  style={{ backgroundColor: shown }}
                  onClick={() => dispatch({ type: 'select', index })}
                >
                  {canInsertAfter && (
                    <div
                      className="group/insert absolute inset-y-0 right-0 z-20 w-5 translate-x-1/2"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        title="Insert color between"
                        aria-label={`Insert midpoint color between ${color.hex} and ${colors[index + 1].hex}`}
                        className="absolute left-1/2 top-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-neutral-950/90 text-white opacity-0 shadow-lg backdrop-blur-sm transition duration-150 group-hover/insert:opacity-100 group-focus-within/insert:opacity-100 hover:scale-110 hover:border-white/40 hover:bg-neutral-900 focus-visible:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleInsertBetween(index)
                        }}
                      >
                        <Plus className="size-4" strokeWidth={2.5} />
                      </button>
                    </div>
                  )}

                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      title={
                        colors.length <= MIN_PALETTE
                          ? `Keep at least ${MIN_PALETTE} colors`
                          : 'Remove color'
                      }
                      aria-label={`Remove ${color.hex}`}
                      disabled={colors.length <= MIN_PALETTE}
                      className="inline-flex size-8 items-center justify-center rounded-md bg-black/25 text-current backdrop-blur-sm transition hover:bg-black/40 disabled:cursor-not-allowed disabled:opacity-40"
                      style={{ color: text }}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveColor(index)
                      }}
                    >
                      <X className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      title={color.locked ? 'Unlock' : 'Lock'}
                      className="inline-flex size-8 items-center justify-center rounded-md bg-black/25 text-current backdrop-blur-sm transition hover:bg-black/40"
                      style={{ color: text }}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation()
                        commitColors(
                          colors.map((c, i) =>
                            i === index ? { ...c, locked: !c.locked } : c
                          )
                        )
                      }}
                    >
                      {color.locked ? (
                        <Lock className="size-3.5" />
                      ) : (
                        <Unlock className="size-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="relative mt-auto space-y-2">
                    <input
                      type="text"
                      value={isHexFocused ? editDraft : color.hex}
                      aria-label={`Hex for color ${index + 1}`}
                      title="Edit hex - double-click for color picker"
                      spellCheck={false}
                      autoComplete="off"
                      className="w-[7.25rem] cursor-text border-0 bg-transparent p-0 font-mono text-sm font-semibold tracking-wide outline-none ring-0 focus:underline"
                      style={{ color: text, caretColor: text }}
                      onPointerDown={(e) => e.stopPropagation()}
                      onFocus={(e) => {
                        dispatch({
                          type: 'beginHexEdit',
                          index,
                          draft: color.hex
                        })
                        e.target.select()
                      }}
                      onChange={(e) => {
                        const v = e.target.value
                        dispatch({ type: 'setEditDraft', draft: v })
                        setSwatchHex(index, v, false)
                      }}
                      onBlur={() => {
                        const raw = editDraft.trim()
                        const rgb = hexToRgb(
                          raw.startsWith('#') ? raw : `#${raw}`
                        )
                        if (rgb) {
                          setSwatchHex(
                            index,
                            rgbToHex(rgb.r, rgb.g, rgb.b),
                            false
                          )
                        }
                        dispatch({ type: 'endHexEdit' })
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation()
                        if (e.key === 'Enter') {
                          e.currentTarget.blur()
                        }
                        if (e.key === 'Escape') {
                          dispatch({ type: 'setEditDraft', draft: color.hex })
                          dispatch({ type: 'endHexEdit' })
                          e.currentTarget.blur()
                        }
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        dispatch({
                          type: 'openPicker',
                          index,
                          draft: color.hex
                        })
                      }}
                    />
                    <button
                      type="button"
                      className="block text-[11px] font-medium uppercase tracking-wide opacity-80 hover:opacity-100"
                      style={{ color: text }}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopy(color.hex, `swatch-${index}`)
                      }}
                    >
                      {copied === `swatch-${index}` ? 'Copied' : 'Copy'}
                    </button>

                    {isPickerOpen && (
                      <div
                        ref={editPanelRef}
                        className={`absolute bottom-full left-0 z-40 mb-2 w-[200px] ${pickerShellClass}`}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <HexColorPicker
                          color={color.hex}
                          onChange={(hex) => {
                            dispatch({
                              type: 'setEditDraft',
                              draft: hex.toUpperCase()
                            })
                            setSwatchHex(index, hex, false)
                          }}
                        />
                      </div>
                    )}
                  </div>
                </Reorder.Item>
              )
            })}
          </AnimatePresence>
        </Reorder.Group>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={toolResultPanelClass}>
          <div className={toolResultHeaderRowClass}>
            <h3 className={toolSectionTitleClass}>Shade ramp</h3>
            <span className={toolHintMetaClass}>Selected {selectedHex}</span>
          </div>
          <div className="flex h-14 overflow-hidden rounded-lg border border-white/10">
            {ramp.map((hex, i) => (
              <button
                key={`${hex}-${i}`}
                type="button"
                title={hex}
                className="flex-1 transition hover:opacity-90"
                style={{ backgroundColor: hex }}
                onClick={() => handleCopy(hex, `ramp-${i}`)}
              />
            ))}
          </div>
          <p className={`mt-2 ${toolHintMetaClass}`}>Click a step to copy</p>
        </div>

        <div className={toolResultPanelClass}>
          <div className={toolResultHeaderRowClass}>
            <h3 className={toolSectionTitleClass}>Color blindness</h3>
          </div>
          <ToolChipRow>
            {BLINDNESS_MODES.map((m) => (
              <ToolChipButton
                key={m.id}
                active={blindness === m.id}
                onClick={() =>
                  dispatch({ type: 'setBlindness', blindness: m.id })
                }
              >
                {m.label}
              </ToolChipButton>
            ))}
          </ToolChipRow>
          <p className={`mt-3 ${toolHintMetaClass}`}>
            Preview only - stored palette hex values stay unchanged.
          </p>
        </div>
      </div>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h3 className={toolSectionTitleClass}>Contrast (adjacent)</h3>
        </div>
        {adjacentPairs.length === 0 ? (
          <p className={toolEmptyHintClass}>Need at least two colors.</p>
        ) : (
          <ul className="space-y-2">
            {adjacentPairs.map((pair, i) => (
              <li
                key={`${pair.a}-${pair.b}-${i}`}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-neutral-900/50 px-3 py-2 text-sm"
              >
                <span
                  className="inline-block size-5 rounded border border-white/20"
                  style={{ backgroundColor: pair.a }}
                />
                <span className="font-mono text-xs text-neutral-300">
                  {pair.a}
                </span>
                <span className="text-neutral-500">↔</span>
                <span
                  className="inline-block size-5 rounded border border-white/20"
                  style={{ backgroundColor: pair.b }}
                />
                <span className="font-mono text-xs text-neutral-300">
                  {pair.b}
                </span>
                <span className="ml-auto font-mono text-xs text-neutral-200">
                  {pair.ratio.toFixed(2)}:1
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    pair.level === 'AAA'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : pair.level === 'AA'
                        ? 'bg-sky-500/20 text-sky-300'
                        : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {pair.level}
                </span>
              </li>
            ))}
          </ul>
        )}
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
              onClick={() =>
                dispatch({ type: 'setExportFormat', format: f.id })
              }
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

const ColorPalette = () => (
  <Suspense
    fallback={
      <ToolLayout title="Color palette generator">
        <p className={toolEmptyHintClass}>Loading palette…</p>
      </ToolLayout>
    }
  >
    <ColorPaletteInner />
  </Suspense>
)

export default ColorPalette
