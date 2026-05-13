'use client'

import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { TTools } from '@/constants/types'
import { matchesToolQuery, groupToolsBySection } from '@/utils/toolUtils'

type ToolsDirectoryClientProps = {
  tools: TTools[]
}

export default function ToolsDirectoryClient({
  tools
}: ToolsDirectoryClientProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () => tools.filter((t) => matchesToolQuery(t, query)),
    [query, tools]
  )

  const sections = useMemo(() => groupToolsBySection(filtered), [filtered])

  return (
    <div className="relative z-20 space-y-8">
      <form
        role="search"
        className="relative z-30 mx-auto max-w-xl"
        onSubmit={(e) => e.preventDefault()}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          inputMode="search"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools by name, path, or keyword…"
          aria-label="Filter tools"
          className="ring-custom_blue/40 relative z-20 w-full rounded-xl border border-white/10 bg-neutral-900/80 py-3 pl-10 pr-4 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:ring-2"
        />
      </form>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-neutral-400">
          No tools match that search.
        </p>
      ) : (
        sections.map(({ section, label, tools: group }) =>
          group.length === 0 ? null : (
            <section key={section} aria-labelledby={`section-${section}`}>
              <h3
                id={`section-${section}`}
                className="mb-4 text-sm font-semibold uppercase tracking-wide text-custom_blue"
              >
                {label}
              </h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.map((tool) => (
                  <Link
                    key={tool.path}
                    href={`/t/${tool.path}`}
                    className="group relative block overflow-hidden rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-6 backdrop-blur-sm transition-all duration-200 hover:border-custom_blue"
                  >
                    <div className="flex h-full flex-col justify-between gap-3">
                      <div>
                        <div className="text-base font-semibold text-white sm:text-lg md:text-xl">
                          {tool.name}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-300 sm:text-sm">
                          {tool.description}
                        </p>
                      </div>

                      <div className="relative text-xs font-medium sm:text-sm">
                        <span className="inline-flex items-center text-custom_blue">
                          <span className="relative after:absolute after:-bottom-px after:left-0 after:h-px after:w-0 after:bg-current after:transition-all after:duration-300 group-hover:after:w-full">
                            Open
                          </span>
                          <ArrowRight className="ml-1 size-4 transition-transform delay-[50ms] duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        )
      )}
    </div>
  )
}
