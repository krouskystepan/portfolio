'use client'

import type { TToolSectionId } from '@/constants/types'

/** Short labels for the jump row — full names stay on section headings. */
export const SECTION_JUMP_LABELS: Record<TToolSectionId, string> = {
  data: 'Data',
  text: 'Text',
  web: 'Web',
  encoding: 'Encoding',
  generators: 'Generators',
  design: 'Design',
  datetime: 'Date & time',
  network: 'Network',
  qa: 'QA'
}

type ToolsCategoryNavProps = {
  sections: readonly TToolSectionId[]
}

function scrollToSection(id: TToolSectionId) {
  const el = document.getElementById(`section-${id}`)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  // Keep URL shareable without fighting the sticky header offset.
  history.replaceState(null, '', `#section-${id}`)
}

export default function ToolsCategoryNav({ sections }: ToolsCategoryNavProps) {
  if (sections.length === 0) return null

  return (
    <nav
      aria-label="Jump to category"
      className="sticky top-20 z-30 -mx-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-xl border border-white/5 bg-neutral-950/70 px-2 py-2 text-sm backdrop-blur-md"
    >
      {sections.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => scrollToSection(id)}
          className="text-neutral-500 transition-colors hover:text-neutral-200"
        >
          {SECTION_JUMP_LABELS[id]}
        </button>
      ))}
    </nav>
  )
}
