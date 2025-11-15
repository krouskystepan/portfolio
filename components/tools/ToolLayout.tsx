import { ReactNode } from 'react'

const ToolLayout = ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) => {
  return (
    <div className="space-y-6">
      <h2 className="mb-8 text-center text-4xl font-bold lg:text-5xl">
        {title}
      </h2>
      {children}
    </div>
  )
}

export default ToolLayout
