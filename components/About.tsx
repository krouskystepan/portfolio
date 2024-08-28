export default function About() {
  return (
    <section
      id="about"
      className="w-full max-w-4xl scroll-mt-[5rem] px-4 py-[5rem]"
    >
      <div className="mx-auto text-center">
        <h3 className="section-heading">About me</h3>
        <p className="!leading-[1.4] tracking-wider">
          My name is <span className="font-semibold">Štěpán Krouský</span>,
          I&apos;m a <span className="font-semibold">FullStack Developer</span>{' '}
          based in the Czech Republic. My passion is to create a{' '}
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
    </section>
  )
}
