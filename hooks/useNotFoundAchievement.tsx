import { useAchievementContext } from '@/context/AchievementContext'
import { useEffect } from 'react'

const useNotFoundAchievement = (delay = 0) => {
  const { isInitialized, unlockAchievement } = useAchievementContext()

  useEffect(() => {
    if (!isInitialized) return

    unlockAchievement('404-hunter', delay)
  }, [isInitialized, unlockAchievement, delay])

  return null
}

export default useNotFoundAchievement
