'use client'

import { useAchievementContext } from '@/context/AchievementContext'
import Image from 'next/image'
import { useRef } from 'react'

const HeroImage = () => {
  const { unlockAchievement } = useAchievementContext()
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

    if (x >= noseXStart && x <= noseXEnd && y >= noseYStart && y <= noseYEnd) {
      unlockAchievement('pick-nose')
    }
  }

  return (
    <div
      ref={imageRef}
      onMouseMove={handleMouseMove}
      className="relative size-full"
    >
      <Image
        priority
        className="rounded-xl border border-white/80 object-cover transition-colors duration-200 hover:bg-white/90 md:rounded-lg"
        src="/images/profile.webp"
        fill
        sizes="(min-width: 1280px) 384px, (min-width: 768px) 320px, 288px"
        quality={80}
        alt="Profile picture"
      />
    </div>
  )
}

export default HeroImage
