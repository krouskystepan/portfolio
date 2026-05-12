import { useAchievementContext } from '@/context/AchievementContext'
import { useEffect, useRef } from 'react'

export const useIdleAchievement = () => {
  const firstIdleTimer = useRef<NodeJS.Timeout | null>(null)
  const hasHadVisibleSession = useRef(false)
  const awaitingReturnFromHidden = useRef(false)
  const { isInitialized, unlockAchievement } = useAchievementContext()

  useEffect(() => {
    if (!isInitialized) return

    if (document.visibilityState === 'visible') {
      hasHadVisibleSession.current = true
    }

    const resetFirstIdleTimer = () => {
      if (firstIdleTimer.current) clearTimeout(firstIdleTimer.current)
      firstIdleTimer.current = setTimeout(() => {
        unlockAchievement('patience-is-key')
      }, 30000)
    }

    const handleUserActivity = () => {
      if (document.hidden) return
      resetFirstIdleTimer()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (hasHadVisibleSession.current) {
          awaitingReturnFromHidden.current = true
        }
        if (firstIdleTimer.current) clearTimeout(firstIdleTimer.current)
      } else {
        if (awaitingReturnFromHidden.current) {
          unlockAchievement('prodigal-tab')
          awaitingReturnFromHidden.current = false
        }
        hasHadVisibleSession.current = true
        resetFirstIdleTimer()
      }
    }

    const handleBeforeUnload = () => {
      if (firstIdleTimer.current) clearTimeout(firstIdleTimer.current)
    }

    resetFirstIdleTimer()

    window.addEventListener('mousemove', handleUserActivity)
    window.addEventListener('keydown', handleUserActivity)
    window.addEventListener('click', handleUserActivity)
    window.addEventListener('scroll', handleUserActivity)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      if (firstIdleTimer.current) clearTimeout(firstIdleTimer.current)
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
