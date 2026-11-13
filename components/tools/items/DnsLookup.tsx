'use client'

import Link from 'next/link'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useAchievementContext } from '@/context/AchievementContext'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  ClearButton,
  PrimaryButton
} from '@/components/tools/_shared/ToolButtons'
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
  toolWarningIntroClass,
  ToolChipButton,
  ToolChipRow,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { csv, enumParam, str, useToolUrlState } from '@/hooks/useToolUrlState'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import {
  DEFAULT_DNS_TYPES,
  DNS_PROVIDER_IDS,
  DNS_PROVIDERS,
  DNS_RECORD_TYPES,
  MAX_DNS_TYPES,
  lookupDnsTypes,
  normalizeDnsName,
  type DnsProviderId,
  type DnsRecordType,
  type DnsTypeOutcome
} from '@/utils/dnsLookup'

type LookupState =
  | { status: 'idle' }
  | { status: 'loading'; name: string }
  | {
      status: 'done'
      name: string
      provider: DnsProviderId
      outcomes: DnsTypeOutcome[]
    }

const linkClass = 'text-custom_blue underline-offset-2 hover:underline'

function DnsLookupInner() {
  const [url, setUrl] = useToolUrlState({
    q: str(''),
    ty: csv([...DEFAULT_DNS_TYPES]),
    p: enumParam<DnsProviderId>('cloudflare', DNS_PROVIDER_IDS)
  })
  const [lookup, setLookup] = useState<LookupState>({ status: 'idle' })
  const [inputError, setInputError] = useState<string | null>(null)
  const { copied, flash } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()
  const abortRef = useRef<AbortController | null>(null)
  const runRef = useRef(0)

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const provider = DNS_PROVIDERS[url.p]
  const selectedTypes: DnsRecordType[] = DNS_RECORD_TYPES.filter((type) =>
    url.ty.includes(type)
  )
  const types =
    selectedTypes.length > 0 ? selectedTypes : [...DEFAULT_DNS_TYPES]
  const loading = lookup.status === 'loading'

  const toggleType = (type: DnsRecordType) => {
    setUrl((current) => {
      const active = DNS_RECORD_TYPES.filter((t) => current.ty.includes(t))
      const has = active.includes(type)
      if (has && active.length === 1) return current
      if (!has && active.length >= MAX_DNS_TYPES) return current
      const next = has ? active.filter((t) => t !== type) : [...active, type]
      return {
        ...current,
        ty: DNS_RECORD_TYPES.filter((t) => next.includes(t))
      }
    })
  }

  const runLookup = async () => {
    const normalized = normalizeDnsName(url.q, types)
    if (!normalized.ok) {
      setInputError(normalized.error)
      setLookup({ status: 'idle' })
      return
    }
    setInputError(null)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    runRef.current += 1
    const run = runRef.current

    const { name } = normalized.value
    setLookup({ status: 'loading', name })
    const outcomes = await lookupDnsTypes(url.p, name, types, controller.signal)
    if (run !== runRef.current) return
    setLookup({ status: 'done', name, provider: url.p, outcomes })
  }

  const handleClear = () => {
    abortRef.current?.abort()
    runRef.current += 1
    setUrl((current) => ({ ...current, q: '' }))
    setLookup({ status: 'idle' })
    setInputError(null)
  }

  const handleCopy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text)
    unlockAchievement('clipboard-master')
    flash(key)
  }

  return (
    <ToolLayout title="DNS Lookup">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Query DNS records using DNS-over-HTTPS (JSON). Browsers cannot send
            raw DNS packets, so this tool asks a public resolver on your behalf.
          </p>
        }
      >
        <div className={toolWarningIntroClass}>
          <strong>Privacy:</strong> when you press Lookup, the hostname you type
          is sent from your browser to <strong>{provider.operator}</strong> (
          <code>{new URL(provider.endpoint).host}</code>), which can log it per
          their{' '}
          <a
            href={provider.privacyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            privacy policy
          </a>
          . Nothing is sent while you type, and opening a shared link will not
          run a query. Do not look up names you consider confidential. Some
          networks, VPNs, or extensions block DoH - switch provider if a lookup
          fails.
        </div>

        <label htmlFor="dns-name" className={toolLabelClass}>
          Domain name (or IP address for PTR)
        </label>
        <input
          id="dns-name"
          value={url.q}
          onChange={(e) => {
            setUrl((current) => ({ ...current, q: e.target.value }))
            setInputError(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !loading) void runLookup()
          }}
          spellCheck={false}
          autoComplete="off"
          placeholder="example.com"
          className={`${toolInputClass} font-mono`}
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <span className={toolLabelClass}>
              Record types (up to {MAX_DNS_TYPES})
            </span>
            <ToolChipRow>
              {DNS_RECORD_TYPES.map((type) => (
                <ToolChipButton
                  key={type}
                  active={types.includes(type)}
                  onClick={() => toggleType(type)}
                >
                  {type}
                </ToolChipButton>
              ))}
            </ToolChipRow>
          </div>
          <div>
            <span className={toolLabelClass}>Resolver</span>
            <ToolChipRow>
              {DNS_PROVIDER_IDS.map((id) => (
                <ToolChipButton
                  key={id}
                  active={url.p === id}
                  onClick={() => setUrl((current) => ({ ...current, p: id }))}
                >
                  {DNS_PROVIDERS[id].label}
                </ToolChipButton>
              ))}
            </ToolChipRow>
          </div>
        </div>

        <div className={toolToolbarBetweenClass}>
          <p className={toolHintMetaClass}>
            {inputError ? (
              <span className="text-red-400">{inputError}</span>
            ) : (
              <>
                Unicode names are converted to punycode. IPs are converted to{' '}
                <code>in-addr.arpa</code> / <code>ip6.arpa</code> for PTR.
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <PrimaryButton
              onClick={() => void runLookup()}
              disabled={!url.q.trim() || loading}
            >
              {loading ? 'Looking up…' : 'Lookup'}
            </PrimaryButton>
            <ClearButton onClick={handleClear}>Clear</ClearButton>
          </div>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <h2 className={`mb-3 ${toolSectionTitleClass}`}>Records</h2>

        {lookup.status === 'idle' ? (
          <p className={toolEmptyHintClass}>
            Results appear here after you run a lookup.
          </p>
        ) : lookup.status === 'loading' ? (
          <p className={toolEmptyHintClass}>
            Asking {provider.operator} about <code>{lookup.name}</code>…
          </p>
        ) : (
          <div className="space-y-5">
            <p className={toolHintMetaClass}>
              <code>{lookup.name}</code> via{' '}
              {DNS_PROVIDERS[lookup.provider].label}
            </p>
            {lookup.outcomes.map((outcome) => (
              <section key={outcome.type} className="space-y-2">
                <h3 className="text-sm font-semibold text-neutral-200">
                  {outcome.type}
                  {outcome.ok ? (
                    <span className="ml-2 text-xs font-normal text-neutral-500">
                      {outcome.answer.statusName}
                      {outcome.answer.flags.authenticated
                        ? ' · DNSSEC validated'
                        : ''}
                    </span>
                  ) : null}
                </h3>

                {!outcome.ok ? (
                  <div className={toolErrorBoxClass}>{outcome.error}</div>
                ) : outcome.answer.answers.length > 0 ? (
                  <ul className="space-y-2">
                    {outcome.answer.answers.map((record, index) => {
                      const key = `${outcome.type}-${index}`
                      return (
                        <li key={key} className={toolValueRowClass}>
                          <div className="min-w-0 flex-1 text-sm">
                            <span className="block text-xs text-neutral-500">
                              {record.name} · {record.type} · TTL {record.ttl}s
                            </span>
                            <span className="break-all font-mono text-neutral-200">
                              {record.data}
                            </span>
                          </div>
                          <ToolCopyButton
                            copied={copied === key}
                            onClick={() => handleCopy(key, record.data)}
                          />
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className={toolEmptyHintClass}>
                    No {outcome.type} records. {outcome.answer.statusHint}
                    {outcome.answer.comment
                      ? ` (${outcome.answer.comment})`
                      : ''}
                  </p>
                )}

                {outcome.ok && outcome.answer.flags.truncated ? (
                  <p className="text-xs text-amber-300/90">
                    The response was truncated; some records may be missing.
                  </p>
                ) : null}
              </section>
            ))}
            <p className={toolHintMetaClass}>
              Answers come from the resolver&apos;s cache and may differ from
              the authoritative nameservers until TTLs expire. See also the{' '}
              <Link href="/t/ip-inspector" className={linkClass}>
                IP Inspector
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

export default function DnsLookup() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="DNS Lookup">
          <p className={toolEmptyHintClass}>Loading…</p>
        </ToolLayout>
      }
    >
      <DnsLookupInner />
    </Suspense>
  )
}
