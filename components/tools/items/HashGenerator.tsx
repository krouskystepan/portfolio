'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import { ClearButton } from '@/components/tools/_shared/ToolButtons'
import {
  toolCheckboxLabelClass,
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolHintMetaClass,
  toolInputClass,
  toolIntroTextClass,
  toolLabelClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarEndClass,
  toolValueRowClass,
  ToolChipButton,
  ToolChipRow,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { useAchievementContext } from '@/context/AchievementContext'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import {
  ALL_ALGOS,
  type HashAlgo,
  type HashFormat,
  cliHint,
  digestAll,
  encodeBytes,
  formatByteSize,
  hashesMatch,
  textToUtf8Bytes
} from '@/utils/hashDigest'

type SourceMode = 'text' | 'file'

const DEBOUNCE_MS = 150
const CLI_TEXT_MAX = 48
const CLI_ALGO: HashAlgo = 'SHA-256'

function truncateForCli(text: string): string {
  if (text.length <= CLI_TEXT_MAX) return text
  return `${text.slice(0, CLI_TEXT_MAX)}…`
}

export default function HashGenerator() {
  const [source, setSource] = useState<SourceMode>('text')
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState<HashFormat>('hex')
  const [uppercase, setUppercase] = useState(false)
  const [expected, setExpected] = useState('')
  const [digests, setDigests] = useState<Partial<Record<HashAlgo, ArrayBuffer>>>(
    {}
  )
  const [error, setError] = useState<string | null>(null)
  const [hashing, setHashing] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const requestIdRef = useRef(0)
  const { copied, flash } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()

  const hasInput = source === 'text' ? text.length > 0 : file != null

  useEffect(() => {
    if (!hasInput) {
      setDigests({})
      setError(null)
      setHashing(false)
      return
    }

    let cancelled = false
    const requestId = ++requestIdRef.current

    const run = async () => {
      setHashing(true)
      setError(null)
      try {
        let data: ArrayBuffer
        if (source === 'text') {
          data = textToUtf8Bytes(text)
        } else {
          try {
            data = await file!.arrayBuffer()
          } catch {
            throw new Error(
              'Could not read this file in the browser (it may be too large for available memory).'
            )
          }
        }

        const next = await digestAll(data, ALL_ALGOS)
        if (cancelled || requestId !== requestIdRef.current) return
        setDigests(next)
      } catch (err) {
        if (cancelled || requestId !== requestIdRef.current) return
        setDigests({})
        setError(
          err instanceof Error ? err.message : 'Failed to compute digests.'
        )
      } finally {
        if (!cancelled && requestId === requestIdRef.current) {
          setHashing(false)
        }
      }
    }

    const delay = source === 'text' ? DEBOUNCE_MS : 0
    const timer = window.setTimeout(run, delay)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [source, text, file, hasInput])

  const encoded = useMemo(() => {
    const out: Partial<Record<HashAlgo, string>> = {}
    for (const algo of ALL_ALGOS) {
      const bytes = digests[algo]
      if (bytes) out[algo] = encodeBytes(bytes, format, uppercase)
    }
    return out
  }, [digests, format, uppercase])

  const verifyStatus = useMemo(() => {
    const trimmed = expected.trim()
    if (!trimmed || Object.keys(encoded).length === 0) return null
    const matched = (Object.entries(encoded) as [HashAlgo, string][]).filter(
      ([, value]) => hashesMatch(value, trimmed)
    )
    if (matched.length > 0) {
      return { ok: true as const, algos: matched.map(([algo]) => algo) }
    }
    return { ok: false as const, algos: [] as HashAlgo[] }
  }, [encoded, expected])

  const hint = useMemo(() => {
    if (source === 'text') {
      return cliHint(CLI_ALGO, 'text', truncateForCli(text))
    }
    return cliHint(CLI_ALGO, 'file', file?.name || 'file')
  }, [source, text, file])

  const acceptFile = (next: File | null) => {
    setFile(next)
    setError(null)
  }

  const handleClear = () => {
    setText('')
    setFile(null)
    setExpected('')
    setDigests({})
    setError(null)
    setDragOver(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCopy = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value)
    unlockAchievement('clipboard-master')
    flash(key)
  }

  return (
    <ToolLayout title="Hash generator">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Compute UTF-8 text digests or client-side file checksums — nothing
            is uploaded. Useful for cache keys, integrity checks, and matching{' '}
            <code>md5sum</code> / <code>sha256sum</code>. MD5 is for legacy
            checksums only, not security.
          </p>
        }
      >
        <div className="mb-4">
          <p className={`${toolLabelClass} mb-2`}>Source</p>
          <ToolChipRow>
            <ToolChipButton
              active={source === 'text'}
              onClick={() => setSource('text')}
            >
              Text
            </ToolChipButton>
            <ToolChipButton
              active={source === 'file'}
              onClick={() => setSource('file')}
            >
              File
            </ToolChipButton>
          </ToolChipRow>
        </div>

        {source === 'text' ? (
          <TextAreaWithLineNumbers
            value={text}
            setValue={setText}
            placeholder="Paste text to hash…"
          />
        ) : (
          <div
            role="button"
            tabIndex={0}
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
              if (dropped) acceptFile(dropped)
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-10 text-center transition ${
              dragOver
                ? 'border-custom_blue/60 bg-custom_blue/10'
                : 'border-white/15 bg-neutral-900/40 hover:border-white/25'
            }`}
          >
            <p className="text-sm text-neutral-200">
              Drop a file here, or click to choose
            </p>
            {file ? (
              <p className={toolHintMetaClass}>
                <span className="font-mono text-neutral-300">{file.name}</span>
                {' · '}
                {formatByteSize(file.size)}
              </p>
            ) : (
              <p className={toolHintMetaClass}>
                Hashed locally in your browser
              </p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => acceptFile(e.target.files?.[0] ?? null)}
            />
          </div>
        )}

        <div className="mt-5">
          <p className={`${toolLabelClass} mb-2`}>Output</p>
          <ToolChipRow>
            <ToolChipButton
              active={format === 'hex'}
              onClick={() => setFormat('hex')}
            >
              Hex
            </ToolChipButton>
            <ToolChipButton
              active={format === 'base64'}
              onClick={() => setFormat('base64')}
            >
              Base64
            </ToolChipButton>
          </ToolChipRow>
          {format === 'hex' ? (
            <label className={`${toolCheckboxLabelClass} mt-3`}>
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="focus:ring-custom_blue/40 size-4 rounded border-white/20 bg-neutral-900 text-custom_blue"
              />
              <span>Uppercase</span>
            </label>
          ) : null}
        </div>

        <div className="mt-5">
          <label className={toolLabelClass} htmlFor="hash-expected">
            Expected hash{' '}
            <span className="font-normal text-neutral-500">(optional)</span>
          </label>
          <input
            id="hash-expected"
            value={expected}
            onChange={(e) => setExpected(e.target.value)}
            placeholder="Paste a digest to verify"
            spellCheck={false}
            autoComplete="off"
            className={`${toolInputClass} font-mono`}
          />
        </div>

        <div className={toolToolbarEndClass}>
          <ClearButton onClick={handleClear}>Clear</ClearButton>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <h2 className={`mb-3 ${toolSectionTitleClass}`}>Result</h2>

        {error ? (
          <div className={toolErrorBoxClass}>{error}</div>
        ) : !hasInput ? (
          <p className={toolEmptyHintClass}>
            Enter text or choose a file to see digests.
          </p>
        ) : hashing && Object.keys(encoded).length === 0 ? (
          <p className={toolEmptyHintClass}>Computing digests…</p>
        ) : (
          <div className="space-y-3 text-sm">
            {ALL_ALGOS.map((algo) => {
              const value = encoded[algo]
              if (!value) return null
              const isMatch =
                verifyStatus?.ok && verifyStatus.algos.includes(algo)
              return (
                <div key={algo} className={toolValueRowClass}>
                  <div className="min-w-0 flex-1 text-xs leading-snug sm:text-sm">
                    <span className="font-medium text-white">{algo}:</span>{' '}
                    <span className="break-all font-mono text-neutral-300">
                      {value}
                    </span>
                    {isMatch ? (
                      <span className="ml-2 text-xs font-medium text-emerald-400">
                        match
                      </span>
                    ) : null}
                  </div>
                  <ToolCopyButton
                    copied={copied === algo}
                    onClick={() => handleCopy(algo, value)}
                  />
                </div>
              )
            })}

            {verifyStatus && !verifyStatus.ok ? (
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/95">
                Expected hash does not match any digest.
              </div>
            ) : null}

            <div className={toolValueRowClass}>
              <div className="min-w-0 flex-1 text-xs leading-snug sm:text-sm">
                <span className="font-medium text-white">CLI:</span>{' '}
                <span className="break-all font-mono text-neutral-300">
                  {hint}
                </span>
              </div>
              <ToolCopyButton
                copied={copied === 'cli'}
                onClick={() => handleCopy('cli', hint)}
              />
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
