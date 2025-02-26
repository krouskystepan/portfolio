import Image from 'next/image'

const BackgroundGradient = () => {
  return (
    <div
      className="w-full h-screen absolute left-0 top-0 z-[1] pointer-events-none"
      data-pattern="stripes"
    >
      <div className="w-full h-full bg-gradient-to-t from-black to-transparent" />
      <Image
        src={`/images/gradient.png`}
        alt={`Gradient `}
        className="w-full h-full absolute left-0 top-0 object-fit object-center opacity-20"
        fill
        priority
      />
    </div>
  )
}

export default BackgroundGradient
