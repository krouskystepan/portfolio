import Outline_Github from '@/components/svg/Outline_Github'
import Outline_Linkedin from '@/components/svg/Outline_Linkedin'

export const socials = [
  {
    icon: <Outline_Github className="cursor-pointer" />,
    link: 'https://github.com/krouskystepan',
    label: 'GitHub Link',
  },
  {
    icon: <Outline_Linkedin className="cursor-pointer" />,
    // TODO: Add link
    link: '',
    label: 'Linkedin Link',
  },
] as const

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

export const projects = [
  {
    title: 'Project 1',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt cupiditate debitis odit, et tempora nisi iusto quod nobis modi recusandae. Odit accusantium corrupti asperiores omnis incidunt, esse sequi porro, reprehenderit expedita rem sunt ullam quia at fuga architecto adipisci soluta recusandae dolor excepturi deserunt!',
    image: '/placeholder.png',
    path: 'https://www.github.com',
    tags: ['Next.js', 'Tailwind CSS', 'Typescript'],
  },
  {
    title: 'Project 2',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt cupiditate debitis odit, et tempora nisi iusto quod nobis modi recusandae. Odit accusantium corrupti asperiores omnis incidunt, esse sequi porro, reprehenderit expedita rem sunt ullam quia at fuga architecto adipisci soluta recusandae dolor excepturi deserunt!',
    image: '/placeholder.png',
    path: 'https://www.github.com',
    tags: [
      'Node.js',
      'Express',
      'Typescr',
      'Node.js',
      'Express',
      'Express',
      'Typescript',
      'Typescript',
    ],
  },
  {
    title: 'Project 3',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt cupiditate debitis odit, et tempora nisi iusto quod nobis modi recusandae. Odit accusantium corrupti asperiores omnis incidunt, esse sequi porro, reprehenderit expedita rem sunt ullam quia at fuga architecto adipisci soluta recusandae dolor excepturi deserunt!',
    image: '/placeholder.png',
    path: 'https://www.github.com',
    tags: ['Node.js', 'Express', 'Typescript'],
  },
] as const
