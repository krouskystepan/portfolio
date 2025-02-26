const AboutMe = () => {
  return (
    <div className="mx-auto w-full max-w-4xl flex flex-col relative">
      <div className="w-full flex flex-col items-center relative z-10 ">
        <div className="w-full h-px bg-gradient-to-r from-neutral-900/0 via-[#4169E1] to-neutral-900/0" />
        <div className="bg-radial w-full h-72 absolute opacity-25" />
      </div>
      <div className="flex flex-col items-center gap-4 relative py-12 z-10">
        <h3 className="text-white text-6xl text-center font-bold">About Me</h3>
        <p className="text-neutral-300 text-lg text-center">
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

//F83A89 pink
//4169E1 blue
