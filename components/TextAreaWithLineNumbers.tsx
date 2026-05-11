'use client'

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'

function getLineHeightPx(el: HTMLElement): number {
  const s = window.getComputedStyle(el)
  const lh = parseFloat(s.lineHeight)
  if (Number.isFinite(lh) && lh > 0) return lh
  const fs = parseFloat(s.fontSize) || 14
  return Math.round(fs * 1.25)
}

const TextAreaWithLineNumbers = ({
  value,
  setValue,
  placeholder,
  fillParent = false
}: {
  value: string
  setValue: React.Dispatch<React.SetStateAction<string>>
  placeholder?: string
  /** Stretch to parent height (e.g. paired Original / Modified columns). */
  fillParent?: boolean
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const mirrorRef = useRef<HTMLDivElement>(null)
  const lineNumberRef = useRef<HTMLDivElement>(null)
  const [lineHeights, setLineHeights] = useState<number[]>([21])
  const [lineHeightPx, setLineHeightPx] = useState(21)

  const recalcLines = useCallback(() => {
    const ta = textAreaRef.current
    const mirror = mirrorRef.current
    if (!ta || !mirror) return

    const lh = getLineHeightPx(ta)
    setLineHeightPx(lh)

    const wrapWidth = ta.clientWidth
    mirror.style.width = `${wrapWidth}px`

    const logicalLines = value.split('\n')
    const heights: number[] = []
    const ms = window.getComputedStyle(mirror)
    const mpt = parseFloat(ms.paddingTop) || 0
    const mpb = parseFloat(ms.paddingBottom) || 0

    for (let i = 0; i < logicalLines.length; i++) {
      const segment = logicalLines[i]
      mirror.textContent = segment.length === 0 ? '\u00a0' : segment
      const contentH = Math.max(
        lh,
        mirror.offsetHeight - mpt - mpb
      )
      heights.push(contentH)
    }

    setLineHeights(heights.length > 0 ? heights : [lh])
  }, [value])

  useLayoutEffect(() => {
    recalcLines()
  }, [recalcLines])

  useLayoutEffect(() => {
    const ta = textAreaRef.current
    if (!ta) return
    const ro = new ResizeObserver(() => {
      recalcLines()
    })
    ro.observe(ta)
    return () => ro.disconnect()
  }, [recalcLines])

  const handleScroll = () => {
    if (lineNumberRef.current && textAreaRef.current) {
      lineNumberRef.current.scrollTop = textAreaRef.current.scrollTop
    }
  }

  const rootClass = fillParent
    ? 'relative flex h-full min-h-0 min-w-0 overflow-hidden rounded-lg border border-white/10 bg-neutral-900/50 font-mono text-sm text-neutral-100 focus-within:ring-2 focus-within:ring-custom_blue'
    : 'relative flex max-h-96 min-h-64 min-w-0 rounded-lg border border-white/10 bg-neutral-900/50 font-mono text-sm text-neutral-100 focus-within:ring-2 focus-within:ring-custom_blue'

  return (
    <div className={rootClass}>
      <div
        ref={lineNumberRef}
        className="h-full min-h-0 shrink-0 select-none overflow-y-auto overflow-x-hidden border-r border-white/10 bg-neutral-950/40 px-2 py-3 text-right text-neutral-500 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ minWidth: '2.5rem' }}
      >
        {lineHeights.map((rowHeight, i) => (
          <div
            key={i}
            className="flex items-start justify-end"
            style={{
              minHeight: lineHeightPx,
              height: rowHeight,
              lineHeight: `${lineHeightPx}px`
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>
      <div className="relative h-full min-h-0 min-w-0 flex-1">
        <textarea
          ref={textAreaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onScroll={handleScroll}
          placeholder={placeholder}
          spellCheck={false}
          className="box-border size-full min-h-0 resize-none overflow-y-auto break-words bg-transparent p-3 outline-none"
        />
        <div
          ref={mirrorRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 box-border whitespace-pre-wrap break-words p-3 font-mono text-sm text-transparent opacity-0"
        />
      </div>
    </div>
  )
}

export default TextAreaWithLineNumbers
