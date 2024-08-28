'use client'

import { NAV_LINKS } from '@/constants'
import Link from 'next/link'
import Burger from './svg/Burger'
import CloseButton from './svg/CloseButton'
import { useState } from 'react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky left-0 top-0 z-10 h-[5rem] bg-white p-6 shadow-sm">
      <nav className="mx-auto flex max-w-5xl items-center justify-between">
        {/* Desktop Navigation */}

        <h6 className={'text-2xl font-bold'}>Krouský Štěpán</h6>

        <a
          href="#content"
          className="sr-only text-center text-2xl text-black outline outline-black focus:not-sr-only"
        >
          Skip to main content
        </a>
        <ul className="hidden items-center gap-5 text-xl font-medium sm:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.name}>
              <Link
                href={link.to}
                className="cursor-pointer outline-transparent transition-all duration-150 hover:text-[#228CDB] focus:text-[#228CDB] focus:outline-none"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Burger */}
        <button
          className={`block cursor-pointer sm:hidden`}
          onClick={() => setIsOpen(true)}
          aria-label="Open Mobile Navigation"
        >
          <Burger className="size-8" />
        </button>

        {/* Mobile Navigation */}
        <nav
          className={`absolute left-0 top-0 block h-screen w-full bg-white duration-500 sm:hidden ${
            isOpen ? '-translate-y-0' : '-translate-x-full'
          }`}
        >
          <button
            onClick={() => setIsOpen(false)}
            className="fixed right-6 top-6 z-20 ml-auto cursor-pointer"
            aria-label="Close Mobile Navigation"
          >
            <CloseButton className="size-8" />
          </button>
          <ul className="flex h-full flex-col items-center justify-center gap-10 text-4xl font-medium">
            {NAV_LINKS.map((link) => (
              <li
                key={link.name}
                className="transition-all duration-150 hover:text-[#228CDB]"
                onClick={() => setIsOpen(false)}
              >
                <Link href={link.to} className="cursor-pointer">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </nav>
    </header>
  )
}
