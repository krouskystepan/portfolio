'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { TTools } from '@/constants/types'
import { isToolComingSoon } from '@/utils/toolUtils'

export default function ToolCard({ tool }: { tool: TTools }) {
  const comingSoon = isToolComingSoon(tool)

  const body = (
    <div className="flex h-full flex-col justify-between gap-3">
      <div>
        <div
          className={`text-base font-semibold sm:text-lg md:text-xl ${
            comingSoon ? 'text-neutral-300' : 'text-white'
          }`}
        >
          {tool.name}
        </div>
        <p
          className={`mt-1 line-clamp-2 text-xs leading-relaxed sm:text-sm ${
            comingSoon ? 'text-neutral-500' : 'text-neutral-300'
          }`}
        >
          {tool.description}
        </p>
      </div>

      <div className="relative text-xs font-medium sm:text-sm">
        {comingSoon ? (
          <span className="text-neutral-500">Coming soon</span>
        ) : (
          <span className="inline-flex items-center text-custom_blue">
            <span className="relative after:absolute after:-bottom-px after:left-0 after:h-px after:w-0 after:bg-current after:transition-all after:duration-300 group-hover:after:w-full">
              Open
            </span>
            <ArrowRight className="ml-1 size-4 transition-transform delay-[50ms] duration-300 group-hover:translate-x-1" />
          </span>
        )}
      </div>
    </div>
  )

  if (comingSoon) {
    return (
      <div className="relative cursor-default overflow-hidden rounded-2xl border border-dashed border-white/10 bg-neutral-950/30 p-6 backdrop-blur-sm">
        {body}
      </div>
    )
  }

  return (
    <Link
      href={`/t/${tool.path}`}
      className="group relative block overflow-hidden rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-6 backdrop-blur-sm transition-all duration-200 hover:border-custom_blue"
    >
      {body}
    </Link>
  )
}
