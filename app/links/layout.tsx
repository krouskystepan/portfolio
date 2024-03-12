import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Stepan Krousky | Links',
  description: 'Just links',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          href="/icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
      </head>
      <body className={`${inter.className} relative mx-auto max-w-[80rem] overflow-hidden`}>
        <div className="absolute bottom-[45%] right-[1rem] -z-10 h-[10rem] w-[20rem] rounded-full bg-[#ff258e] blur-[5rem] sm:w-[25rem] sm:bg-[#FF82BF] sm:blur-[6rem] md:h-[15rem] md:w-[30rem] lg:right-[4rem] lg:h-[20rem] lg:w-[35rem] lg:blur-[8.5rem] xl:right-[5rem] xl:w-[40rem] 2xl:right-[7rem] 2xl:w-[45rem] min-[1820px]:right-[10rem] min-[1820px]:w-[55rem]" />
        <div className="absolute left-[1rem] top-[45%] -z-10 h-[10rem] w-[20rem] rounded-full bg-[#2DE1FC] blur-[5rem] sm:w-[25rem] sm:blur-[6rem] md:h-[15rem] md:w-[30rem] lg:left-[4rem] lg:h-[20rem] lg:w-[35rem] lg:blur-[8.5rem] xl:left-[5rem] xl:w-[40rem] 2xl:left-[7rem] 2xl:w-[45rem] min-[1820px]:left-[10rem] min-[1820px]:w-[55rem]" />
        {children}
      </body>
    </html>
  )
}
