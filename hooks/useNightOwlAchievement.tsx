import { useAchievementContext } from '@/context/AchievementContext'
import { useEffect } from 'react'

const useNightOwlAchievement = (delay = 0) => {
  const { isInitialized, unlockAchievement } = useAchievementContext()

  useEffect(() => {
    if (!isInitialized) return

    const currentHour = new Date().getHours()
    if (currentHour >= 0 && currentHour < 6) {
      unlockAchievement('night-owl', delay)
    }
  }, [isInitialized, delay, unlockAchievement])

  return null
}

export default useNightOwlAchievement
