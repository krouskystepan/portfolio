import { ReactNode } from 'react'

const ToolLayout = ({
  title,
  children,
  embedded = false
}: {
  title: string
  children: ReactNode
  /** Hide the page title (e.g. inside a tabbed workbench) */
  embedded?: boolean
}) => {
  return (
    <div className="space-y-6">
      {!embedded && (
        <h2 className="mb-8 text-center text-4xl font-bold lg:text-5xl">
          {title}
        </h2>
      )}
      {children}
    </div>
  )
}

export default ToolLayout
