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

  const activeRef = useRef(false)
  const [visibleConfetti, setVisibleConfetti] = useState(false)

  const handleMouseEnter = () => {
    if (project.id !== 'discord-gambling-hub') return
    if (activeRef.current) return

    activeRef.current = true
    setVisibleConfetti(true)

    timeoutRef.current = setTimeout(() => {
      unlockAchievement('gambling')
    }, 1000)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    setVisibleConfetti(false)

    setTimeout(() => {
      activeRef.current = false
    }, 700)
  }

  const isReversed = index % 2 === 1

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group/container relative mx-auto flex h-[32rem] w-full flex-col gap-0 overflow-hidden rounded-lg border-2 border-neutral-800 bg-neutral-900 text-center sm:h-[28rem] md:h-96 md:max-w-3xl md:flex-row md:gap-10 md:text-start md:[&>*]:basis-1/2 ${isReversed ? 'md:flex-row-reverse' : ''}`}
      data-pattern="stripes"
      style={{ '--opacity': '0.03' } as CSSProperties}
    >
      {project.id === 'discord-gambling-hub' && (
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
            visibleConfetti ? 'opacity-50' : 'opacity-0'
          }`}
        >
          <CustomConfetti />
        </div>
      )}
      {project.availability && (
        <span
          className={`absolute left-1/2 top-0 -translate-x-1/2 rounded-b-lg border-x-2 border-b-2 border-neutral-800 px-2 py-1 text-xs font-semibold text-white ${isReversed ? 'md:left-full md:-translate-x-full md:rounded-bl-lg md:rounded-br-none md:border-l-2 md:border-r-0' : 'md:left-0 md:translate-x-0 md:rounded-bl-none md:rounded-br-lg md:border-l-0 md:border-r-2'} ${getAvailabilityDetails(project.availability).className}`}
        >
          {getAvailabilityDetails(project.availability).label}
        </span>
      )}
      <div
        className={`flex flex-col px-4 py-7 md:pb-7 md:pl-10 md:pt-10 ${isReversed ? 'md:pl-4 md:pr-10' : 'md:pl-10'}`}
      >
        <h3 className="mt-2 text-3xl font-semibold md:mt-0">{project.name}</h3>
        <p className="mt-3 line-clamp-5 text-base md:line-clamp-6">
          {project.description}
        </p>
        <div className="mt-auto flex flex-col gap-3">
          <ul className="mt-3 flex flex-wrap justify-center gap-2 md:mt-auto md:justify-center">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-lg border border-dashed border-white/25 bg-gradient-to-br from-white/15 to-white/5 px-3 py-1 text-sm text-white shadow-md backdrop-blur-sm transition-transform duration-300 md:group-hover/container:rotate-3 md:group-hover/container:even:-rotate-3"
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
            className="group mx-auto flex w-full max-w-lg items-center justify-center rounded-lg border border-neutral-800 bg-neutral-700 py-2 text-center transition-colors duration-200 hover:bg-neutral-700/80 md:max-w-full"
          >
            <>
              {project.link.type === 'website' && (
                <>
                  <span className="mr-1">Go To Website</span>
                  <Globe size={16} />
                </>
              )}

              {project.link.type === 'external' && (
                <>
                  <span className="mr-1">Visit Project</span>
                  <ExternalLink size={16} />
                </>
              )}

              {project.link.type === 'internal' && (
                <>
                  <span className="mr-0.5">View Project</span>
                  <ChevronRight size={16} />
                </>
              )}
            </>
          </Link>
        </div>
      </div>

      <Image
        src={project.image}
        alt={`Project ${project.name} image`}
        quality={90}
        width={500}
        height={900}
        priority
        className={`mx-auto max-w-56 rounded-t-lg border border-neutral-700 min-[380px]:max-w-80 min-[480px]:max-w-[26rem] sm:max-w-lg md:absolute md:top-8 md:w-[28.25rem] md:shadow-2xl md:transition-all md:duration-200 ${isReversed ? 'md:-left-32 md:group-hover/container:rotate-3' : 'md:-right-32 md:group-hover/container:-rotate-3'} md:group-hover/container:scale-[102%]`}
      />
        <div
          className={`relative mx-auto w-full max-w-56 min-[380px]:max-w-80 min-[480px]:max-w-[26rem] sm:max-w-lg md:absolute md:top-8 md:w-[28.25rem] ${isReversed ? 'md:-left-32' : 'md:-right-32'} md:shadow-2xl md:transition-all md:duration-200 md:group-hover/container:scale-[102%] ${isReversed ? 'md:group-hover/container:rotate-3' : 'md:group-hover/container:-rotate-3'}`}
        >
        <div className="relative aspect-[4/5] overflow-hidden rounded-t-lg border border-neutral-700">
          <Image
            src={project.image}
            alt={`Project ${project.name} image`}
            fill
            priority
            sizes="(min-width: 768px) 28.25rem, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  )
}

export default Project
