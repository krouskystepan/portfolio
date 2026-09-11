import type { MouseEvent, ReactNode } from 'react'

export const PrimaryButton = ({
  onClick,
  disabled,
  children
}: {
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-8 items-center rounded-md px-3 text-xs font-medium transition ${
        disabled
          ? 'cursor-not-allowed bg-neutral-800 text-neutral-500 opacity-60'
          : 'bg-custom_blue text-white hover:opacity-90'
      }`}
    >
      {children}
    </button>
  )
}

function secondaryButtonClass(disabled?: boolean) {
  return `inline-flex h-8 shrink-0 items-center justify-center rounded-md px-3 text-xs font-medium transition ${
    disabled
      ? 'cursor-not-allowed bg-neutral-800 text-neutral-500 opacity-60'
      : 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700'
  }`
}

export const SecondaryButton = ({
  onClick,
  disabled,
  children
}: {
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={secondaryButtonClass(disabled)}
    >
      {children}
    </button>
  )
}

export const ClearButton = ({
  onClick,
  children
}: {
  onClick: () => void
  children: ReactNode
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center rounded-md bg-red-800 px-3 text-xs font-medium text-white transition hover:bg-red-700 active:scale-95"
    >
      {children}
    </button>
  )
}

export const RemoveButton = ({
  onClick,
  disabled,
  children = 'Remove',
  title,
  className = '',
  'aria-label': ariaLabel
}: {
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  children?: ReactNode
  title?: string
  className?: string
  'aria-label'?: string
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={`inline-flex h-8 shrink-0 items-center justify-center rounded-md px-3 text-xs font-medium transition ${
        disabled
          ? 'cursor-not-allowed text-red-400/40'
          : 'text-red-400/90 hover:bg-red-950/50 hover:text-red-300'
      } ${className}`}
    >
      {children}
    </button>
  )
}
