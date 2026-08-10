import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Discord Gambling Hub',
  description:
    'Case study: multi-repo Discord casino, virtual economy, and admin dashboard ecosystem.',
}

const DiscordGamblingHubLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return <div className="mx-auto max-w-4xl px-4 pt-12 pb-16">{children}</div>
}

export default DiscordGamblingHubLayout
