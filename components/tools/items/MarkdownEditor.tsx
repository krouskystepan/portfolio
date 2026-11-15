'use client'

import { Suspense } from 'react'
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAchievementContext } from '@/context/AchievementContext'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  ClearButton,
  SecondaryButton
} from '@/components/tools/_shared/ToolButtons'
import {
  toolHintMetaClass,
  toolIntroTextClass,
  toolLabelClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import { str, useToolUrlState } from '@/hooks/useToolUrlState'
import { downloadTextFile, pickTextFile, readTextFile } from '@/utils/download'

const SAMPLE = `# Markdown preview

Write on the left, see the result on the right. **GitHub-flavoured** Markdown is supported.

## Features

- [x] Tables
- [x] Task lists
- [ ] ~~Raw HTML~~ (never rendered)

| Tool | Runs in |
| ---- | ------- |
| Editor | Browser |
| Preview | Browser |

> Raw HTML such as <script>alert(1)</script> is shown as text, not executed.

\`\`\`ts
const greeting: string = 'hello'
\`\`\`

Visit [the portfolio](https://example.com) for more.
`

/** Preview typography. Raw HTML is never rendered: react-markdown escapes it. */
const previewClass =
  'min-h-64 max-h-[32rem] overflow-auto rounded-lg border border-white/10 bg-neutral-900/50 p-4 text-sm leading-relaxed text-neutral-200 ' +
  '[&_h1]:mb-3 [&_h1]:mt-1 [&_h1]:border-b [&_h1]:border-white/10 [&_h1]:pb-2 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-white ' +
  '[&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:border-b [&_h2]:border-white/10 [&_h2]:pb-1 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white ' +
  '[&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white ' +
  '[&_h4]:mb-1 [&_h4]:mt-3 [&_h4]:font-semibold [&_h4]:text-white ' +
  '[&_p]:my-3 [&_a]:text-custom_blue [&_a]:underline [&_a:hover]:opacity-80 ' +
  '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 ' +
  '[&_li:has(input[type=checkbox])]:list-none [&_li>input]:mr-2 [&_li>input]:accent-custom_blue ' +
  '[&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-white/20 [&_blockquote]:pl-4 [&_blockquote]:text-neutral-400 ' +
  '[&_code]:rounded [&_code]:border [&_code]:border-white/10 [&_code]:bg-neutral-950/70 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] ' +
  '[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-white/10 [&_pre]:bg-neutral-950/70 [&_pre]:p-3 ' +
  '[&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0 ' +
  '[&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-white/15 [&_th]:bg-neutral-800/60 [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-left ' +
  '[&_td]:border [&_td]:border-white/10 [&_td]:px-3 [&_td]:py-1.5 [&_hr]:my-5 [&_hr]:border-white/10 [&_img]:max-w-full [&_del]:text-neutral-500'

function MarkdownEditorInner() {
  const [url, setUrl] = useToolUrlState({
    md: str('', { text: true })
  })
  const markdown = url.md
  const { copied, flash } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()

  const setMarkdown = (value: string) => setUrl({ md: value })

  const handleCopy = async () => {
    if (!markdown) return
    await navigator.clipboard.writeText(markdown)
    unlockAchievement('clipboard-master')
    flash()
  }

  const handleImport = async () => {
    const file = await pickTextFile('.md,.markdown,.txt,text/markdown,text/plain')
    if (file) setMarkdown(await readTextFile(file))
  }

  const stats = markdown.trim()
    ? `${markdown.trim().split(/\s+/).length.toLocaleString()} words · ${markdown.length.toLocaleString()} characters`
    : ''

  return (
    <ToolLayout title="Markdown Editor">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Split editor and live preview with GitHub-flavoured Markdown (tables,
            task lists, strikethrough, autolinks). Raw HTML is{' '}
            <strong className="font-medium text-neutral-200">never rendered</strong>,
            so pasted content cannot run scripts. Everything stays in your browser.
          </p>
        }
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="flex min-w-0 flex-col">
            <div className={toolLabelClass}>Markdown</div>
            <TextAreaWithLineNumbers
              value={markdown}
              setValue={(v) =>
                setUrl((s) => ({
                  ...s,
                  md: typeof v === 'function' ? v(s.md) : v
                }))
              }
              placeholder="# Start writing…"
            />
          </div>
          <div className="flex min-w-0 flex-col">
            <div className={toolLabelClass}>Preview</div>
            <div className={previewClass}>
              {markdown.trim() ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  // Strip javascript:/vbscript:/etc. — defaultUrlTransform keeps http(s), mailto, relative.
                  urlTransform={defaultUrlTransform}
                >
                  {markdown}
                </ReactMarkdown>
              ) : (
                <p className="text-neutral-500">The rendered preview appears here.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            <SecondaryButton onClick={() => setMarkdown(SAMPLE)}>
              Load sample
            </SecondaryButton>
            <SecondaryButton onClick={() => void handleImport()}>
              Import file
            </SecondaryButton>
          </div>
          <ClearButton onClick={() => setMarkdown('')}>Clear</ClearButton>
        </div>
        {stats ? <p className={`${toolHintMetaClass} mt-3`}>{stats}</p> : null}
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Export</h2>
          <div className="flex flex-wrap gap-1.5">
            <SecondaryButton
              disabled={!markdown}
              onClick={() =>
                downloadTextFile(markdown, 'document.md', 'text/markdown;charset=utf-8')
              }
            >
              Download .md
            </SecondaryButton>
            <ToolCopyButton
              copied={copied === true}
              disabled={!markdown}
              idleLabel="Copy Markdown"
              onClick={() => void handleCopy()}
            />
          </div>
        </div>
        <p className={toolHintMetaClass}>
          Copy or download the Markdown source. Very large documents are kept out
          of the page URL automatically.
        </p>
      </div>
    </ToolLayout>
  )
}

export default function MarkdownEditor() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="Markdown Editor">
          <p className="text-center text-sm text-neutral-400">Loading…</p>
        </ToolLayout>
      }
    >
      <MarkdownEditorInner />
    </Suspense>
  )
}
