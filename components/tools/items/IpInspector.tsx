'use client'

import Link from 'next/link'
import { Suspense, useMemo } from 'react'
import { useAchievementContext } from '@/context/AchievementContext'
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
import { str, useToolUrlState } from '@/hooks/useToolUrlState'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import { ipFacts, parseIpAddress } from '@/utils/ipAddress'

const EXAMPLES: readonly string[] = [
  '192.168.0.1',
  '127.0.0.1',
  '8.8.8.8',
  '::1',
  '2001:db8::1',
  '::ffff:192.0.2.128',
  'fe80::1%eth0'
]

const linkClass = 'text-custom_blue underline-offset-2 hover:underline'

function IpInspectorInner() {
  const [url, setUrl] = useToolUrlState({
    ip: str('', { text: true })
  })
  const input = url.ip
  const { copied, flash } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()

  const parsed = useMemo(
    () => (input.trim() ? parseIpAddress(input) : null),
    [input]
  )

  const handleCopy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text)
    unlockAchievement('clipboard-master')
    flash(key)
  }

  const info = parsed?.ok ? parsed.info : null

  return (
    <ToolLayout title="IP Address Inspector">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Parse an IPv4 or IPv6 address and see how it is classified (private,
            loopback, link-local, documentation, …), its alternate forms, and
            its reverse-DNS name. Everything is computed in your browser - no
            network request is made. For prefixes and subnets use the{' '}
            <Link href="/t/cidr-calculator" className={linkClass}>
              CIDR Calculator
            </Link>
            .
          </p>
        }
      >
        <label htmlFor="ip-input" className={toolLabelClass}>
          IP address
        </label>
        <input
          id="ip-input"
          value={input}
          onChange={(e) => setUrl({ ip: e.target.value })}
          spellCheck={false}
          autoComplete="off"
          placeholder="e.g. 192.168.0.1 or 2001:db8::1"
          className={`${toolInputClass} font-mono`}
        />

        <div className={toolToolbarBetweenClass}>
          <ToolChipRow>
            {EXAMPLES.map((example) => (
              <ToolChipButton
                key={example}
                active={input.trim() === example}
                tone="accent"
                onClick={() => setUrl({ ip: example })}
              >
                {example}
              </ToolChipButton>
            ))}
          </ToolChipRow>
          <ClearButton onClick={() => setUrl({ ip: '' })}>Clear</ClearButton>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <h2 className={`mb-3 ${toolSectionTitleClass}`}>Result</h2>

        {parsed && !parsed.ok ? (
          <div className={toolErrorBoxClass}>
            <strong>Error:</strong> {parsed.error}
          </div>
        ) : info ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-200">
                IPv{info.version}
              </span>
              {info.classification.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-custom_blue/80 rounded-md px-2.5 py-1 text-xs font-medium text-white"
                >
                  {tag}
                </span>
              ))}
              <span
                className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                  info.classification.isGlobal
                    ? 'bg-emerald-600/80 text-white'
                    : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                {info.classification.isGlobal
                  ? 'Publicly routable'
                  : 'Not publicly routable'}
              </span>
            </div>

            <p className="text-sm text-neutral-300">
              {info.classification.scope}
              {info.classification.block ? (
                <span className="block text-xs text-neutral-500">
                  {info.classification.block}
                </span>
              ) : null}
            </p>

            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              {ipFacts(info).map((fact) => (
                <div key={fact.label} className={toolValueRowClass}>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs text-neutral-500">
                      {fact.label}
                    </span>
                    <span className="break-all font-mono text-neutral-200">
                      {fact.value}
                    </span>
                  </div>
                  <ToolCopyButton
                    copied={copied === fact.label}
                    onClick={() => handleCopy(fact.label, fact.value)}
                  />
                </div>
              ))}
            </div>

            <p className={toolHintMetaClass}>
              Classful labels (A-E) are historical; modern routing uses CIDR. To
              resolve the PTR name, open{' '}
              <Link
                href={`/t/dns-lookup?q=${encodeURIComponent(info.version === 4 ? info.address : info.compressed)}&ty=PTR`}
                className={linkClass}
              >
                DNS Lookup
              </Link>{' '}
              (this sends the address to a public DNS resolver).
            </p>
          </div>
        ) : (
          <p className={toolEmptyHintClass}>Enter an address to inspect it.</p>
        )}
      </div>
    </ToolLayout>
  )
}

export default function IpInspector() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="IP Address Inspector">
          <p className={toolEmptyHintClass}>Loading…</p>
        </ToolLayout>
      }
    >
      <IpInspectorInner />
    </Suspense>
  )
}
