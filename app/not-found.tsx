import NotFoundAchievementTrigger from '@/components/achievements/NotFoundAchievementTrigger'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: {
    absolute: 'Not Found | Stepan Krousky',
  },
  description: 'The page you are looking for does not exist.',
}

export default function NotFoundPage() {
  return (
    <div className="z-10 flex grow items-center justify-center px-4 text-gray-800">
      <NotFoundAchievementTrigger />
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-gradient text-6xl font-extrabold md:text-7xl">
          404
        </h1>
        <p className="text-2xl font-semibold text-neutral-200 md:text-3xl">
          Oops!
        </p>
        <p className="text-lg font-medium text-neutral-200 md:text-xl">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="mx-auto mt-2 inline-block w-fit rounded-lg border border-white bg-white px-5 py-2 text-lg text-black transition hover:bg-white/20 hover:text-white md:px-6 md:py-3"
        >
          Back Home
        </Link>
      </div>
    </div>
  )
}
