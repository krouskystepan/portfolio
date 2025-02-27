import Link from 'next/link'
import React from 'react'

const NotFoundPage = () => {
  return (
    <div className="z-10 flex grow items-center justify-center text-gray-800">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="bg-gradient-to-br from-custom_pink from-10% to-custom_blue to-90% bg-clip-text text-7xl font-extrabold text-transparent">
          404
        </h1>
        <p className="text-3xl font-semibold text-neutral-200">Oops!</p>
        <p className="text-xl font-medium text-neutral-200">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="mx-auto mt-2 inline-block w-fit rounded-lg border border-white bg-white px-6 py-3 text-lg text-black transition hover:bg-white/20 hover:text-white"
        >
          Back Home
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
