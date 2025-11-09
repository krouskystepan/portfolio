import ToolAchievementTrigger from '@/components/achievements/ToolAchievementTrigger'
import { BackgroundFade } from '@/components/Backgrounds'
import { Metadata } from 'next'

export function generateMetadata(): Metadata {
  return {
    title: 'Tools',
    description: 'Simple everyday tools for text, data, and conversions.',
  }
}

const ToolsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-4 py-12">
      <ToolAchievementTrigger />
      <BackgroundFade className="bg-gradient-to-b from-neutral-900/60 to-transparent" />
      <div className="z-10">{children}</div>
    </section>
  )
}

export default ToolsLayout
