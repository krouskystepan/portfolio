export const PrimaryButton = ({
  onClick,
  disabled,
  children
}: {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
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
  children: React.ReactNode
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
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
  children: React.ReactNode
}) => {
  return (
    <button
      onClick={onClick}
      className="rounded-lg bg-red-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
    >
      {children}
    </button>
  )
}
