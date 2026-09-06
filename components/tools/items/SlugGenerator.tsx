'use client'

import { Suspense, useMemo } from 'react'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import { ClearButton } from '@/components/tools/_shared/ToolButtons'
import {
  toolIntroTextClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarEndClass,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { useAchievementContext } from '@/context/AchievementContext'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import { str, useToolUrlState } from '@/hooks/useToolUrlState'

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function SlugGeneratorInner() {
  const [url, setUrl] = useToolUrlState({
    t: str('', { text: true })
  })
  const input = url.t
  const { copied, flash } = useCopyFeedback()
  const slug = useMemo(() => slugify(input), [input])
  const { unlockAchievement } = useAchievementContext()

  const handleCopy = async () => {
    if (!slug) return
    await navigator.clipboard.writeText(slug)
    unlockAchievement('clipboard-master')
    flash()
  }

  return (
    <ToolLayout title="Slug generator">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Lowercase URL slug with accents stripped (Unicode NFD + combining
            marks removed). Adjust manually if you need locale-specific rules.
          </p>
        }
      >
        <TextAreaWithLineNumbers
          value={input}
          setValue={(v) =>
            setUrl((s) => ({
              ...s,
              t: typeof v === 'function' ? v(s.t) : v
            }))
          }
          placeholder="Page title or heading, e.g. Café Müller - 2026 Tour"
        />
        <div className={toolToolbarEndClass}>
          <ClearButton onClick={() => setUrl({ t: '' })}>Clear</ClearButton>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Slug</h2>
          {slug ? (
            <ToolCopyButton copied={copied === true} onClick={handleCopy} />
          ) : null}
        </div>
        <pre className={toolPreOutputClass}>
          {slug || <span className="text-neutral-500">Slug appears here.</span>}
        </pre>
      </div>
    </ToolLayout>
  )
}

export default function SlugGenerator() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="Slug generator">
          <p className="text-center text-sm text-neutral-400">Loading…</p>
        </ToolLayout>
      }
    >
      <SlugGeneratorInner />
    </Suspense>
  )
}
