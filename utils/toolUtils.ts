import { TOOL_SECTION_ORDER, TOOL_SECTION_LABELS } from '@/constants'
import { TTools } from '@/constants/types'

export function matchesToolQuery(tool: TTools, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    tool.name.toLowerCase().includes(q) ||
    tool.description.toLowerCase().includes(q) ||
    tool.path.toLowerCase().includes(q) ||
    tool.keywords.some((k) => k.toLowerCase().includes(q))
  )
}

export function groupToolsBySection(list: TTools[]) {
  return TOOL_SECTION_ORDER.map((section) => ({
    section,
    label: TOOL_SECTION_LABELS[section],
    tools: list.filter((t) => t.section === section)
  }))
}
