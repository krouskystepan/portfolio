import Hero from '@/components/sections/Hero'
import AboutMe from '@/components/sections/AboutMe'
import Projects from '@/components/sections/Projects'
import ContactMe from '@/components/sections/ContactMe'
import BackgroundGradient from '@/components/BackgroundGradient'

const Home = () => {
  return (
    <section className="flex w-full flex-col px-4">
      <BackgroundGradient />
      <Hero />
      <AboutMe />
      <Projects />
      <ContactMe />
    </section>
  )
}

export default Home
