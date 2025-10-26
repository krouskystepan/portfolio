import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { BackgroundFade } from '@/components/Backgrounds'

export const metadata = {
  title: 'Tools',
  description: 'Simple everyday tools for text, data, and conversions.',
}

const tools = [
  {
    name: 'Text Compare / Diff Tool',
    path: '',
    description:
      'Compare two blocks of text and see the differences highlighted.',
  },
  {
    name: 'JSON Formatter & Validator',
    path: '',
    description:
      'Format, validate, and inspect JSON instantly in your browser.',
  },
  {
    name: 'Regex Tester',
    path: '',
    description:
      'Test and debug regular expressions with instant match highlighting.',
  },
  {
    name: 'UUID Generator',
    path: '',
    description: 'Generate random UUIDs (v4) for identifiers or testing.',
  },
  {
    name: 'Color Converter',
    path: '',
    description:
      'Convert colors between HEX, RGB, and HSL. Live color preview.',
  },
  {
    name: 'Markdown Previewer',
    path: '',
    description: 'Write and preview Markdown with instant rendering.',
  },
  {
    name: 'CSV to JSON Converter',
    path: '',
    description:
      'Convert CSV data into formatted JSON objects and arrays instantly.',
  },
  {
    name: 'URL Encoder / Decoder',
    path: '',
    description: 'Encode or decode URLs and query parameters with one click.',
  },
  {
    name: 'HTML / CSS / JS Minifier',
    path: '',
    description:
      'Minify or beautify HTML, CSS, or JavaScript code to optimize performance.',
  },
  {
    name: 'Timestamp Converter',
    path: '',
    description: 'Convert Unix timestamps to readable dates and vice versa.',
  },
]

export default function ToolsPage() {
  return (
    <section className="flex w-full max-w-6xl mx-auto flex-col px-4 py-12">
      <BackgroundFade className="bg-gradient-to-b from-neutral-900/60 to-transparent" />
      <div className="z-10">
        <h2 className="mb-8 text-center text-4xl font-bold lg:text-5xl">
          Utility Tools
        </h2>
      </div>

      <div className="z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, index) => (
          <Link
            key={index}
            href={tool.path}
            className={`group relative block overflow-hidden rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-6 backdrop-blur-sm ${tool.path !== '' ? 'transition-all duration-200 hover:border-custom_blue' : 'cursor-default'}`}
          >
            <div className="flex flex-col justify-between gap-3 h-full">
              <div>
                <div className="text-base sm:text-lg md:text-xl font-semibold text-white">
                  {tool.name}
                </div>
                <p className="line-clamp-2 mt-1 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="relative inline-flex items-center text-xs sm:text-sm font-medium text-custom_blue">
                {tool.path === '' ? (
                  <span>Coming Soon</span>
                ) : (
                  <>
                    <span className="relative after:absolute after:-bottom-px after:left-0 after:h-[1px] after:w-0 after:bg-current after:transition-all after:duration-300 group-hover:after:w-full">
                      Open
                    </span>
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 delay-50" />
                  </>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
