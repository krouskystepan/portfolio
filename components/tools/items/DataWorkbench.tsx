'use client'

import { Suspense, useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import JsonFormatter from './JsonFormatter'
import CsvJsonConverter from './CsvJsonConverter'
import YamlJsonConverter from './YamlJsonConverter'
import JsonToTsGenerator from './JsonToTsGenerator'
import { ToolChipButton, ToolChipRow } from '@/components/tools/_shared/toolUi'

const TAB_IDS = ['formatter', 'csv', 'yaml', 'ts'] as const
type TabId = (typeof TAB_IDS)[number]

function isTabId(v: string | null): v is TabId {
  return v !== null && (TAB_IDS as readonly string[]).includes(v)
}

function DataWorkbenchInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const paramTab = searchParams.get('tab')
  const tab: TabId = isTabId(paramTab) ? paramTab : 'formatter'

  const setTab = useCallback(
    (next: TabId) => {
      const qs = new URLSearchParams(searchParams.toString())
      if (next === 'formatter') {
        qs.delete('tab')
      } else {
        qs.set('tab', next)
      }
      const q = qs.toString()
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
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
