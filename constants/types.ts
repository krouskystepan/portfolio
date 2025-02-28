export type TProject = {
  name: string
  description: string
  image: string
  link: {
    type: 'github' | 'website'
    url: string
  }
  tags: string[]
  isDemo: boolean
}
