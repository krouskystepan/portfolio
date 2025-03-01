import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { Outfit } from 'next/font/google'
import './globals.css'
import { BASE_URL } from '@/constants'
import { Metadata } from 'next'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export const metadata: Metadata = {
  title: {
    template: '%s | Stepan Krousky',
    default: 'Home | Stepan Krousky',
  },
  description:
    'The personal portfolio of Stepan Krousky, showcasing projects, skills, and experience in full-stack development.',
  applicationName: 'Stepan Krousky | Personal Portfolio',
  publisher: 'Stepan Krousky',
  authors: [{ name: 'Stepan Krousky', url: BASE_URL }],
  metadataBase: new URL(BASE_URL),
  keywords: [
    'Stepan Krousky',
    'Full-Stack Developer',
    'Portfolio',
    'Web Development',
    'JavaScript',
    'TypeScript',
    'Next.js',
  ],
  robots: 'index, follow',
}

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <html lang="en" className={`scroll-smooth ${outfit.variable}`}>
      <body className="flex min-h-dvh flex-col bg-neutral-950 antialiased">
        <Navbar />
        <main className="flex w-full flex-1 flex-col pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

export default RootLayout
