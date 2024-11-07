import Hero from '@/components/Hero'
import Skills from '@/components/Skills'
import Projects from '@/components/Projects'
import About from '@/components/About'
import Contact from '@/components/Contact'

export default function Home() {
  return (
    <main id="content" className="flex flex-col items-center scroll-smooth">
      <section className="w-full bg-[#F9F9F9] px-4 pt-12 md:pt-[7.5rem] ">
        <Hero />
        <Skills />
      </section>
      <About />
      <Projects />
      <Contact />
    </main>
  )
}
