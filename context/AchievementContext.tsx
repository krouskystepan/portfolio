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

export const AchievementProvider = ({ children }: { children: ReactNode }) => {
  const [unlockedIds, setUnlockedIds] = useState<AchievementID[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedUnlocked = localStorage.getItem('unlockedAchievements')
    const parsed: AchievementID[] = storedUnlocked
      ? JSON.parse(storedUnlocked)
      : []

    const validIds = parsed.filter((id) =>
      allAchievements.some((ach) => ach.id === id)
    )

    setUnlockedIds(validIds)

    if (validIds.length !== parsed.length) {
      localStorage.setItem('unlockedAchievements', JSON.stringify(validIds))
    }

    setIsInitialized(true)
  }, [])

  const unlockAchievement = (id: AchievementID, delay = 0) => {
    if (unlockedIds.includes(id)) return

    setUnlockedIds((prev) => {
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
        getUnlockedAchievementsAsPercent: () => {
          const validUnlockedCount = unlockedIds.filter((id) =>
            allAchievements.some((ach) => ach.id === id)
          ).length

          return (validUnlockedCount / allAchievements.length) * 100
        },
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
