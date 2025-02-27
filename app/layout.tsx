import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="flex min-h-dvh flex-col bg-black antialiased">
        <Navbar />
        <main className="flex w-full flex-1 flex-col pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

export default RootLayout
