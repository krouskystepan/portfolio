'use client'

import { BASE_URL } from '@/constants'
import { WorkspaceStatus } from '@/constants/types'
import { calculateUptime } from '@/utils/utils'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

const CodingStatus = () => {
  const [data, setData] = useState<WorkspaceStatus | null>(null)
  const [uptime, setUptime] = useState<number>(0)

  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/vscodeStatus`)

      if (response.status === 202) {
        const fetchedData: WorkspaceStatus = response.data.workSpace
        setData(fetchedData)
        setUptime(calculateUptime(fetchedData.startup_time))
      }
    } catch (error) {
      console.error('Error fetching workspace status:', error)
    }
  }

  useEffect(() => {
    fetchStatus() // Fetch the status once when the component mounts

    // Start an interval to update uptime every second
    const interval = setInterval(() => {
      setUptime((prevUptime) => prevUptime + 1) // Increment uptime by 1 second
    }, 1000)

    // Cleanup the interval when the component is unmounted
    return () => clearInterval(interval)
  }, []) // Empty dependency array ensures the effect runs only once

  // Format uptime as a string for display
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
    <div className="pt-12">
      <div
        className={`mx-auto flex w-2/5 shrink-0 items-center justify-around gap-8 overflow-hidden rounded-xl border border-dashed p-4  text-center backdrop-blur-lg ${data ? 'border-emerald-400' : 'border-white/25'}`}
        style={{ '--opacity': '0.04' } as React.CSSProperties}
        data-pattern="stripes"
      >
        {data ? (
          <>
            <span className="w-1/3 truncate">
              <strong>Project Name:</strong> <br />
              {data?.project_name}
            </span>
            <span className="w-1/3 truncate">
              <strong>Uptime:</strong> <br />
              {formatUptime(uptime)}
            </span>
            <span className="w-1/3 truncate">
              <strong>Active File:</strong> <br />
              {data?.active_file}
            </span>
          </>
        ) : (
          <span>No active session now! Come back later!</span>
        )}
      </div>
    </div>
  )
}

export default CodingStatus
