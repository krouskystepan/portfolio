import { Mail, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function Contact() {
  return (
    <section
      id="contact"
      className="w-full max-w-4xl scroll-mt-[5rem] px-4 py-[5rem]"
    >
      <div className="mx-auto text-center">
        <h3 className="section-heading !mb-2">Contact me</h3>
        <p className="mb-8 text-xl">Feel free to get in touch!</p>
        <div className="flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-16">
          <ContactBox
            icon={<MapPin size={26} />}
            title="Location"
            description="Turnov, Czech Republic"
          />
          <ContactBox
            icon={<Mail size={26} />}
            title="Email"
            email="stepan.krousky@seznam.cz"
          />
        </div>
      </div>
    </section>
  )
}

function ContactBox({
  icon,
  title,
  description,
  email,
}: {
  icon: React.ReactNode
  title: string
  description?: string
  email?: string
}) {
  return (
    <div className="flex flex-1 gap-4 odd:justify-end">
      <div className="flex size-14 items-center justify-center rounded-full border border-gray-200 p-2 shadow-md">
        {icon}
      </div>
      <div className="flex flex-col justify-center text-left">
        <h5 className="text-xl font-semibold">{title}</h5>
        {description && <p className="text-base">{description}</p>}
        {email && (
          <Link
            href={`mailto:${email}`}
            className="cursor-pointer text-[#595959] outline-transparent transition-colors duration-150 hover:text-[#228CDB] focus:text-[#228CDB] focus:outline-none"
          >
            {email}
          </Link>
        )}
      </div>
    </div>
  )
}
