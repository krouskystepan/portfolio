import { allAchievements } from '.'

export type TProject = {
  id: string
  name: string
  description: string
  image: string
  link: {
    type: 'github' | 'website'
    url: string
  }
  tags: string[]
  availability: 'live' | 'demo' | 'other'
}

export type WorkspaceStatus = {
  project_name: string
  startup_time: string
  active_file: string
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
