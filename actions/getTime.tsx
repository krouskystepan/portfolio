'use server'

export async function getUtcTime(): Promise<number> {
  const res = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC', {
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch UTC time: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  return new Date(data.utc_datetime).getTime()
}
