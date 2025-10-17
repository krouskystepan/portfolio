import Countdown from '@/components/Countdown'

export const dynamic = 'force-dynamic'

const CountdownPage = async () => {
  // 🎯 Fetch atomic UTC time from reliable API
  let serverNow: number

  try {
    const res = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC', {
      cache: 'no-store',
    })
    const data = await res.json()
    serverNow = new Date(data.utc_datetime).getTime()
  } catch (e) {
    console.log(e)
    console.warn('⚠️ Failed to fetch worldtimeapi, fallback to local clock')
    serverNow = Date.now()
  }

  // 1 Nov 2025 00:00 Prague time (UTC+1 normally, but on that date: UTC+2)
  const targetDate = new Date('2025-10-31T22:00:00Z')

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <Countdown target={targetDate} serverNow={serverNow} title="" />
    </div>
  )
}

export default CountdownPage
