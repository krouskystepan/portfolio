import HeroImage from '../HeroImage'
import Skills from '../Skills'
import WaveEmoji from '../WaveEmoji'
import HeroActions from './HeroActions'

const Hero = () => {
  return (
    <div className="z-10 py-8 md:py-12 lg:py-16 xl:py-20">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 md:gap-8">
        <div className="flex flex-col h-full gap-6 md:flex-row md:items-stretch md:gap-10">
          <div className="order-2 flex justify-between gap-3 flex-1 flex-col md:order-1 md:min-h-full md:gap-7">
            <h1 className="text-center text-4xl font-extrabold text-neutral-100 sm:text-6xl md:text-left md:text-5xl md:leading-[1.05] min-[940px]:text-6xl">
              QA Automation & Full Stack Developer
            </h1>

            <p className="text-center text-2xl text-neutral-300 md:text-left md:text-[1.25rem] md:leading-7">
              <WaveEmoji />, I'm&nbsp;Štěpán Krouský, a{' '}
              <span className="font-semibold">
                QA&nbsp;Automation&nbsp;Engineer
              </span>{' '}
              and{' '}
              <span className="font-semibold">
                Full&nbsp;Stack&nbsp;Developer
              </span>{' '}
              from&nbsp;Czechia. I build{' '}
              <span className="italic">web&nbsp;apps</span> and{' '}
              <span className="italic">automated&nbsp;test&nbsp;suites.</span>
            </p>

            <div className="hidden min-[821px]:block">
              <HeroActions />
            </div>
          </div>

          <div className="order-1 mx-auto aspect-square w-full max-w-64 shrink-0 sm:max-w-80 md:order-2 md:mx-0 md:w-72 lg:w-80 xl:w-96">
            <HeroImage />
          </div>
        </div>

        <div className="block min-[821px]:hidden">
          <HeroActions />
        </div>

        <SkillsField />
      </div>
    </div>
  )
}

export default Hero

const SkillsField = () => {
  return (
    <div className="relative h-fit w-full overflow-hidden border border-x-white border-y-transparent py-1">
      <div className="absolute right-0 top-0 z-20 h-full w-8 bg-gradient-to-l from-white/20 to-transparent" />
      <div className="absolute left-0 top-0 z-20 h-full w-8 bg-gradient-to-r from-white/20 to-transparent" />
      <Skills />
    </div>
  )
}
