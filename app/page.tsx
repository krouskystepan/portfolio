import BackgroundGradient from '@/components/BackgroundGradient'
import Hero from '@/components/Hero'
import AboutMe from '@/components/AboutMe'
import Projects from '@/components/Projects'

const Home = () => {
  return (
    <>
      <BackgroundGradient />
      <Hero />
      <AboutMe />
      <Projects />
      {/* <div className="h-96 bg-black" /> */}
    </>
  )
}

export default Home
