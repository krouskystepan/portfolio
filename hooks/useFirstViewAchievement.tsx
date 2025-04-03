import { useAchievementContext } from '@/context/AchievementContext'
import { useEffect } from 'react'

const useFirstVisitAchievement = (delay = 0) => {
  const { isInitialized, unlockAchievement } = useAchievementContext()

  useEffect(() => {
    if (!isInitialized) return

    unlockAchievement('first-visit', delay)
  }, [isInitialized, unlockAchievement, delay])

  return null
}

export default useFirstVisitAchievement
