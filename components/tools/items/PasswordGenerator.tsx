'use client'

import { useAchievementContext } from '@/context/AchievementContext'
import { useMemo, useState } from 'react'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  ClearButton,
  PrimaryButton
} from '@/components/tools/_shared/ToolButtons'
import {
  toolCheckboxLabelClass,
  toolEmptyHintClass,
  toolHintMetaClass,
  toolNumberInputClass,
  toolPanelClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolValueRowClass,
  ToolCopyButton
} from '@/components/tools/_shared/toolUi'
import {
  DEFAULT_CHARSET,
  MAX_COUNT,
  MAX_LENGTH,
  MIN_COUNT,
  MIN_LENGTH,
  buildCharset,
  buildReadablePools,
  entropyBits,
  formatStrengthLabel,
  generatePasswords,
  hasLetterCharset,
  readableEntropyBits,
  strengthFromEntropy,
  type CharsetOptions
} from '@/utils/passwordGenerator'

const CHARSET_TOGGLES: {
  key: keyof Omit<CharsetOptions, 'excludeAmbiguous'>
  label: string
}[] = [
  { key: 'lowercase', label: 'Lowercase' },
  { key: 'uppercase', label: 'Uppercase' },
  { key: 'digits', label: 'Digits' },
  { key: 'symbols', label: 'Symbols' }
]

const PasswordGenerator = () => {
  const [length, setLength] = useState(20)
  const [count, setCount] = useState(1)
  const [readable, setReadable] = useState(false)
  const [charsetOptions, setCharsetOptions] =
    useState<CharsetOptions>(DEFAULT_CHARSET)
  const [passwords, setPasswords] = useState<string[]>([])
  const [copiedStates, setCopiedStates] = useState<boolean[]>([])

  const { unlockAchievement } = useAchievementContext()

  const charset = useMemo(() => buildCharset(charsetOptions), [charsetOptions])
  const readablePools = useMemo(
    () => buildReadablePools(charsetOptions),
    [charsetOptions]
  )

  const bits = useMemo(() => {
    if (readable) return readableEntropyBits(length, charsetOptions)
    return entropyBits(length, charset.length)
  }, [readable, length, charsetOptions, charset.length])

  const strength = useMemo(() => strengthFromEntropy(bits), [bits])

  const lengthOk =
    !Number.isNaN(length) && length >= MIN_LENGTH && length <= MAX_LENGTH
  const countOk =
    !Number.isNaN(count) && count >= MIN_COUNT && count <= MAX_COUNT
  const lettersOk = hasLetterCharset(charsetOptions)
  const readableOk =
    lettersOk &&
    readablePools.consonants.length > 0 &&
    readablePools.vowels.length > 0
  const randomOk = charset.length > 0
  const charsetOk = readable ? readableOk : randomOk
  const isGenerateDisabled = !lengthOk || !countOk || !charsetOk

  const handleGenerate = () => {
    if (isGenerateDisabled) return
    try {
      const out = generatePasswords(length, count, charset, {
        readable,
        charsetOptions
      })
      setPasswords(out)
      setCopiedStates(new Array(out.length + 1).fill(false))
    } catch {
      // Range / empty charset already blocked by isGenerateDisabled
    }
  }

  const handleClear = () => {
    setPasswords([])
    setCopiedStates([])
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    unlockAchievement('clipboard-master')
  }

  const handleLocalCopy = (index: number, value: string) => {
    handleCopy(value)
    setCopiedStates((prev) => {
      const updated = [...prev]
      updated[index] = true
      return updated
    })
    setTimeout(() => {
      setCopiedStates((prev) => {
        const updated = [...prev]
        updated[index] = false
        return updated
      })
    }, 1500)
  }

  const handleCopyAll = () => {
    if (passwords.length === 0) return
    handleCopy(passwords.join('\n'))
    setCopiedStates((prev) => {
      const updated = [...prev]
      updated[passwords.length] = true
      return updated
    })
    setTimeout(() => {
      setCopiedStates((prev) => {
        const updated = [...prev]
        updated[passwords.length] = false
        return updated
      })
    }, 1500)
  }

  const toggleCharset = (key: keyof CharsetOptions) => {
    setCharsetOptions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <ToolLayout title="Password / secret generator">
      <div className={toolPanelClass}>
        <div className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-end sm:gap-8">
          <div className="flex flex-wrap gap-4">
            <div className="flex w-fit max-w-full flex-col gap-1">
              <label htmlFor="pw-length" className={toolCheckboxLabelClass}>
                Length ({MIN_LENGTH}-{MAX_LENGTH})
              </label>
              <input
                id="pw-length"
                type="number"
                value={length}
                min={MIN_LENGTH}
                max={MAX_LENGTH}
                onChange={(e) => setLength(parseInt(e.target.value) || 0)}
                className={toolNumberInputClass}
              />
            </div>
            <div className="flex w-fit max-w-full flex-col gap-1">
              <label htmlFor="pw-count" className={toolCheckboxLabelClass}>
                Count ({MIN_COUNT}-{MAX_COUNT})
              </label>
              <input
                id="pw-count"
                type="number"
                value={count}
                min={MIN_COUNT}
                max={MAX_COUNT}
                onChange={(e) => setCount(parseInt(e.target.value) || 0)}
                className={toolNumberInputClass}
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {CHARSET_TOGGLES.map(({ key, label }) => (
                <label key={key} className={toolCheckboxLabelClass}>
                  <input
                    type="checkbox"
                    checked={charsetOptions[key]}
                    onChange={() => toggleCharset(key)}
                    className="size-4 accent-custom_blue"
                  />
                  {label}
                </label>
              ))}
              <label className={toolCheckboxLabelClass}>
                <input
                  type="checkbox"
                  checked={charsetOptions.excludeAmbiguous}
                  onChange={() => toggleCharset('excludeAmbiguous')}
                  className="size-4 accent-custom_blue"
                />
                Skip lookalikes
              </label>
              <label className={toolCheckboxLabelClass}>
                <input
                  type="checkbox"
                  checked={readable}
                  onChange={() => setReadable((v) => !v)}
                  className="size-4 accent-custom_blue"
                />
                Readable
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className={toolHintMetaClass}>
                {charsetOk && lengthOk ? (
                  <>
                    ~{Math.round(bits)} bits · {formatStrengthLabel(strength)}
                    {readable ? (
                      <span className="text-neutral-600"> · patterned</span>
                    ) : null}
                  </>
                ) : readable && !lettersOk ? (
                  'Readable needs letters enabled.'
                ) : !charsetOk ? (
                  'Select at least one character set.'
                ) : (
                  `Length must be ${MIN_LENGTH}-${MAX_LENGTH}.`
                )}
              </p>
              <div className="flex flex-wrap gap-3">
                <PrimaryButton
                  onClick={handleGenerate}
                  disabled={isGenerateDisabled}
                >
                  Generate
                </PrimaryButton>
                <ClearButton onClick={handleClear}>Clear</ClearButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Generated secrets</h2>
          {passwords.length > 0 ? (
            <ToolCopyButton
              copied={Boolean(copiedStates[passwords.length])}
              onClick={handleCopyAll}
              idleLabel="Copy all"
              copiedLabel="Copied all!"
            />
          ) : null}
        </div>

        {passwords.length > 0 ? (
          <ul className="grid grid-cols-1 gap-2 font-mono text-sm">
            {passwords.map((value, index) => (
              <li key={index} className={toolValueRowClass}>
                <span className="min-w-0 flex-1 break-all font-mono text-xs leading-snug sm:text-sm">
                  {value}
                </span>
                <ToolCopyButton
                  copied={Boolean(copiedStates[index])}
                  onClick={() => handleLocalCopy(index, value)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className={toolEmptyHintClass}>
            Generated passwords will appear here.
          </p>
        )}
      </div>
    </ToolLayout>
  )
}

export default PasswordGenerator
