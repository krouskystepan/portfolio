'use client'

import { Component, type ReactNode, useMemo, useRef, useState } from 'react'
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  ClearButton,
  SecondaryButton
} from '@/components/tools/_shared/ToolButtons'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import {
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolHintMetaClass,
  toolIntroTextClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolSegmentBarClass,
  toolToolbarBetweenClass,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'

type EccLevel = 'L' | 'M' | 'Q' | 'H'

const ECC_LEVELS: EccLevel[] = ['L', 'M', 'Q', 'H']
const SIZE_PRESETS = [128, 256, 384, 512] as const
type QrSize = (typeof SIZE_PRESETS)[number]

/** Version 40 byte-mode capacity (ISO/IEC 18004). */
const MAX_BYTES: Record<EccLevel, number> = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273
}

const DEFAULT_SIZE: QrSize = 256
const MARGIN_MODULES = 4
const MIN_CONTRAST = 3

function OptionPills<T extends string | number>({
  value,
  options,
  onChange,
  ariaLabel,
  format = String
}: {
  value: T
  options: readonly T[]
  onChange: (next: T) => void
  ariaLabel: string
  format?: (option: T) => string
}) {
  return (
    <div
      className={`${toolSegmentBarClass} grid h-9 w-fit shrink-0 items-stretch gap-0.5 p-0.5`}
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`
      }}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <button
          key={String(option)}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-md px-2.5 text-center text-xs font-medium leading-none transition ${
            value === option
              ? 'bg-custom_blue text-white'
              : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
          }`}
        >
          {format(option)}
        </button>
      ))}
    </div>
  )
}

class QrEncodeBoundary extends Component<
  { resetKey: string; children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidUpdate(prevProps: { resetKey: string }) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className={toolErrorBoxClass}>
          <strong>Error:</strong> This text is too long to encode as a QR code.
          Shorten it or lower the error-correction level.
        </div>
      )
    }
    return <div className="contents">{this.props.children}</div>
  }
}

function srgbChannel(value: number) {
  const c = value / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(hex: string) {
  const h = hex.replace('#', '')
  if (h.length !== 6) return null
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  if ([r, g, b].some((n) => Number.isNaN(n))) return null
  return (
    0.2126 * srgbChannel(r) + 0.7152 * srgbChannel(g) + 0.0722 * srgbChannel(b)
  )
}

function contrastRatio(a: string, b: string) {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  if (la == null || lb == null) return null
  const lighter = Math.max(la, lb)
  const darker = Math.min(la, lb)
  return (lighter + 0.05) / (darker + 0.05)
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function ColorField({
  id,
  label,
  value,
  onChange
}: {
  id: string
  label: string
  value: string
  onChange: (next: string) => void
}) {
  return (
    <label
      htmlFor={id}
      className="flex h-9 cursor-pointer items-center justify-center gap-1.5 px-2.5"
    >
      <span className="sr-only">{label}</span>
      <input
        id={id}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="tool-color-swatch size-5 shrink-0 rounded ring-1 ring-white/15"
        title={label}
      />
      <span className="font-mono text-[11px] tabular-nums text-neutral-400">
        {value}
      </span>
    </label>
  )
}

const QrCodeGenerator = () => {
  const [input, setInput] = useState('')
  const [ecc, setEcc] = useState<EccLevel>('M')
  const [size, setSize] = useState<QrSize>(DEFAULT_SIZE)
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')

  const svgRef = useRef<SVGSVGElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const payload = input
  const byteLength = useMemo(
    () => new TextEncoder().encode(payload).length,
    [payload]
  )
  const charLength = useMemo(() => Array.from(payload).length, [payload])
  const overCapacity = byteLength > MAX_BYTES[ecc]
  const contrast = contrastRatio(fgColor, bgColor)
  const poorContrast = contrast != null && contrast < MIN_CONTRAST
  const canRender = payload.length > 0 && !overCapacity

  const downloadSvg = () => {
    const svg = svgRef.current
    if (!svg) return
    const clone = svg.cloneNode(true) as SVGSVGElement
    if (!clone.getAttribute('xmlns')) {
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    }
    const source = new XMLSerializer().serializeToString(clone)
    triggerDownload(
      new Blob([source], { type: 'image/svg+xml;charset=utf-8' }),
      'qr-code.svg'
    )
  }

  const downloadPng = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (!blob) return
      triggerDownload(blob, 'qr-code.png')
    }, 'image/png')
  }

  return (
    <ToolLayout title="QR code generator">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Encoded in your browser - nothing is uploaded. Paste a URL or any
            text and the code updates as you type.
          </p>
        }
      >
        <TextAreaWithLineNumbers
          value={input}
          setValue={setInput}
          placeholder="https://example.com or any text…"
        />

        <div className={toolToolbarBetweenClass}>
          <div className="flex flex-wrap items-center gap-3">
            <OptionPills
              value={ecc}
              options={ECC_LEVELS}
              onChange={setEcc}
              ariaLabel="Error correction"
            />

            <div className="grid h-9 w-fit shrink-0 grid-cols-2 divide-x divide-white/10 overflow-hidden rounded-lg border border-white/10 bg-neutral-900/80">
              <ColorField
                id="qr-fg"
                label="Foreground"
                value={fgColor}
                onChange={setFgColor}
              />
              <ColorField
                id="qr-bg"
                label="Background"
                value={bgColor}
                onChange={setBgColor}
              />
            </div>

            <OptionPills
              value={size}
              options={SIZE_PRESETS}
              onChange={setSize}
              ariaLabel="Size"
              format={(px) => `${px}`}
            />
          </div>

          <ClearButton onClick={() => setInput('')}>Clear</ClearButton>
        </div>

        {poorContrast ? (
          <p className={`${toolHintMetaClass} mt-3 text-amber-300/90`}>
            Low contrast - scanners may fail. Prefer a dark foreground on a
            light background.
          </p>
        ) : null}
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>QR code</h2>
          {canRender ? (
            <div className="flex flex-wrap justify-end gap-2">
              <SecondaryButton onClick={downloadPng}>
                Download PNG
              </SecondaryButton>
              <SecondaryButton onClick={downloadSvg}>
                Download SVG
              </SecondaryButton>
            </div>
          ) : null}
        </div>

        {payload.length === 0 ? (
          <p className={toolEmptyHintClass}>
            Your QR code will appear here as you type.
          </p>
        ) : overCapacity ? (
          <div className={toolErrorBoxClass}>
            <strong>Error:</strong> {byteLength} bytes exceeds the maximum of{' '}
            {MAX_BYTES[ecc]} bytes for error-correction level {ecc}. Shorten the
            text or choose a lower level (L has the most capacity).
          </div>
        ) : (
          <QrEncodeBoundary resetKey={`${payload}:${ecc}`}>
            <p className={`${toolHintMetaClass} mb-4`}>
              {charLength} {charLength === 1 ? 'character' : 'characters'} ·{' '}
              {byteLength} {byteLength === 1 ? 'byte' : 'bytes'}
            </p>
            <div className="flex justify-center">
              <div
                className="overflow-hidden rounded-2xl ring-1 ring-white/15"
                style={{ backgroundColor: bgColor, width: size, height: size }}
              >
                <QRCodeSVG
                  ref={svgRef}
                  value={payload}
                  size={size}
                  level={ecc}
                  bgColor={bgColor}
                  fgColor={fgColor}
                  marginSize={MARGIN_MODULES}
                  title="Generated QR code"
                  className="block"
                />
              </div>
            </div>
            <QRCodeCanvas
              ref={canvasRef}
              value={payload}
              size={size}
              level={ecc}
              bgColor={bgColor}
              fgColor={fgColor}
              marginSize={MARGIN_MODULES}
              style={{ display: 'none' }}
              aria-hidden
            />
          </QrEncodeBoundary>
        )}
      </div>
    </ToolLayout>
  )
}

export default QrCodeGenerator
