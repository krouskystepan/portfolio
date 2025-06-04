import { BackgroundFade } from '@/components/Backgrounds'
import Project from '@/components/Project'
import { PROJECTS } from '@/constants'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projects',
}

const Projects = () => {
  return (
    <section className="flex w-full flex-col px-4 py-12">
      <BackgroundFade className="bg-gradient-to-b from-neutral-900/60 to-transparent" />
      <div className="z-10">
        <h2 className="mb-8 text-center text-4xl font-bold md:text-5xl">
          My Projects
        </h2>
        <div className="grid grid-cols-1 gap-10">
          {PROJECTS.map((project, index) => (
            <Project key={index} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projects
