'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smile } from 'lucide-react'

type CountdownTarget = Date | string | number

interface CountdownProps {
  target?: CountdownTarget
  title?: string
  serverNow: number
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
  <motion.div
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col items-center"
  >
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
  </motion.div>
)

const Smiles = () => {
  const smiles = [0, 1]
  const delayStep = 2.5

  return (
    <div className="flex items-center justify-center gap-6">
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

const Countdown = ({
  target,
  title,
  onComplete,
  serverNow,
}: CountdownProps) => {
  const targetDate = useMemo(() => toDate(target), [target])

  // 1) Fix the relationship between client clock and server clock once.
  //    If the client is wrong by +3 min and the server is your truth,
  //    this offset corrects the client to match the server.
  const [offset, setOffset] = useState<number>(() => serverNow - Date.now())

  // 2) Render "now" from the live client clock + that fixed offset.
  //    This avoids drift even if setInterval ticks late or the tab sleeps.
  const [now, setNow] = useState<number>(Date.now() + offset)

  useEffect(() => {
    const id = setInterval(() => {
      // Recompute from the real-time client clock each tick
      setNow(Date.now() + offset)
    }, 1000)
    return () => clearInterval(id)
  }, [offset])

  useEffect(() => {
    const syncOffset = () => {
      // Recalculate offset if local clock likely changed
      const newOffset = serverNow - Date.now()
      setOffset(newOffset)
    }

    const visibilityHandler = () => {
      if (document.visibilityState === 'visible') syncOffset()
    }

    document.addEventListener('visibilitychange', visibilityHandler)
    const id = setInterval(syncOffset, 60_000) // re-sync every 1 min

    return () => {
      document.removeEventListener('visibilitychange', visibilityHandler)
      clearInterval(id)
    }
  }, [serverNow])

  const msRemaining = Math.max(0, targetDate.getTime() - now)
  const { days, hours, minutes, seconds } = getTimeParts(msRemaining)
  const isOver = msRemaining <= 0

  useEffect(() => {
    if (isOver) onComplete?.()
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
        <>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { value: pad2(days), label: days === 1 ? 'day' : 'days' },
              { value: pad2(hours), label: 'hours' },
              { value: pad2(minutes), label: 'minutes' },
              { value: pad2(seconds), label: 'seconds' },
            ].map((item, index) => (
              <Digit key={index} value={item.value} label={item.label} />
            ))}
          </div>
          <motion.div
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="mt-3 text-xs text-neutral-400"
          >
            Server (UTC) time:&nbsp;
            <span className="text-white">{new Date(now).toUTCString()}</span>
          </motion.div>
        </>
      )}
    </div>
  )
}

export default Countdown
