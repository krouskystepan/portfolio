'use client'

import { TProject } from '@/constants/types'
import Link from 'next/link'
import Image from 'next/image'
import { CSSProperties, useRef, useState } from 'react'
import { useAchievementContext } from '@/context/AchievementContext'
import CustomConfetti from './CustomConfetti'
import { ChevronRight, ExternalLink } from 'lucide-react'
import { getAvailabilityDetails } from '@/utils/utils'

const Project = ({ project }: { project: TProject }) => {
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

  const isExternal = project.link.type === 'external'

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group/container relative mx-auto flex h-[32rem] w-full flex-col gap-0 overflow-hidden rounded-lg border-2 border-neutral-800 bg-neutral-900 text-center sm:h-[28rem] md:h-96 md:max-w-3xl md:flex-row md:gap-10 md:text-start md:even:flex-row-reverse md:[&>*]:basis-1/2"
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
          className={`absolute left-1/2 top-0 -translate-x-1/2 rounded-b-lg border-x-2 border-b-2 border-neutral-800 px-2 py-1 text-xs font-semibold text-white md:group-odd/container:left-0 md:group-odd/container:translate-x-0 md:group-odd/container:rounded-bl-none md:group-odd/container:rounded-br-lg md:group-odd/container:border-l-0 md:group-odd/container:border-r-2 md:group-even/container:left-full md:group-even/container:-translate-x-full md:group-even/container:rounded-bl-lg md:group-even/container:rounded-br-none md:group-even/container:border-l-2 md:group-even/container:border-r-0 ${getAvailabilityDetails(project.availability).className}`}
        >
          {getAvailabilityDetails(project.availability).label}
        </span>
      )}
      <div className="flex flex-col px-4 py-7 md:pb-7 md:pl-10 md:pt-10 md:group-even/container:pl-4 md:group-even/container:pr-10">
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
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="group mx-auto flex w-full max-w-lg items-center justify-center rounded-lg border border-neutral-800 bg-neutral-700 py-2 text-center transition-colors duration-200 hover:bg-neutral-700/80 md:max-w-full"
          >
            {isExternal ? (
              <>
                <span className="mr-1">Visit Project</span>
                <ExternalLink size={16} />
              </>
            ) : (
              <>
                <span className="mr-0.5">View Project</span>
                <ChevronRight size={16} />
              </>
            )}
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
        className="mx-auto max-w-56 rounded-t-lg border border-neutral-700 min-[380px]:max-w-80 min-[480px]:max-w-[26rem] sm:max-w-lg md:absolute md:-right-32 md:top-8 md:mx-0 md:w-[28.25rem] md:shadow-2xl md:transition-all md:duration-200 md:group-even/container:-left-32 md:group-hover/container:-rotate-3 md:group-hover/container:scale-[102%] md:group-hover/container:group-even/container:rotate-3"
      />
    </div>
  )
}

export default Project
