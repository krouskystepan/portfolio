'use client'

import { TProject } from '@/constants/types'
import Link from 'next/link'
import Image from 'next/image'
import { CSSProperties, useRef, useState } from 'react'
import { useAchievementContext } from '@/context/AchievementContext'
import CustomConfetti from './CustomConfetti'
import { ChevronRight, ExternalLink, Globe } from 'lucide-react'
import { getAvailabilityDetails } from '@/utils/utils'

const Project = ({ project, index }: { project: TProject; index: number }) => {
  const { unlockAchievement } = useAchievementContext()

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const activeRef = useRef(false)
  const [visibleConfetti, setVisibleConfetti] = useState(false)

  const handleMouseEnter = () => {
    if (project.id !== 'discord-gambling-hub') return
    if (activeRef.current) return

    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current)
      leaveTimeoutRef.current = null
    }

    activeRef.current = true
    setVisibleConfetti(true)

    timeoutRef.current = setTimeout(() => {
      unlockAchievement('gambling')
    }, 1000)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    setVisibleConfetti(false)

    leaveTimeoutRef.current = setTimeout(() => {
      activeRef.current = false
      leaveTimeoutRef.current = null
    }, 700)
  }

  const isReversed = index % 2 === 1

  const ctaLabel =
    project.link.type === 'website'
      ? 'Go To Website'
      : project.link.type === 'external'
        ? 'Visit Project'
        : 'View Project'

  return (
    <article
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group/container relative mx-auto w-full max-w-5xl"
    >
      <div
        className="relative grid overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 lg:min-h-[22rem] lg:grid-cols-2 lg:items-stretch"
        data-pattern="stripes"
        style={{ '--opacity': '0.03' } as CSSProperties}
      >
        {project.id === 'discord-gambling-hub' && visibleConfetti && (
          <CustomConfetti />
        )}
        {project.availability && (
          <span
            className={`absolute top-0 z-10 rounded-b-lg border-x border-b border-neutral-800 px-2.5 py-1 text-xs font-semibold text-white ${
              isReversed ? 'right-4' : 'left-4'
            } ${getAvailabilityDetails(project.availability).className}`}
          >
            {getAvailabilityDetails(project.availability).label}
          </span>
        )}

        <div
          className={`relative z-10 flex min-w-0 flex-col px-5 pb-6 pt-10 text-center sm:px-8 lg:px-10 lg:py-10 lg:text-start ${
            isReversed ? 'lg:order-2' : 'lg:order-1'
          }`}
        >
          <h3 className="text-2xl font-semibold sm:text-3xl">{project.name}</h3>
          <p className="mt-3 line-clamp-6 text-base leading-relaxed text-neutral-300 lg:line-clamp-none">
            {project.description}
          </p>

          <div className="mt-6 flex flex-col gap-4 lg:mt-auto lg:pt-6">
            <ul className="flex flex-wrap justify-center gap-2 lg:justify-start">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-lg border border-dashed border-white/25 bg-gradient-to-br from-white/15 to-white/5 px-3 py-1 text-sm text-white shadow-md backdrop-blur-sm"
                >
                  {tag}
                </li>
              ))}
            </ul>

            <Link
              href={project.link.url}
              target={project.link.type === 'internal' ? undefined : '_blank'}
              rel={
                project.link.type === 'internal'
                  ? undefined
                  : 'noopener noreferrer'
              }
              className="mx-auto flex w-full max-w-lg items-center justify-center gap-1 rounded-lg border border-neutral-800 bg-neutral-800/80 py-2.5 text-center transition-colors duration-200 hover:bg-neutral-700 lg:mx-0 lg:max-w-full"
            >
              <span>{ctaLabel}</span>
              {project.link.type === 'website' && <Globe size={16} />}
              {project.link.type === 'external' && <ExternalLink size={16} />}
              {project.link.type === 'internal' && <ChevronRight size={16} />}
            </Link>
          </div>
        </div>

        <div
          className={`relative z-10 min-h-[14rem] overflow-hidden border-t border-neutral-800 sm:min-h-[20rem] lg:min-h-full lg:border-t-0 ${
            isReversed
              ? 'lg:order-1 lg:border-r lg:border-neutral-800'
              : 'lg:order-2 lg:border-l lg:border-neutral-800'
          }`}
        >
          <Image
            src={project.image}
            alt={`Project ${project.name} image`}
            width={2400}
            height={1600}
            priority={index < 2}
            unoptimized
            sizes="(min-width: 768px) 40vw, 100vw"
            className="absolute inset-x-0 top-0 h-auto w-full max-w-none"
          />
        </div>
      </div>
    </article>
  )
}

export default Project
