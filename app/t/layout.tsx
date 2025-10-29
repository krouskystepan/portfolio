import { BackgroundFade } from '@/components/Backgrounds'

const ToolLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="flex w-full max-w-6xl mx-auto min-h-full flex-col px-4 py-12">
      <BackgroundFade className="bg-gradient-to-b from-neutral-900/60 to-transparent" />
      <div className="z-10">{children}</div>
    </section>
  )
}

export default ToolLayout
