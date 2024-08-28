import { SKILLS } from '@/constants'
import Image from 'next/image'

export default function Skills() {
  return (
    <div className="mx-auto max-w-4xl py-[3rem] text-center md:py-[6rem] lg:pt-[10rem]">
      <h2 className="section-heading">Skills</h2>
      <ul className="group mx-auto flex w-fit flex-col items-center justify-center gap-4 transition-all duration-300 md:flex-row md:gap-10">
        {SKILLS.map((skill) => (
          <li
            key={skill.link}
            className={`relative sm:transition-all sm:duration-300 sm:hover:-translate-y-1 sm:hover:scale-110 sm:[&:not(:hover)]:group-hover:translate-y-2 sm:[&:not(:hover)]:group-hover:scale-95`}
          >
            <Image
              src={skill.link}
              sizes={`${skill.width}px`}
              alt="Skill icon"
              height={skill.height}
              width={skill.width}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
