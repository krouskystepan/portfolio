'use client'

import { useRef, useState } from 'react'
import yaml from 'js-yaml'
import { toast } from 'sonner'
import { useAchievementContext } from '@/context/AchievementContext'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  ClearButton,
  PrimaryButton,
  SecondaryButton
} from '@/components/tools/_shared/ToolButtons'
import {
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolIntroTextClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarBetweenClass,
  toolFlexEndButtonsClass,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { str, useToolUrlState } from '@/hooks/useToolUrlState'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import { downloadTextFile, readTextFile } from '@/utils/download'

const YamlJsonConverter = ({ embedded = false }: { embedded?: boolean } = {}) => {
  const [url, setUrl] = useToolUrlState({
    yaml: str('', { text: true })
  })
  const input = url.yaml
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { copied, flash } = useCopyFeedback()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { unlockAchievement } = useAchievementContext()

  const setInput = (v: React.SetStateAction<string>) =>
    setUrl((s) => ({
      ...s,
      yaml: typeof v === 'function' ? v(s.yaml) : v
    }))

  const handleOpenFile = async (file: File | null) => {
    if (!file) return
    try {
      const text = await readTextFile(file)
      setInput(text)
      setOutput('')
      setError(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to open file.')
    }
  }

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

  const handleValidateYaml = () => {
    if (!input.trim()) return
    try {
      yaml.load(input)
      setOutput('YAML is valid.')
      setError(null)
    } catch (err) {
      setError((err as Error).message)
      setOutput('')
    }
  }

  const handleFormatYaml = () => {
    if (!input.trim()) return
    try {
      const doc = yaml.load(input)
      setOutput(yaml.dump(doc, { indent: 2, lineWidth: 120 }))
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
    flash()
  }

  return (
    <ToolLayout title="YAML ↔ JSON" embedded={embedded}>
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Convert between YAML and JSON, or validate and reformat YAML in the
            browser.
          </p>
        }
      >
        <TextAreaWithLineNumbers
          value={input}
          setValue={setInput}
          placeholder="Paste YAML or JSON here..."
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".yaml,.yml,.json,.txt,text/yaml,text/plain,application/json"
          className="hidden"
          onChange={(e) => {
            void handleOpenFile(e.target.files?.[0] ?? null)
            e.target.value = ''
          }}
        />

        <div className={toolToolbarBetweenClass}>
          <SecondaryButton onClick={() => fileInputRef.current?.click()}>
            Open file
          </SecondaryButton>
          <div className={toolFlexEndButtonsClass}>
            <PrimaryButton onClick={handleYamlToJson} disabled={!input.trim()}>
              YAML → JSON
            </PrimaryButton>
            <PrimaryButton onClick={handleJsonToYaml} disabled={!input.trim()}>
              JSON → YAML
            </PrimaryButton>
            <SecondaryButton
              onClick={handleValidateYaml}
              disabled={!input.trim()}
            >
              Validate YAML
            </SecondaryButton>
            <SecondaryButton onClick={handleFormatYaml} disabled={!input.trim()}>
              Format YAML
            </SecondaryButton>
            <ClearButton onClick={handleClear}>Clear</ClearButton>
          </div>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Result</h2>

          {output ? (
            <div className="flex flex-wrap gap-2">
              <SecondaryButton
                onClick={() =>
                  downloadTextFile(
                    output,
                    output.trimStart().startsWith('{') ||
                      output.trimStart().startsWith('[')
                      ? 'data.json'
                      : 'data.yaml'
                  )
                }
              >
                Download
              </SecondaryButton>
              <ToolCopyButton copied={copied === true} onClick={handleCopy} />
            </div>
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
