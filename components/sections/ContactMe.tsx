import { SOCIALS } from '@/constants'
import Link from 'next/link'
import Image from 'next/image'

const ContactMe = () => {
  return (
    <section id="contact" className="scroll-m-6 py-16 text-white">
      <div className="mx-auto flex flex-col gap-4 px-6 text-center">
        <div className="mx-auto w-fit px-12">
          <h2 className="text-4xl font-bold md:text-5xl">Get in Touch</h2>
          <div className="mx-[-30%] mt-1 h-0.5 w-[160%] rounded-xl bg-gradient-to-r from-transparent via-custom_blue to-transparent md:h-1" />
        </div>
        <p className="mx-auto max-w-xs text-center text-base font-medium text-neutral-300 sm:max-w-sm sm:text-xl md:max-w-2xl">
          Feel free to reach out via email or connect with me on social media.
        </p>
        <div
          className="mx-auto rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-8 min-[440px]:px-14 sm:px-20 md:px-32 md:py-12 lg:px-40 lg:py-14"
          style={{ '--opacity': '0.03' } as React.CSSProperties}
          data-pattern="stripes"
        >
          <p className="text-center text-xl font-medium text-neutral-300 sm:text-3xl">
            Email me at:
          </p>
          <a
            href="mailto:your.email@example.com"
            className="text-lg text-custom_blue underline-offset-2 hover:underline sm:text-2xl"
          >
            {
              SOCIALS.filter(
                (social) => social.label === 'Mail'
              )[0].source.split(':')[1]
            }
          </a>

          <div className="mt-3 flex flex-row justify-center gap-4">
            {SOCIALS.map((social, index) => (
              <Link
                key={index}
                href={social.source}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  'rounded-3xl border border-neutral-700 bg-neutral-800 p-3 shadow-md transition hover:bg-neutral-700/80 hover:shadow-lg sm:p-4'
                }
              >
                <Image
                  src={social.iconPath}
                  alt={social.label}
                  width={28}
                  height={28}
                  className="size-5 sm:size-7"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactMe
