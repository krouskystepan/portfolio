import { tools } from '@/constants/tools'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

const getToolById = (toolId: string) => {
  return tools.find((tool) => tool.path === toolId)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ toolId: string }>
}): Promise<Metadata> {
  const { toolId } = await params
  const tool = getToolById(toolId)

  if (!tool) notFound()

  return {
    title: `${tool.name} | Stepan Krousky`,
    description: tool?.description,
  }
}

export async function generateStaticParams() {
  return tools.map((tool) => ({
    toolId: tool.path,
  }))
}

const ToolsPage = async ({
  params,
}: {
  params: Promise<{ toolId: string }>
}) => {
  const { toolId } = await params

  const tool = getToolById(toolId)

  if (!tool) notFound()

  const toolMap = {
    'text-diff': () => import('@/components/tools/TextDifference'),
    'json-formatter': () => import('@/components/tools/JsonFormatter'),
    'uuid-generator': () => import('@/components/tools/UuidGenerator'),
    'color-converter': () => import('@/components/tools/ColorConverter'),
    'alphabet-sorter': () => import('@/components/tools/AlphabetSorter'),
    'timestamp-converter': () =>
      import('@/components/tools/TimestampConverter'),
  } as const

  const importer = toolMap[tool.path as keyof typeof toolMap]
  if (!importer) notFound()

  const { default: Component } = await importer()
  return <Component />
}

export default ToolsPage
