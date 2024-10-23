import { MAX_PROJECTS, PROJECTS } from '@/constants'
import Image from 'next/image'
import Link from 'next/link'

export default function Projects() {
  const sortedProjects = [...PROJECTS].sort((a, b) => b.priority - a.priority)

  return (
    <section
      id="projects"
      className="w-full scroll-mt-20 bg-[#F9F9F9] px-4 py-20 md:px-0"
    >
      <div className="mx-auto max-w-4xl py-0 text-center">
        <h3 className="section-heading">Projects</h3>
        <div className="space-y-6">
          {sortedProjects.slice(0, MAX_PROJECTS).map((project) => (
            <a
              key={project.title}
              href={project.path}
              target="_blank"
              className="group/container relative mx-auto flex h-[28rem] w-full flex-col gap-0 overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-100 text-center transition-colors duration-200 md:h-80 md:max-w-3xl md:flex-row md:gap-10 md:text-start md:even:flex-row-reverse md:hover:border-2 md:hover:border-[#2b63b2] md:[&>*]:basis-1/2"
            >
              {project.isDemo && (
                <span className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-lg bg-rose-600 px-2 py-1 text-xs font-semibold text-white md:rounded-b-none md:group-odd/container:left-0 md:group-odd/container:translate-x-0 md:group-odd/container:rounded-br-lg md:group-even/container:left-full md:group-even/container:-translate-x-full md:group-even/container:rounded-bl-lg">
                  Demo
                </span>
              )}
              <div className="flex flex-col px-4 py-7 md:pb-7 md:pl-10 md:pt-10 md:group-even/container:pl-4 md:group-even/container:pr-10">
                <h4 className="mt-2 text-2xl font-semibold md:mt-0">
                  {project.title}
                </h4>
                <p className="mt-3 line-clamp-6">{project.description}</p>
                <ul className="mt-3 flex flex-wrap justify-center gap-2 md:mt-auto md:justify-start">
                  {project.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-xl bg-gray-700 px-3 py-1 text-[.7rem] uppercase tracking-wide text-white transition-transform duration-300 md:group-hover/container:rotate-3 md:group-hover/container:even:-rotate-3"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>

              <Image
                src={project.image}
                alt="Image"
                quality={90}
                width={500}
                height={900}
                className="absolute -right-32 top-8 hidden w-[28.25rem] rounded-t-lg shadow-2xl transition-all duration-200 group-even/container:-left-32 group-hover/container:-rotate-3 group-hover/container:scale-[102%] group-hover/container:group-even/container:rotate-3 md:block"
              />
              <Image
                src={project.image}
                alt="Image"
                quality={90}
                width={500}
                height={900}
                className="mx-auto block max-w-56 rounded-t-lg border border-gray-200 min-[380px]:max-w-80 min-[480px]:max-w-[26rem]  sm:max-w-lg md:hidden"
              />
            </a>
          ))}
          {sortedProjects.length > MAX_PROJECTS && (
            <div className="mt-6 flex justify-center">
              <Link
                href="/projects"
                className="cursor-pointer rounded-md border border-gray-300 px-3 py-1.5 text-lg transition-colors duration-200 hover:border-[#2b63b2] hover:bg-gray-100"
                aria-label="Show more projects"
              >
                All My Projects
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
