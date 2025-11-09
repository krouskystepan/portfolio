'use client'

import useNotFoundAchievement from '@/hooks/useNotFoundAchievement'

const NotFoundAchievementTrigger = () => {
  useNotFoundAchievement(500)
  return null
}

export default NotFoundAchievementTrigger
