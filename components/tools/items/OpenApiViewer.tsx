'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import Link from 'next/link'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  ClearButton,
  SecondaryButton
} from '@/components/tools/_shared/ToolButtons'
import {
  toolCompactInputClass,
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolHintMetaClass,
  toolIntroTextClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarBetweenClass,
  ToolChipButton,
  ToolChipRow,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { useAchievementContext } from '@/context/AchievementContext'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import { pickTextFile, readTextFile } from '@/utils/download'
import {
  OPENAPI_METHODS,
  SAMPLE_OPENAPI_JSON,
  filterEndpoints,
  groupEndpointsByTag,
  parseOpenApiText,
  type ApiEndpoint,
  type ApiMediaContent,
  type ParsedOpenApi,
  type SchemaSummary
} from '@/utils/openapiParse'

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

type MethodFilter = ApiEndpoint['method'] | 'ALL'

const METHOD_FILTERS: readonly MethodFilter[] = [
  'ALL',
  ...OPENAPI_METHODS.map((m) => m.toUpperCase() as ApiEndpoint['method'])
]

const methodBadgeClass: Record<ApiEndpoint['method'], string> = {
  GET: 'bg-emerald-700/80 text-white',
  POST: 'bg-sky-700/80 text-white',
  PUT: 'bg-amber-600/90 text-white',
  PATCH: 'bg-violet-700/80 text-white',
  DELETE: 'bg-red-700/90 text-white',
  OPTIONS: 'bg-neutral-700 text-neutral-100',
  HEAD: 'bg-neutral-700 text-neutral-100',
  TRACE: 'bg-neutral-700 text-neutral-100'
}

const REQUEST_BUILDER_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])

function MethodBadge({ method }: { method: ApiEndpoint['method'] }) {
  return (
    <span
      className={`inline-flex h-6 w-16 shrink-0 items-center justify-center rounded text-[11px] font-semibold ${methodBadgeClass[method]}`}
    >
      {method}
    </span>
  )
}

function statusClass(status: string): string {
  if (status.startsWith('2')) return 'bg-emerald-600/80 text-white'
  if (status.startsWith('3')) return 'bg-sky-600/80 text-white'
  if (status.startsWith('4')) return 'bg-amber-600/90 text-white'
  if (status.startsWith('5')) return 'bg-red-700/90 text-white'
  return 'bg-neutral-700 text-neutral-100'
}

function SchemaView({ schema }: { schema: SchemaSummary }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <code className="rounded-md border border-white/10 bg-neutral-900/80 px-1.5 py-0.5 font-mono text-[13px] text-neutral-200">
          {schema.label}
        </code>
        {schema.ref ? (
          <span className="break-all font-mono text-neutral-500">{schema.ref}</span>
        ) : null}
      </div>
      {schema.description ? (
        <p className="text-xs text-neutral-400">{schema.description}</p>
      ) : null}
      {schema.enumValues ? (
        <p className="text-xs text-neutral-400">
          Enum:{' '}
          <span className="font-mono text-neutral-300">
            {schema.enumValues.join(', ')}
          </span>
        </p>
      ) : null}
      {schema.properties ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[22rem] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 uppercase tracking-wide text-neutral-400">
                <th className="py-1.5 pr-3 font-medium">Property</th>
                <th className="py-1.5 pr-3 font-medium">Type</th>
                <th className="py-1.5 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {schema.properties.map((prop) => (
                <tr key={prop.name} className="border-b border-white/5 align-top">
                  <td className="py-1.5 pr-3 font-mono text-neutral-100">
                    {prop.name}
                    {prop.required ? (
                      <span className="ml-1 text-red-400" title="required">
                        *
                      </span>
                    ) : null}
                  </td>
                  <td className="py-1.5 pr-3 font-mono text-neutral-300">
                    {prop.type}
                  </td>
                  <td className="py-1.5 text-neutral-400">
                    {prop.description ?? '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}

function MediaList({ content }: { content: ApiMediaContent[] }) {
  if (content.length === 0) return null
  return (
    <div className="mt-2 space-y-3">
      {content.map((item) => (
        <div key={item.mediaType} className="space-y-2">
          <p className="font-mono text-xs text-neutral-400">{item.mediaType}</p>
          {item.schema ? <SchemaView schema={item.schema} /> : null}
        </div>
      ))}
    </div>
  )
}

function EndpointDetail({
  endpoint,
  doc,
  copied,
  onCopy
}: {
  endpoint: ApiEndpoint
  doc: ParsedOpenApi
  copied: string | true | null
  onCopy: (key: string, text: string) => void
}) {
  const server = doc.servers[0]?.url
  const fullUrl = server
    ? `${server.replace(/\/$/, '')}${endpoint.path}`
    : endpoint.path
  const canOpenInBuilder =
    REQUEST_BUILDER_METHODS.has(endpoint.method) && /^https?:\/\//i.test(fullUrl)

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <MethodBadge method={endpoint.method} />
          <code className="min-w-0 flex-1 break-all font-mono text-sm text-neutral-100">
            {endpoint.path}
          </code>
          {endpoint.deprecated ? (
            <span className="rounded bg-amber-600/90 px-2 py-0.5 text-[11px] font-semibold text-white">
              Deprecated
            </span>
          ) : null}
        </div>
        {endpoint.summary ? (
          <p className="text-base font-medium text-white">{endpoint.summary}</p>
        ) : null}
        {endpoint.description ? (
          <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-400">
            {endpoint.description}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
          {endpoint.operationId ? (
            <span>
              operationId:{' '}
              <span className="font-mono text-neutral-300">
                {endpoint.operationId}
              </span>
            </span>
          ) : null}
          {endpoint.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-neutral-800 px-2 py-0.5 text-neutral-300"
            >
              {tag}
            </span>
          ))}
          {endpoint.security.length > 0 ? (
            <span>
              Security:{' '}
              <span className="font-mono text-neutral-300">
                {endpoint.security.join(', ')}
              </span>
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <ToolCopyButton
            copied={copied === 'path'}
            onClick={() => onCopy('path', endpoint.path)}
            idleLabel="Copy path"
          />
          <ToolCopyButton
            copied={copied === 'url'}
            onClick={() => onCopy('url', `${endpoint.method} ${fullUrl}`)}
            idleLabel="Copy method + URL"
          />
          {canOpenInBuilder ? (
            <Link
              href={`/t/http-request-builder?method=${endpoint.method}&url=${encodeURIComponent(fullUrl)}`}
              className="inline-flex h-8 items-center rounded-md bg-neutral-800 px-3 text-xs font-medium text-neutral-100 transition hover:bg-neutral-700"
            >
              Open in request builder
            </Link>
          ) : null}
        </div>
      </div>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-neutral-200">
          Parameters
        </h3>
        {endpoint.parameters.length === 0 ? (
          <p className={toolEmptyHintClass}>No parameters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 uppercase tracking-wide text-neutral-400">
                  <th className="py-1.5 pr-3 font-medium">Name</th>
                  <th className="py-1.5 pr-3 font-medium">In</th>
                  <th className="py-1.5 pr-3 font-medium">Type</th>
                  <th className="py-1.5 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {endpoint.parameters.map((param) => (
                  <tr
                    key={`${param.in}:${param.name}`}
                    className="border-b border-white/5 align-top"
                  >
                    <td className="py-1.5 pr-3 font-mono text-neutral-100">
                      {param.name}
                      {param.required ? (
                        <span className="ml-1 text-red-400" title="required">
                          *
                        </span>
                      ) : null}
                    </td>
                    <td className="py-1.5 pr-3 text-neutral-300">{param.in}</td>
                    <td className="py-1.5 pr-3 font-mono text-neutral-300">
                      {param.type}
                    </td>
                    <td className="py-1.5 text-neutral-400">
                      {param.description ?? '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-neutral-200">
          Request body
          {endpoint.requestBody?.required ? (
            <span className="ml-2 text-xs font-normal text-red-400">required</span>
          ) : null}
        </h3>
        {!endpoint.requestBody ? (
          <p className={toolEmptyHintClass}>No request body.</p>
        ) : (
          <>
            {endpoint.requestBody.description ? (
              <p className="text-sm text-neutral-400">
                {endpoint.requestBody.description}
              </p>
            ) : null}
            <MediaList content={endpoint.requestBody.content} />
          </>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-neutral-200">
          Responses
        </h3>
        {endpoint.responses.length === 0 ? (
          <p className={toolEmptyHintClass}>No responses documented.</p>
        ) : (
          <ul className="space-y-3">
            {endpoint.responses.map((response) => (
              <li
                key={response.status}
                className="rounded-lg border border-white/10 bg-neutral-900/50 p-3"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex h-6 min-w-11 items-center justify-center rounded px-2 text-xs font-semibold ${statusClass(response.status)}`}
                  >
                    {response.status}
                  </span>
                  <span className="text-sm text-neutral-300">
                    {response.description ?? ''}
                  </span>
                </div>
                <MediaList content={response.content} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default function OpenApiViewer() {
  const [text, setText] = useState('')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('ALL')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedSchema, setSelectedSchema] = useState<string | null>(null)
  const { copied, flash } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()

  const deferredText = useDeferredValue(text)
  const parsed = useMemo(
    () => (deferredText.trim() ? parseOpenApiText(deferredText) : null),
    [deferredText]
  )
  const doc = parsed?.ok ? parsed.doc : null

  const filtered = useMemo(
    () => (doc ? filterEndpoints(doc.endpoints, search, methodFilter) : []),
    [doc, search, methodFilter]
  )
  const groups = useMemo(
    () =>
      doc
        ? groupEndpointsByTag(
            filtered,
            doc.tags.map((t) => t.name)
          )
        : [],
    [doc, filtered]
  )

  const selected =
    doc?.endpoints.find((endpoint) => endpoint.id === selectedId) ??
    filtered[0] ??
    null

  const schemaNames = doc ? Object.keys(doc.schemas) : []
  const activeSchema =
    doc && selectedSchema && selectedSchema in doc.schemas
      ? doc.schemas[selectedSchema]
      : null

  const handleCopy = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value)
    unlockAchievement('clipboard-master')
    flash(key)
  }

  const handleUpload = async () => {
    setUploadError(null)
    const file = await pickTextFile('.json,.yaml,.yml,.txt,application/json,text/yaml')
    if (!file) return
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError('File is larger than 5 MB.')
      return
    }
    try {
      setText(await readTextFile(file))
      setFileName(file.name)
      setSelectedId(null)
      setSelectedSchema(null)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Could not read file.')
    }
  }

  const reset = () => {
    setText('')
    setFileName(null)
    setUploadError(null)
    setSearch('')
    setMethodFilter('ALL')
    setSelectedId(null)
    setSelectedSchema(null)
  }

  return (
    <ToolLayout title="OpenAPI viewer">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Paste or upload an OpenAPI <code>3.x</code> document (JSON or YAML)
            to browse endpoints, parameters and schemas. Everything is parsed
            in your browser - nothing is uploaded and external{' '}
            <code>$ref</code> files are not fetched. Swagger 2.0 is not
            supported. To try an endpoint, open it in the{' '}
            <Link
              href="/t/http-request-builder"
              className="text-custom_blue underline-offset-2 hover:underline"
            >
              HTTP request builder
            </Link>
            .
          </p>
        }
      >
        <TextAreaWithLineNumbers
          value={text}
          setValue={(v) => {
            setText(v)
            setFileName(null)
          }}
          placeholder={'openapi: 3.0.3\ninfo:\n  title: My API\n  version: 1.0.0\npaths: {}'}
        />
        <div className={toolToolbarBetweenClass}>
          <p className={`${toolHintMetaClass} max-w-xl`}>
            {fileName ? `Loaded ${fileName}. ` : ''}
            Up to 5 MB. JSON is a valid YAML subset, so either works.
          </p>
          <div className="flex flex-wrap gap-3">
            <SecondaryButton
              onClick={() => {
                setText(SAMPLE_OPENAPI_JSON)
                setFileName(null)
                setSelectedId(null)
              }}
            >
              Load sample
            </SecondaryButton>
            <SecondaryButton onClick={() => void handleUpload()}>
              Upload file
            </SecondaryButton>
            <ClearButton onClick={reset}>Clear</ClearButton>
          </div>
        </div>
        {uploadError ? (
          <div className={`${toolErrorBoxClass} mt-4`}>{uploadError}</div>
        ) : null}
      </ToolInputPanel>

      {parsed && !parsed.ok ? (
        <div className={toolResultPanelClass}>
          <div className={toolErrorBoxClass} role="alert">
            <pre className="whitespace-pre-wrap break-words font-mono text-sm">
              {parsed.error}
            </pre>
          </div>
        </div>
      ) : null}

      {!parsed ? (
        <div className={toolResultPanelClass}>
          <div className={toolResultHeaderRowClass}>
            <h2 className={toolSectionTitleClass}>Endpoints</h2>
          </div>
          <p className={toolEmptyHintClass}>
            Paste a spec or load the sample to list endpoints here.
          </p>
        </div>
      ) : null}

      {doc ? (
        <>
          <div className={toolResultPanelClass}>
            <div className={toolResultHeaderRowClass}>
              <h2 className={toolSectionTitleClass}>{doc.title}</h2>
              <span className="rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-300">
                OpenAPI {doc.openapi}
                {doc.apiVersion ? ` · v${doc.apiVersion}` : ''}
              </span>
            </div>
            {doc.description ? (
              <p className="mb-3 whitespace-pre-line text-sm leading-relaxed text-neutral-400">
                {doc.description}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-neutral-400">
              <span>
                {doc.endpoints.length} endpoint
                {doc.endpoints.length === 1 ? '' : 's'}
              </span>
              <span>
                {schemaNames.length} schema{schemaNames.length === 1 ? '' : 's'}
              </span>
              {doc.servers.map((server) => (
                <span key={server.url}>
                  Server:{' '}
                  <span className="font-mono text-neutral-300">{server.url}</span>
                  {server.description ? ` (${server.description})` : ''}
                </span>
              ))}
            </div>
            {doc.warnings.length > 0 ? (
              <ul className="mt-3 space-y-1 text-xs text-amber-200/90">
                {doc.warnings.map((warning) => (
                  <li key={warning}>• {warning}</li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
            <div className={toolResultPanelClass}>
              <div className={toolResultHeaderRowClass}>
                <h2 className={toolSectionTitleClass}>Endpoints</h2>
                <span className="text-xs text-neutral-500">
                  {filtered.length} / {doc.endpoints.length}
                </span>
              </div>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search path, summary, tag…"
                aria-label="Search endpoints"
                spellCheck={false}
                className={toolCompactInputClass}
              />
              <ToolChipRow className="mt-3">
                {METHOD_FILTERS.map((m) => (
                  <ToolChipButton
                    key={m}
                    active={methodFilter === m}
                    onClick={() => setMethodFilter(m)}
                  >
                    {m === 'ALL' ? 'All' : m}
                  </ToolChipButton>
                ))}
              </ToolChipRow>

              <div className="mt-4 max-h-[32rem] space-y-4 overflow-y-auto pr-1">
                {filtered.length === 0 ? (
                  <p className={toolEmptyHintClass}>No endpoints match.</p>
                ) : (
                  groups.map((group) => (
                    <div key={group.tag}>
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        {group.tag}
                      </p>
                      <ul className="space-y-1">
                        {group.endpoints.map((endpoint) => {
                          const active = selected?.id === endpoint.id
                          return (
                            <li key={endpoint.id}>
                              <button
                                type="button"
                                onClick={() => setSelectedId(endpoint.id)}
                                aria-current={active ? 'true' : undefined}
                                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition ${
                                  active
                                    ? 'bg-neutral-800 text-white'
                                    : 'text-neutral-300 hover:bg-neutral-900'
                                }`}
                              >
                                <MethodBadge method={endpoint.method} />
                                <span
                                  className={`min-w-0 flex-1 break-all font-mono text-xs ${
                                    endpoint.deprecated ? 'line-through opacity-60' : ''
                                  }`}
                                >
                                  {endpoint.path}
                                </span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className={toolResultPanelClass}>
              <div className={toolResultHeaderRowClass}>
                <h2 className={toolSectionTitleClass}>Detail</h2>
              </div>
              {selected ? (
                <EndpointDetail
                  endpoint={selected}
                  doc={doc}
                  copied={copied}
                  onCopy={(key, value) => void handleCopy(key, value)}
                />
              ) : (
                <p className={toolEmptyHintClass}>
                  {doc.endpoints.length === 0
                    ? 'This document has no paths.'
                    : 'Select an endpoint to see details.'}
                </p>
              )}
            </div>
          </div>

          {schemaNames.length > 0 ? (
            <div className={toolResultPanelClass}>
              <div className={toolResultHeaderRowClass}>
                <h2 className={toolSectionTitleClass}>Schemas</h2>
              </div>
              <ToolChipRow>
                {schemaNames.map((name) => (
                  <ToolChipButton
                    key={name}
                    active={selectedSchema === name}
                    onClick={() =>
                      setSelectedSchema((current) => (current === name ? null : name))
                    }
                  >
                    {name}
                  </ToolChipButton>
                ))}
              </ToolChipRow>
              <div className="mt-4">
                {activeSchema ? (
                  <SchemaView schema={activeSchema} />
                ) : (
                  <p className={toolEmptyHintClass}>
                    Pick a schema to inspect its properties.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </ToolLayout>
  )
}
