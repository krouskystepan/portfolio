import { TProject } from './types'

export const PROJECT_FILTERS = ['live', 'all', 'demo'] as const

export const PROJECTS: TProject[] = [
  {
    id: 'discord-gambling-hub',
    name: 'Discord Gambling Hub',
    description:
      'A modular Discord gambling and economy system featuring multiple casino-style games, a virtual currency backend, and an integrated Next.js admin dashboard for real-time player and game management.',
    image: '/images/projects/discord-gambling-bot.png',
    link: {
      type: 'internal',
      url: '/projects/discord-gambling-hub'
    },
    tags: [
      'Next.js',
      'Node.js',
      'Discord.js',
      'TypeScript',
      'Tailwind',
      'MongoDB'
    ],
    availability: 'live'
  },
  {
    id: 'portfolio-platform',
    name: 'Portfolio Platform',
    description:
      'A self-hosted Next.js portfolio platform running on a custom VPS with subdomain-based services, GitHub Actions deployment, and lightweight interactive features such as achievements and internal tools.',
    image: '/images/projects/portfolio.png',
    link: {
      type: 'internal',
      url: '/projects/portfolio-platform'
    },
    tags: [
      'Next.js',
      'TypeScript',
      'Node.js',
      'PM2',
      'Nginx',
      'VPS',
      'GitHub Actions'
    ],
    availability: 'live'
  },
  {
    id: 'wassa',
    name: 'Wassa',
    description:
      'Wassa specializes in packaging development, offering custom paperboard solutions and logistics across the Czech Republic, Germany, Poland, and the EU. This project showcases their services.',
    image: '/images/projects/wassa.png',
    link: {
      type: 'website',
      url: 'https://wassa.eu'
    },
    tags: ['Next.js', 'Tailwind', 'Shadcn'],
    availability: 'live'
  },
  {
    id: 'custom-overlays',
    name: 'Streaming Overlays',
    description:
      'A real-time overlay platform built around a custom Node.js WebSocket server that aggregates events from Kick and StreamElements and delivers normalized live data to browser-based OBS overlays.',
    image: '/images/projects/custom-overlays.png',
    link: {
      type: 'internal',
      url: '/projects/custom-overlays'
    },
    tags: [
      'Node.js',
      'TypeScript',
      'WebSockets',
      'Express',
      'Vite',
      'Monorepo'
    ],
    availability: 'live'
  },
  {
    id: 'monkeycovers',
    name: 'MonkeyCovers',
    description:
      'MonkeyCovers is a cutting-edge platform designed for creating and purchasing custom phone cases. Built with the latest technology, it offers a seamless and stylish shopping experience.',
    image: '/images/projects/monkeycovers.png',
    link: {
      type: 'external',
      url: 'https://github.com/krouskystepan/monkeycovers'
    },
    tags: ['Next.js', 'Postgres', 'Tailwind', 'Kinde'],
    availability: 'demo'
  },
  {
    id: 'sk-clothing-shop',
    name: 'SK Clothing Shop',
    description:
      'This is a simple project created without the need for a database. It serves as a basic example of building an e-commerce website without relying on backend.',
    image: '/images/projects/sk-clothing.png',
    link: {
      type: 'external',
      url: 'https://github.com/krouskystepan/sk_clothing-shop'
    },
    tags: ['Next.js', 'Shadcn', 'Tailwind', 'Stripe'],
    availability: 'demo'
  }
] as const
