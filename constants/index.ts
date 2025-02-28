import { TProject } from './types'

export const NAV_LINKS = [
  {
    href: '/',
    label: 'Home',
  },
  {
    href: '#about',
    label: 'About',
  },
  {
    href: '/projects',
    label: 'Projects',
  },
  {
    href: '#contact',
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
  },
  {
    iconPath: '/svgs/mail.svg',
    source: 'mailto:stepan.krousky@seznam.cz',
    label: 'Mail',
  },
  {
    iconPath: '/svgs/linkedin.svg',
    source: 'https://www.linkedin.com/in/krouskystepan/',
    label: 'Linkedin Link',
  },
] as const

export const PROJECTS: TProject[] = [
  {
    name: 'Wassa',
    description:
      'Wassa specializes in packaging development, offering custom paperboard solutions and logistics across the Czech Republic, Germany, Poland, and the EU. This project showcases their services.',
    image: '/images/projects/wassa.png',
    link: {
      type: 'website',
      url: 'https://wassa.eu',
    },
    tags: ['Next.js', 'Tailwind', 'Shadcn'],
    isDemo: false,
  },
  {
    name: 'MonkeyCovers',
    description:
      'MonkeyCovers is a cutting-edge platform designed for creating and purchasing custom phone cases. Built with the latest technology, it offers a seamless and stylish shopping experience.',
    image: '/images/projects/monkeycovers.png',
    link: {
      type: 'github',
      url: 'https://github.com/krouskystepan/monkeycovers',
    },
    tags: ['Next.js', 'Postgres', 'Tailwind', 'Kinde'],
    isDemo: true,
  },
  {
    name: 'SK Clothing Shop',
    description:
      'This is a simple project created without the need for a database. It serves as a basic example of building an e-commerce website without relying on backend.',
    image: '/images/projects/sk-clothing.png',
    link: {
      type: 'github',
      url: 'https://github.com/krouskystepan/sk_clothing-shop',
    },
    tags: ['Next.js', 'Shadcn', 'Tailwind', 'Stripe'],
    isDemo: true,
  },
] as const
