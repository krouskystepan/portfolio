'use client'

import { useMemo, useState } from 'react'
import TextAreaWithLineNumbers from '../TextAreaWithLineNumbers'
import ToolLayout from './ToolLayout'
import { ClearButton } from './ToolButtons'
import {
  toolIntroTextClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarEndClass,
  ToolInputPanel
} from './toolUi'

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const SlugGenerator = () => {
  const [input, setInput] = useState('')
  const slug = useMemo(() => slugify(input), [input])

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
          setValue={setInput}
          placeholder="Page title or heading, e.g. Café Müller — 2026 Tour"
        />
        <div className={toolToolbarEndClass}>
          <ClearButton onClick={() => setInput('')}>Clear</ClearButton>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Slug</h2>
        </div>
        <pre className={toolPreOutputClass}>
          {slug || (
            <span className="text-neutral-500">Slug appears here.</span>
          )}
        </pre>
      </div>
    </ToolLayout>
  )
}

export default SlugGenerator
