'use client'

import { NAV_LINKS } from '@/constants'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import useFirstVisitAchievement from '@/hooks/useFirstViewAchievement'
import useNightOwlAchievement from '@/hooks/useNightOwlAchievement'
import useIdleAchievement from '@/hooks/useIdleAchievement'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  useFirstVisitAchievement(200)
  useNightOwlAchievement(350)
  useIdleAchievement()

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-50 flex w-full items-center justify-center gap-4 px-4">
      <DottedLine position="outside" />

      <nav className="flex h-20 w-full max-w-5xl items-center justify-between gap-2 sm:gap-4 2xl:max-w-7xl">
        <div
          className="pointer-events-auto shrink-0 overflow-hidden rounded-xl border border-dashed border-white/25 backdrop-blur-lg hover:bg-white/5"
          style={{ '--opacity': '0.04' } as React.CSSProperties}
          data-pattern="stripes"
        >
          <Link
            href="/"
            className="flex h-12 items-center gap-4 px-4 text-xl text-white"
          >
            <Image
              src="/svgs/logo.svg"
              alt="Logo"
              width={24}
              height={24}
              priority
            />
            <span className="tracking-wide">
              <span className="font-extrabold">Krouský</span>Štěpán
            </span>
          </Link>
        </div>

        <DottedLine position="inside" />

        <div className="pointer-events-auto relative flex h-12 shrink-0 items-center gap-4">
          {/* Desktop navigation */}
          <div
            className="hidden h-full items-center rounded-xl border border-dashed border-white/25 px-4 text-lg font-medium backdrop-blur-md md:flex"
            style={{ '--opacity': '0.04' } as React.CSSProperties}
            data-pattern="stripes"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="mx-4 flex h-fit items-center justify-center rounded-xl tracking-wide text-neutral-300 transition-colors duration-200 hover:text-white hover:underline hover:underline-offset-2"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div
            className="flex h-12 items-center gap-4 rounded-xl border border-dashed border-white/25 backdrop-blur-md md:hidden"
            data-pattern="stripes"
            style={{ '--opacity': '0.04' } as React.CSSProperties}
          >
            <div className="flex h-full grow">
              <button
                type="button"
                aria-label="Menu"
                className="flex min-w-fit grow cursor-pointer items-center justify-center gap-3 rounded-xl px-4 text-white hover:bg-white/5 min-[420px]:min-w-20"
                onClick={() => setIsOpen((prev) => !prev)}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          <div
            className={`absolute right-0 top-16 flex w-[calc(100vw-2rem)] flex-col gap-2 rounded-xl bg-gradient-to-br from-white/30 to-white/5 p-4 shadow-lg outline outline-neutral-600/20 backdrop-blur-md transition-all duration-700 min-[400px]:w-52 md:hidden ${
              isOpen ? 'translate-x-0' : 'translate-x-[110%]'
            }`}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-center rounded-xl text-lg tracking-wide text-white hover:underline hover:underline-offset-2"
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
      className={`hidden h-px border-t border-dashed border-white/25 ${
        position === 'outside' ? 'grow 2xl:flex' : 'w-full md:flex '
      }`}
    />
  )
}
