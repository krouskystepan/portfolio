import Outline_Github from '@/components/svg/Outline_Github'
import Outline_Linkedin from '@/components/svg/Outline_Linkedin'

export const BASE_URL = 'https://stepankrousky.com'
export const MAX_PROJECTS = 3

export const SOCIALS = [
  {
    icon: <Outline_Github className="cursor-pointer" />,
    link: 'https://github.com/krouskystepan',
    label: 'GitHub Link',
  },
  // {
  //   icon: <Outline_Linkedin className="cursor-pointer" />,
  //   // TODO: Add link
  //   link: '',
  //   label: 'Linkedin Link',
  // },
] as const

export const NAV_LINKS = [
  {
    name: 'Home',
    to: '/#home',
  },
  {
    name: 'About',
    to: '/#about',
  },
  {
    name: 'Projects',
    to: '/#projects',
  },
  {
    name: 'Contact',
    to: '/#contact',
  },
] as const

export const SKILLS = [
  {
    link: 'https://skillicons.dev/icons?i=js,ts',
    width: 104,
    height: 48,
  },
  {
    link: 'https://skillicons.dev/icons?i=nextjs,tailwind',
    width: 104,
    height: 48,
  },
  {
    link: 'https://skillicons.dev/icons?i=mysql,mongodb,postgres',
    width: 161,
    height: 48,
  },
  {
    link: 'https://skillicons.dev/icons?i=express,nodejs',
    width: 104,
    height: 48,
  },
  {
    link: 'https://skillicons.dev/icons?i=mui,figma',
    width: 104,
    height: 48,
  },
] as const

export const PROJECTS = [
  {
    title: 'Wassa',
    description:
      'Wassa specializes in packaging development, offering custom paperboard solutions and logistics across the Czech Republic, Germany, Poland, and the EU. This project showcases their services.',
    image: '/projects/wassa.png',
    path: 'https://wassa.eu',
    tags: ['Next.js', 'Tailwind', 'Shadcn', 'Prisma'],
    priority: 5,
  },
  {
    title: 'MonkeyCovers',
    description:
      'MonkeyCovers is a cutting-edge platform designed for creating and purchasing custom phone cases. Built with the latest technology, it offers a seamless and stylish shopping experience.',
    image: '/projects/monkeycovers.png',
    path: 'https://github.com/krouskystepan/monkeycovers',
    tags: ['Next.js', 'Postgres', 'Tailwind', 'Kinde'],
    priority: 10,
  },
  {
    title: 'SK Clothing Shop',
    description:
      'This is a simple project created without the need for a database. It serves as a basic example of building an e-commerce website without relying on backend.',
    image: '/projects/sk-clothing.png',
    path: 'https://github.com/krouskystepan/sk_clothing-shop',
    tags: ['Next.js', 'Shadcn', 'Tailwind', 'Stripe'],
    priority: 0,
  },
] as const
