import { TProject, TTools } from './types'

export const BASE_URL = 'https://krouskystepan.com'

export const NAV_LINKS = [
  {
    href: '/',
    label: 'Home',
  },
  {
    href: '/#about',
    label: 'About',
  },
  {
    href: '/projects',
    label: 'Projects',
  },
  {
    href: '/#contact',
    label: 'Contact',
  },
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
  'Figma',
] as const

export const SOCIALS = [
  {
    iconPath: '/svgs/github.svg',
    source: 'https://github.com/krouskystepan',
    label: 'GitHub Link',
    achievementId: 'pet-cat',
  },
  {
    iconPath: '/svgs/mail.svg',
    source: 'mailto:stepan.krousky@seznam.cz',
    label: 'Mail',
    achievementId: '',
  },
  {
    iconPath: '/svgs/linkedin.svg',
    source: 'https://www.linkedin.com/in/krouskystepan/',
    label: 'Linkedin Link',
    achievementId: '',
  },
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
      url: '/projects/discord-gambling-hub',
    },
    tags: [
      'Next.js',
      'Node.js',
      'Discord.js',
      'TypeScript',
      'Tailwind',
      'MongoDB',
    ],
    availability: 'live',
  },
  {
    id: 'wassa',
    name: 'Wassa',
    description:
      'Wassa specializes in packaging development, offering custom paperboard solutions and logistics across the Czech Republic, Germany, Poland, and the EU. This project showcases their services.',
    image: '/images/projects/wassa.png',
    link: {
      type: 'website',
      url: 'https://wassa.eu',
    },
    tags: ['Next.js', 'Tailwind', 'Shadcn'],
    availability: 'live',
  },
  {
    id: 'monkeycovers',
    name: 'MonkeyCovers',
    description:
      'MonkeyCovers is a cutting-edge platform designed for creating and purchasing custom phone cases. Built with the latest technology, it offers a seamless and stylish shopping experience.',
    image: '/images/projects/monkeycovers.png',
    link: {
      type: 'external',
      url: 'https://github.com/krouskystepan/monkeycovers',
    },
    tags: ['Next.js', 'Postgres', 'Tailwind', 'Kinde'],
    availability: 'demo',
  },
  {
    id: 'sk-clothing-shop',
    name: 'SK Clothing Shop',
    description:
      'This is a simple project created without the need for a database. It serves as a basic example of building an e-commerce website without relying on backend.',
    image: '/images/projects/sk-clothing.png',
    link: {
      type: 'external',
      url: 'https://github.com/krouskystepan/sk_clothing-shop',
    },
    tags: ['Next.js', 'Shadcn', 'Tailwind', 'Stripe'],
    availability: 'demo',
  },
] as const

export const allAchievements = [
  {
    id: 'first-visit',
    title: 'Who Are You?',
    description: 'You visited my portfolio for the first time!',
  },
  {
    id: 'caught-coding',
    title: 'Caught Me Live!',
    description: 'You caught me coding live!',
  },
  {
    id: 'say-hey',
    title: 'Said Hey!',
    description: 'You greeted me with a "Hey!".',
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'You visited my portfolio between 12AM - 5AM.',
  },
  {
    id: 'hidden-path',
    title: 'Off the Beaten Path',
    description: 'You found a secret spot in my portfolio.',
  },
  {
    id: 'mui-skill',
    title: 'Where is MUI?',
    description: 'You found the MUI skill!',
  },
  {
    id: 'pet-cat',
    title: 'Cat Cuddler',
    description: 'You petted the cat. A true animal lover!',
  },
  {
    id: 'inspector-of-gadgets',
    title: 'Inspector of Gadgets',
    description: 'Visited the Tools page. Sleuth approved.',
  },
  {
    id: 'pick-nose',
    title: 'The Forbidden Touch',
    description: 'You dared to poke my nose. A bold move, indeed!',
  },
  {
    id: 'clipboard-master',
    title: 'Copycat',
    description: 'You copied some text from my portfolio.',
  },
  {
    id: 'patience-is-key',
    title: 'Patience is Key',
    description: 'You waited for 30sec without any interaction.',
  },
  {
    id: 'patience-is-key-ii',
    title: 'Patience is Key II',
    description: 'You waited for 5min without any interaction.',
  },
  {
    id: 'gambling',
    title: 'Gambling Enthusiast',
    description: 'You hovered over Gambling Bot. Feeling lucky?',
  },
  {
    id: '404-hunter',
    title: 'Lost and Found',
    description: 'You visited a non-existent page. Oops!',
  },
] as const

// TODOs
/*
- Responsive uuid gen
- Responsive color conv
- Filter out invalid achievements via edited local storage
*/

export const tools: TTools[] = [
  {
    name: 'Text Compare / Diff Tool',
    path: 'text-diff',
    description:
      'Compare two blocks of text and see the differences highlighted.',
  },
  {
    name: 'JSON Formatter & Validator',
    path: 'json-formatter',
    description:
      'Format, validate, and inspect JSON instantly in your browser.',
  },
  {
    name: 'UUID Generator',
    path: 'uuid-generator',
    description: 'Generate random UUIDs (v4) for identifiers or testing.',
  },
  {
    name: 'Color Converter',
    path: 'color-converter',
    description:
      'Convert colors between HEX, RGB, HSL and more. Live color preview.',
  },
  {
    name: 'Markdown Previewer',
    path: '',
    description: 'Write and preview Markdown with instant rendering.',
  },
  {
    name: 'Alphabet Sorter',
    path: 'alphabet-sorter',
    description:
      'Sort text alphabetically, with an option to automatically group related items together.',
  },
  {
    name: 'CSV to JSON Converter',
    path: '',
    description:
      'Convert CSV data into formatted JSON objects and arrays instantly.',
  },
  {
    name: 'HTML / CSS / JS Minifier',
    path: '',
    description:
      'Minify or beautify HTML, CSS, or JavaScript code to optimize performance.',
  },
  {
    name: 'Timestamp Converter',
    path: 'timestamp-converter',
    description: 'Convert Unix timestamps to readable dates and vice versa.',
  },
  {
    name: 'JSON to TS Type Generator',
    path: '',
    // path: 'json-to-ts',
    description:
      'Convert JSON objects into clean, typed TypeScript interfaces with one click.',
  },
  {
    name: 'Text Case Converter',
    path: '',
    // path: 'case-converter',
    description:
      'Convert text into camelCase, PascalCase, snake_case, uppercase, and more.',
  },
  {
    name: 'YAML to JSON Converter',
    path: '',
    // path: 'yaml-json',
    description: 'Convert YAML data to JSON and JSON back to YAML instantly.',
  },
]
