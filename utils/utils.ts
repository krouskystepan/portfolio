import { TProjectFilter } from '@/constants/types'

export async function verifyGithubToken(token: string) {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`
      }
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

export const getAvailabilityDetails = (availability: TProjectFilter) => {
  switch (availability) {
    case 'demo':
      return {
        className: 'bg-red-900',
        label: 'Demo'
      }
    case 'live':
      return {
        className: 'bg-green-900',
        label: 'Live'
      }
    case 'all':
      return {
        className: 'bg-blue-800',
        label: 'All'
      }
    default:
      return {
        className: 'bg-gray-900',
        label: 'Unknown'
      }
  }
}
