'use client'

import { useState } from 'react'
import { DiffMethod } from 'react-diff-viewer'
import TextAreaWithLineNumbers from '../TextAreaWithLineNumbers'
import ReactDiffViewer from 'react-diff-viewer'

const TextDifference = () => {
  const [textA, setTextA] = useState('')
  const [textB, setTextB] = useState('')
  const [compareMethod, setCompareMethod] = useState(DiffMethod.WORDS)
  const [splitView, setSplitView] = useState(false)

  return (
    <div>
      <h2 className="mb-8 text-center text-4xl font-bold lg:text-5xl">
        Text Compare / Diff Tool
      </h2>

      <div className="z-10 mb-8 grid grid-cols-1 gap-6">
        <div className="flex flex-col rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-5 backdrop-blur-sm">
          <h2 className="mb-2 text-lg font-semibold text-neutral-100">
            Text A
          </h2>

          <TextAreaWithLineNumbers
            value={textA}
            setValue={setTextA}
            placeholder="Enter first text..."
          />
        </div>

        <div className="flex flex-col rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-5 backdrop-blur-sm">
          <h2 className="mb-2 text-lg font-semibold text-neutral-100">
            Text B
          </h2>

          <TextAreaWithLineNumbers
            value={textB}
            setValue={setTextB}
            placeholder="Enter second text..."
          />
        </div>
      </div>

      <div className="z-10 overflow-auto rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-6 text-neutral-100 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-between sm:flex-row sm:gap-4">
          <h2 className="mb-4 text-lg font-semibold text-white">Differences</h2>
          <div className="flex flex-col items-center sm:flex-row sm:gap-4">
            <label className="mb-4 flex items-center gap-2 text-sm text-neutral-300">
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

            <label className="mb-4 flex items-center gap-2 text-sm text-neutral-300">
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
    </div>
  )
}

export default TextDifference
