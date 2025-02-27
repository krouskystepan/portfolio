import Link from 'next/link'
import React from 'react'

const Projects = () => {
  return (
    <div className="mx-auto w-full px-2 py-12 lg:py-6">
      {/* Top Side Lines */}
      <div className="hidden w-full justify-center lg:flex">
        <div className="relative flex h-24 w-full max-w-xl justify-center bg-gradient-to-t from-neutral-600 to-transparent lg:max-w-3xl 2xl:h-36 2xl:max-w-5xl">
          <div className="absolute top-0 h-full w-[calc(100%-2px)] bg-black/90" />
        </div>
      </div>

      <div className="relative flex w-full justify-center">
        {/* Top Line */}
        <div className="absolute left-0 top-0 z-20 h-px w-full bg-gradient-to-r from-transparent via-neutral-600 to-transparent" />
        {/* Bottom Line */}
        <div className="absolute bottom-0 left-0 z-20 h-px w-full bg-gradient-to-r from-transparent via-neutral-600 to-transparent" />

        {/* Side Lines */}
        <div className="relative flex w-full max-w-xl flex-col items-center gap-4 overflow-hidden border-neutral-600 px-8 py-20 text-white lg:max-w-3xl lg:border-x lg:py-24 2xl:max-w-5xl 2xl:py-32">
          <div
            className="absolute inset-0 hidden lg:block"
            data-pattern="honeycomb"
          />

          <h2 className="z-20 text-4xl font-bold sm:text-6xl md:text-5xl">
            Projects
          </h2>
          <p className="z-20 flex flex-col text-center text-base  font-medium text-neutral-300 sm:text-xl">
            <span>Here are some of the projects I've worked on.</span>
            <span>
              You can find more on my{' '}
              <Link
                href="https://github.com/krouskystepan"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white"
              >
                GitHub
              </Link>
              .
            </span>
          </p>
          <Link
            href={'/projects'}
            className="relative rounded-lg border border-white bg-white px-4 py-3 font-semibold tracking-wider text-black transition hover:bg-white/20 hover:text-white lg:px-5"
          >
            View Projects
          </Link>
        </div>
      </div>

      {/* Bottom Side Lines */}
      <div className="hidden w-full justify-center lg:flex">
        <div className="relative flex h-24 w-full max-w-xl justify-center bg-gradient-to-b from-neutral-600 to-transparent lg:max-w-3xl 2xl:h-36 2xl:max-w-5xl">
          <div className="absolute top-0 h-full w-[calc(100%-2px)] bg-black" />
        </div>
      </div>
    </div>
  )
}

export default Projects
