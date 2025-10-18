import Countdown from '@/components/Countdown'

export const dynamic = 'force-dynamic'

const CountdownPage = async () => {
  const serverTime = Date.now()

  // 1 Nov 2025 00:00 Prague time (UTC+1 normally, but on that date: UTC+2)
  const targetDate = new Date('2025-10-31T22:00:00Z')

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <Countdown target={targetDate} serverTime={serverTime} title="" />
    </div>
  )
}

export default CountdownPage
