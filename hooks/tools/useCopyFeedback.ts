'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_CLEAR_MS = 1500

/**
 * Ephemeral "Copied!" feedback with auto-clear.
 * - Single target: `flash()` then check `copied === true`
 * - Multiple targets: `flash('row-id')` then check `copied === 'row-id'`
 */
export function useCopyFeedback(clearMs = DEFAULT_CLEAR_MS) {
  const [copied, setCopied] = useState<string | true | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    setCopied(null)
  }, [])

  const flash = useCallback(
    (key: string | true = true) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setCopied(key)
      timerRef.current = setTimeout(() => {
        setCopied(null)
        timerRef.current = null
      }, clearMs)
    },
    [clearMs]
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return { copied, flash, clear }
}
