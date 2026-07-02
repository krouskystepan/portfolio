const AboutMe = () => {
  return (
    <div
      id="about"
      className="relative mx-auto flex w-full max-w-4xl scroll-m-20 flex-col py-12 md:py-16 lg:py-24 xl:py-28"
    >
      <div className="relative z-10 flex w-full flex-col items-center ">
        <div className="h-px w-full bg-gradient-to-r from-neutral-900/0 via-custom_blue to-neutral-900/0" />
        <div className="bg-radial absolute h-72 w-full opacity-25" />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-4 py-12">
        <h2 className="text-center text-4xl font-bold text-white md:text-5xl">
          About Me
        </h2>
        <p className="text-center text-lg text-neutral-300 sm:text-xl">
          My name is <span className="font-semibold">Štěpán Krouský</span>, I'm
          a <span className="font-semibold">QA Automation Engineer</span> and{' '}
          <span className="font-semibold">Full Stack Developer</span> based in
          the Czech Republic. I develop Python-based test automation for
          automotive infotainment systems and build production web applications
          with <span className="font-semibold">React, Next.js,</span> and{' '}
          <span className="font-semibold">TypeScript.</span>
          <br />
          <br />
          On the web side, I focus on creating a{' '}
          <span className="font-semibold">polished UI/UX</span> with an{' '}
          <span className="font-semibold">emphasis on quality</span> across the
          frontend and backend. In QA, I work with tools like{' '}
          <span className="font-semibold">Jira</span> and{' '}
          <span className="font-semibold">Codebeamer</span> to design and
          maintain automated test suites in agile, international teams.
        </p>
      </div>
    </div>
  )
}

export default AboutMe
