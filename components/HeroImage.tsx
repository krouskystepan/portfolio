'use client'

import { useAchievementContext } from '@/context/AchievementContext'
import Image from 'next/image'
import { useRef } from 'react'

const HeroImage = () => {
  const { isAchievementUnlocked, unlockAchievement } = useAchievementContext()
  const imageRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const noseXStart = 140
    const noseXEnd = 160
    const noseYStart = 126
    const noseYEnd = 152

    if (
      x >= noseXStart &&
      x <= noseXEnd &&
      y >= noseYStart &&
      y <= noseYEnd &&
      !isAchievementUnlocked('pick-nose')
    ) {
      unlockAchievement('pick-nose')
    }
  }

  return (
    <div ref={imageRef} onMouseMove={handleMouseMove}>
      <Image
        priority
        className="size-full rounded-xl border border-white/80 transition-colors duration-200 hover:bg-white/90 md:rounded-lg"
        src="/images/profile.webp"
        width={270}
        height={270}
        quality={80}
        alt="Profile picture"
      />
    </div>
  )
}

export default HeroImage
