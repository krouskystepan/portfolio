'use client'

import { useEffect, useState } from 'react'
import { WorkspaceStatus } from '@/constants/types'
import { formatUptime } from '@/utils/utils'

const POLL_INTERVAL = 2000
const STALE_AFTER = 65_000

const CodingStatusClient = ({
  initialData
}: {
  initialData: WorkspaceStatus | null
}) => {
  const [data, setData] = useState<WorkspaceStatus | null>(initialData)
  const [now, setNow] = useState<number | null>(null)

  // 🟢 polling – aktualizuje DATA
  useEffect(() => {
    let firstRun = true

    const poll = async () => {
      try {
        const res = await fetch('/api/vscodeStatus', {
          cache: 'no-store'
        })

        if (!res.ok || res.status === 204) {
          if (!firstRun) setData(null)
          return
        }

        const json = await res.json()
        const next: WorkspaceStatus = json.status

        const age = Date.now() - new Date(next.lastUpdate).getTime()

        if (age > STALE_AFTER) {
          if (!firstRun) setData(null)
        } else {
          setData(next)
        }
      } catch {
        if (!firstRun) setData(null)
      } finally {
        firstRun = false
      }
    }

    const interval = setInterval(poll, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  // ⏱️ CLIENT-ONLY clock (PO mountu)
  useEffect(() => {
    setNow(Date.now())

    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const isStale =
    data !== null &&
    now !== null &&
    now - new Date(data.lastUpdate).getTime() > STALE_AFTER

  const uptime =
    data && now !== null && !isStale
      ? Math.floor((now - new Date(data.startup_time).getTime()) / 1000)
      : null

  return (
    <div className="z-10 pt-4 sm:pt-8 md:pt-12">
      <div
        className={`mx-auto flex shrink-0 flex-col items-center justify-around gap-3 overflow-hidden rounded-xl border border-dashed p-4 text-center text-neutral-300 backdrop-blur-lg sm:flex-row sm:gap-8 ${
          data && !isStale
            ? 'max-w-72 border-emerald-400 sm:w-3/5 sm:max-w-full xl:w-2/5'
            : 'w-fit border-white/25'
        }`}
        style={{ '--opacity': '0.04' } as React.CSSProperties}
        data-pattern="stripes"
      >
        {data && !isStale ? (
          <>
            <span className="sm:w-1/3 sm:truncate">
              <strong>Project Name:</strong>
              <br />
              {data.project_name}
            </span>

            <span className="sm:w-1/3 sm:truncate">
              <strong>Uptime:</strong>
              <br />
              {uptime !== null ? formatUptime(uptime) : '—'}
            </span>

            <span className="sm:w-1/3 sm:truncate">
              <strong>Active File:</strong>
              <br />
              {data.active_file ?? '—'}
            </span>
          </>
        ) : (
          <span>
            No active session now! <br className="block sm:hidden" /> Come back
            later!
          </span>
        )}
      </div>
    </div>
  )
}

export default CodingStatusClient
