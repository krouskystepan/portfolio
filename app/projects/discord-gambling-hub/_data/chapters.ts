export type GamblingHubChapter = {
  slug: string
  title: string
  summary: string
  href: string
}

export const GAMBLING_HUB_BASE = '/projects/discord-gambling-hub'

export const GAMBLING_HUB_CHAPTERS: GamblingHubChapter[] = [
  {
    slug: 'architecture',
    title: 'Architecture & Shared Package',
    summary:
      'Three repos, one MongoDB, domain subpath exports that keep bot and dashboard aligned.',
    href: `${GAMBLING_HUB_BASE}/architecture`,
  },
  {
    slug: 'economy',
    title: 'Economy & Trust',
    summary:
      'Dual balances, immutable transactions, gated ATM, player pay, and lock reconciliation.',
    href: `${GAMBLING_HUB_BASE}/economy`,
  },
  {
    slug: 'casino',
    title: 'Casino Engine & Fairness',
    summary:
      'Instant and interactive casino games, multi-bet sessions, per-game toggles, and computed RTP.',
    href: `${GAMBLING_HUB_BASE}/casino`,
  },
  {
    slug: 'engagement',
    title: 'Engagement Systems',
    summary:
      'Daily bonuses, VIP rooms, predictions, raffles, and quest progression.',
    href: `${GAMBLING_HUB_BASE}/engagement`,
  },
  {
    slug: 'admin-ops',
    title: 'Admin Dashboard & Ops',
    summary:
      'Guild-scoped dashboard, ATM queue, audits, health, reports, and settings with live RTP.',
    href: `${GAMBLING_HUB_BASE}/admin-ops`,
  },
  {
    slug: 'reliability',
    title: 'Testing & Reliability',
    summary:
      'Background workers, Vitest coverage, lock reconciliation, and the hard problems the system had to solve.',
    href: `${GAMBLING_HUB_BASE}/reliability`,
  },
]

export const GAMBLING_HUB_LINKS = {
  admin: 'https://github.com/krouskystepan/gambling-bot-admin',
  discord: 'https://github.com/krouskystepan/gambling-bot-discord',
  shared: 'https://github.com/krouskystepan/gambling-bot-shared',
  community: 'https://discord.gg/Y2mMQN5QVE',
  caseStudy: 'https://www.krouskystepan.com/projects/discord-gambling-hub',
} as const

export function getChapterNeighbors(slug: string) {
  const index = GAMBLING_HUB_CHAPTERS.findIndex((c) => c.slug === slug)
  if (index === -1) return { prev: null, next: null }

  return {
    prev: index > 0 ? GAMBLING_HUB_CHAPTERS[index - 1] : null,
    next:
      index < GAMBLING_HUB_CHAPTERS.length - 1
        ? GAMBLING_HUB_CHAPTERS[index + 1]
        : null,
  }
}
