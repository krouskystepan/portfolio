import { BASE_URL } from '@/constants'
import { WorkspaceStatus } from '@/constants/types'
import { calculateUptime } from '@/utils/utils'
import CodingStatusClient from './CodingStatusClient'

const fetchStatus = async (): Promise<WorkspaceStatus | null> => {
  try {
    const response = await fetch(`${BASE_URL}/api/vscodeStatus`, {
      cache: 'no-store',
    })

    if (response.status === 202) {
      const responseData = await response.json()
      return responseData.workSpace
    }
  } catch (error) {
    console.error('Error fetching workspace status:', error)
  }

  return null
}

const CodingStatus = async () => {
  const data = await fetchStatus()
  const initialUptime = data ? calculateUptime(data.startup_time) : 0

  return <CodingStatusClient data={data} initialUptime={initialUptime} />
}

export default CodingStatus
