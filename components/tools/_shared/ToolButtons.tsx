import type { ReactNode } from 'react'

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
      className={`inline-flex h-8 items-center rounded-md px-3 text-xs font-medium transition ${
        disabled
          ? 'cursor-not-allowed bg-neutral-800 text-neutral-500 opacity-60'
          : 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700'
      }`}
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
