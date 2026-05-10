'use client'

import { allAchievements } from '@/constants'
import { AchievementContextType, AchievementID } from '@/constants/types'
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react'
import { toast } from 'sonner'

const AchievementContext = createContext<AchievementContextType | undefined>(
  undefined
)

function parseStoredUnlockedIds(raw: string | null): AchievementID[] {
  if (!raw?.trim()) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []
  const ids = parsed.filter(
    (id): id is AchievementID =>
      typeof id === 'string' &&
      allAchievements.some((ach) => ach.id === id)
  )
  return [...new Set(ids)]
}

export const AchievementProvider = ({ children }: { children: ReactNode }) => {
  const [unlockedIds, setUnlockedIds] = useState<AchievementID[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedUnlocked = localStorage.getItem('unlockedAchievements')
    const validIds = parseStoredUnlockedIds(storedUnlocked)

    setUnlockedIds(validIds)

    const normalized = JSON.stringify(validIds)
    if (
      storedUnlocked !== null &&
      storedUnlocked !== normalized
    ) {
      localStorage.setItem('unlockedAchievements', normalized)
    }

    setIsInitialized(true)
  }, [])

  const unlockAchievement = (id: AchievementID, delay = 0) => {
    if (!allAchievements.some((ach) => ach.id === id)) return

    setUnlockedIds((prev) => {
      if (prev.includes(id)) return prev

      const newUnlocked = [...prev, id]
      localStorage.setItem('unlockedAchievements', JSON.stringify(newUnlocked))

      const achievement = allAchievements.find((ach) => ach.id === id)
      if (achievement) {
        setTimeout(() => {
          toast.success(
            `${achievement.title} (${newUnlocked.length}/${allAchievements.length})`,
            { description: achievement.description }
          )
        }, delay)
      }

      return newUnlocked
    })
  }

  const isAchievementUnlocked = (id: AchievementID): boolean =>
    unlockedIds.includes(id)

  const resetAllAchievements = () => {
    setUnlockedIds([])
    localStorage.removeItem('unlockedAchievements')
  }

  return (
    <AchievementContext.Provider
      value={{
        unlockAchievement,
        isAchievementUnlocked,
        getAchievementById: (id) =>
          allAchievements.find((ach) => ach.id === id),
        resetAllAchievements,
        getUnlockedAchievementsAsPercent: () =>
          (unlockedIds.length / allAchievements.length) * 100,
        isInitialized,
      }}
    >
      {children}
    </AchievementContext.Provider>
  )
}

export const useAchievementContext = () => {
  const context = useContext(AchievementContext)
  if (!context) {
    throw new Error(
      'useAchievementContext must be used within an AchievementProvider'
    )
  }
  return context
}
