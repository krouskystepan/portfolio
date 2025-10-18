'use server'

export async function getUtcTime(): Promise<number> {
  try {
    const res = await fetch(
      'https://timeapi.io/api/Time/current/zone?timeZone=UTC',
      {
        cache: 'no-store',
      }
    )
    const data = await res.json()
    return new Date(data.dateTime).getTime()
  } catch (err) {
    console.error(err)
    console.warn('⚠️ Failed to fetch UTC time, fallback to local clock')
    return Date.now()
  }
}
