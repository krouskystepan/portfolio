import { PROJECTS } from '@/constants'
import Image from 'next/image'

export default function ProjectsPage() {
  const sortedProjects = [...PROJECTS].sort((a, b) => b.priority - a.priority)

  return (
    <section className="w-full scroll-mt-[5rem] bg-[#F9F9F9] px-4 pb-[4rem] pt-[3rem] md:px-0">
      <div className="mx-auto max-w-4xl py-0 text-center">
        <h3 className="section-heading">All My Projects</h3>
        <div className="space-y-6">
          {sortedProjects.map((project) => (
            <a
              key={project.title}
              href={project.path}
              target="_blank"
              className="group/container relative mx-auto flex h-[28rem] w-full flex-col gap-0 overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-100 text-center transition-colors duration-200 md:h-[20rem] md:max-w-[48rem] md:flex-row md:gap-10 md:text-start md:even:flex-row-reverse md:hover:border-2 md:hover:border-[#2b63b2] md:[&>*]:basis-1/2"
            >
              <div className="flex flex-col px-4 py-7 md:pb-7 md:pl-10 md:pt-10 md:group-even/container:pl-4 md:group-even/container:pr-10">
                <h4 className="text-2xl font-semibold">{project.title}</h4>
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
                className="mx-auto block max-w-[14rem] rounded-t-lg border border-gray-200 min-[380px]:max-w-[20rem] min-[480px]:max-w-[26rem]  sm:max-w-[32rem] md:hidden"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
