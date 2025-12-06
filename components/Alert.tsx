import { Info, OctagonAlert, StickyNote, TriangleAlert } from 'lucide-react'
import React from 'react'

type TAlert = {
  title: string
  description: string
  type: 'info' | 'warning' | 'error' | 'note'
}

const alertStyles = {
  info: {
    border: 'border-blue-700',
    bg: 'bg-blue-700/25',
    iconBg: 'bg-blue-700',
    icon: <Info size={20} />,
    text: 'text-blue-100',
  },
  warning: {
    border: 'border-amber-500',
    bg: 'bg-amber-500/20',
    iconBg: 'bg-amber-500',
    icon: <TriangleAlert size={20} />,
    text: 'text-amber-100',
  },
  error: {
    border: 'border-red-600',
    bg: 'bg-red-600/25',
    iconBg: 'bg-red-600',
    icon: <OctagonAlert size={20} />,
    text: 'text-red-100',
  },
  note: {
    border: 'border-neutral-700',
    bg: 'bg-neutral-800/40',
    iconBg: 'bg-neutral-700',
    icon: <StickyNote size={20} />,
    text: 'text-neutral-300',
  },
} as const

const Alert = ({ title, description, type }: TAlert) => {
  const styles = alertStyles[type]

  return (
    <div
      className={`flex w-full rounded-lg border-l-[6px] p-5 ${styles.border} ${styles.bg}`}
    >
      <div
        className={`mr-4 flex size-8 items-center justify-center rounded-md ${styles.iconBg}`}
      >
        {styles.icon}
      </div>

      <div className={`w-full ${styles.text}`}>
        <h5 className="mb-1 text-base font-semibold">{title}</h5>
        <p className="text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

export default Alert
