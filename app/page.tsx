import Hero from '@/components/sections/Hero'
import AboutMe from '@/components/sections/AboutMe'
import Projects from '@/components/sections/Projects'
import ContactMe from '@/components/sections/ContactMe'
import BackgroundGradient from '@/components/BackgroundGradient'

const Home = () => {
  return (
    <section className="flex w-full flex-col px-4">
      <BackgroundGradient />
      {/* Done */}
      <Hero />
      <AboutMe />
      <Projects />
      {/* TBD */}
      <ContactMe />
      {/* <div className="h-96 bg-black" /> */}
    </section>
  )
}

export default Home
