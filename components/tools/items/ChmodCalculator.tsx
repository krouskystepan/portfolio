'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  toolAccentButtonClass,
  toolCheckboxLabelClass,
  toolErrorBoxClass,
  toolInputClass,
  toolIntroTextClass,
  toolLabelClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolSoftButtonClass,
  toolValueRowClass,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { useAchievementContext } from '@/context/AchievementContext'
import {
  DEFAULT_MODE,
  type PermissionMode,
  type SpecialBits,
  type TriadBits,
  bitsToOctal,
  bitsToSymbolic,
  cloneMode,
  parseMode,
  parseOctal
} from '@/utils/chmodPermissions'

type TriadKey = 'owner' | 'group' | 'other'
type BitKey = keyof TriadBits
type SpecialKey = keyof SpecialBits
type CopyKey = 'octal' | 'symbolic' | 'chmod'

const TRIADS: { key: TriadKey; label: string }[] = [
  { key: 'owner', label: 'Owner' },
  { key: 'group', label: 'Group' },
  { key: 'other', label: 'Other' }
]

const BITS: { key: BitKey; label: string }[] = [
  { key: 'r', label: 'Read' },
  { key: 'w', label: 'Write' },
  { key: 'x', label: 'Execute' }
]

const SPECIALS: { key: SpecialKey; label: string; hint: string }[] = [
  { key: 'setuid', label: 'setuid', hint: '4' },
  { key: 'setgid', label: 'setgid', hint: '2' },
  { key: 'sticky', label: 'sticky', hint: '1' }
]

const PRESETS = ['755', '644', '600', '700', '777'] as const

const EMPTY_MODE: PermissionMode = {
  owner: { r: false, w: false, x: false },
  group: { r: false, w: false, x: false },
  other: { r: false, w: false, x: false },
  special: { setuid: false, setgid: false, sticky: false }
}

const ChmodCalculator = () => {
  const [mode, setMode] = useState<PermissionMode>(() =>
    cloneMode(DEFAULT_MODE)
  )
  const [modeText, setModeText] = useState(() => bitsToOctal(DEFAULT_MODE))
  const [modeError, setModeError] = useState<string | null>(null)
  const [copied, setCopied] = useState<CopyKey | null>(null)

  const { unlockAchievement } = useAchievementContext()

  const applyMode = (next: PermissionMode) => {
    setMode(next)
    setModeText(bitsToOctal(next))
    setModeError(null)
  }

  const toggleBit = (triad: TriadKey, bit: BitKey) => {
    applyMode({
      ...mode,
      [triad]: {
        ...mode[triad],
        [bit]: !mode[triad][bit]
      }
    })
  }

  const toggleSpecial = (key: SpecialKey) => {
    applyMode({
      ...mode,
      special: {
        ...mode.special,
        [key]: !mode.special[key]
      }
    })
  }

  const handleModeChange = (text: string) => {
    setModeText(text)

    if (!text.trim()) {
      setMode(cloneMode(EMPTY_MODE))
      setModeError(null)
      return
    }

    const result = parseMode(text)
    if (result.ok) {
      setMode(result.mode)
      setModeError(null)
      return
    }

    // While typing a symbolic string, stay quiet until it looks complete.
    const trimmed = text.trim()
    const looksSymbolic =
      !/^\d+$/.test(trimmed) && /^[bcdlpsrwxst-]+$/i.test(trimmed)
    const maxLen = /^[bcdlps-]/.test(trimmed[0] ?? '') ? 10 : 9
    const typingSymbolic = looksSymbolic && trimmed.length < maxLen

    setModeError(typingSymbolic ? null : result.error)
  }

  const handleModeBlur = () => {
    if (!modeText.trim()) {
      setModeError(null)
      return
    }
    if (modeError) {
      setModeText(bitsToOctal(mode))
      setModeError(null)
    } else {
      setModeText(bitsToOctal(mode))
    }
  }

  const applyPreset = (preset: string) => {
    const result = parseOctal(preset)
    if (result.ok) applyMode(result.mode)
  }

  const octal = bitsToOctal(mode)
  const symbolic = bitsToSymbolic(mode)
  const chmodCmd = `chmod ${octal} file`

  const handleCopy = async (key: CopyKey, text: string) => {
    await navigator.clipboard.writeText(text)
    unlockAchievement('clipboard-master')
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <ToolLayout title="Unix permission calculator">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Toggle read / write / execute for owner, group, and others - or
            paste an octal (<code>755</code>) or symbolic (
            <code>rwxr-xr-x</code>) mode. Both stay in sync. Typical usage:{' '}
            <code>chmod 755 path</code>
          </p>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {TRIADS.map(({ key, label }) => (
            <fieldset
              key={key}
              className="rounded-xl border border-white/10 bg-neutral-900/40 p-4"
            >
              <legend className="px-1 text-sm font-medium text-white">
                {label}
              </legend>
              <div className="mt-2 flex flex-col gap-2.5">
                {BITS.map(({ key: bit, label: bitLabel }) => (
                  <label key={bit} className={toolCheckboxLabelClass}>
                    <input
                      type="checkbox"
                      checked={mode[key][bit]}
                      onChange={() => toggleBit(key, bit)}
                      className="focus:ring-custom_blue/40 size-4 rounded border-white/20 bg-neutral-900 text-custom_blue"
                    />
                    <span>
                      <span className="font-mono text-neutral-100">{bit}</span>
                      <span className="text-neutral-500"> - {bitLabel}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-4">
          <p className={`${toolLabelClass} mb-2`}>Special bits</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {SPECIALS.map(({ key, label, hint }) => (
              <label key={key} className={toolCheckboxLabelClass}>
                <input
                  type="checkbox"
                  checked={mode.special[key]}
                  onChange={() => toggleSpecial(key)}
                  className="focus:ring-custom_blue/40 size-4 rounded border-white/20 bg-neutral-900 text-custom_blue"
                />
                <span>
                  {label}{' '}
                  <span className="font-mono text-neutral-500">(+{hint})</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <label className={toolLabelClass} htmlFor="chmod-mode">
            Mode (octal or symbolic)
          </label>
          <input
            id="chmod-mode"
            value={modeText}
            onChange={(e) => handleModeChange(e.target.value)}
            onBlur={handleModeBlur}
            placeholder="755 or rwxr-xr-x"
            spellCheck={false}
            autoComplete="off"
            className={`${toolInputClass} font-mono`}
          />
          {modeError ? (
            <div className={`${toolErrorBoxClass} mt-2 p-2 text-xs`}>
              {modeError}
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => applyPreset(preset)}
              className={
                octal === preset && modeText.trim()
                  ? toolAccentButtonClass
                  : toolSoftButtonClass
              }
            >
              {preset}
            </button>
          ))}
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <h2 className={`mb-3 ${toolSectionTitleClass}`}>Result</h2>
        <div className="space-y-3 text-sm">
          {(
            [
              { key: 'octal' as const, label: 'Octal', value: octal },
              { key: 'symbolic' as const, label: 'Symbolic', value: symbolic },
              { key: 'chmod' as const, label: 'chmod', value: chmodCmd }
            ] as const
          ).map(({ key, label, value }) => (
            <div key={key} className={toolValueRowClass}>
              <div className="min-w-0 flex-1 text-xs leading-snug sm:text-sm">
                <span className="font-medium text-white">{label}:</span>{' '}
                <span className="break-all font-mono text-neutral-300">
                  {value}
                </span>
              </div>
              <ToolCopyButton
                copied={copied === key}
                onClick={() => handleCopy(key, value)}
              />
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}

export default ChmodCalculator
