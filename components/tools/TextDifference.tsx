'use client'

import { useState } from 'react'
import { DiffMethod } from 'react-diff-viewer'
import TextAreaWithLineNumbers from '../TextAreaWithLineNumbers'
import ReactDiffViewer from 'react-diff-viewer'
import ToolLayout from './ToolLayout'
import {
  toolCheckboxLabelClass,
  toolPanelClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarBetweenClass
} from './toolUi'

const TextDifference = () => {
  const [textA, setTextA] = useState('')
  const [textB, setTextB] = useState('')
  const [compareMethod, setCompareMethod] = useState(DiffMethod.WORDS)
  const [splitView, setSplitView] = useState(false)

  return (
    <ToolLayout title="Text Compare / Diff Tool">
      <div className={toolPanelClass}>
        <h2 className={`mb-3 ${toolSectionTitleClass}`}>Text A</h2>

        <TextAreaWithLineNumbers
          value={textA}
          setValue={setTextA}
          placeholder="Enter first text..."
        />
      </div>

      <div className={toolPanelClass}>
        <h2 className={`mb-3 ${toolSectionTitleClass}`}>Text B</h2>

        <TextAreaWithLineNumbers
          value={textB}
          setValue={setTextB}
          placeholder="Enter second text..."
        />
      </div>

      <div className={`${toolResultPanelClass} z-10`}>
        <div className={`${toolToolbarBetweenClass} !mt-0 items-start sm:items-center`}>
          <h2 className={toolSectionTitleClass}>Differences</h2>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <label className={toolCheckboxLabelClass}>
              <input
                type="checkbox"
                checked={compareMethod === DiffMethod.WORDS}
                onChange={() =>
                  setCompareMethod(
                    compareMethod === DiffMethod.WORDS
                      ? DiffMethod.CHARS
                      : DiffMethod.WORDS
                  )
                }
                className="size-4 accent-custom_blue"
              />
              Compare by words
            </label>

            <label className={toolCheckboxLabelClass}>
              <input
                type="checkbox"
                checked={splitView}
                onChange={() => setSplitView((prev) => !prev)}
                className="size-4 accent-custom_blue"
              />
              Split View
            </label>
          </div>
        </div>

        <div className="w-full overflow-auto font-mono text-sm">
          <ReactDiffViewer
            oldValue={textA}
            newValue={textB}
            splitView={splitView}
            compareMethod={compareMethod}
            useDarkTheme
            styles={{
              variables: {
                dark: {
                  diffViewerBackground: 'transparent',
                  diffViewerColor: '#e5e5e5',
                  addedBackground: 'rgba(34,197,94,0.25)',
                  removedBackground: 'rgba(239,68,68,0.25)',
                  gutterBackground: 'transparent',
                  gutterColor: '#71717a',
                  codeFoldBackground: 'rgba(255,255,255,0.05)',
                  codeFoldContentColor: '#a1a1aa',
                  diffViewerTitleBackground: 'transparent',
                  diffViewerTitleColor: '#ffffff',
                },
              },
              diffContainer: { background: 'transparent' },
              line: { padding: '2px 0' },
              contentText: {
                color: '#e5e5e5',
                fontSize: '0.875rem',
                lineHeight: '1.5',
              },
              gutter: { color: '#71717a', userSelect: 'none' },
              marker: { color: '#a1a1aa' },
              titleBlock: {
                background: 'transparent',
                color: '#ffffff',
                fontWeight: 600,
              },
            }}
          />
        </div>
      </div>
    </ToolLayout>
  )
}

export default TextDifference
