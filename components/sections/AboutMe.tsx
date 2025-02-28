const AboutMe = () => {
  return (
    <div
      id="about"
      className="relative mx-auto flex w-full max-w-4xl scroll-m-20 flex-col"
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
          a <span className="font-semibold">FullStack Developer</span> based in
          the Czech Republic. I focus on creating a{' '}
          <span className="font-semibold">polished UI/UX.</span> I like to
          create projects with an{' '}
          <span className="font-semibold">emphasis on perfectionism</span> in
          the frontend and backend.
          <br />
          <br />
          My main stack currently includes{' '}
          <span className="font-semibold">React/Next.js</span> in combination
          with <span className="font-semibold">Tailwind CSS</span> and{' '}
          <span className="font-semibold">TypeScript.</span> I strongly believe
          in the importance of a{' '}
          <span className="font-semibold">
            high-quality user interface and experience.
          </span>{' '}
          Therefore, I strive to integrate{' '}
          <span className="font-semibold">modern technologies</span> into my
          work to achieve optimal results for my projects.
        </p>
      </div>
    </div>
  )
}

export default AboutMe
