import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Krouský Lab',
  description:
    'Case study: a client-side lab of playable puzzles and the solvers that explain the next move.'
}

const KrouskyLabLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="mx-auto max-w-4xl px-4 pt-12 pb-16">{children}</div>
}

export default KrouskyLabLayout
