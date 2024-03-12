import GitHub from '@/components/svg/GitHub'
import Instagram from '@/components/svg/Instagram'
import Linkedin from '@/components/svg/Linkedin'
import Spotify from '@/components/svg/Spotify'

import Link from 'next/link'

export default async function Links() {
  return (
    <main className="flex h-screen flex-col items-center justify-center gap-5 overflow-hidden">
      <h1 className="bg-gradient-to-r from-[#222222] to-[#555555] bg-clip-text text-4xl font-bold text-transparent">
        Stepan Krousky
      </h1>
      <section className="grid grid-cols-2 gap-10 sm:grid-cols-4">
        <Link
          href="https://open.spotify.com/user/11157116423"
          aria-label="Spotify Link"
        >
          <Spotify size={64} />
        </Link>
        <Link
          href="https://www.linkedin.com/in/štěpán-krouský-907782261/"
          aria-label="Linkedin Link"
        >
          <Linkedin size={64} />
        </Link>
        <Link
          href="https://www.instagram.com/krouskystepan/"
          aria-label="Instagram Link"
        >
          <Instagram size={64} />
        </Link>
        <Link href="https://github.com/krouskystepan" aria-label="GitHub Link">
          <GitHub size={64} />
        </Link>
      </section>
    </main>
  )
}
