import React, { useRef } from 'react'

const TextAreaWithLineNumbers = ({
  value,
  setValue,
  placeholder,
}: {
  value: string
  setValue: React.Dispatch<React.SetStateAction<string>>
  placeholder?: string
}) => {
  const lineCount = value.split('\n').length
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumberRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (lineNumberRef.current && textAreaRef.current) {
      lineNumberRef.current.scrollTop = textAreaRef.current.scrollTop
    }
  }

  return (
    <div className="relative flex max-h-96 min-h-64 rounded-lg border border-white/10 bg-neutral-900/50 font-mono text-sm text-neutral-100 focus-within:ring-2 focus-within:ring-custom_blue">
      <div
        ref={lineNumberRef}
        className="select-none overflow-hidden border-r border-white/10 bg-neutral-950/40 p-3 text-right text-neutral-500"
        style={{ minWidth: '2.5rem' }}
      >
        {Array.from({ length: lineCount }).map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        ref={textAreaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onScroll={handleScroll}
        placeholder={placeholder}
        spellCheck={false}
        className="h-auto w-full resize-none overflow-y-auto bg-transparent p-3 outline-none"
      />
    </div>
  )
}

export default TextAreaWithLineNumbers
