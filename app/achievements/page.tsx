'use client'

import { BackgroundFade } from '@/components/Backgrounds'
import { allAchievements } from '@/constants'
import { useAchievementContext } from '@/context/AchievementContext'

import { useEffect } from 'react'

const Achievements = () => {
  const {
    isInitialized,
    unlockAchievement,
    isAchievementUnlocked,
    getUnlockedAchievementsAsPercent,
    resetAllAchievements,
  } = useAchievementContext()

  useEffect(() => {
    if (!isInitialized) return

    unlockAchievement('hidden-path', 500)
  }, [isInitialized, unlockAchievement])

  const progress = getUnlockedAchievementsAsPercent()

  return (
    <section className="flex w-full flex-col px-4 py-12">
      <BackgroundFade className="bg-gradient-to-b from-neutral-900/60 to-transparent" />
      <div className="z-10">
        <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl md:text-5xl">
          Your Achievements
        </h2>

        <div className="mx-auto mb-4 w-full max-w-sm md:max-w-lg">
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800 md:h-4">
            <div
              className="h-full bg-gradient-to-r from-neutral-300 to-neutral-100 opacity-80 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-2 text-center text-sm md:text-base">{`${Math.floor(progress)}% unlocked`}</p>
        </div>

        <ul className="mx-auto grid max-w-md select-none grid-cols-1 justify-center gap-4 min-[740px]:max-w-2xl min-[740px]:grid-cols-2 lg:max-w-3xl">
          {[
            ...allAchievements.filter((ach) => isAchievementUnlocked(ach.id)),
            ...allAchievements.filter((ach) => !isAchievementUnlocked(ach.id)),
          ].map((ach) => (
            <li
              key={ach.id}
              className={`rounded-md border px-4 py-2 text-center ${
                isAchievementUnlocked(ach.id)
                  ? 'border-emerald-500'
                  : 'border-red-500'
              }`}
            >
              <p
                className={`font-semibold tracking-wide ${
                  isAchievementUnlocked(ach.id)
                    ? 'text-white'
                    : 'text-neutral-400'
                }`}
              >
                {ach.title}
              </p>
              <p
                className={`text-sm text-neutral-400 ${isAchievementUnlocked(ach.id) ? '' : 'blur-sm'}`}
              >
                {isAchievementUnlocked(ach.id)
                  ? ach.description
                  : 'This achievement is hidden until unlocked.'}
              </p>
            </li>
          ))}
        </ul>
        {getUnlockedAchievementsAsPercent() >= 100 ? (
          <div className="flex items-center justify-center">
            <button
              onClick={resetAllAchievements}
              className="mx-auto mt-3 max-w-fit rounded-md bg-red-500 px-4 py-2 text-center transition-colors duration-200 hover:bg-red-600"
            >
              Reset Achievements
            </button>
          </div>
        ) : (
          ''
        )}
      </div>
    </section>
  )
}

export default Achievements
