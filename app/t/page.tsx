import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { tools } from '@/constants/tools'

export default function ToolsPage() {
  return (
    <div>
      <h2 className="mb-8 text-center text-4xl font-bold lg:text-5xl">
        Utility Tools
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, index) => (
          <Link
            key={index}
            href={`/t/${tool.path}`}
            className={`group relative block overflow-hidden rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-6 backdrop-blur-sm ${tool.path !== '' ? 'transition-all duration-200 hover:border-custom_blue' : 'cursor-default'}`}
          >
            <div className="flex h-full flex-col justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-white sm:text-lg md:text-xl">
                  {tool.name}
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-300 sm:text-sm">
                  {tool.description}
                </p>
              </div>

              <div className="relative text-xs font-medium sm:text-sm">
                {tool.path === '' ? (
                  <span className="text-custom_pink">Coming Soon</span>
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
          </Link>
        ))}
      </div>
    </div>
  )
}
