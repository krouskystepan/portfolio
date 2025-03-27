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
export const calculateUptime = (startTime: string): number => {
  const startupTime = new Date(startTime)
  const currentTime = new Date()
  const uptimeInMs = currentTime.getTime() - startupTime.getTime()

  const seconds = Math.floor(uptimeInMs / 1000)

  return seconds
}
