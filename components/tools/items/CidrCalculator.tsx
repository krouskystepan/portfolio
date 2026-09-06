'use client'

import { Suspense } from 'react'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import { ClearButton } from '@/components/tools/_shared/ToolButtons'
import {
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolHintMetaClass,
  toolInputClass,
  toolIntroTextClass,
  toolLabelClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarBetweenClass,
  toolValueRowClass,
  ToolChipButton,
  ToolChipRow,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { useAchievementContext } from '@/context/AchievementContext'
import { CIDR_PRESETS } from '@/utils/cidrSubnet'
import { useCidrCalculator } from '@/hooks/tools/useCidrCalculator'

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

function CidrCalculatorInner() {
  const {
    state,
    info,
    copied,
    flash,
    setCidrText,
    blurCidr,
    setIpText,
    blurIp,
    setPrefix,
    setMaskText,
    blurMask,
    applyPreset,
    reset
  } = useCidrCalculator()

  const { input, cidrText, ipText, maskText, cidrError, ipError, maskError } =
    state

  const { unlockAchievement } = useAchievementContext()

  const hostEdge = info.prefix >= 31

  const handleCopy = async (key: CopyKey, text: string) => {
    await navigator.clipboard.writeText(text)
    unlockAchievement('clipboard-master')
    flash(key)
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
            onChange={(e) => setCidrText(e.target.value)}
            onBlur={blurCidr}
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
              onChange={(e) => setIpText(e.target.value)}
              onBlur={blurIp}
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
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-neutral-500"
              >
                /
              </span>
              <input
                id="cidr-prefix"
                type="number"
                min={0}
                max={32}
                value={input.prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className={`${toolInputClass} pl-7 font-mono [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
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
            onChange={(e) => setMaskText(e.target.value)}
            onBlur={blurMask}
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

        <div className="mt-4">
          <p className={`${toolLabelClass} mb-2`}>Presets</p>
          <ToolChipRow>
            {CIDR_PRESETS.map((preset) => (
              <ToolChipButton
                key={preset.cidr}
                active={info.cidr === preset.cidr}
                tone="accent"
                onClick={() => applyPreset(preset.cidr)}
                title={preset.cidr}
              >
                {preset.label}
              </ToolChipButton>
            ))}
          </ToolChipRow>
        </div>

        <div className={toolToolbarBetweenClass}>
          <p className={`${toolHintMetaClass} max-w-xl`}>
            Only contiguous masks are accepted (e.g. <code>255.255.255.0</code>
            ).
          </p>
          <ClearButton onClick={reset}>Reset</ClearButton>
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

export default function CidrCalculator() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="CIDR / subnet calculator">
          <p className={toolEmptyHintClass}>Loading…</p>
        </ToolLayout>
      }
    >
      <CidrCalculatorInner />
    </Suspense>
  )
}
