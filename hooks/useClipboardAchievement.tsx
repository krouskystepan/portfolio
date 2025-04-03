import { useAchievementContext } from '@/context/AchievementContext'
import { useEffect } from 'react'

const useClipboardAchievement = () => {
  const { isInitialized, unlockAchievement } = useAchievementContext()

  useEffect(() => {
    if (!isInitialized) return

    const handleCopy = () => {
      unlockAchievement('clipboard-master')
    }

    document.addEventListener('copy', handleCopy)
    return () => {
      document.removeEventListener('copy', handleCopy)
    }
  }, [unlockAchievement, isInitialized])
}

export default useClipboardAchievement
