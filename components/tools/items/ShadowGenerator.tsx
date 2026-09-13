'use client'

import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode
} from 'react'
import { createPortal } from 'react-dom'
import { HexAlphaColorPicker } from 'react-colorful'
import { Plus } from 'lucide-react'
import { useAchievementContext } from '@/context/AchievementContext'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
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
  ToolChipButton,
  ToolChipRow,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { hexToRgb, rgbToHex } from '@/utils/colorUtils'
import {
  EXPORT_FORMATS,
  MAX_BLUR,
  MAX_OFFSET,
  MAX_SPREAD,
  MIN_BLUR,
  MIN_OFFSET,
  MIN_SPREAD,
  SHADOW_KINDS,
  formatShadowColor,
  presetMatches,
  presetsForKind,
  shadowCssValue,
  toHexAlpha,
  type ShadowKind,
  type ShadowPreset,
  type ShadowSurface
} from '@/utils/shadowGenerator'
import { useShadowGenerator } from '@/hooks/tools/useShadowGenerator'

function ControlRow({
  label,
  children
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="w-24 shrink-0 text-sm font-medium text-neutral-300">
        {label}
      </span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {children}
      </div>
    </div>
  )
}

const pickerShellClass =
  `${toolPickerShellClass} ` +
  '[&_.react-colorful__alpha]:!mt-3 [&_.react-colorful__alpha]:!h-3 [&_.react-colorful__alpha]:!rounded-lg ' +
  '[&_.react-colorful__alpha-pointer]:!h-3.5 [&_.react-colorful__alpha-pointer]:!w-3.5'

const PICKER_W = 260
const PICKER_H = 320

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

const checkerboardClass =
  'bg-neutral-800 bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] bg-[linear-gradient(45deg,#2a2a2a_25%,transparent_25%),linear-gradient(-45deg,#2a2a2a_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#2a2a2a_75%),linear-gradient(-45deg,transparent_75%,#2a2a2a_75%)]'

function LayerColorSwatch({
  hex,
  alpha,
  label,
  open,
  onToggle,
  onClose,
  onChange
}: {
  hex: string
  alpha: number
  label: string
  open: boolean
  onToggle: () => void
  onClose: () => void
  onChange: (hex8: string) => void
}) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const hex8 = toHexAlpha(hex, alpha)

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
        className={`size-8 shrink-0 overflow-hidden rounded-md border border-white/20 shadow-inner ${checkerboardClass}`}
        onClick={onToggle}
      >
        <span
          className="block size-full"
          style={{ backgroundColor: formatShadowColor(hex, alpha) }}
        />
      </button>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            className={`fixed z-[200] w-[260px] shadow-2xl ${pickerShellClass} !bg-neutral-900`}
            style={{ top: coords.top, left: coords.left }}
          >
            <HexAlphaColorPicker color={hex8} onChange={onChange} />
          </div>,
          document.body
        )}
    </>
  )
}

function PresetThumb({ preset }: { preset: ShadowPreset }) {
  const css = shadowCssValue(preset.kind, preset.layers)
  if (preset.kind === 'box') {
    return (
      <span
        className="size-6 shrink-0 rounded-md bg-white"
        style={{ boxShadow: css }}
        aria-hidden
      />
    )
  }
  return (
    <span
      className="w-7 shrink-0 text-center text-sm font-semibold leading-6 text-white"
      style={{ textShadow: css }}
      aria-hidden
    >
      Aa
    </span>
  )
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
  suffix = 'px'
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (n: number) => void
  suffix?: string
}) {
  return (
    <label className="flex items-center gap-1.5">
      <span className={toolHintMetaClass}>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        aria-label={label}
        onChange={(e) => {
          const n = Number.parseInt(e.target.value, 10)
          if (!Number.isFinite(n)) return
          onChange(n)
        }}
        className={`${toolNumberInputClass} !w-[3.75rem] max-w-[3.75rem]`}
      />
      {suffix ? <span className={toolHintMetaClass}>{suffix}</span> : null}
    </label>
  )
}

function SampleHeading({
  cssValue,
  light,
  text,
  onChange
}: {
  cssValue: string
  light: boolean
  text: string
  onChange: (value: string) => void
}) {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || document.activeElement === el) return
    if ((el.textContent ?? '') !== text) el.textContent = text
  }, [text])

  return (
    <h2
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label="Sample heading"
      spellCheck={false}
      className={`max-w-xl overflow-visible bg-transparent text-center text-4xl font-bold leading-normal tracking-tight outline-none sm:text-5xl ${
        light ? 'text-neutral-900' : 'text-white'
      }`}
      style={{ textShadow: cssValue }}
      onInput={(e) => onChange(e.currentTarget.textContent ?? '')}
    />
  )
}

function ShadowPreview({
  kind,
  cssValue,
  surface,
  checker,
  sampleText,
  onSurface,
  onChecker,
  onSampleText
}: {
  kind: ShadowKind
  cssValue: string
  surface: ShadowSurface
  checker: boolean
  sampleText: string
  onSurface: (surface: ShadowSurface) => void
  onChecker: (checker: boolean) => void
  onSampleText: (text: string) => void
}) {
  const light = surface === 'light'

  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={toolHintMetaClass}>
          {kind === 'box'
            ? 'Preview'
            : 'Preview · click the heading to edit'}
        </p>
        <ToolChipRow>
          <ToolChipButton
            active={surface === 'light'}
            onClick={() => onSurface('light')}
          >
            Light
          </ToolChipButton>
          <ToolChipButton
            active={surface === 'dark'}
            onClick={() => onSurface('dark')}
          >
            Dark
          </ToolChipButton>
          {kind === 'box' ? (
            <ToolChipButton
              active={checker}
              onClick={() => onChecker(!checker)}
            >
              Checker
            </ToolChipButton>
          ) : null}
        </ToolChipRow>
      </div>
      <div
        className={`mt-3 grid min-h-56 place-items-center overflow-visible rounded-xl px-10 py-16 sm:min-h-64 sm:px-14 sm:py-20 ${
          checker ? checkerboardClass : ''
        }`}
        style={
          checker
            ? undefined
            : { backgroundColor: light ? '#f4f4f5' : '#171717' }
        }
      >
        {kind === 'box' ? (
          <div
            className={`h-24 w-40 rounded-2xl sm:h-28 sm:w-48 ${
              light ? 'bg-white' : 'bg-neutral-800'
            }`}
            style={{ boxShadow: cssValue }}
          />
        ) : (
          <SampleHeading
            cssValue={cssValue}
            light={light}
            text={sampleText}
            onChange={onSampleText}
          />
        )}
      </div>
    </div>
  )
}

function ShadowGeneratorInner() {
  const { unlockAchievement } = useAchievementContext()
  const {
    kind,
    exportFormat,
    surface,
    checker,
    sampleText,
    layers,
    hexFocusId,
    editDraft,
    copied,
    flash,
    cssValue,
    exportText,
    setKind,
    setExportFormat,
    setSurface,
    setChecker,
    setSampleText,
    setEditDraft,
    handleRandomize,
    handleApplyPreset,
    handleAddLayer,
    handleRemoveLayer,
    handleLayerHex,
    handleLayerColor,
    handleLayerOffset,
    handleLayerBlur,
    handleLayerSpread,
    handleLayerAlphaPct,
    handleLayerInset,
    beginHexEdit,
    endHexEdit,
    MIN_LAYERS,
    MAX_LAYERS
  } = useShadowGenerator()

  const [pickerId, setPickerId] = useState<string | null>(null)

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    flash(key)
    unlockAchievement('clipboard-master')
  }

  const presets = presetsForKind(kind)

  return (
    <ToolLayout title="CSS shadow generator">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Build <code>box-shadow</code> and <code>text-shadow</code> with
            layers, inset, and alpha. Presets sketch a look the way blob shapes
            do - then tune offsets and color. The URL stays in sync so you can
            share the result.
          </p>
        }
      >
        <div className="space-y-4">
          <ControlRow label="Kind">
            <ToolChipRow>
              {SHADOW_KINDS.map((k) => (
                <ToolChipButton
                  key={k.id}
                  active={kind === k.id}
                  onClick={() => setKind(k.id)}
                >
                  {k.label}
                </ToolChipButton>
              ))}
            </ToolChipRow>
            <div className="ml-auto">
              <SecondaryButton onClick={handleRandomize}>
                Randomize
              </SecondaryButton>
            </div>
          </ControlRow>

          <ControlRow label="Preset">
            {presets.map((preset) => {
              const active = presetMatches(preset, kind, layers)
              return (
                <button
                  key={preset.id}
                  type="button"
                  title={preset.hint}
                  onClick={() => handleApplyPreset(preset)}
                  className={`flex h-10 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-neutral-100 transition ${
                    active
                      ? 'bg-white/10 ring-2 ring-white/70'
                      : 'ring-1 ring-white/15 hover:ring-white/35'
                  }`}
                >
                  <PresetThumb preset={preset} />
                  {preset.label}
                </button>
              )
            })}
          </ControlRow>
        </div>
      </ToolInputPanel>

      <ShadowPreview
        kind={kind}
        cssValue={cssValue}
        surface={surface}
        checker={checker}
        sampleText={sampleText}
        onSurface={setSurface}
        onChecker={setChecker}
        onSampleText={setSampleText}
      />

      <div className={toolPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <div className="min-w-0">
            <h3 className={toolSectionTitleClass}>Layers</h3>
            <p className={toolHintMetaClass}>
              {kind === 'text'
                ? 'Spread and inset stay in state but are ignored for text-shadow.'
                : `Up to ${MAX_LAYERS} layers. Spread 0 is omitted from CSS.`}
            </p>
          </div>
          <SecondaryButton
            onClick={handleAddLayer}
            disabled={layers.length >= MAX_LAYERS}
          >
            <span className="inline-flex items-center gap-1.5">
              <Plus className="size-3.5" strokeWidth={2.5} />
              Add layer
            </span>
          </SecondaryButton>
        </div>
        <ul className="space-y-2">
          {layers.map((layer, index) => {
            const isHexFocused = hexFocusId === layer.id
            const alphaPct = Math.round(layer.alpha * 100)
            return (
              <li
                key={layer.id}
                className="flex flex-col gap-3 rounded-lg border border-white/10 bg-neutral-900/50 p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <LayerColorSwatch
                    hex={layer.hex}
                    alpha={layer.alpha}
                    label={`Color for layer ${index + 1}`}
                    open={pickerId === layer.id}
                    onToggle={() =>
                      setPickerId((id) => (id === layer.id ? null : layer.id))
                    }
                    onClose={() => setPickerId(null)}
                    onChange={(hex8) => handleLayerColor(layer.id, hex8)}
                  />
                  <input
                    type="text"
                    value={isHexFocused ? editDraft : layer.hex}
                    aria-label={`Hex for layer ${index + 1}`}
                    title="Edit hex"
                    spellCheck={false}
                    autoComplete="off"
                    className={`${toolCompactInputClass} !w-[7.25rem] max-w-[7.25rem] shrink-0 font-mono tracking-wide`}
                    onFocus={(e) => {
                      beginHexEdit(layer.id, layer.hex)
                      e.target.select()
                    }}
                    onChange={(e) => {
                      const v = e.target.value
                      setEditDraft(v)
                      handleLayerHex(layer.id, v)
                    }}
                    onBlur={() => {
                      const raw = editDraft.trim()
                      const rgb = hexToRgb(
                        raw.startsWith('#') ? raw : `#${raw}`
                      )
                      if (rgb) {
                        handleLayerHex(
                          layer.id,
                          rgbToHex(rgb.r, rgb.g, rgb.b)
                        )
                      }
                      endHexEdit()
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.currentTarget.blur()
                      if (e.key === 'Escape') {
                        setEditDraft(layer.hex)
                        endHexEdit()
                        e.currentTarget.blur()
                      }
                    }}
                  />
                  <NumberField
                    label="Alpha"
                    value={alphaPct}
                    min={0}
                    max={100}
                    suffix="%"
                    onChange={(n) => handleLayerAlphaPct(layer.id, n)}
                  />
                  <div className="ml-auto">
                    <RemoveButton
                      title={
                        layers.length <= MIN_LAYERS
                          ? `Keep at least ${MIN_LAYERS} layer`
                          : 'Remove layer'
                      }
                      aria-label={`Remove layer ${index + 1}`}
                      disabled={layers.length <= MIN_LAYERS}
                      onClick={() => handleRemoveLayer(layer.id)}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <NumberField
                    label="X"
                    value={layer.x}
                    min={MIN_OFFSET}
                    max={MAX_OFFSET}
                    onChange={(n) => handleLayerOffset(layer.id, 'x', n)}
                  />
                  <NumberField
                    label="Y"
                    value={layer.y}
                    min={MIN_OFFSET}
                    max={MAX_OFFSET}
                    onChange={(n) => handleLayerOffset(layer.id, 'y', n)}
                  />
                  <NumberField
                    label="Blur"
                    value={layer.blur}
                    min={MIN_BLUR}
                    max={MAX_BLUR}
                    onChange={(n) => handleLayerBlur(layer.id, n)}
                  />
                  {kind === 'box' ? (
                    <>
                      <NumberField
                        label="Spread"
                        value={layer.spread}
                        min={MIN_SPREAD}
                        max={MAX_SPREAD}
                        onChange={(n) => handleLayerSpread(layer.id, n)}
                      />
                      <label className={toolCheckboxLabelClass}>
                        <input
                          type="checkbox"
                          checked={layer.inset}
                          onChange={() =>
                            handleLayerInset(layer.id, !layer.inset)
                          }
                          className="size-4 accent-custom_blue"
                        />
                        Inset
                      </label>
                    </>
                  ) : null}
                </div>
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

const ShadowGenerator = () => (
  <Suspense
    fallback={
      <ToolLayout title="CSS shadow generator">
        <p className={toolEmptyHintClass}>Loading shadow…</p>
      </ToolLayout>
    }
  >
    <ShadowGeneratorInner />
  </Suspense>
)

export default ShadowGenerator
