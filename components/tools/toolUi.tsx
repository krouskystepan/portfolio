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

export const toolNumberInputClass =
  'ring-custom_blue/40 h-10 w-full max-w-[7rem] rounded-lg border border-white/10 bg-neutral-900/80 px-3 text-sm text-neutral-100 outline-none focus:ring-2'

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

/** Segmented control pill (language / workbench tabs) */
export function toolSegmentTabClass(active: boolean) {
  return `rounded-lg px-3 py-2 text-center text-xs font-medium transition sm:text-sm ${
    active
      ? 'bg-custom_blue text-white shadow-sm'
      : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
  }`
}

export const toolSegmentBarClass =
  'flex flex-wrap gap-2 rounded-xl border border-white/10 bg-neutral-900/50 p-1'

/** Neutral secondary action (e.g. “Now”) */
export const toolSoftButtonClass =
  'rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-100 transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60'

/** Amber helper action (+1 hour, fix JSON) */
export const toolAccentButtonClass =
  'rounded-lg bg-amber-600/90 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60'

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
export const toolHintMetaClass =
  'text-xs leading-relaxed text-neutral-500'

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
      className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition active:scale-95 ${
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
