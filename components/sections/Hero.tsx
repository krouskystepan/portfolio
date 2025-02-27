import Image from 'next/image'
import Skills from '../Skills'

const Hero = () => {
  return (
    <div className="z-10 my-12 md:my-24">
      <div className="mx-auto grid h-fit max-w-5xl justify-center gap-4 md:grid-cols-3 md:gap-12">
        <div className="order-2 flex h-full flex-col justify-evenly gap-4 md:order-1 md:col-span-2 md:gap-0 lg:justify-between">
          <h1 className="text-center text-4xl font-extrabold text-neutral-100 sm:text-6xl md:text-left md:text-5xl md:leading-none min-[870px]:text-7xl">
            FullStack React Developer
          </h1>
          <p className="text-center text-2xl text-neutral-300 md:text-left md:text-[1.25rem] md:leading-6 lg:text-2xl">
            Hey, I'm&nbsp;Štěpán Krouský, a{' '}
            <span className="font-semibold">FullStack&nbsp;Developer</span>{' '}
            from&nbsp;Czechia. I enjoy building{' '}
            <span className="italic">sites</span> and contributing to{' '}
            <span className="italic">open&nbsp;source.</span>
          </p>
          <SkillsField className="hidden lg:block" />
        </div>
        <div className="order-1 mx-auto aspect-square size-72 overflow-hidden rounded-xl border border-white/80 md:order-2 md:size-full md:rounded-lg">
          <Image
            priority
            className="size-full"
            src="/images/profile.webp"
            width={270}
            height={270}
            alt="Profile picture"
          />
        </div>
      </div>
      <SkillsField className="mt-4 block lg:hidden" />
    </div>
  )
}

export default Hero

const SkillsField = ({ className }: { className: string }) => {
  return (
    <div
      className={`relative h-fit w-full overflow-hidden border border-x-white border-y-transparent py-1 ${className}`}
    >
      <div className="absolute right-0 z-20 h-full w-8 bg-gradient-to-l from-white/20 to-transparent" />
      <div className="absolute left-0 z-20 h-full w-8 bg-gradient-to-r from-white/20 to-transparent" />
      <Skills />
    </div>
  )
}
