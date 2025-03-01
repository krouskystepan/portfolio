import Image from 'next/image'

export const BackgroundFade = ({ className }: { className: string }) => {
  return (
    <div className="pointer-events-none absolute left-0 top-0 z-[1] h-screen w-full">
      <div className={`size-full ${className}`} />
    </div>
  )
}

export const BackgroundGradient = () => {
  const breakpoinClasses = '2xl:h-[80vh] min-[3000px]:h-3/4 min-[4000px]:h-1/3'

  return (
    <div
      className={`pointer-events-none absolute left-0 top-0 z-[1] h-screen w-full ${breakpoinClasses}`}
      data-pattern="stripes"
    >
      <BackgroundFade
        className={`bg-gradient-to-t from-neutral-950 to-transparent ${breakpoinClasses}`}
      />
      <Image
        src={`/images/gradient.png`}
        alt="Gradient"
        className="absolute left-0 top-0 size-full object-cover opacity-20"
        width={1280}
        height={800}
        quality={80}
        priority
      />
    </div>
  )
}
