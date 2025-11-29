'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BackgroundFade } from '@/components/Backgrounds'
import Project from '@/components/Project'
import { PROJECTS } from '@/constants'
import { TProjectFilter } from '@/constants/types'

const BG_MAP: Record<TProjectFilter, string> = {
  live: 'bg-green-600',
  all: 'bg-blue-600',
  demo: 'bg-red-600',
}

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
          <div className="relative flex overflow-hidden rounded-xl border-2 border-neutral-800">
            <motion.div
              layoutId="highlight"
              className={`absolute inset-y-0 ${BG_MAP[filter]}`}
              style={{
                width: `${100 / ORDER.length}%`,
                left: `${ORDER.indexOf(filter) * (100 / ORDER.length)}%`,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
            />

            {ORDER.map((item, index) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`
                  relative z-10 flex size-8 items-center justify-center
                  bg-transparent p-8 text-base font-bold transition sm:size-20 sm:text-xl
                  ${BG_MAP[filter] !== BG_MAP[item] ? 'hover:bg-neutral-800/30' : ''}
                  ${index !== ORDER.length - 1 ? 'border-r-2 border-neutral-800' : ''}
                `}
              >
                {item === 'all'
                  ? 'All'
                  : item.charAt(0).toUpperCase() + item.slice(1)}
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
