import ToolLayoutClient from './ToolLayoutClient'

export const metadata = {
  title: 'Tools',
  description: 'Simple everyday tools for text, data, and conversions.',
}

const ToolsLayout = ({ children }: { children: React.ReactNode }) => {
  return <ToolLayoutClient>{children}</ToolLayoutClient>
}

export default ToolsLayout
