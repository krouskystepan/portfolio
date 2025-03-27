import axios from 'axios'

export async function verifyGithubToken(token: string) {
  try {
    return await axios
      .get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .catch(() => false)
  } catch (error) {
    console.error('Error verifying token:', error)
  }
}

export const calculateUptime = (startTime: string): number => {
  const startupTime = new Date(startTime)
  const currentTime = new Date()
  const uptimeInMs = currentTime.getTime() - startupTime.getTime()

  const seconds = Math.floor(uptimeInMs / 1000)

  return seconds
}
