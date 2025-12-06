import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

// Header Components
export const ProjectSubPageTag = ({ text }: { text: string }) => {
  return (
    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
      {text}
    </p>
  )
}

export const ProjectSubPageTitle = ({ title }: { title: string }) => {
  return (
    <h1 className="mb-4 text-4xl font-bold leading-tight sm:text-5xl">
      {title}
    </h1>
  )
}

export const ProjectSubPageDescription = ({
  description,
}: {
  description: string
}) => {
  return (
    <div className="space-y-2 text-lg leading-relaxed text-neutral-300">
      {description
        .split('\n')
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>{p}</p>
        ))}
    </div>
  )
}

type TOCItem = { label: string; href: string }

export const ProjectSubPageTableOfContents = ({
  title,
  items,
}: {
  title: string
  items: TOCItem[]
}) => {
  return (
    <section className="my-8 border-l border-neutral-800 pl-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-neutral-400">
        {title}
      </h2>

      <ol className="space-y-2 text-sm ">
        {items.map((item, index) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="text-neutral-300 transition-colors duration-100 hover:font-medium hover:text-neutral-50 hover:underline"
            >
              {index + 1}. {item.label}
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}

// Main Layout and Components
type ProjectSectionProps = {
  id: string
  iconStyle: {
    icon: LucideIcon
    color: string
  }
  title: string
  children: ReactNode
}

export const ProjectSubPageSectionLayout = ({
  id,
  iconStyle: { icon: Icon, color },
  title,
  children,
}: ProjectSectionProps) => {
  return (
    <section id={id} className="mt-16 scroll-m-16">
      <div className="mb-4 flex items-center gap-3">
        <Icon className={color} size={26} />
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  )
}

type ProjectListProps =
  | { items: ReactNode[]; children?: never; className?: string }
  | { items?: never; children: ReactNode; className?: string }

export const ProjectSubPageBulletList = (props: ProjectListProps) => {
  const className = `ml-5 list-disc space-y-2 text-neutral-300 ${
    props.className ?? ''
  }`

  if (props.items) {
    return (
      <ul className={className}>
        {props.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    )
  }

  return <ul className={className}>{props.children}</ul>
}

export const ProjectSubPageNumberedList = (props: ProjectListProps) => {
  const className = `ml-5 list-disc space-y-2 text-neutral-300 ${
    props.className ?? ''
  }`

  if (props.items) {
    return (
      <ol className={className}>
        {props.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ol>
    )
  }

  return <ol className={className}>{props.children}</ol>
}

export const ProjectSubPageParagraph = ({
  children,
  className,
}: {
  children: string | ReactNode
  className?: string
}) => {
  if (typeof children === 'string') {
    return (
      <div
        className={`space-y-2 leading-relaxed text-neutral-300 ${className ?? ''}`}
      >
        {children
          .split('\n')
          .filter(Boolean)
          .map((line, i) => (
            <p key={i}>{line}</p>
          ))}
      </div>
    )
  }

  return (
    <p className={`leading-relaxed text-neutral-300 ${className ?? ''}`}>
      {children}
    </p>
  )
}

type ProjectSubPageInfoCardProps =
  | {
      title: string
      icon: LucideIcon
      iconColor: string
      items: string[]
      children?: never
      className?: string
    }
  | {
      title: string
      icon: LucideIcon
      iconColor: string
      items?: never
      children: ReactNode
      className?: string
    }

export const ProjectSubPageInfoCard = ({
  title,
  icon: Icon,
  iconColor,
  items,
  children,
  className,
}: ProjectSubPageInfoCardProps) => {
  return (
    <div
      className={`rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 ${
        className ?? ''
      }`}
    >
      <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
        <Icon size={18} className={iconColor} />
        {title}
      </h3>

      {items ? (
        <ProjectSubPageBulletList className="ml-1 text-sm" items={items} />
      ) : (
        <div className="ml-1 text-sm">{children}</div>
      )}
    </div>
  )
}

export const ProjectSubPageFlowDiagram = ({ steps }: { steps: string[] }) => {
  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-4">
          {/* Step Box */}
          <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 px-4 py-3 text-center text-sm text-neutral-200 shadow-sm">
            {step}
          </div>

          {/* Arrow (except last) */}
          {i !== steps.length - 1 && (
            <span className="hidden text-neutral-600 sm:inline-block">→</span>
          )}
        </div>
      ))}
    </div>
  )
}
