import Link from 'next/link'
import React from 'react'

const Projects = () => {
  return (
    <div className="w-full px-2 mx-auto py-6">
      {/* Top Side Lines */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-5xl h-36 flex justify-center relative bg-gradient-to-t from-neutral-600 to-transparent">
          <div className="w-[calc(100%-2px)] h-full absolute top-0 bg-black/90" />
        </div>
      </div>

      <div className="w-full flex justify-center relative">
        {/* Top Line */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-600 to-transparent z-20" />
        {/* Bottom Line */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-600 to-transparent z-20" />

        {/* Side Lines */}
        <div className="w-full max-w-5xl flex flex-col gap-4 items-center relative px-8 py-32 text-white border-x border-neutral-600 overflow-hidden">
          <div className="absolute inset-0" data-pattern="honeycomb" />

          <h2 className="text-6xl font-semibold relative">Projects</h2>
          <p className="text-xl text-center relative flex flex-col">
            <span>Here are some of the projects I've worked on.</span>
            <span>
              You can find more on my{' '}
              <Link
                href="https://github.com/krouskystepan"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-neutral-300"
              >
                GitHub
              </Link>
              .
            </span>
          </p>
          <button className="px-6 py-3 bg-white text-black border border-white font-semibold rounded-lg hover:bg-transparent hover:text-white transition relative tracking-wider">
            View Projects
          </button>
        </div>
      </div>

      {/* Bottom Side Lines */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-3xl 2xl:max-w-5xl h-24 2xl:h-36 flex justify-center relative bg-gradient-to-b from-neutral-600 to-transparent">
          <div className="w-[calc(100%-2px)] h-full absolute top-0 bg-black" />
        </div>
      </div>
    </div>
  )
}

export default Projects
