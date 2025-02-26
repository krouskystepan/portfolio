'use client'

import { NAV_LINKS } from '@/constants'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="w-full flex items-center justify-center gap-4 fixed left-0 top-0 z-50 px-4 pointer-events-none">
      <DottedLine position="outside" />

      <nav className="w-full max-w-5xl 2xl:max-w-7xl h-20 flex items-center justify-between gap-2 sm:gap-4">
        <div
          className="pointer-events-auto hover:bg-white/5 border border-white/25 border-dashed rounded-xl backdrop-blur-lg shrink-0 overflow-hidden"
          style={{ '--opacity': '0.04' } as React.CSSProperties}
          data-pattern="stripes"
        >
          <Link
            href="/"
            className="h-12 flex items-center gap-4 px-4 text-white text-xl"
          >
            <Image src="/svgs/logo.svg" alt="Logo" width={24} height={24} />
            <span className="tracking-wide">
              <span className="font-extrabold">Krouský</span>Štěpán
            </span>
          </Link>
        </div>

        <DottedLine position="inside" />

        <div className="h-12 flex shrink-0 items-center gap-4 relative pointer-events-auto">
          {/* Desktop navigation */}
          <div
            className="h-full hidden md:flex items-center px-4 border border-white/25 border-dashed rounded-xl backdrop-blur-md text-lg font-medium"
            style={{ '--opacity': '0.04' } as React.CSSProperties}
            data-pattern="stripes"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="h-fit text-neutral-300 hover:text-white hover:underline hover:underline-offset-2 tracking-wide transition-colors duration-200 rounded-xl flex justify-center items-center mx-4"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div
            className="h-12 md:hidden flex items-center gap-4 border border-white/25 border-dashed rounded-xl backdrop-blur-md"
            data-pattern="stripes"
            style={{ '--opacity': '0.04' } as React.CSSProperties}
          >
            <div className="h-full flex grow">
              <button
                type="button"
                aria-label="Menu"
                className="min-w-20 flex grow items-center justify-center gap-3 px-4 hover:bg-white/5 rounded-xl cursor-pointer text-white"
                onClick={() => setIsOpen((prev) => !prev)}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          <div
            className={`w-[calc(100vw-2rem)] min-[400px]:w-52 md:hidden flex flex-col gap-2 absolute -bottom-4 translate-y-full p-4 bg-gradient-to-br from-white/30 to-white/5 backdrop-blur-md outline outline-neutral-600 shadow-lg rounded-xl transition-all duration-700 ${
              isOpen ? 'right-0' : '-right-[300%]'
            }`}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg text-white hover:underline hover:underline-offset-2 tracking-wide rounded-xl flex justify-center items-center"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <DottedLine position="outside" />
    </div>
  )
}

export default Navbar

const DottedLine = ({ position }: { position: 'outside' | 'inside' }) => {
  return (
    <hr
      className={`h-[1px] hidden border-t border-white/25 border-dashed ${
        position === 'outside' ? '2xl:flex grow' : 'md:flex w-full '
      }`}
    />
  )
}
