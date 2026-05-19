import ToolsDirectoryClient from '@/components/tools/directory/ToolsDirectoryClient'
import { tools } from '@/constants/tools'

export default function ToolsPage() {
  return (
    <div>
      <h2 className="mb-8 text-center text-4xl font-bold lg:text-5xl">
        Utility Tools
      </h2>
      <ToolsDirectoryClient tools={tools} />
    </div>
  )
}
