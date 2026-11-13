'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  ClearButton,
  PrimaryButton,
  RemoveButton,
  SecondaryButton
} from '@/components/tools/_shared/ToolButtons'
import {
  toolCompactInputClass,
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolHintMetaClass,
  toolInputClass,
  toolIntroTextClass,
  toolLabelClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolWarningIntroClass,
  ToolChipButton,
  ToolChipRow,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { useAchievementContext } from '@/context/AchievementContext'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import { custom, enumParam, useToolUrlState } from '@/hooks/useToolUrlState'
import {
  HTTP_METHODS,
  buildRequest,
  createRow,
  executeRequest,
  formatBytes,
  formatDuration,
  formatResponseMeta,
  isForbiddenHeaderName,
  methodAllowsBody,
  previewRequestUrl,
  redactUrl,
  splitUrlQuery,
  statusTone,
  tryFormatJson,
  urlLooksSensitive,
  type AuthMode,
  type BodyMode,
  type ExecuteSuccess,
  type FetchFailure,
  type HttpMethod,
  type KeyValueRow,
  type StatusTone
} from '@/utils/httpRequestBuilder'

const TIMEOUT_OPTIONS = [
  { label: '10 s', ms: 10_000 },
  { label: '30 s', ms: 30_000 },
  { label: '60 s', ms: 60_000 }
] as const

const HISTORY_LIMIT = 20
const BODY_DISPLAY_LIMIT = 200_000

const BODY_MODES: readonly { id: BodyMode; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'json', label: 'JSON' },
  { id: 'raw', label: 'Raw' }
]

const AUTH_MODES: readonly { id: AuthMode; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'bearer', label: 'Bearer' },
  { id: 'basic', label: 'Basic' }
]

const cellInputClass =
  'ring-custom_blue/40 w-full min-w-[6rem] rounded-md border border-white/10 bg-neutral-900/80 px-2 py-1.5 font-mono text-[13px] text-neutral-100 outline-none placeholder:text-neutral-600 focus:ring-2'

const statusToneClass: Record<StatusTone, string> = {
  info: 'bg-neutral-700 text-neutral-100',
  success: 'bg-emerald-600/80 text-white',
  redirect: 'bg-sky-600/80 text-white',
  client: 'bg-amber-600/90 text-white',
  server: 'bg-red-700/90 text-white'
}

/**
 * Only non-secret request shape goes to the URL. The URL field is skipped
 * entirely when it looks like it carries credentials. Headers, body and auth
 * are never serialized.
 */
const urlFieldCodec = custom<string>(
  '',
  (raw) => raw ?? '',
  (value) => (value === '' || urlLooksSensitive(value) ? null : value),
  { text: true }
)

type RequestSnapshot = {
  method: HttpMethod
  url: string
  query: KeyValueRow[]
  headers: KeyValueRow[]
  bodyMode: BodyMode
  body: string
}

type HistoryEntry = {
  id: string
  at: number
  method: HttpMethod
  url: string
  status: number | null
  totalMs: number
  failureTitle: string | null
  snapshot: RequestSnapshot
}

type ResponseState =
  | { kind: 'success'; result: ExecuteSuccess; sentUrl: string }
  | { kind: 'failure'; failure: FetchFailure; sentUrl: string }

function cloneRows(rows: readonly KeyValueRow[]): KeyValueRow[] {
  return rows.map((row) => ({ ...row }))
}

function KeyValueEditor({
  rows,
  onChange,
  label,
  namePlaceholder,
  valuePlaceholder,
  headerMode = false
}: {
  rows: KeyValueRow[]
  onChange: (rows: KeyValueRow[]) => void
  label: string
  namePlaceholder: string
  valuePlaceholder: string
  headerMode?: boolean
}) {
  const update = (id: string, patch: Partial<KeyValueRow>) =>
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)))

  if (rows.length === 0) {
    return (
      <p className={toolEmptyHintClass}>
        No {label.toLowerCase()} yet. Use the add button to create one.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-neutral-400">
            <th className="w-10 py-2 pr-3 font-medium">On</th>
            <th className="py-2 pr-3 font-medium">Name</th>
            <th className="py-2 pr-3 font-medium">Value</th>
            <th className="w-28 py-2 font-medium">
              <span className="sr-only">Remove</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const forbidden =
              headerMode && row.name.trim() && isForbiddenHeaderName(row.name)
            return (
              <tr key={row.id} className="border-b border-white/5">
                <td className="py-2 pr-3 align-middle">
                  <input
                    type="checkbox"
                    checked={row.enabled}
                    onChange={(e) => update(row.id, { enabled: e.target.checked })}
                    aria-label={`${label} ${index + 1} enabled`}
                    className="size-4 accent-custom_blue"
                  />
                </td>
                <td className="py-2 pr-3 align-middle">
                  <input
                    value={row.name}
                    onChange={(e) => update(row.id, { name: e.target.value })}
                    spellCheck={false}
                    autoComplete="off"
                    className={cellInputClass}
                    placeholder={namePlaceholder}
                    aria-label={`${label} name ${index + 1}`}
                  />
                  {forbidden ? (
                    <p className="mt-1 text-xs text-amber-300/90">
                      Browser-controlled header - it will not be sent.
                    </p>
                  ) : null}
                </td>
                <td className="py-2 pr-3 align-middle">
                  <input
                    value={row.value}
                    onChange={(e) => update(row.id, { value: e.target.value })}
                    spellCheck={false}
                    autoComplete="off"
                    className={cellInputClass}
                    placeholder={valuePlaceholder}
                    aria-label={`${label} value ${index + 1}`}
                  />
                </td>
                <td className="py-2 align-middle">
                  <RemoveButton
                    onClick={() => onChange(rows.filter((r) => r.id !== row.id))}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function HttpRequestBuilderInner() {
  const [urlState, setUrlState] = useToolUrlState({
    method: enumParam<HttpMethod>('GET', HTTP_METHODS),
    url: urlFieldCodec
  })
  const method = urlState.method
  const url = urlState.url

  const [query, setQuery] = useState<KeyValueRow[]>([])
  const [headers, setHeaders] = useState<KeyValueRow[]>([])
  const [bodyMode, setBodyMode] = useState<BodyMode>('none')
  const [body, setBody] = useState('')

  // Secrets: React state only. Never passed to useToolUrlState / URL / storage.
  const [authMode, setAuthMode] = useState<AuthMode>('none')
  const [bearerToken, setBearerToken] = useState('')
  const [basicUser, setBasicUser] = useState('')
  const [basicPass, setBasicPass] = useState('')

  const [timeoutMs, setTimeoutMs] = useState<number>(30_000)
  const [sending, setSending] = useState(false)
  const [buildError, setBuildError] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [response, setResponse] = useState<ResponseState | null>(null)
  const [responseTab, setResponseTab] = useState<'body' | 'headers'>('body')
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const abortRef = useRef<AbortController | null>(null)
  const { copied, flash } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const setMethod = (next: HttpMethod) =>
    setUrlState((s) => ({ ...s, method: next }))
  const setUrl = (next: string) => setUrlState((s) => ({ ...s, url: next }))

  const preview = previewRequestUrl(url, query)
  const bodyDisabled = !methodAllowsBody(method)

  const send = async () => {
    const built = buildRequest({
      method,
      url,
      query,
      headers,
      bodyMode,
      body,
      auth:
        authMode === 'bearer'
          ? { mode: 'bearer', token: bearerToken }
          : authMode === 'basic'
            ? { mode: 'basic', username: basicUser, password: basicPass }
            : { mode: 'none' }
    })

    if (!built.ok) {
      setBuildError(built.error)
      setWarnings([])
      return
    }

    setBuildError(null)
    setWarnings(built.warnings)
    setSending(true)

    const controller = new AbortController()
    abortRef.current = controller

    const result = await executeRequest(built, {
      timeoutMs,
      signal: controller.signal,
      pageProtocol: window.location.protocol
    })

    abortRef.current = null
    setSending(false)

    const snapshot: RequestSnapshot = {
      method,
      url,
      query: cloneRows(query),
      headers: cloneRows(headers),
      bodyMode,
      body
    }

    if (result.ok) {
      setResponse({ kind: 'success', result, sentUrl: built.url })
      setResponseTab('body')
    } else {
      setResponse({
        kind: 'failure',
        failure: result.failure,
        sentUrl: built.url
      })
    }

    setHistory((prev) =>
      [
        {
          id: `${Date.now()}-${prev.length}`,
          at: Date.now(),
          method,
          url: built.url,
          status: result.ok ? result.meta.status : null,
          totalMs: result.ok ? result.meta.totalMs : result.elapsedMs,
          failureTitle: result.ok ? null : result.failure.title,
          snapshot
        },
        ...prev
      ].slice(0, HISTORY_LIMIT)
    )
  }

  const cancel = () => abortRef.current?.abort()

  const restore = (entry: HistoryEntry) => {
    setUrlState({ method: entry.snapshot.method, url: entry.snapshot.url })
    setQuery(cloneRows(entry.snapshot.query))
    setHeaders(cloneRows(entry.snapshot.headers))
    setBodyMode(entry.snapshot.bodyMode)
    setBody(entry.snapshot.body)
  }

  const clearSecrets = () => {
    setBearerToken('')
    setBasicUser('')
    setBasicPass('')
    setAuthMode('none')
  }

  const resetAll = () => {
    abortRef.current?.abort()
    setUrlState({ method: 'GET', url: '' })
    setQuery([])
    setHeaders([])
    setBodyMode('none')
    setBody('')
    clearSecrets()
    setResponse(null)
    setBuildError(null)
    setWarnings([])
  }

  const handleCopy = async (key: string, text: string) => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    unlockAchievement('clipboard-master')
    flash(key)
  }

  const moveQueryFromUrl = () => {
    const split = splitUrlQuery(url)
    if (split.rows.length === 0) return
    setUrl(split.base)
    setQuery((prev) => [...prev, ...split.rows])
  }

  const urlHasQuery = url.includes('?')

  return (
    <ToolLayout title="HTTP request builder">
      <ToolInputPanel
        intro={
          <>
            <p className={toolWarningIntroClass}>
              <strong>Browser-only, no proxy.</strong> Requests are sent
              directly from your browser with <code>fetch</code>, so they are
              subject to <strong>CORS</strong>: the target server must send{' '}
              <code>Access-Control-Allow-Origin</code> for this site, or the
              response cannot be read (it shows up as a generic network error).
              Nothing goes through our servers. This is not a Postman
              replacement - for CORS-blocked APIs use your terminal or convert
              the request with{' '}
              <Link
                href="/t/curl-to-http"
                className="text-custom_blue underline-offset-2 hover:underline"
              >
                curl to fetch
              </Link>
              .
            </p>
            <p className={toolIntroTextClass}>
              Credentials you enter under Auth live in memory only. They are
              never written to the page URL or storage, and disappear on
              refresh. Method and URL may be saved in the page URL for sharing
              (skipped automatically when the URL looks like it holds a token).
            </p>
          </>
        }
      >
        <div className="space-y-6">
          <div>
            <span className={toolLabelClass}>Method</span>
            <ToolChipRow>
              {HTTP_METHODS.map((m) => (
                <ToolChipButton
                  key={m}
                  active={method === m}
                  onClick={() => setMethod(m)}
                >
                  {m}
                </ToolChipButton>
              ))}
            </ToolChipRow>
          </div>

          <div>
            <label htmlFor="http-url" className={toolLabelClass}>
              URL
            </label>
            <input
              id="http-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !sending) void send()
              }}
              spellCheck={false}
              autoComplete="off"
              placeholder="https://httpbin.org/get"
              className={`${toolInputClass} font-mono`}
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <p
                className={`${toolHintMetaClass} min-w-0 flex-1 break-all`}
                aria-live="polite"
              >
                {preview ? (
                  <>
                    Will request:{' '}
                    <span className="font-mono text-neutral-300">{preview}</span>
                  </>
                ) : (
                  'Include a scheme; https:// is assumed when omitted.'
                )}
              </p>
              {urlHasQuery ? (
                <SecondaryButton onClick={moveQueryFromUrl}>
                  Move ?query into table
                </SecondaryButton>
              ) : null}
            </div>
          </div>

          <div>
            <div className={toolResultHeaderRowClass}>
              <h3 className="text-sm font-semibold text-neutral-200">
                Query parameters
              </h3>
              <SecondaryButton
                onClick={() => setQuery((rows) => [...rows, createRow()])}
              >
                Add parameter
              </SecondaryButton>
            </div>
            <KeyValueEditor
              rows={query}
              onChange={setQuery}
              label="Query"
              namePlaceholder="key"
              valuePlaceholder="value"
            />
          </div>

          <div>
            <div className={toolResultHeaderRowClass}>
              <h3 className="text-sm font-semibold text-neutral-200">Headers</h3>
              <div className="flex flex-wrap gap-2">
                <SecondaryButton
                  onClick={() =>
                    setHeaders((rows) => [
                      ...rows,
                      createRow('Accept', 'application/json')
                    ])
                  }
                >
                  Add Accept
                </SecondaryButton>
                <SecondaryButton
                  onClick={() => setHeaders((rows) => [...rows, createRow()])}
                >
                  Add header
                </SecondaryButton>
              </div>
            </div>
            <KeyValueEditor
              rows={headers}
              onChange={setHeaders}
              label="Header"
              namePlaceholder="Header-Name"
              valuePlaceholder="value"
              headerMode
            />
          </div>

          <div>
            <div className={toolResultHeaderRowClass}>
              <h3 className="text-sm font-semibold text-neutral-200">Body</h3>
              <ToolChipRow>
                {BODY_MODES.map((mode) => (
                  <ToolChipButton
                    key={mode.id}
                    active={bodyMode === mode.id}
                    onClick={() => setBodyMode(mode.id)}
                    disabled={bodyDisabled && mode.id !== 'none'}
                  >
                    {mode.label}
                  </ToolChipButton>
                ))}
              </ToolChipRow>
            </div>
            {bodyDisabled ? (
              <p className={toolHintMetaClass}>
                GET requests cannot carry a body. Pick another method to enable
                it.
              </p>
            ) : bodyMode === 'none' ? (
              <p className={toolHintMetaClass}>No request body.</p>
            ) : (
              <>
                <TextAreaWithLineNumbers
                  value={body}
                  setValue={setBody}
                  placeholder={
                    bodyMode === 'json' ? '{\n  "hello": "world"\n}' : 'Raw body text'
                  }
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className={toolHintMetaClass}>
                    {bodyMode === 'json'
                      ? 'Validated before sending. Content-Type: application/json is added unless you set one.'
                      : 'Sent as-is. Set a Content-Type header if the server needs one.'}
                  </p>
                  {bodyMode === 'json' ? (
                    <SecondaryButton
                      onClick={() => {
                        const formatted = tryFormatJson(body)
                        if (formatted !== null) setBody(formatted)
                      }}
                      disabled={tryFormatJson(body) === null}
                    >
                      Format JSON
                    </SecondaryButton>
                  ) : null}
                </div>
              </>
            )}
          </div>

          <div>
            <div className={toolResultHeaderRowClass}>
              <h3 className="text-sm font-semibold text-neutral-200">Auth</h3>
              <ToolChipRow>
                {AUTH_MODES.map((mode) => (
                  <ToolChipButton
                    key={mode.id}
                    active={authMode === mode.id}
                    onClick={() => setAuthMode(mode.id)}
                  >
                    {mode.label}
                  </ToolChipButton>
                ))}
              </ToolChipRow>
            </div>
            {authMode !== 'none' ? (
              <div className="space-y-3">
                <p className={toolWarningIntroClass}>
                  Held in memory for this tab only - never added to the URL or
                  saved. Use throwaway or test credentials; anything you send
                  goes straight to the target server in the clear if the URL is{' '}
                  <code>http://</code>.
                </p>
                {authMode === 'bearer' ? (
                  <div>
                    <label htmlFor="http-bearer" className={toolLabelClass}>
                      Bearer token
                    </label>
                    <input
                      id="http-bearer"
                      type="password"
                      value={bearerToken}
                      onChange={(e) => setBearerToken(e.target.value)}
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="token"
                      className={`${toolCompactInputClass} font-mono`}
                    />
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="http-basic-user" className={toolLabelClass}>
                        Username
                      </label>
                      <input
                        id="http-basic-user"
                        value={basicUser}
                        onChange={(e) => setBasicUser(e.target.value)}
                        autoComplete="off"
                        spellCheck={false}
                        className={`${toolCompactInputClass} font-mono`}
                      />
                    </div>
                    <div>
                      <label htmlFor="http-basic-pass" className={toolLabelClass}>
                        Password
                      </label>
                      <input
                        id="http-basic-pass"
                        type="password"
                        value={basicPass}
                        onChange={(e) => setBasicPass(e.target.value)}
                        autoComplete="off"
                        spellCheck={false}
                        className={`${toolCompactInputClass} font-mono`}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <SecondaryButton onClick={clearSecrets}>
                    Clear credentials
                  </SecondaryButton>
                </div>
              </div>
            ) : (
              <p className={toolHintMetaClass}>
                Optional. Adds an Authorization header; replaces one set in the
                headers table.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-neutral-400">Timeout</span>
              <ToolChipRow>
                {TIMEOUT_OPTIONS.map((option) => (
                  <ToolChipButton
                    key={option.ms}
                    active={timeoutMs === option.ms}
                    onClick={() => setTimeoutMs(option.ms)}
                  >
                    {option.label}
                  </ToolChipButton>
                ))}
              </ToolChipRow>
            </div>
            <div className="flex flex-wrap gap-3">
              {sending ? (
                <SecondaryButton onClick={cancel}>Cancel</SecondaryButton>
              ) : null}
              <PrimaryButton onClick={() => void send()} disabled={sending || !url.trim()}>
                {sending ? 'Sending…' : 'Send'}
              </PrimaryButton>
              <ClearButton onClick={resetAll}>Reset</ClearButton>
            </div>
          </div>

          {buildError ? (
            <div className={toolErrorBoxClass} role="alert">
              {buildError}
            </div>
          ) : null}
          {warnings.length > 0 ? (
            <ul className="space-y-1 text-xs text-amber-200/90">
              {warnings.map((warning) => (
                <li key={warning}>• {warning}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Response</h2>
          {response?.kind === 'success' ? (
            <ToolCopyButton
              copied={copied === 'body'}
              onClick={() =>
                handleCopy('body', response.result.bodyDisplay || response.result.bodyText)
              }
              idleLabel="Copy body"
              disabled={response.result.isBinary}
            />
          ) : null}
        </div>

        {!response ? (
          <p className={toolEmptyHintClass}>
            Send a request to see status, timing, size, headers and body here.
          </p>
        ) : response.kind === 'failure' ? (
          <div className="space-y-3" role="alert">
            <div className={toolErrorBoxClass}>
              <p className="font-semibold">{response.failure.title}</p>
              <p className="mt-1">{response.failure.message}</p>
            </div>
            {response.failure.hints.length > 0 ? (
              <ul className="list-disc space-y-2 pl-5 text-sm text-neutral-400">
                {response.failure.hints.map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ul>
            ) : null}
            <p className={`${toolHintMetaClass} break-all`}>
              Target: <span className="font-mono">{redactUrl(response.sentUrl)}</span>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex h-8 items-center rounded-md px-3 text-xs font-semibold ${
                  statusToneClass[statusTone(response.result.meta.status)]
                }`}
              >
                {response.result.meta.status} {response.result.meta.statusText}
              </span>
              <span className="inline-flex h-8 items-center rounded-md bg-neutral-800 px-3 text-xs text-neutral-200">
                {formatDuration(response.result.meta.totalMs)}
              </span>
              <span className="inline-flex h-8 items-center rounded-md bg-neutral-800 px-3 text-xs text-neutral-200">
                {formatBytes(response.result.meta.sizeBytes)}
              </span>
              {response.result.meta.contentType ? (
                <span className="inline-flex h-8 max-w-full items-center truncate rounded-md bg-neutral-800 px-3 font-mono text-xs text-neutral-300">
                  {response.result.meta.contentType}
                </span>
              ) : null}
            </div>

            <dl className="grid gap-x-6 gap-y-1 text-xs text-neutral-400 sm:grid-cols-2">
              {formatResponseMeta(response.result.meta)
                .filter((item) => item.label === 'Headers in' || item.label === 'Final URL')
                .map((item) => (
                  <div key={item.label} className="flex gap-2">
                    <dt className="shrink-0">{item.label}:</dt>
                    <dd className="break-all font-mono text-neutral-300">
                      {item.label === 'Final URL' ? redactUrl(item.value) : item.value}
                    </dd>
                  </div>
                ))}
            </dl>

            <ToolChipRow>
              <ToolChipButton
                active={responseTab === 'body'}
                onClick={() => setResponseTab('body')}
              >
                Body{response.result.isJson ? ' (JSON)' : ''}
              </ToolChipButton>
              <ToolChipButton
                active={responseTab === 'headers'}
                onClick={() => setResponseTab('headers')}
              >
                Headers ({response.result.meta.headers.length})
              </ToolChipButton>
            </ToolChipRow>

            {responseTab === 'body' ? (
              response.result.isBinary ? (
                <p className={toolEmptyHintClass}>
                  Binary response ({response.result.meta.contentType}) -{' '}
                  {formatBytes(response.result.meta.sizeBytes)} not displayed.
                </p>
              ) : response.result.bodyText === '' ? (
                <p className={toolEmptyHintClass}>Empty response body.</p>
              ) : (
                <>
                  <pre className={`${toolPreOutputClass} max-h-[28rem] text-xs sm:text-sm`}>
                    {response.result.bodyDisplay.length > BODY_DISPLAY_LIMIT
                      ? response.result.bodyDisplay.slice(0, BODY_DISPLAY_LIMIT)
                      : response.result.bodyDisplay}
                  </pre>
                  {response.result.bodyDisplay.length > BODY_DISPLAY_LIMIT ? (
                    <p className={`${toolHintMetaClass} mt-2`}>
                      Display truncated to {BODY_DISPLAY_LIMIT.toLocaleString()}{' '}
                      characters. Copy body still copies the full text.
                    </p>
                  ) : null}
                </>
              )
            ) : (
              <>
                {response.result.meta.headers.length === 0 ? (
                  <p className={toolEmptyHintClass}>
                    No readable response headers.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {response.result.meta.headers.map(([name, value]) => (
                      <li
                        key={`${name}:${value}`}
                        className="flex flex-col gap-1 rounded-lg border border-white/10 bg-neutral-900/50 px-3 py-2 sm:flex-row sm:gap-3"
                      >
                        <span className="w-48 shrink-0 break-all font-mono text-xs font-medium text-neutral-300">
                          {name}
                        </span>
                        <span className="min-w-0 flex-1 break-all font-mono text-xs text-neutral-100">
                          {value}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className={`${toolHintMetaClass} mt-3`}>
                  Cross-origin responses only expose CORS-safelisted headers
                  plus those listed in <code>Access-Control-Expose-Headers</code>
                  , so some headers may be missing.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Session history</h2>
          {history.length > 0 ? (
            <ClearButton onClick={() => setHistory([])}>Clear history</ClearButton>
          ) : null}
        </div>
        {history.length === 0 ? (
          <p className={toolEmptyHintClass}>
            Requests you send appear here until you refresh. Kept in memory
            only; auth credentials are not stored.
          </p>
        ) : (
          <ul className="space-y-2">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-neutral-900/50 px-3 py-2"
              >
                <span className="w-16 shrink-0 font-mono text-xs font-semibold text-neutral-300">
                  {entry.method}
                </span>
                <span
                  className={`inline-flex h-6 shrink-0 items-center rounded px-2 text-xs font-semibold ${
                    entry.status === null
                      ? 'bg-red-700/90 text-white'
                      : statusToneClass[statusTone(entry.status)]
                  }`}
                  title={entry.failureTitle ?? undefined}
                >
                  {entry.status ?? 'ERR'}
                </span>
                <span className="min-w-0 flex-1 break-all font-mono text-xs text-neutral-200">
                  {redactUrl(entry.url)}
                </span>
                <span className="shrink-0 text-xs text-neutral-500">
                  {formatDuration(entry.totalMs)} ·{' '}
                  {new Date(entry.at).toLocaleTimeString()}
                </span>
                <SecondaryButton onClick={() => restore(entry)}>
                  Restore
                </SecondaryButton>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ToolLayout>
  )
}

export default function HttpRequestBuilder() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="HTTP request builder">
          <p className="text-center text-sm text-neutral-400">Loading…</p>
        </ToolLayout>
      }
    >
      <HttpRequestBuilderInner />
    </Suspense>
  )
}
