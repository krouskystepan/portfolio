import type { ReactNode } from 'react'

/** Primary dashed card (input / controls) */
export const toolPanelClass =
  'flex flex-col rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-6 backdrop-blur-sm'

/** Secondary dashed card (output / results) */
export const toolResultPanelClass =
  'overflow-auto rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-6 backdrop-blur-sm text-neutral-100'

/** Section title inside a panel (e.g. Result, Text A) */
export const toolSectionTitleClass = 'text-lg font-semibold text-white'

/** Row above result body */
export const toolResultHeaderRowClass =
  'mb-3 flex items-center justify-between gap-3'

/** Helper / description copy at top of a panel */
export const toolIntroTextClass =
  'mb-4 text-sm leading-relaxed text-neutral-400 [&_code]:rounded-md [&_code]:border [&_code]:border-white/10 [&_code]:bg-neutral-900/80 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_code]:text-neutral-200'

/** Warning-style notice (e.g. JWT) */
export const toolWarningIntroClass =
  'mb-4 rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-100/95'

export const toolInputClass =
  'ring-custom_blue/40 w-full rounded-lg border border-white/10 bg-neutral-900/80 px-3 py-3 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:ring-2'

/** Compact input matching chip height (h-8) */
export const toolCompactInputClass =
  'ring-custom_blue/40 h-8 w-full rounded-md border border-white/10 bg-neutral-900/80 px-2.5 text-xs text-neutral-100 outline-none placeholder:text-neutral-500 focus:ring-1'

export const toolNumberInputClass =
  'ring-custom_blue/40 h-8 w-full max-w-[7rem] rounded-md border border-white/10 bg-neutral-900/80 px-2.5 text-xs text-neutral-100 outline-none focus:ring-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'

export const toolLabelClass = 'mb-2 block text-sm font-medium text-neutral-300'

export const toolErrorBoxClass =
  'rounded-lg border border-red-500/30 bg-red-500/10 p-4 font-mono text-sm text-red-400'

export const toolEmptyHintClass = 'text-sm text-neutral-400'

/** Monospace output block */
export const toolPreOutputClass =
  'min-h-12 w-full overflow-auto whitespace-pre-wrap break-all rounded-lg border border-white/10 bg-neutral-900/50 p-3 font-mono text-sm leading-relaxed text-neutral-100'

/** Toolbar under textarea / inputs */
export const toolToolbarBetweenClass =
  'mt-4 flex flex-wrap items-center justify-between gap-3'

export const toolToolbarEndClass = 'mt-4 flex flex-wrap justify-end gap-3'

/** Primary row actions aligned end, grows to fill (pair with `toolToolbarBetweenClass`) */
export const toolFlexEndButtonsClass = 'flex flex-1 flex-wrap justify-end gap-3'

/** Checkbox row (UUID, diff, etc.) */
export const toolCheckboxLabelClass =
  'flex cursor-pointer items-center gap-2 text-sm text-neutral-300'

export type ToolChipTone = 'default' | 'accent'

/** Canonical chip style - amber for presets, blue for modes/toggles */
export function toolChipClass(active: boolean, tone: ToolChipTone = 'default') {
  if (active && tone === 'accent') {
    return 'inline-flex h-8 items-center justify-center rounded-md bg-amber-600/90 px-2.5 text-xs font-medium text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60'
  }
  return `inline-flex h-8 items-center justify-center rounded-md px-2.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
    active
      ? 'bg-custom_blue text-white'
      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
  }`
}

/** @deprecated Prefer ToolChipButton / ToolChipRow for modes and presets */
export function toolSegmentTabClass(active: boolean) {
  return toolChipClass(active)
}

/** @deprecated Prefer ToolChipRow */
export const toolSegmentBarClass = 'flex flex-wrap gap-1.5'

/** @deprecated Prefer ToolChipButton tone="default" (idle) */
export const toolSoftButtonClass = toolChipClass(false)

/** @deprecated Prefer ToolChipButton tone="accent" when active */
export const toolAccentButtonClass =
  'inline-flex h-8 items-center justify-center rounded-md bg-amber-600/90 px-2.5 text-xs font-medium text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60'

/** Row with label + value + optional copy (UUID list, timestamp, color) */
export const toolValueRowClass =
  'flex flex-row items-center gap-3 rounded-lg border border-white/10 bg-neutral-900/50 p-3'

/** Dense card (case variants, match list items) */
export const toolMediumCardClass =
  'flex flex-col gap-2 rounded-lg border border-white/10 bg-neutral-900/50 p-4'

/** Single-line list row (regex matches) */
export const toolListItemClass =
  'rounded-lg border border-white/10 bg-neutral-900/50 px-3 py-2 font-mono text-sm text-neutral-200'

/** Muted hint under controls */
export const toolHintMetaClass = 'text-xs leading-relaxed text-neutral-500'

/** react-colorful shell - keep the spectrum a square, not a thin bar. */
export const toolPickerShellClass =
  'rounded-xl border border-white/10 bg-neutral-900/40 p-4 ' +
  '[&_.react-colorful]:!h-[220px] [&_.react-colorful]:!w-full ' +
  '[&_.react-colorful__saturation]:!mb-3 [&_.react-colorful__saturation]:!rounded-lg [&_.react-colorful__saturation]:!border-b-0 ' +
  '[&_.react-colorful__hue]:!h-3 [&_.react-colorful__hue]:!rounded-lg ' +
  '[&_.react-colorful__pointer]:!h-4 [&_.react-colorful__pointer]:!w-4 ' +
  '[&_.react-colorful__hue-pointer]:!h-3.5 [&_.react-colorful__hue-pointer]:!w-3.5'

type ToolChipButtonProps = {
  active: boolean
  onClick: () => void
  children: ReactNode
  title?: string
  className?: string
  tone?: ToolChipTone
  disabled?: boolean
  type?: 'button' | 'submit'
}

export function ToolChipButton({
  active,
  onClick,
  children,
  title,
  className = '',
  tone = 'default',
  disabled,
  type = 'button'
}: ToolChipButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`${toolChipClass(active, tone)} ${className}`}
    >
      {children}
    </button>
  )
}

export function ToolChipRow({
  children,
  className = ''
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`flex flex-wrap gap-1.5 ${className}`}>{children}</div>
}

type ToolCopyButtonProps = {
  copied: boolean
  onClick: () => void
  idleLabel?: string
  copiedLabel?: string
  disabled?: boolean
}

export function ToolCopyButton({
  copied,
  onClick,
  idleLabel = 'Copy',
  copiedLabel = 'Copied!',
  disabled
}: ToolCopyButtonProps) {
  const isDisabled = Boolean(disabled) || copied
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`inline-flex h-8 shrink-0 items-center rounded-md px-3 text-xs font-medium transition active:scale-95 ${
        copied
          ? 'cursor-default bg-neutral-900 text-custom_blue'
          : 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50'
      }`}
    >
      {copied ? copiedLabel : idleLabel}
    </button>
  )
}

/** Wraps optional intro + children inside the standard input panel */
export function ToolInputPanel({
  intro,
  children
}: {
  intro?: ReactNode
  children: ReactNode
}) {
  return (
    <div className={toolPanelClass}>
      {intro}
      {children}
    </div>
  )
}
