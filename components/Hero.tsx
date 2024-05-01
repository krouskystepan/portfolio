import { socials } from '@/constants'
import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <div className="mx-auto flex max-w-5xl justify-center">
      <div
        id="home"
        className="flex scroll-mt-[15rem] flex-col-reverse justify-center gap-[3rem] lg:flex-row lg:gap-[6.5rem]"
      >
        <div className="sm:w-[500px]">
          <h1 className="text-gradient mt-7 text-center text-5xl font-bold !leading-[1.25] lg:text-left">
            Full-Stack React Developer
          </h1>
          <p className="mx-auto mt-5 max-w-[500px] text-center text-lg font-medium lg:text-left">
            Hey, I&apos;m Štěpán Krouský a{' '}
            <span className="font-semibold">Full-Stack Developer</span> from
            Czechia. I enjoy building <span className="italic">sites</span> and
            contributing to <span className="italic">open source.</span>
          </p>
          <div className="mt-3 flex gap-4">
            {socials.map((social) => (
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
          </div>
        </div>
        <div className="mx-auto flex size-[250px] items-center justify-center md:size-[300px] lg:size-[350px]">
          <div className="size-full animate-bubble overflow-hidden bg-gradient-to-r from-[#228CDB] to-[#2B32B2] p-1">
            <Image
              priority
              className="animate-bubble"
              src="/profile.webp"
              width={350}
              height={350}
              sizes="(min-width: 1040px) 342px, (min-width: 780px) 292px, 242px"
              alt="Profile picture"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
