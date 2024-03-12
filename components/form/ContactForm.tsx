'use client'

import Link from 'next/link'
import Outline_Linkedin from '../svg/Outline_Linkedin'
import SubmitButton from './SubmitButton'
import { sendEmail } from '@/actions/sendEmail'
import { toast } from 'react-toastify'

export default function ContactForm() {
  return (
    <form
      className="mx-auto mt-8 flex max-w-2xl flex-col md:mt-10"
      action={async (formData) => {
        const { error } = await sendEmail(formData)

        if (error) {
          toast.error(error)
          return
        }

        toast.success('Email send successfully!')
      }}
    >
      <div className="flex flex-row-reverse items-center gap-5">
        <Link
          href={'https://www.linkedin.com/in/štěpán-krouský-907782261/'}
          target="_blank"
          className="mr-1 hidden min-[420px]:block"
          aria-label="Linkedin Link"
        >
          <Outline_Linkedin className="size-8 cursor-pointer transition-all duration-150 hover:text-[#228CDB]" />
        </Link>
        <span className='hidden min-[420px]:block'>{' / '}</span>
        <input
          className="h-10 w-full rounded-xl border px-3 py-2 text-sm"
          name="senderEmail"
          type="email"
          required
          maxLength={500}
          placeholder="Your email"
        />
      </div>
      <textarea
        className="my-3 h-52 rounded-xl border p-4 text-sm"
        name="message"
        placeholder="Your message"
        required
        maxLength={5000}
      />
      <SubmitButton />
    </form>
  )
}
