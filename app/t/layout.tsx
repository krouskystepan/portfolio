import ToolClientLayout from '@/layouts/ToolClientLayout'
import { Metadata } from 'next'

export function generateMetadata(): Metadata {
  return {
    title: 'Tools',
    description: 'Simple everyday tools for text, data, and conversions.',
  }
}

const ToolsLayout = ({ children }: { children: React.ReactNode }) => {
  return <ToolClientLayout>{children}</ToolClientLayout>
}

export default ToolsLayout
