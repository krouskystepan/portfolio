import { useAchievementContext } from '@/context/AchievementContext'
import { useEffect } from 'react'

const useToolsAchievement = (delay = 0) => {
  const { isInitialized, unlockAchievement } = useAchievementContext()

  useEffect(() => {
    if (!isInitialized) return

    unlockAchievement('inspector-of-gadgets', delay)
  }, [isInitialized, unlockAchievement, delay])

  return null
}

export default useToolsAchievement
