import Link from 'next/link'
import { socials } from '@/constants'

export default function Footer() {
  return (
    <footer className="bottom-0 left-0 bg-[#2D2C2D] p-10">
      <div className="mx-auto flex max-w-5xl flex-col justify-around gap-5 text-center md:flex-row">
        <p className=" font-bold text-white">
          Copyright © 2024. All rights are reserved
        </p>
        <div className="flex justify-center gap-5">
          {socials.map((social) => (
            <Link
              key={social.label}
              href={social.link}
              target="_blank"
              aria-label={social.label}
              className="text-white transition-all duration-150 hover:text-[#228CDB] focus:text-[#228CDB] [&>*]:size-6"
            >
              {social.icon}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
