import { projects } from '@/constants'
import Image from 'next/image'

export default function Projects() {
  return (
    <section
      id="projects"
      className="w-full scroll-mt-[5rem] bg-[#F9F9F9] px-4 py-[3rem] sm:scroll-mt-[10rem] md:py-[6rem] lg:py-[10rem]"
    >
      <div className="mx-auto max-w-4xl py-0 text-center">
        <h3 className="section-heading">Projects</h3>
        <div className="flex flex-col gap-4">
          {projects.map((project) => (
            <a
              key={project.title}
              href={project.path}
              target="_blank"
              className="group/container flex h-[20rem] gap-10 overflow-hidden rounded-lg bg-gray-100 text-start even:flex-row-reverse [&>*]:basis-1/2"
            >
              <div className="flex flex-col py-10 pl-10 group-even/container:pl-4 group-even/container:pr-10">
                <h4 className="text-2xl font-semibold">{project.title}</h4>
                <p className="mt-3 line-clamp-5">{project.description}</p>
                <ul className="mt-auto flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-xl bg-gray-700 px-3 py-1 text-[.7rem] uppercase tracking-wide text-white transition-transform duration-300 group-hover/container:rotate-3 group-hover/container:even:-rotate-3"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative overflow-hidden">
                <Image
                  src={project.image}
                  alt="Image"
                  fill
                  className="transition-transform group-hover/container:rotate-3 group-hover/container:scale-110 group-hover/container:group-even/container:-rotate-3"
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
