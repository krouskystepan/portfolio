import Link from 'next/link'
import Outline_Linkedin from './svg/Outline_Linkedin'
import Outline_Github from './svg/Outline_Github'

export default function Footer() {
  return (
    <footer className="bottom-0 left-0 bg-[#2D2C2D] p-10">
      <div className="mx-auto flex max-w-5xl flex-col justify-around gap-5 text-center md:flex-row">
        <p className=" font-bold text-white">
          Copyright © 2024. All rights are reserved
        </p>
        <div className="flex justify-center gap-5">
          <Link
            href={'https://www.linkedin.com/in/štěpán-krouský-907782261/'}
            target="_blank"
            aria-label="Linkedin Link"
            className='text-white transition-all duration-150 hover:text-[#228CDB] focus:text-[#228CDB]'
          >
            <Outline_Linkedin className="size-6 cursor-pointer" />
          </Link>
          <Link
            href={'https://github.com/krouskystepan'}
            target="_blank"
            aria-label="GitHub Link"
            className='text-white transition-all duration-150 hover:text-[#228CDB] focus:text-[#228CDB]'
          >
            <Outline_Github className="size-6 cursor-pointer" />
          </Link>
        </div>
      </div>
    </footer>
  )
}