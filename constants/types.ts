import { allAchievements, PROJECT_FILTERS } from '.'

export type TProjectFilter = (typeof PROJECT_FILTERS)[number]

export type TProject = {
  id: string
  name: string
  description: string
  image: string
  link: {
    type: 'internal' | 'external' | 'website'
    url: string
  }
  tags: string[]
  availability: Exclude<TProjectFilter, 'all'>
}

export type WorkspaceStatus = {
  projectName: string
  startupTime: string
  activeFile: string
  lastUpdate: string
  uptime?: number
}

export type AchievementID = (typeof allAchievements)[number]['id']

export type Achievement = {
  id: AchievementID
  title: string
  description: string
}

export type AchievementContextType = {
  unlockAchievement: (id: AchievementID, delay?: number) => void
  isAchievementUnlocked: (id: AchievementID) => boolean
  getAchievementById: (id: AchievementID) => Achievement | undefined
  getUnlockedAchievementsAsPercent: () => number
  resetAllAchievements: () => void
  isInitialized: boolean
}

export const TOOL_SECTION_ORDER = [
  'data',
  'text',
  'web',
  'utilities'
] as const

export type TToolSectionId = (typeof TOOL_SECTION_ORDER)[number]

export const TOOL_SECTION_LABELS: Record<TToolSectionId, string> = {
  data: 'Data & serialization',
  text: 'Text & patterns',
  web: 'Web & encoding',
  utilities: 'IDs, time & color'
}

export type TTools = {
  name: string
  path: string
  description: string
  section: TToolSectionId
  /** Lowercase tokens for search / filter on the tools index */
  keywords: string[]
}
