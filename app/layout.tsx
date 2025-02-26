import Navbar from '@/components/shared/Navbar'
import './globals.css'
import { Outfit } from 'next/font/google'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="antialiased bg-black min-h-dvh flex flex-col">
        <Navbar />
        <main className="w-full flex flex-col grow pt-20 px-4">{children}</main>
      </body>
    </html>
  )
}

export default RootLayout
