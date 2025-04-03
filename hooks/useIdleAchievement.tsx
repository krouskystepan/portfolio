import { useAchievementContext } from '@/context/AchievementContext'
import { useEffect, useRef } from 'react'

export const useIdleAchievement = () => {
  const firstIdleTimer = useRef<NodeJS.Timeout | null>(null)
  const secondIdleTimer = useRef<NodeJS.Timeout | null>(null)
  const { isInitialized, unlockAchievement } = useAchievementContext()

  useEffect(() => {
    if (!isInitialized) return

    const resetFirstIdleTimer = () => {
      if (firstIdleTimer.current) clearTimeout(firstIdleTimer.current)
      firstIdleTimer.current = setTimeout(() => {
        unlockAchievement('patience-is-key')
      }, 30000)
    }

    const resetSecondIdleTimer = () => {
      if (secondIdleTimer.current) clearTimeout(secondIdleTimer.current)
      secondIdleTimer.current = setTimeout(() => {
        unlockAchievement('patience-is-key-ii')
      }, 300_000)
    }

    const handleUserActivity = () => {
      if (document.hidden) return
      resetFirstIdleTimer()
      resetSecondIdleTimer()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (firstIdleTimer.current) clearTimeout(firstIdleTimer.current)
        if (secondIdleTimer.current) clearTimeout(secondIdleTimer.current)
      } else {
        resetFirstIdleTimer()
        resetSecondIdleTimer()
      }
    }

    const handleBeforeUnload = () => {
      if (firstIdleTimer.current) clearTimeout(firstIdleTimer.current)
      if (secondIdleTimer.current) clearTimeout(secondIdleTimer.current)
    }

    resetFirstIdleTimer()
    resetSecondIdleTimer()

    window.addEventListener('mousemove', handleUserActivity)
    window.addEventListener('keydown', handleUserActivity)
    window.addEventListener('click', handleUserActivity)
    window.addEventListener('scroll', handleUserActivity)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      if (firstIdleTimer.current) clearTimeout(firstIdleTimer.current)
      if (secondIdleTimer.current) clearTimeout(secondIdleTimer.current)
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
