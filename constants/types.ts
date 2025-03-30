export type TProject = {
  name: string
  description: string
  image: string
  link: {
    type: 'github' | 'website'
    url: string
  }
  tags: string[]
  availability: 'live' | 'demo' | 'other'
}

export type WorkspaceStatus = {
  project_name: string
  uptime: number
  active_file: string
  lastUpdate: string
}
