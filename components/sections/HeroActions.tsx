'use client'

import GitHubIcon from '@/components/GitHubIcon'
import { CV_URL, SOCIALS } from '@/constants'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

const shardClasses =
  'group inline-flex w-full min-h-11 px-2.5 py-2.5 text-xs items-center justify-center gap-1.5 whitespace-nowrap rounded-full border transition-all duration-200 min-[400px]:gap-2 min-[400px]:px-3 min-[400px]:text-sm sm:min-h-0 sm:gap-2.5 sm:px-5 sm:py-2.5 sm:text-base md:w-auto'

const socialButtonClassName = `${shardClasses} border-white bg-white/[0.04] text-neutral-200 hover:bg-white hover:text-neutral-950 font-medium`

const primaryButtonClassName = `${shardClasses} border-white bg-white text-neutral-950 hover:bg-white/[0.04] hover:text-neutral-200 font-semibold tracking-wide`

const HeroActionButton = ({
  href,
  external,
  openInNewTab = true,
  ariaLabel,
  variant = 'social',
  children
}: {
  href: string
  external?: boolean
  openInNewTab?: boolean
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
        {...(openInNewTab
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {})}
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
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="size-4 shrink-0 min-[400px]:size-5"
            aria-hidden
          >
            <path
              d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 9H2V21H6V9Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="hidden min-[400px]:inline">LinkedIn</span>
        </HeroActionButton>
      )}

      <HeroActionButton
        href={CV_URL}
        external
        openInNewTab={false}
        ariaLabel="View CV"
        variant="primary"
      >
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
