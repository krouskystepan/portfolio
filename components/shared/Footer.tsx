import Link from 'next/link'
import Image from 'next/image'
import { SOCIALS } from '@/constants'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <div
      className="z-20 mt-12 flex w-full flex-col gap-6 border-t border-t-neutral-800 bg-neutral-950 py-16"
      style={{ '--opacity': '0.04' } as React.CSSProperties}
      data-pattern="stripes"
    >
      <div
        className="pointer-events-auto mx-auto w-fit shrink-0 overflow-hidden rounded-xl border border-dashed border-white/25 backdrop-blur-lg hover:bg-white/5"
        style={{ '--opacity': '0.04' } as React.CSSProperties}
        data-pattern="stripes"
      >
        <Link
          href="/"
          className="flex h-12 items-center gap-4 px-4 text-xl text-white"
        >
          <Image src="/svgs/logo.svg" alt="Logo" width={24} height={24} />
          <span className="tracking-wide">
            <span className="font-extrabold">Krouský</span>Štěpán
          </span>
        </Link>
      </div>
      <div className="flex justify-center">
        {SOCIALS.map((social, index) => (
          <Link
            key={index}
            href={social.source}
            target="_blank"
            rel="noopener noreferrer"
            className={`border border-neutral-800 bg-neutral-900 p-3 shadow-md transition first:rounded-l-xl last:rounded-r-xl hover:bg-neutral-800/80 hover:shadow-lg sm:p-4`}
          >
            <Image
              src={social.iconPath}
              alt={social.label}
              width={24}
              height={24}
              className="size-4 sm:size-6"
            />
          </Link>
        ))}
      </div>
      <p className="text-center font-bold text-white">
        Copyright © {currentYear}. All rights are reserved.
      </p>
    </div>
  )
}

export default Footer
