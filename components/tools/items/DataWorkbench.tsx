'use client'

import { Suspense, useCallback } from 'react'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import JsonFormatter from './JsonFormatter'
import CsvJsonConverter from './CsvJsonConverter'
import YamlJsonConverter from './YamlJsonConverter'
import JsonToTsGenerator from './JsonToTsGenerator'
import { ToolChipButton, ToolChipRow } from '@/components/tools/_shared/toolUi'
import { enumParam, useToolUrlState } from '@/hooks/useToolUrlState'

const TAB_IDS = ['formatter', 'csv', 'yaml', 'ts'] as const
type TabId = (typeof TAB_IDS)[number]

function DataWorkbenchInner() {
  const [url, setUrl] = useToolUrlState({
    tab: enumParam<TabId>('formatter', TAB_IDS)
  })
  const tab = url.tab

  const setTab = useCallback(
    (next: TabId) => {
      setUrl({ tab: next })
    },
    [setUrl]
  )

  return (
    <ToolLayout title="JSON & data workbench">
      <div
        className="mb-6"
        role="tablist"
        aria-label="Data workbench modes"
      >
        <ToolChipRow>
          {(
            [
              ['formatter', 'JSON format'],
              ['csv', 'CSV ↔ JSON'],
              ['yaml', 'YAML ↔ JSON'],
              ['ts', 'JSON → TS']
            ] as const
          ).map(([id, label]) => (
            <ToolChipButton
              key={id}
              active={tab === id}
              onClick={() => setTab(id)}
            >
              {label}
            </ToolChipButton>
          ))}
        </ToolChipRow>
      </div>

      <div role="tabpanel" className="min-h-48">
        {tab === 'formatter' && <JsonFormatter embedded />}
        {tab === 'csv' && <CsvJsonConverter embedded />}
        {tab === 'yaml' && <YamlJsonConverter embedded />}
        {tab === 'ts' && <JsonToTsGenerator embedded />}
      </div>
    </ToolLayout>
  )
}

export default function DataWorkbench() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="JSON & data workbench">
          <p className="text-center text-sm text-neutral-400">Loading…</p>
        </ToolLayout>
      }
    >
      <DataWorkbenchInner />
    </Suspense>
  )
}
