'use client'

import { Suspense, useMemo } from 'react'
import { DiffMethod } from 'react-diff-viewer'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ReactDiffViewer from 'react-diff-viewer'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  toolCheckboxLabelClass,
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolIntroTextClass,
  toolLabelClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  ToolChipButton,
  ToolChipRow,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { bool, enumParam, str, useToolUrlState } from '@/hooks/useToolUrlState'
import { stableStringify } from '@/utils/jsonSort'

type DiffMode = 'text' | 'json'
const DIFF_MODES = ['text', 'json'] as const satisfies readonly DiffMode[]

type JsonSide = { text: string; error: string | null }

/** Parse one JSON pane and re-serialise with deep-sorted keys. Empty input is allowed. */
function normalizeJsonSide(raw: string): JsonSide {
  if (!raw.trim()) return { text: '', error: null }
  try {
    return { text: stableStringify(JSON.parse(raw) as unknown, 2), error: null }
  } catch (err) {
    return { text: '', error: (err as Error).message || 'Invalid JSON.' }
  }
}

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

function TextDifferenceInner() {
  const [url, setUrl] = useToolUrlState({
    a: str('', { text: true }),
    b: str('', { text: true }),
    split: bool(true),
    diffOnly: bool(true),
    words: bool(false),
    mode: enumParam<DiffMode>('text', DIFF_MODES)
  })
  const {
    a: textA,
    b: textB,
    split: splitView,
    diffOnly: showDiffOnly,
    words: highlightWords,
    mode: diffMode
  } = url
  const isJson = diffMode === 'json'

  const jsonA = useMemo(
    () => (isJson ? normalizeJsonSide(textA) : null),
    [isJson, textA]
  )
  const jsonB = useMemo(
    () => (isJson ? normalizeJsonSide(textB) : null),
    [isJson, textB]
  )
  const jsonHasError = Boolean(jsonA?.error || jsonB?.error)
  const diffOld = isJson ? (jsonA?.text ?? '') : textA
  const diffNew = isJson ? (jsonB?.text ?? '') : textB

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
    <ToolLayout title={isJson ? 'JSON Compare / Diff Tool' : 'Text Compare / Diff Tool'}>
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Paste or edit two versions side by side. The preview uses a line-by-line
            diff: use <strong className="font-medium text-neutral-200">Split</strong>{' '}
            for two columns or{' '}
            <strong className="font-medium text-neutral-200">Unified</strong> for one.
            Enable <strong className="font-medium text-neutral-200">Word highlight</strong>{' '}
            when you need changes inside a line.
          </p>
        }
      >
        <div className="mb-4" role="tablist" aria-label="Compare mode">
          <ToolChipRow>
            <ToolChipButton
              active={!isJson}
              onClick={() => setUrl((s) => ({ ...s, mode: 'text' }))}
            >
              Text
            </ToolChipButton>
            <ToolChipButton
              active={isJson}
              onClick={() => setUrl((s) => ({ ...s, mode: 'json' }))}
            >
              JSON
            </ToolChipButton>
          </ToolChipRow>
          {isJson ? (
            <p className="mt-2 text-xs leading-relaxed text-neutral-500">
              Both sides are parsed and re-printed with sorted keys, so key order
              and whitespace differences are ignored.
            </p>
          ) : null}
        </div>
        <div className="grid min-h-64 grid-cols-1 gap-5 md:h-96 md:grid-cols-2">
          <div className="flex max-h-96 min-h-64 min-w-0 flex-col md:h-full md:max-h-none">
            <div className={toolLabelClass}>Original</div>
            <div className="min-h-0 flex-1">
              <TextAreaWithLineNumbers
                fillParent
                value={textA}
                setValue={(v) =>
                  setUrl((s) => ({
                    ...s,
                    a: typeof v === 'function' ? v(s.a) : v
                  }))
                }
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
                setValue={(v) =>
                  setUrl((s) => ({
                    ...s,
                    b: typeof v === 'function' ? v(s.b) : v
                  }))
                }
                placeholder="Modified text…"
              />
            </div>
          </div>
        </div>
        {isJson && (jsonA?.error || jsonB?.error) ? (
          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              {jsonA?.error ? (
                <div className={toolErrorBoxClass}>
                  <span className="font-semibold">Original:</span> {jsonA.error}
                </div>
              ) : null}
            </div>
            <div>
              {jsonB?.error ? (
                <div className={toolErrorBoxClass}>
                  <span className="font-semibold">Modified:</span> {jsonB.error}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </ToolInputPanel>

      <div className={`${toolResultPanelClass} z-10`}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Compare</h2>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div role="tablist" aria-label="Diff layout">
            <ToolChipRow>
              <ToolChipButton
                active={splitView}
                onClick={() => setUrl((s) => ({ ...s, split: true }))}
              >
                Split
              </ToolChipButton>
              <ToolChipButton
                active={!splitView}
                onClick={() => setUrl((s) => ({ ...s, split: false }))}
              >
                Unified
              </ToolChipButton>
            </ToolChipRow>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className={toolCheckboxLabelClass}>
              <input
                type="checkbox"
                checked={showDiffOnly}
                onChange={() =>
                  setUrl((s) => ({ ...s, diffOnly: !s.diffOnly }))
                }
                className="size-4 accent-custom_blue"
              />
              Hide unchanged (fold)
            </label>
            <label className={toolCheckboxLabelClass}>
              <input
                type="checkbox"
                checked={highlightWords}
                onChange={() => setUrl((s) => ({ ...s, words: !s.words }))}
                className="size-4 accent-custom_blue"
              />
              Word highlight
            </label>
          </div>
        </div>

        <div className="max-h-[min(70vh,720px)] min-h-48 overflow-auto rounded-lg border border-white/10 bg-neutral-900/50">
          {isJson && jsonHasError ? (
            <div className="flex min-h-48 items-center justify-center px-6 py-10">
              <p className={`${toolEmptyHintClass} text-center`}>
                Fix the JSON errors above to see the diff.
              </p>
            </div>
          ) : !hasAnyText ? (
            <div className="flex min-h-48 items-center justify-center px-6 py-10">
              <p className={`${toolEmptyHintClass} text-center`}>
                Add text in Original and/or Modified to see the diff.
              </p>
            </div>
          ) : (
            <div className="w-full min-w-0 p-1 font-mono sm:p-2">
              <ReactDiffViewer
                oldValue={diffOld}
                newValue={diffNew}
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

export default function TextDifference() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="Text Compare / Diff Tool">
          <p className="text-center text-sm text-neutral-400">Loading…</p>
        </ToolLayout>
      }
    >
      <TextDifferenceInner />
    </Suspense>
  )
}
