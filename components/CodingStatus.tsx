'use client'

import { BASE_URL } from '@/constants'
import { WorkspaceStatus } from '@/constants/types'
import { calculateUptime } from '@/utils/utils'
import React, { useEffect, useState } from 'react'

const CodingStatus = () => {
  const [data, setData] = useState<WorkspaceStatus | null>(null)
  const [uptime, setUptime] = useState<number>(0)

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/vscodeStatus`)

      if (response.status === 202) {
        const responseData = await response.json()
        const fetchedData: WorkspaceStatus = responseData.workSpace
        setData(fetchedData)
        setUptime(calculateUptime(fetchedData.startup_time))
      }
    } catch (error) {
      console.error('Error fetching workspace status:', error)
    }
  }

  useEffect(() => {
    fetchStatus()

    const interval = setInterval(() => {
      setUptime((prevUptime) => prevUptime + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / (3600 * 24))
    const hours = Math.floor((seconds % (3600 * 24)) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    const timeParts: string[] = []

    if (days > 0) timeParts.push(`${days} ${days === 1 ? 'day' : 'days'}`)
    if (hours > 0) timeParts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`)
    if (minutes > 0)
      timeParts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`)
    if (secs > 0 || timeParts.length === 0)
      timeParts.push(`${secs} ${secs === 1 ? 'second' : 'seconds'}`)

    return timeParts.join(', ')
  }

  return (
    <div className="z-10 pt-4 sm:pt-8 md:pt-12">
      <div
        className={`mx-auto flex shrink-0 flex-col items-center justify-around gap-3 overflow-hidden rounded-xl border border-dashed p-4 text-center text-neutral-300 backdrop-blur-lg sm:flex-row sm:gap-8 ${data ? 'w-72 border-emerald-400 sm:w-3/5 xl:w-2/5' : 'w-fit border-white/25'}`}
        style={{ '--opacity': '0.04' } as React.CSSProperties}
        data-pattern="stripes"
      >
        {data ? (
          <>
            <span className="sm:w-1/3 sm:truncate">
              <strong>Project Name:</strong> <br />
              {data?.project_name}
            </span>
            <span className="sm:w-1/3 sm:truncate">
              <strong>Uptime:</strong> <br />
              {formatUptime(uptime)}
            </span>
            <span className="sm:w-1/3 sm:truncate">
              <strong>Active File:</strong> <br />
              {data?.active_file}
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

export default CodingStatus
