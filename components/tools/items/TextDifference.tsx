'use client'

import { useMemo, useState } from 'react'
import { DiffMethod } from 'react-diff-viewer'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ReactDiffViewer from 'react-diff-viewer'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  toolCheckboxLabelClass,
  toolEmptyHintClass,
  toolIntroTextClass,
  toolLabelClass,
  toolPanelClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolSegmentBarClass,
  toolSegmentTabClass
} from '@/components/tools/_shared/toolUi'

/** Matches portfolio tool surfaces (neutral-950, dashed cards, emerald / red accents) */
const diffVariables = {
  diffViewerBackground: 'transparent',
  diffViewerColor: '#e5e5e5',
  addedBackground: 'rgba(34, 197, 94, 0.22)',
  removedBackground: 'rgba(239, 68, 68, 0.2)',
  wordAddedBackground: 'rgba(34, 197, 94, 0.42)',
  wordRemovedBackground: 'rgba(239, 68, 68, 0.4)',
  addedGutterBackground: 'rgba(34, 197, 94, 0.12)',
  removedGutterBackground: 'rgba(239, 68, 68, 0.12)',
  gutterBackground: 'rgba(10, 10, 10, 0.45)',
  gutterBackgroundDark: 'rgba(3, 3, 3, 0.4)',
  gutterColor: '#a1a1aa',
  addedGutterColor: '#a1a1aa',
  removedGutterColor: '#a1a1aa',
  codeFoldBackground: 'rgba(255, 255, 255, 0.06)',
  codeFoldGutterBackground: 'rgba(255, 255, 255, 0.04)',
  codeFoldContentColor: '#a1a1aa',
  diffViewerTitleBackground: 'transparent',
  diffViewerTitleColor: '#fafafa',
  diffViewerTitleBorderColor: 'rgba(255, 255, 255, 0.1)',
  emptyLineBackground: 'rgba(23, 23, 23, 0.35)',
  highlightBackground: 'rgba(234, 179, 8, 0.12)',
  highlightGutterBackground: 'rgba(234, 179, 8, 0.1)',
} as const

const TextDifference = () => {
  const [textA, setTextA] = useState('')
  const [textB, setTextB] = useState('')
  const [splitView, setSplitView] = useState(true)
  const [showDiffOnly, setShowDiffOnly] = useState(true)
  const [highlightWords, setHighlightWords] = useState(false)

  const diffStyles = useMemo(
    () => ({
      variables: {
        dark: { ...diffVariables },
      },
      diffContainer: {
        pre: {
          margin: 0,
          fontFamily: 'inherit',
          whiteSpace: 'pre-wrap' as const,
          wordBreak: 'break-word' as const,
          overflowWrap: 'anywhere' as const,
        },
        borderRadius: 0,
        fontSize: '0.8125rem',
        lineHeight: '1.5',
      },
      line: {
        padding: '2px 8px',
        minHeight: '1.25rem',
        lineHeight: '1.5',
      },
      gutter: {
        padding: '2px 10px',
        minWidth: '3rem',
        fontSize: '0.75rem',
        lineHeight: '1.5',
        userSelect: 'none' as const,
      },
      contentText: {
        fontSize: '0.8125rem',
        lineHeight: '1.5',
        whiteSpace: 'pre-wrap' as const,
        wordBreak: 'break-word' as const,
        overflowWrap: 'anywhere' as const,
      },
      marker: {
        width: '1.25rem',
        paddingLeft: 4,
        fontSize: '0.75rem',
        lineHeight: '1.5',
        color: '#a1a1aa',
      },
      titleBlock: {
        padding: '8px 12px',
        fontSize: '0.8125rem',
        fontWeight: 600,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      },
      codeFold: {
        fontSize: '0.75rem',
      },
    }),
    []
  )

  const hasAnyText = textA.length > 0 || textB.length > 0

  return (
    <ToolLayout title="Text Compare / Diff Tool">
      <div className={toolPanelClass}>
        <p className={toolIntroTextClass}>
          Paste or edit two versions side by side. The preview uses a line-by-line
          diff: use <strong className="font-medium text-neutral-200">Split</strong>{' '}
          for two columns or{' '}
          <strong className="font-medium text-neutral-200">Unified</strong> for one.
          Enable <strong className="font-medium text-neutral-200">Word highlight</strong>{' '}
          when you need changes inside a line.
        </p>

        <div className="grid min-h-64 grid-cols-1 gap-5 md:h-96 md:grid-cols-2">
          <div className="flex max-h-96 min-h-64 min-w-0 flex-col md:h-full md:max-h-none">
            <div className={toolLabelClass}>Original</div>
            <div className="min-h-0 flex-1">
              <TextAreaWithLineNumbers
                fillParent
                value={textA}
                setValue={setTextA}
                placeholder="Original text…"
              />
            </div>
          </div>
          <div className="flex max-h-96 min-h-64 min-w-0 flex-col md:h-full md:max-h-none">
            <div className={toolLabelClass}>Modified</div>
            <div className="min-h-0 flex-1">
              <TextAreaWithLineNumbers
                fillParent
                value={textB}
                setValue={setTextB}
                placeholder="Modified text…"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={`${toolResultPanelClass} z-10`}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Compare</h2>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div
            className={toolSegmentBarClass}
            role="tablist"
            aria-label="Diff layout"
          >
            <button
              type="button"
              role="tab"
              aria-selected={splitView}
              className={toolSegmentTabClass(splitView)}
              onClick={() => setSplitView(true)}
            >
              Split
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!splitView}
              className={toolSegmentTabClass(!splitView)}
              onClick={() => setSplitView(false)}
            >
              Unified
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className={toolCheckboxLabelClass}>
              <input
                type="checkbox"
                checked={showDiffOnly}
                onChange={() => setShowDiffOnly((v) => !v)}
                className="size-4 accent-custom_blue"
              />
              Hide unchanged (fold)
            </label>
            <label className={toolCheckboxLabelClass}>
              <input
                type="checkbox"
                checked={highlightWords}
                onChange={() => setHighlightWords((v) => !v)}
                className="size-4 accent-custom_blue"
              />
              Word highlight
            </label>
          </div>
        </div>

        <div className="max-h-[min(70vh,720px)] min-h-48 overflow-auto rounded-lg border border-white/10 bg-neutral-900/50">
          {!hasAnyText ? (
            <div className="flex min-h-48 items-center justify-center px-6 py-10">
              <p className={`${toolEmptyHintClass} text-center`}>
                Add text in Original and/or Modified to see the diff.
              </p>
            </div>
          ) : (
            <div className="w-full min-w-0 p-1 font-mono sm:p-2">
              <ReactDiffViewer
                oldValue={textA}
                newValue={textB}
                splitView={splitView}
                compareMethod={
                  highlightWords
                    ? DiffMethod.WORDS_WITH_SPACE
                    : DiffMethod.LINES
                }
                disableWordDiff={!highlightWords}
                showDiffOnly={showDiffOnly}
                extraLinesSurroundingDiff={4}
                useDarkTheme
                hideLineNumbers={false}
                leftTitle="Original"
                rightTitle="Modified"
                styles={diffStyles}
              />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}

export default TextDifference
