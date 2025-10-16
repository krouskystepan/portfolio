'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smile } from 'lucide-react'

const CountdownPage = () => {
  const targetDate = useMemo(() => new Date('2025-10-31T23:00:00Z'), [])

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <Countdown target={targetDate} title="" />
    </div>
  )
}

type CountdownTarget = Date | string | number

interface CountdownProps {
  target?: CountdownTarget
  title?: string
  onComplete?: () => void
}

function toDate(target?: CountdownTarget): Date {
  if (!target) return new Date(Date.now() + 10 * 60 * 1000)
  if (target instanceof Date) return target
  const d = new Date(target)
  return isNaN(d.getTime()) ? new Date() : d
}

function clampNonNegative(n: number): number {
  return n < 0 ? 0 : n
}

function getTimeParts(msRemaining: number) {
  const totalSeconds = Math.floor(clampNonNegative(msRemaining) / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds }
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0')
}

const Digit = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="relative aspect-[5/3] w-24 overflow-hidden rounded-xl border border-neutral-600">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center text-4xl font-semibold text-white"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
    <div className="mt-2 text-xs uppercase text-gray-400">{label}</div>
  </div>
)

export function Smiles() {
  const smiles = [0, 1] // three instances
  const delayStep = 2.5 // seconds between starts

  return (
    <div className="flex items-center justify-center gap-4">
      {smiles.map((i) => (
        <motion.div
          key={i}
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, 360] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear',
            delay: i * delayStep,
          }}
          className="select-none text-6xl font-light text-neutral-300"
        >
          <Smile size={82} />
        </motion.div>
      ))}
    </div>
  )
}

function Countdown({ target, title, onComplete }: CountdownProps) {
  const targetDate = useMemo(() => toDate(target), [target])
  const [now, setNow] = useState<number>(() => Date.now())

  const msRemaining = Math.max(0, targetDate.getTime() - now)
  const { days, hours, minutes, seconds } = getTimeParts(msRemaining)

  console.log(msRemaining)
  const isOver = msRemaining <= 0

  useEffect(() => {
    if (isOver) {
      onComplete?.()
      return
    }
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [isOver, onComplete])

  return (
    <div className="flex flex-col items-center justify-center text-white">
      {title && (
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center text-4xl font-bold"
        >
          {title}
        </motion.h1>
      )}

      {isOver ? (
        <Smiles />
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {days > 0 && (
              <Digit
                key={`d-${days}`}
                value={String(days)}
                label={days === 1 ? 'day' : 'days'}
              />
            )}
          </AnimatePresence>
          <Digit value={pad2(hours)} label={hours === 1 ? 'hour' : 'hours'} />
          <Digit
            value={pad2(minutes)}
            label={minutes === 1 ? 'minute' : 'minutes'}
          />
          <Digit
            value={pad2(seconds)}
            label={seconds === 1 ? 'second' : 'seconds'}
          />
        </div>
      )}
    </div>
  )
}

export default CountdownPage
