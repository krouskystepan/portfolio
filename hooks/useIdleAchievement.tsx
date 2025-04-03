import { useAchievementContext } from '@/context/AchievementContext'
import { useEffect, useRef } from 'react'

export const useIdleAchievement = () => {
  const idleTimer = useRef<NodeJS.Timeout | null>(null)
  const { isInitialized, unlockAchievement } = useAchievementContext()

  useEffect(() => {
    if (!isInitialized) return

    const resetTimer = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => {
        unlockAchievement('patience-is-key')
      }, 30000)
    }

    const handleUserActivity = () => {
      if (document.hidden) return
      resetTimer()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (idleTimer.current) clearTimeout(idleTimer.current)
      } else {
        resetTimer()
      }
    }

    const handleBeforeUnload = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current)
    }

    resetTimer()

    window.addEventListener('mousemove', handleUserActivity)
    window.addEventListener('keydown', handleUserActivity)
    window.addEventListener('click', handleUserActivity)
    window.addEventListener('scroll', handleUserActivity)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current)
      window.removeEventListener('mousemove', handleUserActivity)
      window.removeEventListener('keydown', handleUserActivity)
      window.removeEventListener('click', handleUserActivity)
      window.removeEventListener('scroll', handleUserActivity)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isInitialized, unlockAchievement])

  return null
}

export default useIdleAchievement
