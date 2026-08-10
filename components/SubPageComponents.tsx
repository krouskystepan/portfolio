import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  ImageIcon,
  type LucideIcon
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ReactNode } from 'react'
import { PROJECTS } from '@/constants/projects'

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
  description
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
  items
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
  className?: string
}

export const ProjectSubPageSectionLayout = ({
  id,
  iconStyle: { icon: Icon, color },
  title,
  children,
  className
}: ProjectSectionProps) => {
  return (
    <section
      id={id}
      className={`scroll-m-16 ${className ?? 'mt-16'}`}
    >
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
  className
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
  className
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

type ChapterNavItem = {
  title: string
  summary: string
  href: string
}

export const ProjectSubPageChapterNav = ({
  title = 'Chapters',
  items
}: {
  title?: string
  items: ChapterNavItem[]
}) => {
  return (
    <section className="my-8">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-neutral-400">
        {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 transition-all duration-200 hover:border-blue-400/50 hover:bg-neutral-900/80"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-400 transition-colors duration-200 group-hover:text-blue-300">
                  Chapter {index + 1}
                </p>
                <h3 className="mb-1 text-base font-semibold text-neutral-100 transition-colors duration-200 group-hover:text-white">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-400 transition-colors duration-200 group-hover:text-neutral-300">
                  {item.summary}
                </p>
              </div>
              <ArrowRight className="mt-1 size-4 shrink-0 text-neutral-600 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-blue-400" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

type BreadcrumbItem = { label: string; href?: string }

export const ProjectSubPageBreadcrumb = ({
  items
}: {
  items: BreadcrumbItem[]
}) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-500"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span
            key={`${item.label}-${index}`}
            className="flex items-center gap-2"
          >
            {index > 0 && <span className="text-neutral-700">/</span>}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-neutral-200"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-neutral-300' : undefined}>
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}

/** Default case-study crumb: Projects / {project name} [/ chapter] */
export const ProjectCaseStudyBreadcrumb = ({
  projectId,
  chapter
}: {
  projectId: string
  chapter?: string
}) => {
  const project = PROJECTS.find((p) => p.id === projectId)
  if (!project) return null

  const hubHref =
    project.link.type === 'internal' ? project.link.url : undefined

  const items: BreadcrumbItem[] = [
    { label: 'Projects', href: '/projects' },
    chapter && hubHref
      ? { label: project.name, href: hubHref }
      : { label: project.name }
  ]

  if (chapter) {
    items.push({ label: chapter })
  }

  return <ProjectSubPageBreadcrumb items={items} />
}

export const ProjectSubPagePrevNext = ({
  prev,
  next
}: {
  prev: { title: string; href: string } | null
  next: { title: string; href: string } | null
}) => {
  if (!prev && !next) return null

  return (
    <nav
      aria-label="Chapter navigation"
      className="mt-12 flex flex-col gap-4 border-t border-neutral-800 pt-8 sm:flex-row sm:items-start sm:justify-between"
    >
      {prev ? (
        <Link
          href={prev.href}
          className="group inline-flex max-w-sm items-center gap-2 text-neutral-400 transition-colors duration-200 hover:text-neutral-100"
        >
          <ArrowLeft className="size-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span className="min-w-0">
            <span className="block text-xs text-neutral-500">Previous</span>
            <span className="block truncate text-sm font-medium text-neutral-200 group-hover:text-white">
              {prev.title}
            </span>
          </span>
        </Link>
      ) : (
        <span />
      )}

      {next ? (
        <Link
          href={next.href}
          className="group inline-flex max-w-sm items-center gap-2 self-end text-right text-neutral-400 transition-colors duration-200 hover:text-neutral-100 sm:self-start"
        >
          <span className="min-w-0">
            <span className="block text-xs text-neutral-500">Next</span>
            <span className="block truncate text-sm font-medium text-neutral-200 group-hover:text-white">
              {next.title}
            </span>
          </span>
          <ArrowRight className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </nav>
  )
}

export const ProjectSubPageFigure = ({
  src,
  alt,
  caption,
  filenameHint,
  /** Placeholder frame only. Real images keep natural aspect. */
  aspect = 'wide',
  className
}: {
  src?: string
  alt: string
  caption?: string
  /** Suggested filename under public/images/projects/discord-gambling-hub/ */
  filenameHint?: string
  /** `wide` ≈ 16:9 (admin). `embed` ≈ 3:4 (Discord message / embed crop). */
  aspect?: 'wide' | 'embed'
  className?: string
}) => {
  const isEmbed = aspect === 'embed'

  return (
    <figure
      className={`overflow-hidden rounded-xl border border-neutral-800 ${
        className ??
        (isEmbed ? 'my-6 mx-auto max-w-md' : 'my-6')
      }`}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={isEmbed ? 900 : 1920}
          height={isEmbed ? 1200 : 1080}
          className="h-auto w-full"
          sizes={
            isEmbed
              ? '(min-width: 448px) 448px, 100vw'
              : '(min-width: 896px) 896px, 100vw'
          }
          unoptimized
        />
      ) : (
        <div
          className={`flex w-full flex-col items-center justify-center gap-2 bg-neutral-950/50 px-4 text-center ${
            isEmbed ? 'aspect-[3/4]' : 'aspect-video'
          }`}
        >
          <ImageIcon size={28} className="text-neutral-600" />
          <p className="text-sm font-medium text-neutral-400">
            Screenshot pending
          </p>
          {filenameHint && (
            <p className="font-mono text-xs text-neutral-600">{filenameHint}</p>
          )}
        </div>
      )}
      {caption && (
        <figcaption className="border-t border-neutral-800 bg-neutral-900/40 px-4 py-3 text-sm text-neutral-400">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

type ExternalLinkItem = {
  label: string
  href: string
  description?: string
}

export const ProjectSubPageExternalLinks = ({
  title = 'Repositories & community',
  items
}: {
  title?: string
  items: ExternalLinkItem[]
}) => {
  return (
    <section className="my-8 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-neutral-400">
        {title}
      </h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-start gap-2 text-neutral-200 transition-colors hover:text-white"
            >
              <ExternalLink
                size={14}
                className="mt-1 shrink-0 text-neutral-500 group-hover:text-neutral-300"
              />
              <span>
                <span className="font-medium underline-offset-2 group-hover:underline">
                  {item.label}
                </span>
                {item.description && (
                  <span className="mt-0.5 block text-sm text-neutral-400">
                    {item.description}
                  </span>
                )}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
