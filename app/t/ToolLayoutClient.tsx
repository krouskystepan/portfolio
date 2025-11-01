'use client'

import { BackgroundFade } from '@/components/Backgrounds'
import useToolsAchievement from '@/hooks/useToolsAchievement'

const ToolLayoutClient = ({ children }: { children: React.ReactNode }) => {
  useToolsAchievement(500)

  return (
    <section className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-4 py-12">
      <BackgroundFade className="bg-gradient-to-b from-neutral-900/60 to-transparent" />
      <div className="z-10">{children}</div>
    </section>
  )
}

export default ToolLayoutClient
