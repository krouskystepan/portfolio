'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import { ClearButton } from '@/components/tools/_shared/ToolButtons'
import {
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolHintMetaClass,
  toolIntroTextClass,
  toolLabelClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarEndClass,
  ToolChipButton,
  ToolChipRow,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { useAchievementContext } from '@/context/AchievementContext'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import {
  fileToBase64,
  formatByteSize,
  formatOutput,
  resolveImageMime,
  validateImageFile,
  type ImageOutputMode
} from '@/utils/imageBase64'

const DISPLAY_CHARS = 4000

const MODES: readonly { id: ImageOutputMode; label: string }[] = [
  { id: 'data-uri', label: 'Data URI' },
  { id: 'raw', label: 'Raw Base64' },
  { id: 'css', label: 'CSS url()' },
  { id: 'html', label: 'HTML <img>' }
]

type Encoded = { mime: string; base64: string; bytes: number }

export default function ImageBase64() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<ImageOutputMode>('data-uri')
  const [encoded, setEncoded] = useState<Encoded | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const requestIdRef = useRef(0)
  const { copied, flash } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()

  useEffect(() => {
    const requestId = ++requestIdRef.current

    if (!file) {
      setEncoded(null)
      setPreviewUrl(null)
      setError(null)
      setBusy(false)
      return
    }

    const validation = validateImageFile(file)
    if (validation) {
      setEncoded(null)
      setPreviewUrl(null)
      setError(validation)
      setBusy(false)
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setError(null)
    setBusy(true)

    const run = async () => {
      try {
        let buffer: ArrayBuffer
        try {
          buffer = await file.arrayBuffer()
        } catch {
          throw new Error(
            'Could not read this file in the browser (it may be too large for available memory).'
          )
        }
        if (requestId !== requestIdRef.current) return
        setEncoded({
          mime: resolveImageMime(file),
          base64: fileToBase64(buffer),
          bytes: buffer.byteLength
        })
      } catch (err) {
        if (requestId !== requestIdRef.current) return
        setEncoded(null)
        setError(
          err instanceof Error ? err.message : 'Failed to encode this image.'
        )
      } finally {
        if (requestId === requestIdRef.current) setBusy(false)
      }
    }
    void run()

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  const output = useMemo(
    () => (encoded ? formatOutput(mode, encoded.mime, encoded.base64) : ''),
    [encoded, mode]
  )

  const displayed = useMemo(() => {
    if (output.length <= DISPLAY_CHARS) return output
    return `${output.slice(0, DISPLAY_CHARS)}\n… (${output.length.toLocaleString()} chars total; Copy includes everything)`
  }, [output])

  const handleClear = () => {
    setFile(null)
    setDragOver(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    unlockAchievement('clipboard-master')
    flash('output')
  }

  return (
    <ToolLayout title="Image to Base64 / data URI">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Drop or choose an image to get raw Base64 or a <code>data:</code>{' '}
            URI for CSS and HTML embeds. The file is read and encoded in your
            browser - nothing is uploaded.
          </p>
        }
      >
        <div
          role="button"
          tabIndex={0}
          aria-label="Choose an image file"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const dropped = e.dataTransfer.files?.[0]
            if (dropped) setFile(dropped)
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-10 text-center transition ${
            dragOver
              ? 'border-custom_blue/60 bg-custom_blue/10'
              : 'border-white/15 bg-neutral-900/40 hover:border-white/25'
          }`}
        >
          <p className="text-sm text-neutral-200">
            Drop an image here, or click to choose
          </p>
          {file ? (
            <p className={toolHintMetaClass}>
              <span className="font-mono text-neutral-300">{file.name}</span>
              {' · '}
              {formatByteSize(file.size)}
            </p>
          ) : (
            <p className={toolHintMetaClass}>
              PNG, JPEG, WebP, GIF, SVG, and more - encoded locally
            </p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {previewUrl && !error ? (
          <div className="mt-4 flex justify-center rounded-lg border border-white/10 bg-neutral-900/50 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Selected image preview"
              className="max-h-64 max-w-full rounded object-contain"
            />
          </div>
        ) : null}

        <div className="mt-5">
          <p className={`${toolLabelClass} mb-2`}>Output format</p>
          <ToolChipRow>
            {MODES.map(({ id, label }) => (
              <ToolChipButton
                key={id}
                active={mode === id}
                onClick={() => setMode(id)}
              >
                {label}
              </ToolChipButton>
            ))}
          </ToolChipRow>
        </div>

        <div className={toolToolbarEndClass}>
          <ClearButton onClick={handleClear}>Clear</ClearButton>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Result</h2>
          {output ? (
            <ToolCopyButton copied={copied === 'output'} onClick={handleCopy} />
          ) : null}
        </div>

        {error ? (
          <div className={toolErrorBoxClass}>{error}</div>
        ) : !file ? (
          <p className={toolEmptyHintClass}>
            Choose an image to see its Base64 output.
          </p>
        ) : busy && !encoded ? (
          <p className={toolEmptyHintClass}>Encoding…</p>
        ) : encoded ? (
          <div className="space-y-3">
            <p className={toolHintMetaClass}>
              {encoded.mime} · {formatByteSize(encoded.bytes)} ·{' '}
              {output.length.toLocaleString()} chars output
            </p>
            <pre className={toolPreOutputClass}>{displayed}</pre>
          </div>
        ) : null}
      </div>
    </ToolLayout>
  )
}
