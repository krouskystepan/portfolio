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
  'Python',
  'QA Automation',
  'Jira',
  'Codebeamer',
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

export { PROJECT_FILTERS, PROJECTS } from './projects'
export { allAchievements } from './achievements'
export { tools, type ToolPath } from './tools'
