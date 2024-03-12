import Image from 'next/image'

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
            contributing to <span className="italic">open source.</span> My
            focus is <span className="italic underline">Next.js</span>
          </p>
        </div>
        <div className="mx-auto flex size-[250px] items-center justify-center md:size-[300px] lg:size-[350px]">
          <div className="size-full animate-bubble-animation overflow-hidden bg-gradient-to-r from-[#228CDB] to-[#2B32B2] p-1" >
            <Image
              priority
              className="animate-bubble-animation"
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
