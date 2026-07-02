'use client'

import GitHubIcon from '@/components/GitHubIcon'
import { SOCIALS } from '@/constants'
import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

const socialButtonClassName =
  'group inline-flex w-full min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-2.5 text-xs font-medium text-neutral-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)] backdrop-blur-sm transition-all duration-200 hover:border-custom_blue/45 hover:bg-custom_blue/10 hover:text-white hover:shadow-[0_8px_28px_-10px_rgba(65,105,225,0.55)] min-[400px]:gap-2 min-[400px]:px-3 min-[400px]:text-sm sm:min-h-0 sm:gap-2.5 sm:px-5 sm:py-2.5 sm:text-base md:w-auto'

const primaryButtonClassName =
  'group inline-flex w-full min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-white bg-white px-2.5 py-2.5 text-xs font-semibold tracking-wide text-neutral-950 shadow-md transition-all duration-200 hover:bg-white/90 hover:shadow-[0_8px_28px_-10px_rgba(255,255,255,0.35)] min-[400px]:gap-2 min-[400px]:px-3 min-[400px]:text-sm sm:min-h-0 sm:gap-2.5 sm:px-5 sm:py-2.5 sm:text-base md:w-auto'

const HeroActionButton = ({
  href,
  external,
  ariaLabel,
  variant = 'social',
  children
}: {
  href: string
  external?: boolean
  ariaLabel?: string
  variant?: 'social' | 'primary'
  children: ReactNode
}) => {
  const className =
    variant === 'primary' ? primaryButtonClassName : socialButtonClassName

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={className}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} aria-label={ariaLabel} className={className}>
      {children}
    </Link>
  )
}

const HeroActions = () => {
  const github = SOCIALS.find((social) => social.label === 'GitHub Link')
  const linkedin = SOCIALS.find((social) => social.label === 'Linkedin Link')

  return (
    <div className="mt-auto grid w-full items-center grid-cols-3 gap-2 lg:flex lg:w-auto lg:flex-wrap md:items-center md:justify-start md:gap-4">
      {github && (
        <HeroActionButton
          href={github.source}
          external
          ariaLabel={github.label}
        >
          <GitHubIcon
            id={github.achievementId}
            path={github.iconPath}
            alt=""
            size={20}
            className="size-4 shrink-0 min-[400px]:size-5"
          />
          <span className="hidden min-[400px]:inline">GitHub</span>
        </HeroActionButton>
      )}

      {linkedin && (
        <HeroActionButton
          href={linkedin.source}
          external
          ariaLabel={linkedin.label}
        >
          <Image
            src={linkedin.iconPath}
            alt=""
            width={20}
            height={20}
            className="size-4 shrink-0 min-[400px]:size-5"
          />
          <span className="hidden min-[400px]:inline">LinkedIn</span>
        </HeroActionButton>
      )}

      <HeroActionButton href="/cv" ariaLabel="View CV" variant="primary">
        <span>CV</span>
        <ArrowUpRight
          size={18}
          className="size-4 shrink-0 transition-transform duration-200 min-[400px]:size-[18px] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden
        />
      </HeroActionButton>
    </div>
  )
}

export default HeroActions
