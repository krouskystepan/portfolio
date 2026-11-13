'use client'

import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { TOOL_SECTION_ORDER, type TTools } from '@/constants/types'
import { matchesToolQuery, groupToolsBySection } from '@/utils/toolUtils'
import ToolCard from './ToolCard'
import ToolsCategoryNav from './ToolsCategoryNav'

type ToolsDirectoryClientProps = {
  tools: readonly TTools[]
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

  const visibleSections = useMemo(
    () => sections.filter(({ tools: group }) => group.length > 0),
    [sections]
  )

  const jumpSectionIds = useMemo(
    () =>
      TOOL_SECTION_ORDER.filter((id) =>
        visibleSections.some((s) => s.section === id)
      ),
    [visibleSections]
  )

  return (
    <div className="relative z-20 space-y-8">
      <div className="mx-auto max-w-xl space-y-4">
        <form
          role="search"
          className="relative z-30"
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

        <ToolsCategoryNav sections={jumpSectionIds} />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-neutral-400">
          No tools match that search.
        </p>
      ) : (
        visibleSections.map(({ section: id, label, tools: group }) => (
          <section
            key={id}
            id={`section-${id}`}
            aria-labelledby={`heading-${id}`}
            className="scroll-mt-28"
          >
            <h3
              id={`heading-${id}`}
              className="mb-4 text-sm font-semibold uppercase tracking-wide text-custom_blue"
            >
              {label}
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((tool) => (
                <ToolCard key={tool.path || tool.name} tool={tool} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
