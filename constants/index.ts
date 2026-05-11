import { TProject, TTools } from './types'

export type { TToolSectionId } from './types'
export { TOOL_SECTION_ORDER, TOOL_SECTION_LABELS } from './types'

export const BASE_URL = 'https://krouskystepan.com'

export const NAV_LINKS = [
  {
    href: '/',
    label: 'Home'
  },
  {
    href: '/#about',
    label: 'About'
  },
  {
    href: '/projects',
    label: 'Projects'
  },
  {
    href: '/#contact',
    label: 'Contact'
  }
] as const

export const SKILLS = [
  'React',
  'Next.js',
  'Tailwind CSS',
  'Node.js',
  'Express.js',
  'JavaScript',
  'TypeScript',
  'MySQL',
  'MongoDB',
  'Firebase',
  'Prisma',
  'MUI',
  'Figma'
] as const

export const SOCIALS = [
  {
    iconPath: '/svgs/github.svg',
    source: 'https://github.com/krouskystepan',
    label: 'GitHub Link',
    achievementId: 'pet-cat'
  },
  {
    iconPath: '/svgs/mail.svg',
    source: 'mailto:stepan.krousky@seznam.cz',
    label: 'Mail',
    achievementId: ''
  },
  {
    iconPath: '/svgs/linkedin.svg',
    source: 'https://www.linkedin.com/in/krouskystepan/',
    label: 'Linkedin Link',
    achievementId: ''
  }
] as const

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

export const allAchievements = [
  {
    id: 'first-visit',
    title: 'Who Are You?',
    description: 'You visited my portfolio for the first time!'
  },
  {
    id: 'say-hey',
    title: 'Said Hey!',
    description: 'You greeted me with a "Hey!".'
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'You visited my portfolio between 12AM - 5AM.'
  },
  {
    id: 'hidden-path',
    title: 'Off the Beaten Path',
    description: 'You found a secret spot in my portfolio.'
  },
  {
    id: 'mui-skill',
    title: 'Where is MUI?',
    description: 'You found the MUI skill!'
  },
  {
    id: 'pet-cat',
    title: 'Cat Cuddler',
    description: 'You petted the cat. A true animal lover!'
  },
  {
    id: 'inspector-of-gadgets',
    title: 'Inspector of Gadgets',
    description: 'Visited the Tools page. Sleuth approved.'
  },
  {
    id: 'pick-nose',
    title: 'The Forbidden Touch',
    description: 'You dared to poke my nose. A bold move, indeed!'
  },
  {
    id: 'clipboard-master',
    title: 'Copycat',
    description: 'You copied some text from my portfolio.'
  },
  {
    id: 'patience-is-key',
    title: 'Patience is Key',
    description: 'You waited for 30sec without any interaction.'
  },
  {
    id: 'patience-is-key-ii',
    title: 'Patience is Key II',
    description: 'You waited for 5min without any interaction.'
  },
  {
    id: 'gambling',
    title: 'Gambling Enthusiast',
    description: 'You hovered over Gambling Bot. Feeling lucky?'
  },
  {
    id: '404-hunter',
    title: 'Lost and Found',
    description: 'You visited a non-existent page. Oops!'
  }
] as const

export const tools: TTools[] = [
  {
    name: 'JSON & data workbench',
    path: 'data-workbench',
    description:
      'Format and validate JSON, convert CSV and YAML, and generate TypeScript types in one place.',
    section: 'data',
    keywords: [
      'json',
      'yaml',
      'csv',
      'typescript',
      'format',
      'validate',
      'converter',
      'ts types'
    ]
  },
  {
    name: 'Text Compare / Diff Tool',
    path: 'text-diff',
    description:
      'Compare two blocks of text and see the differences highlighted.',
    section: 'text',
    keywords: ['diff', 'compare', 'merge', 'changes']
  },
  {
    name: 'Text Case Converter',
    path: 'case-converter',
    description:
      'Convert text into camelCase, PascalCase, snake_case, uppercase, and more.',
    section: 'text',
    keywords: ['case', 'camelcase', 'pascal', 'snake']
  },
  {
    name: 'Alphabet Sorter',
    path: 'alphabet-sorter',
    description:
      'Sort text alphabetically, with an option to automatically group related items together.',
    section: 'text',
    keywords: ['sort', 'list', 'alphabetical']
  },
  {
    name: 'Regex tester',
    path: 'regex-tester',
    description:
      'Try JavaScript regular expressions with flags and see each match in your sample text.',
    section: 'text',
    keywords: ['regexp', 'pattern', 'match']
  },
  {
    name: 'Slug generator',
    path: 'slug-generator',
    description:
      'Turn titles into URL-friendly slugs with accent stripping and hyphen rules.',
    section: 'text',
    keywords: ['url', 'permalink', 'seo']
  },
  {
    name: 'HTML / CSS / JS Minifier',
    path: 'html-css-js-minifier',
    description:
      'Minify or beautify HTML, CSS, or JavaScript code to optimize performance.',
    section: 'web',
    keywords: ['minify', 'beautify', 'prettier', 'bundle']
  },
  {
    name: 'URL encoder / decoder',
    path: 'url-encoder-decoder',
    description:
      'Encode and decode text with URI component rules (UTF-8 safe) for query strings.',
    section: 'web',
    keywords: ['encodeURIComponent', 'decodeURIComponent', 'percent']
  },
  {
    name: 'JWT decode (no verification)',
    path: 'jwt-decoder',
    description:
      'Inspect JWT header and payload JSON. Signature is not verified.',
    section: 'web',
    keywords: ['jwt', 'bearer', 'token', 'base64']
  },
  {
    name: 'UUID Generator',
    path: 'uuid-generator',
    description: 'Generate random UUIDs (v4) for identifiers or testing.',
    section: 'utilities',
    keywords: ['guid', 'v4', 'random id']
  },
  {
    name: 'Color Converter',
    path: 'color-converter',
    description:
      'Convert colors between HEX, RGB, HSL and more. Live color preview.',
    section: 'utilities',
    keywords: ['hex', 'rgb', 'hsl', 'picker']
  },
  {
    name: 'Timestamp Converter',
    path: 'timestamp-converter',
    description: 'Convert Unix timestamps to readable dates and vice versa.',
    section: 'utilities',
    keywords: ['unix', 'epoch', 'timezone', 'date']
  }
]
