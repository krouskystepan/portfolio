'use client'

import { useState, useEffect, useRef } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { WorkspaceStatus } from '@/constants/types'
import { db } from '@/utils/firebase'
import { calculateUptime, formatUptime } from '@/utils/utils'
import { useAchievementContext } from '@/context/AchievementContext'

const CodingStatusClient = ({
  initialData,
}: {
  initialData: WorkspaceStatus | null
}) => {
  const [data, setData] = useState<WorkspaceStatus | null>(initialData)
  const uptimeRef = useRef(
    calculateUptime(data?.startup_time || new Date().toISOString())
  )
  const uptimeElementRef = useRef<HTMLSpanElement | null>(null)

  const { unlockAchievement, getAchievementById } = useAchievementContext()

  useEffect(() => {
    const codingSessionRef = doc(db, 'codingSession', 'currentSession')

    const unsubscribe = onSnapshot(codingSessionRef, (docSnap) => {
      const newData = docSnap.data()?.status as WorkspaceStatus

      const currentTime = new Date()
      const lastUpdateTime = new Date(newData?.lastUpdate)
      const timeDifference = currentTime.getTime() - lastUpdateTime.getTime()

      if (timeDifference > 60_000 || !newData) {
        setData(null)
      } else {
        setData(newData)

        unlockAchievement('caught-coding', 1000)
      }
    })

    return () => unsubscribe()
  }, [getAchievementById, unlockAchievement])

  useEffect(() => {
    if (!data || typeof window === 'undefined') return

    const lastUpdateTime = new Date(data.lastUpdate)

    const updateUptime = () => {
      const currentTime = new Date()
      const timeDifference = currentTime.getTime() - lastUpdateTime.getTime()

      if (timeDifference > 60_000) {
        setData(null)
        return
      }

      uptimeRef.current += 1
      if (uptimeElementRef.current) {
        uptimeElementRef.current.textContent = formatUptime(uptimeRef.current)
      }
    }

    updateUptime()
    const interval = setInterval(updateUptime, 1000)

    return () => clearInterval(interval)
  }, [data])

  return (
    <div className="z-10 pt-4 sm:pt-8 md:pt-12">
      <div
        className={`mx-auto flex shrink-0 flex-col items-center justify-around gap-3 overflow-hidden rounded-xl border border-dashed p-4 text-center text-neutral-300 backdrop-blur-lg sm:flex-row sm:gap-8 ${
          data
            ? 'max-w-72 border-emerald-400 sm:w-3/5 sm:max-w-full xl:w-2/5'
            : 'w-fit border-white/25'
        }`}
        style={{ '--opacity': '0.04' } as React.CSSProperties}
        data-pattern="stripes"
      >
        {data ? (
          <>
            <span className="sm:w-1/3 sm:truncate">
              <strong>Project Name:</strong> <br />
              {data.project_name}
            </span>
            <span className="sm:w-1/3 sm:truncate">
              <strong>Uptime:</strong> <br />
              <span ref={uptimeElementRef}>
                {formatUptime(uptimeRef.current)}
              </span>
            </span>
            <span className="sm:w-1/3 sm:truncate">
              <strong>Active File:</strong> <br />
              {data.active_file}
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
