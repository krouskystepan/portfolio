'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import { ClearButton } from '@/components/tools/_shared/ToolButtons'
import {
  toolAccentButtonClass,
  toolErrorBoxClass,
  toolHintMetaClass,
  toolInputClass,
  toolIntroTextClass,
  toolLabelClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolSoftButtonClass,
  toolToolbarBetweenClass,
  toolValueRowClass,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { useAchievementContext } from '@/context/AchievementContext'
import {
  CIDR_PRESETS,
  DEFAULT_INPUT,
  type SubnetInput,
  calculateSubnet,
  formatCidr,
  formatIpv4,
  maskToPrefix,
  parseCidr,
  parseIpv4,
  prefixToMask
} from '@/utils/cidrSubnet'

type CopyKey =
  | 'network'
  | 'broadcast'
  | 'firstHost'
  | 'lastHost'
  | 'usableHosts'
  | 'netmask'
  | 'wildcard'
  | 'cidr'
  | 'ipDecimal'

const CidrCalculator = () => {
  const [input, setInput] = useState<SubnetInput>(DEFAULT_INPUT)
  const [cidrText, setCidrText] = useState(() => formatCidr(DEFAULT_INPUT))
  const [ipText, setIpText] = useState(() => formatIpv4(DEFAULT_INPUT.ip))
  const [maskText, setMaskText] = useState(() =>
    formatIpv4(prefixToMask(DEFAULT_INPUT.prefix))
  )
  const [cidrError, setCidrError] = useState<string | null>(null)
  const [ipError, setIpError] = useState<string | null>(null)
  const [maskError, setMaskError] = useState<string | null>(null)
  const [copied, setCopied] = useState<CopyKey | null>(null)

  const { unlockAchievement } = useAchievementContext()

  const applyInput = (next: SubnetInput) => {
    const prefix = Math.min(32, Math.max(0, Math.trunc(next.prefix)))
    const normalized: SubnetInput = { ip: next.ip >>> 0, prefix }
    setInput(normalized)
    setCidrText(formatCidr(normalized))
    setIpText(formatIpv4(normalized.ip))
    setMaskText(formatIpv4(prefixToMask(normalized.prefix)))
    setCidrError(null)
    setIpError(null)
    setMaskError(null)
  }

  const handleCidrChange = (text: string) => {
    setCidrText(text)
    if (!text.trim()) {
      setCidrError(null)
      return
    }
    const result = parseCidr(text)
    if (result.ok) {
      const prefix = Math.min(32, Math.max(0, Math.trunc(result.input.prefix)))
      const normalized: SubnetInput = {
        ip: result.input.ip >>> 0,
        prefix
      }
      setInput(normalized)
      setIpText(formatIpv4(normalized.ip))
      setMaskText(formatIpv4(prefixToMask(normalized.prefix)))
      setCidrError(null)
      setIpError(null)
      setMaskError(null)
      return
    }
    setCidrError(result.error)
  }

  const handleCidrBlur = () => {
    setCidrText(formatCidr(input))
    setCidrError(null)
  }

  const handleIpChange = (text: string) => {
    setIpText(text)
    if (!text.trim()) {
      setIpError(null)
      return
    }
    const result = parseIpv4(text)
    if (result.ok) {
      const normalized: SubnetInput = {
        ip: result.value,
        prefix: input.prefix
      }
      setInput(normalized)
      setCidrText(formatCidr(normalized))
      setIpError(null)
      setCidrError(null)
      return
    }
    setIpError(result.error)
  }

  const handleIpBlur = () => {
    setIpText(formatIpv4(input.ip))
    setIpError(null)
  }

  const handlePrefixChange = (raw: string) => {
    if (raw.trim() === '') return
    const n = Number.parseInt(raw, 10)
    if (!Number.isFinite(n)) return
    applyInput({ ip: input.ip, prefix: Math.min(32, Math.max(0, n)) })
  }

  const handleMaskChange = (text: string) => {
    setMaskText(text)
    if (!text.trim()) {
      setMaskError(null)
      return
    }
    const ipResult = parseIpv4(text)
    if (!ipResult.ok) {
      setMaskError(ipResult.error)
      return
    }
    const prefixResult = maskToPrefix(ipResult.value)
    if (!prefixResult.ok) {
      setMaskError(prefixResult.error)
      return
    }
    const normalized: SubnetInput = {
      ip: input.ip,
      prefix: prefixResult.prefix
    }
    setInput(normalized)
    setCidrText(formatCidr(normalized))
    setMaskError(null)
    setCidrError(null)
  }

  const handleMaskBlur = () => {
    setMaskText(formatIpv4(prefixToMask(input.prefix)))
    setMaskError(null)
  }

  const applyPreset = (cidr: string) => {
    const result = parseCidr(cidr)
    if (result.ok) applyInput(result.input)
  }

  const handleReset = () => applyInput(DEFAULT_INPUT)

  const info = calculateSubnet(input)
  const hostEdge = info.prefix >= 31

  const handleCopy = async (key: CopyKey, text: string) => {
    await navigator.clipboard.writeText(text)
    unlockAchievement('clipboard-master')
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const resultRows: { key: CopyKey; label: string; value: string }[] = [
    { key: 'network', label: 'Network address', value: info.network },
    { key: 'broadcast', label: 'Broadcast address', value: info.broadcast },
    ...(info.firstHost
      ? [
          {
            key: 'firstHost' as const,
            label: 'First usable host',
            value: info.firstHost
          }
        ]
      : []),
    ...(info.lastHost
      ? [
          {
            key: 'lastHost' as const,
            label: 'Last usable host',
            value: info.lastHost
          }
        ]
      : []),
    {
      key: 'usableHosts',
      label: 'Usable hosts',
      value: String(info.usableHosts)
    },
    { key: 'netmask', label: 'Subnet mask', value: info.netmask },
    { key: 'wildcard', label: 'Wildcard mask', value: info.wildcard },
    { key: 'cidr', label: 'Network CIDR', value: info.cidr },
    {
      key: 'ipDecimal',
      label: 'IP (decimal)',
      value: String(info.ipDecimal)
    }
  ]

  return (
    <ToolLayout title="CIDR / subnet calculator">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Enter an IPv4 address with a CIDR prefix or dotted subnet mask to
            get the network address, broadcast, and usable host range. All math
            runs in your browser.
          </p>
        }
      >
        <div>
          <label className={toolLabelClass} htmlFor="cidr-string">
            CIDR
          </label>
          <input
            id="cidr-string"
            value={cidrText}
            onChange={(e) => handleCidrChange(e.target.value)}
            onBlur={handleCidrBlur}
            placeholder="192.168.1.10/24"
            spellCheck={false}
            autoComplete="off"
            className={`${toolInputClass} font-mono`}
          />
          {cidrError ? (
            <div className={`${toolErrorBoxClass} mt-2 p-2 text-xs`}>
              {cidrError}
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_6.5rem]">
          <div>
            <label className={toolLabelClass} htmlFor="cidr-ip">
              IP address
            </label>
            <input
              id="cidr-ip"
              value={ipText}
              onChange={(e) => handleIpChange(e.target.value)}
              onBlur={handleIpBlur}
              placeholder="192.168.1.10"
              spellCheck={false}
              autoComplete="off"
              className={`${toolInputClass} font-mono`}
            />
            {ipError ? (
              <div className={`${toolErrorBoxClass} mt-2 p-2 text-xs`}>
                {ipError}
              </div>
            ) : null}
          </div>

          <div>
            <label className={toolLabelClass} htmlFor="cidr-prefix">
              Prefix
            </label>
            <div className="relative">
              <span
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 font-mono text-sm text-neutral-500"
              >
                /
              </span>
              <input
                id="cidr-prefix"
                type="number"
                min={0}
                max={32}
                value={input.prefix}
                onChange={(e) => handlePrefixChange(e.target.value)}
                className={`${toolInputClass} [appearance:textfield] font-mono pl-7 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className={toolLabelClass} htmlFor="cidr-mask">
            Subnet mask
          </label>
          <input
            id="cidr-mask"
            value={maskText}
            onChange={(e) => handleMaskChange(e.target.value)}
            onBlur={handleMaskBlur}
            placeholder="255.255.255.0"
            spellCheck={false}
            autoComplete="off"
            className={`${toolInputClass} font-mono`}
          />
          {maskError ? (
            <div className={`${toolErrorBoxClass} mt-2 p-2 text-xs`}>
              {maskError}
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {CIDR_PRESETS.map((preset) => (
            <button
              key={preset.cidr}
              type="button"
              onClick={() => applyPreset(preset.cidr)}
              className={
                info.cidr === preset.cidr
                  ? toolAccentButtonClass
                  : toolSoftButtonClass
              }
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className={toolToolbarBetweenClass}>
          <p className={`${toolHintMetaClass} max-w-xl`}>
            Only contiguous masks are accepted (e.g. <code>255.255.255.0</code>
            ).
          </p>
          <ClearButton onClick={handleReset}>Reset</ClearButton>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <h2 className={`mb-3 ${toolSectionTitleClass}`}>Result</h2>
        {hostEdge ? (
          <p className={`${toolHintMetaClass} mb-3`}>
            {info.prefix === 32
              ? 'Host route (/32) — no usable host range.'
              : 'Point-to-point (/31) — no traditional usable host range.'}
          </p>
        ) : null}
        <div className="space-y-3 text-sm">
          {resultRows.map(({ key, label, value }) => (
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

export default CidrCalculator
