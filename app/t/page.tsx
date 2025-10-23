import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { BackgroundFade } from '@/components/Backgrounds'

export const metadata = {
  title: 'Dev Tools',
  description: 'Developer utilities and playgrounds',
}

const tools = [
  {
    name: 'Text Compare / Diff Tool',
    path: '/t/text-compare',
    description:
      'Compare two blocks of text and see the differences highlighted.',
  },
  {
    name: 'JSON Formatter & Validator',
    path: '/t/json-formatter',
    description:
      'Format, validate, and inspect JSON instantly in your browser.',
  },
]

export default function ToolsPage() {
  return (
    <section className="flex w-full max-w-6xl mx-auto flex-col px-4 py-12">
      <BackgroundFade className="bg-gradient-to-b from-neutral-900/60 to-transparent" />
      <div className="z-10">
        <h2 className="mb-8 text-center text-4xl font-bold md:text-5xl">
          Developer Tools
        </h2>
      </div>

      <div className="z-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.path}
            href={tool.path}
            className="group relative block overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 backdrop-blur-sm transition-all duration-200 hover:border-custom_blue"
          >
            <div className="flex flex-col justify-between gap-3 h-full">
              <div>
                <div className="text-xl font-semibold text-white">
                  {tool.name}
                </div>
                <p className="mt-1 text-sm text-neutral-400 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="relative inline-flex items-center text-sm font-medium text-custom_blue">
                <span className="relative after:absolute after:-bottom-px after:left-0 after:h-[1px] after:w-0 after:bg-current after:transition-all after:duration-300 group-hover:after:w-full">
                  Open
                </span>
                <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
