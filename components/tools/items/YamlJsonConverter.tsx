'use client'

import { useState } from 'react'
import yaml from 'js-yaml'
import { useAchievementContext } from '@/context/AchievementContext'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import { ClearButton, PrimaryButton } from '@/components/tools/_shared/ToolButtons'
import {
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolPanelClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarEndClass,
  ToolCopyButton
} from '@/components/tools/_shared/toolUi'

const YamlJsonConverter = ({ embedded = false }: { embedded?: boolean } = {}) => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { unlockAchievement } = useAchievementContext()

  const handleYamlToJson = () => {
    if (!input.trim()) return
    try {
      const doc = yaml.load(input)
      setOutput(JSON.stringify(doc, null, 2))
      setError(null)
    } catch (err) {
      setError((err as Error).message)
      setOutput('')
    }
  }

  const handleJsonToYaml = () => {
    if (!input.trim()) return
    try {
      const parsed = JSON.parse(input) as unknown
      setOutput(yaml.dump(parsed, { indent: 2, lineWidth: 120 }))
      setError(null)
    } catch (err) {
      setError((err as Error).message)
      setOutput('')
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError(null)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    unlockAchievement('clipboard-master')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout title="YAML ↔ JSON" embedded={embedded}>
      <div className={toolPanelClass}>
        <TextAreaWithLineNumbers
          value={input}
          setValue={setInput}
          placeholder="Paste YAML or JSON here..."
        />

        <div className={toolToolbarEndClass}>
          <PrimaryButton onClick={handleYamlToJson} disabled={!input.trim()}>
            YAML → JSON
          </PrimaryButton>
          <PrimaryButton onClick={handleJsonToYaml} disabled={!input.trim()}>
            JSON → YAML
          </PrimaryButton>
          <ClearButton onClick={handleClear}>Clear</ClearButton>
        </div>
      </div>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Result</h2>

          {output ? (
            <ToolCopyButton copied={copied} onClick={handleCopy} />
          ) : null}
        </div>

        {error ? (
          <div className={toolErrorBoxClass}>
            <strong>Error:</strong> {error}
          </div>
        ) : output ? (
          <pre className={toolPreOutputClass}>{output}</pre>
        ) : (
          <div className={toolEmptyHintClass}>
            Output appears here after conversion.
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

export default YamlJsonConverter
