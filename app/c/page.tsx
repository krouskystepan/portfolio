import { getUtcTime } from '@/actions/getTime'
import Countdown from '@/components/Countdown'

export const dynamic = 'force-dynamic'

const CountdownPage = async () => {
  const serverNow = await getUtcTime()
  const targetDate = new Date('2025-10-31T22:00:00Z')

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <Countdown target={targetDate} serverNow={serverNow} />
    </div>
  )
}

export default CountdownPage
