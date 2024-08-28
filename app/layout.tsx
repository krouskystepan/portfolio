import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

import './globals.css'
import { BASE_URL } from '@/constants'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'Stepan Krousky | Personal Portfolio',
  applicationName: 'Stepan Krousky | Personal Portfolio',
  publisher: 'Stepan Krousky',
  authors: [{ name: 'Stepan Krousky', url: BASE_URL }],
  metadataBase: new URL(BASE_URL),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${poppins.className}`}>
        <Navbar />
        <main className="flex min-h-[calc(100vh-5rem)] flex-col">
          <div className="flex flex-1 flex-col">{children}</div>
          <Footer />
        </main>
      </body>
    </html>
  )
}
