import Outline_Github from '@/components/svg/Outline_Github'
import Outline_Linkedin from '@/components/svg/Outline_Linkedin'

export const socials = [
  {
    icon: <Outline_Linkedin className="size-6 cursor-pointer" />,
    link: 'https://github.com/krouskystepan',
    label: 'GitHub Link',
  },
  {
    icon: <Outline_Github className="size-6 cursor-pointer" />,
    link: 'https://www.linkedin.com/in/štěpán-krouský-907782261',
    label: 'Linkedin Link',
  },
]

export const navLinks = [
  {
    name: 'Home',
    to: '#home',
  },
  {
    name: 'About',
    to: '#about',
  },
  {
    name: 'Projects',
    to: '#projects',
  },
  {
    name: 'Contact',
    to: '#contact',
  },
] as const

export const skills = [
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
