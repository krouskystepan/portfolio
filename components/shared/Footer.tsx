import Link from 'next/link'
import Image from 'next/image'
import { SOCIALS } from '@/constants'
import { useMemo } from 'react'
import GitHubIcon from '../GitHubIcon'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerSocials = useMemo(
    () => [
      SOCIALS[0],
      {
        iconPath: '/svgs/question.svg',
        source: '/achievements',
        label: 'Mystery Achievement',
        achievementId: 'achievementLink',
      },
      SOCIALS[1],

      {
        iconPath: '/svgs/code.svg',
        source: '/t',
        label: 'Mystery Achievement',
        achievementId: 'achievementLink',
      },
      SOCIALS[2],
    ],
    []
  )

  return (
    <footer
      className="z-20 mt-12 flex w-full flex-col gap-6 border-t border-t-neutral-800 bg-neutral-950 py-16"
      data-pattern="stripes"
    >
      <div className="pointer-events-auto mx-auto w-fit shrink-0 overflow-hidden rounded-xl border border-dashed border-white/25 backdrop-blur-lg hover:bg-white/5">
        <Link
          href="/"
          className="flex h-12 items-center gap-4 px-4 text-xl text-white"
        >
          <Image
            src="/svgs/logo.svg"
            alt="Krouský Štěpán Logo"
            width={24}
            height={24}
          />
          <span className="tracking-wide">
            <span className="font-extrabold">Krouský</span>Štěpán
          </span>
        </Link>
      </div>

      <div className="flex justify-center">
        {footerSocials.map(
          ({ iconPath, source, label, achievementId }, index) => (
            <Link
              key={index}
              href={source}
              target={
                achievementId === 'achievementLink' ? undefined : '_blank'
              }
              rel="noopener noreferrer"
              className={`border border-neutral-800 bg-neutral-900 p-3 shadow-md transition hover:bg-neutral-800/80 hover:shadow-lg sm:p-4 ${index === 0 ? 'rounded-l-xl' : ''} ${index === footerSocials.length - 1 ? 'rounded-r-xl' : ''}`}
            >
              {achievementId === 'pet-cat' ? (
                <GitHubIcon
                  id={achievementId}
                  path={iconPath}
                  alt={label}
                  size={24}
                  className="size-4 sm:size-6"
                />
              ) : (
                <Image
                  id={achievementId}
                  src={iconPath}
                  alt={label}
                  width={24}
                  height={24}
                  className="size-5 sm:size-7"
                />
              )}
            </Link>
          )
        )}
      </div>

      <p className="px-4 text-center font-bold text-white">
        Copyright © {currentYear}. All rights reserved.
      </p>
    </footer>
  )
}

export default Footer
