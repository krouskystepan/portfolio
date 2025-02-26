import Image from 'next/image'
import { Skills } from './Skills'

const Hero = () => {
  return (
    <div className="mx-auto max-w-5xl grid grid-cols-3 justify-center gap-8 my-24 z-10 h-fit">
      <div className="flex flex-col gap-4 col-span-2">
        <h1 className="text-neutral-100 text-7xl font-extrabold">
          FullStack React Developer
        </h1>
        <p className="text-neutral-300 text-3xl">
          Hey, I'm&nbsp;Štěpán Krouský, a{' '}
          <span className="font-semibold">FullStack&nbsp;Developer</span>{' '}
          from&nbsp;Czechia. I enjoy building{' '}
          <span className="italic">sites</span> and contributing to{' '}
          <span className="italic">open&nbsp;source.</span>
        </p>

        <div className="mt-auto w-full h-fit relative overflow-hidden border border-x-white border-y-transparent py-1">
          <div className="h-full w-8 right-0 absolute bg-gradient-to-l from-white/20 to-transparent z-20" />
          <div className="h-full w-8 left-0 absolute bg-gradient-to-r from-white/20 to-transparent z-20" />
          <Skills />
        </div>
        {/* <div className="mt-6 flex justify-center gap-4 lg:mt-3 lg:justify-start">
            {SOCIALS.map((social) => (
              <Link
                key={social.label}
                href={social.link}
                target="_blank"
                aria-label={social.label}
                className="text-black transition-all duration-150 hover:text-[#228CDB] focus:text-[#228CDB] [&>*]:size-8"
              >
                {social.icon}
              </Link>
            ))}
          </div> */}
      </div>
      <div className="border border-white/80 overflow-hidden rounded-lg">
        <Image
          priority
          className="size-full"
          src="/images/profile.webp"
          width={350}
          height={350}
          sizes="(min-width: 1040px) 342px, (min-width: 780px) 292px, 242px"
          alt="Profile picture"
        />
      </div>
    </div>
  )
}

export default Hero
