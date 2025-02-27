import Image from 'next/image'

const BackgroundGradient = () => {
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 z-[1] h-screen w-full"
      data-pattern="stripes"
    >
      <div className="size-full bg-gradient-to-t from-black to-transparent" />
      <Image
        src={`/images/gradient.png`}
        alt={`Gradient `}
        className="absolute left-0 top-0 size-full object-center opacity-20"
        fill
      />
    </div>
  )
}

export default BackgroundGradient
