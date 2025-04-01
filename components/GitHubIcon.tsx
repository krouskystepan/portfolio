'use client'

import { Achievement } from '@/constants/types'
import { useAchievementContext } from '@/context/AchievementContext'
import { motion, useAnimation } from 'framer-motion'

const GitHubIcon = ({
  id,
  path,
  alt,
  size,
  className,
}: {
  id: Achievement['id']
  path: string
  alt: string
  size: number
  className?: string
}) => {
  const { isAchievementUnlocked, unlockAchievement } = useAchievementContext()

  const controls = useAnimation()

  const handleMouseEnter = () => {
    controls.start({
      rotate: [0, -7, 7, -5, 5, 0],
      transition: { duration: 0.4, ease: 'easeInOut' },
    })

    if (!isAchievementUnlocked(id)) {
      unlockAchievement(id)
    }
  }

  return (
    <motion.img
      src={path}
      alt={alt}
      width={size}
      height={size}
      className={className}
      onMouseEnter={handleMouseEnter}
      animate={controls}
    />
  )
}

export default GitHubIcon
