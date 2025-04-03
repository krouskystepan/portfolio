'use client'

import { useAchievementContext } from '@/context/AchievementContext'
import { motion } from 'framer-motion'

const WaveEmoji = () => {
  const { unlockAchievement } = useAchievementContext()

  const handleMouseEnter = () => {
    unlockAchievement('say-hey')
  }

  return (
    <motion.span
      className="inline-block cursor-help text-2xl"
      initial={{ rotate: 0 }}
      whileHover={{ rotate: 15, scale: 1.2 }}
      transition={{ type: 'spring', stiffness: 300 }}
      exit={{ rotate: 0 }}
      animate={{ rotate: 0 }}
      onMouseEnter={handleMouseEnter}
    >
      👋🏼
    </motion.span>
  )
}

export default WaveEmoji
