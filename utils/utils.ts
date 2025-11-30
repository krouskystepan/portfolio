import { TProjectFilter } from '@/constants/types'

export async function verifyGithubToken(token: string) {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      return false
    }

    return await response.json()
  } catch (error) {
    console.error('Error verifying token:', error)
    return false
  }
}

export const calculateUptime = (startDate: string): number => {
  const start = new Date(startDate)
  const now = new Date()

  if (isNaN(start.getTime())) {
    throw new Error(`Invalid date format: ${startDate}`)
  }

  return Math.floor((now.getTime() - start.getTime()) / 1000)
}

export const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / (3600 * 24))
  const hours = Math.floor((seconds % (3600 * 24)) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const timeParts: string[] = []
  if (days > 0) timeParts.push(`${days} ${days === 1 ? 'd' : 'ds'}`)
  if (hours > 0) timeParts.push(`${hours} ${hours === 1 ? 'h' : 'hrs'}`)
  if (minutes > 0)
    timeParts.push(`${minutes} ${minutes === 1 ? 'min' : 'mins'}`)
  if (secs > 0 || timeParts.length === 0)
    timeParts.push(`${secs} ${secs === 1 ? 'sec' : 'secs'}`)

  return timeParts.join(', ')
}

export const getAvailabilityDetails = (availability: TProjectFilter) => {
  switch (availability) {
    case 'demo':
      return {
        className: 'bg-red-900',
        label: 'Demo',
      }
    case 'live':
      return {
        className: 'bg-green-900',
        label: 'Live',
      }
    case 'all':
      return {
        className: 'bg-blue-800',
        label: 'All',
      }
    default:
      return {
        className: 'bg-gray-900',
        label: 'Unknown',
      }
  }
}
