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

export const formatUptime = (seconds: number): string => {
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
