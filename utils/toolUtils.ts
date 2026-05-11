import { TOOL_SECTION_ORDER, TOOL_SECTION_LABELS } from '@/constants'
import { TTools } from '@/constants/types'

function searchHaystacks(tool: TTools): string[] {
  const keywords = tool.keywords ?? []
  return [
    tool.name.toLowerCase(),
    tool.description.toLowerCase(),
    tool.path.toLowerCase(),
    ...keywords.map((k) => k.toLowerCase())
  ]
}

function normalizeSearchTokens(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s/&,|/-]+/)
    .map((t) => t.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, ''))
    .filter(Boolean)
}

export function matchesToolQuery(tool: TTools, query: string): boolean {
  const tokens = normalizeSearchTokens(query)
  if (tokens.length === 0) return true

  const haystacks = searchHaystacks(tool)
  return tokens.every((token) => haystacks.some((h) => h.includes(token)))
}

export function groupToolsBySection(list: TTools[]) {
  return TOOL_SECTION_ORDER.map((section) => ({
    section,
    label: TOOL_SECTION_LABELS[section],
    tools: list.filter((t) => t.section === section)
  }))
}
