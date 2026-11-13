import { tools } from '@/constants'
import { isToolPath, loadTool } from '@/components/tools/toolRegistry'
import { isToolComingSoon } from '@/utils/toolUtils'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

const getLiveToolById = (toolId: string) => {
  const tool = tools.find((entry) => entry.path === toolId)
  if (!tool || isToolComingSoon(tool)) return undefined
  return tool
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ toolId: string }>
}): Promise<Metadata> {
  const { toolId } = await params
  const tool = getLiveToolById(toolId)

  if (!tool) notFound()

  return {
    title: `${tool.name} | Stepan Krousky`,
    description: tool.description
  }
}

export async function generateStaticParams() {
  return tools
    .filter((tool) => !isToolComingSoon(tool))
    .map((tool) => ({
      toolId: tool.path
    }))
}

const ToolsPage = async ({
  params
}: {
  params: Promise<{ toolId: string }>
}) => {
  const { toolId } = await params

  const tool = getLiveToolById(toolId)

  if (!tool) notFound()

  if (!isToolPath(tool.path)) notFound()

  const Component = await loadTool(tool.path)
  return <Component />
}

export default ToolsPage
