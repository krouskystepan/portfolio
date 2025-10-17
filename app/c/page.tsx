import Countdown from '@/components/Countdown'

export default async function CountdownPage() {
  // ⏰ This runs on the server, so it's using accurate UTC time
  const serverNow = Date.now()
  // 1 Nov 2025 00:00 Prague
  const targetDate = new Date('2025-10-31T22:00:00Z')

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <Countdown target={targetDate} serverNow={serverNow} title="" />
    </div>
  )
}
