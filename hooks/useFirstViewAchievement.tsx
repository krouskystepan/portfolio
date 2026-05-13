import { FIRST_VISIT_DAY_STORAGE_KEY } from '@/constants/achievements'
import { useAchievementContext } from '@/context/AchievementContext'
import { useEffect } from 'react'

function localCalendarDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const useFirstVisitAchievement = (delay = 0) => {
  const { isInitialized, unlockAchievement } = useAchievementContext()

  useEffect(() => {
    if (!isInitialized) return

    const today = localCalendarDateString(new Date())
    const stored = localStorage.getItem(FIRST_VISIT_DAY_STORAGE_KEY)

    if (stored === null) {
      localStorage.setItem(FIRST_VISIT_DAY_STORAGE_KEY, today)
    } else if (stored !== today) {
      unlockAchievement('return-visitor')
    }

    unlockAchievement('first-visit', delay)
  }, [isInitialized, unlockAchievement, delay])

  return null
}

export default useFirstVisitAchievement
