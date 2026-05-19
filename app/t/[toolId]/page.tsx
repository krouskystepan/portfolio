import { tools } from '@/constants'
import { isToolPath, loadTool } from '@/components/tools/toolRegistry'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

const getToolById = (toolId: string) => {
  return tools.find((tool) => tool.path === toolId)
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ toolId: string }>
}): Promise<Metadata> {
  const { toolId } = await params
  const tool = getToolById(toolId)

  if (!tool) notFound()

  return {
    title: `${tool.name} | Stepan Krousky`,
    description: tool?.description
  }
}

export async function generateStaticParams() {
  return tools.map((tool) => ({
    toolId: tool.path
  }))
}

const ToolsPage = async ({
  params
}: {
  params: Promise<{ toolId: string }>
}) => {
  const { toolId } = await params

  const tool = getToolById(toolId)

  if (!tool) notFound()

  if (!isToolPath(tool.path)) notFound()

  const Component = await loadTool(tool.path)
  return <Component />
}

export default ToolsPage
