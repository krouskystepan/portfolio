'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BackgroundFade } from '@/components/Backgrounds'
import Project from '@/components/Project'
import { PROJECTS } from '@/constants'
import { TProjectFilter } from '@/constants/types'
import { getAvailabilityDetails } from '@/utils/utils'

const Projects = () => {
  const [filter, setFilter] = useState<TProjectFilter>('all')

  const ORDER: TProjectFilter[] = ['live', 'all', 'demo']

  const filteredProjects =
    filter === 'all'
      ? PROJECTS
      : PROJECTS.filter((p) => p.availability === filter)

  return (
    <section className="flex w-full flex-col px-4 py-12">
      <BackgroundFade className="bg-gradient-to-b from-neutral-900/60 to-transparent" />

      <div className="z-10">
        <h2 className="mb-8 text-center text-4xl font-bold md:text-5xl">
          My Projects
        </h2>

        <div className="mb-6 flex justify-center sm:mb-10">
          <div className="relative flex overflow-hidden rounded-xl border-2 border-neutral-800 p-1 backdrop-blur">
            <motion.div
              layoutId="availability-highlight"
              className={`absolute inset-y-1 rounded-lg ${getAvailabilityDetails(filter).className}`}
              style={{
                width: `calc(${100 / ORDER.length}% - 0.5rem)`,
                left: `calc(${ORDER.indexOf(filter) * (100 / ORDER.length)}% + 0.25rem)`,
              }}
              transition={{
                backgroundColor: { delay: 0.08 },
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }}
            />

            {ORDER.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className="relative z-10 flex w-24 items-center justify-center rounded-lg px-5 py-2 text-sm font-semibold transition sm:px-8 sm:py-3 sm:text-lg"
              >
                {item === 'all'
                  ? getAvailabilityDetails('all').label
                  : getAvailabilityDetails(item).label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              className="grid grid-cols-1 gap-10"
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.1 },
                },
              }}
            >
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.2, ease: 'linear' }}
                >
                  <Project project={project} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

export default Projects
