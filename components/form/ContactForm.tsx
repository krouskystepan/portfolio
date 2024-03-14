'use client'

import Link from 'next/link'
import Outline_Linkedin from '../svg/Outline_Linkedin'
import SubmitButton from './SubmitButton'
import { sendEmail } from '@/actions/sendEmail'
import { toast } from 'react-toastify'
import { socials } from '@/constants'
import { useState } from 'react'

export default function ContactForm() {
  const [formData, setformData] = useState<{
    senderEmail: string
    message: string
  }>({
    senderEmail: '',
    message: '',
  })

  return (
    <form
      className="mx-auto mt-8 flex max-w-2xl flex-col md:mt-10"
      action={async () => {
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
          href={socials.linkedin}
          target="_blank"
          className="mr-1 hidden min-[420px]:block"
          aria-label="Linkedin Link"
        >
          <Outline_Linkedin className="size-8 cursor-pointer transition-all duration-150 hover:text-[#228CDB]" />
        </Link>
        <span className="hidden min-[420px]:block">{' / '}</span>
        <input
          className="h-10 w-full rounded-xl border px-3 py-2 text-sm"
          type="email"
          required
          maxLength={500}
          placeholder="Your email"
          onChange={(e) =>
            setformData({ ...formData, senderEmail: e.target.value })
          }
        />
      </div>
      <textarea
        className="my-3 h-52 rounded-xl border p-4 text-sm"
        placeholder="Your message"
        required
        maxLength={5000}
        onChange={(e) => setformData({ ...formData, message: e.target.value })}
      />
      <SubmitButton />
    </form>
  )
}
