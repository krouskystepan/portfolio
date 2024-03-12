import Hero from '@/components/Hero'
import Skills from '@/components/Skills'
import Projects from '@/components/Projects'
import About from '@/components/About'
import Contact from '@/components/Contact'

import Link from 'next/link'

export default function Home() {
  return (
    <main id='content' className="flex flex-col items-center scroll-smooth">
      <section className="w-full bg-[#F9F9F9] px-4 pt-[3rem] md:pt-[7.5rem] lg:h-[calc(100vh-80px)]">
        <Hero />
        <Skills />
      </section>
      <About />
      <Projects />
      <Contact />
    </main>
  )
}
