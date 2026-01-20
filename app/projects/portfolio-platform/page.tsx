import {
  Globe,
  Server,
  Layers,
  Trophy,
  Terminal,
  ShieldCheck,
  Wrench,
  Clock
} from 'lucide-react'
import Alert from '@/components/Alert'
import {
  ProjectSubPageBulletList,
  ProjectSubPageDescription,
  ProjectSubPageInfoCard,
  ProjectSubPageParagraph,
  ProjectSubPageSectionLayout,
  ProjectSubPageTableOfContents,
  ProjectSubPageTag,
  ProjectSubPageTitle
} from '@/components/SubPageComponents'

const PortfolioCaseStudyPage = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-12">
      {/* HEADER */}
      <header className="mb-8">
        <ProjectSubPageTag text="Case Study" />
        <ProjectSubPageTitle title="Portfolio Platform – Next.js, VPS & Subdomain Services" />
        <ProjectSubPageDescription
          description={`This project is my personal portfolio platform, built and hosted on custom infrastructure.\nBeyond presenting projects, it serves as a controlled environment for experimenting with frontend architecture, deployment workflows, subdomain-based services, and small interactive features.\nThe platform is designed to be incrementally extensible without architectural rewrites.`}
        />
      </header>

      <Alert
        type="info"
        title="Project Overview"
        description="The platform runs on a custom VPS with multiple subdomains, each representing a focused service or application. Deployment, runtime behavior, and routing are fully under my control."
      />

      {/* TOC */}
      <ProjectSubPageTableOfContents
        title="Contents"
        items={[
          { label: 'Motivation & Scope', href: '#motivation' },
          { label: 'System & Deployment Architecture', href: '#architecture' },
          { label: 'Subdomain-Based Service Model', href: '#subdomains' },
          { label: 'Frontend Architecture (Next.js)', href: '#frontend' },
          { label: 'Achievements System', href: '#achievements' },
          { label: 'Internal Tools & Utilities', href: '#tools' },
          {
            label: 'Infrastructure Decisions & Trade-offs',
            href: '#tradeoffs'
          },
          { label: 'Future Expansion', href: '#future' }
        ]}
      />

      {/* 1. MOTIVATION */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Globe, color: 'text-blue-400' }}
        title="1. Motivation & Scope"
        id="motivation"
      >
        <ProjectSubPageParagraph>
          The portfolio was built not only to showcase projects, but to function
          as a small, real-world platform running on self-managed
          infrastructure. The focus is on clarity, extensibility, and control
          over the entire stack.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Host the platform on a custom VPS instead of managed hosting.',
            'Support multiple independent services via subdomains.',
            'Keep deployment simple, predictable, and reproducible.',
            'Experiment with interactive frontend features without backend dependencies.'
          ]}
        />
      </ProjectSubPageSectionLayout>

      {/* 2. ARCHITECTURE */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Server, color: 'text-emerald-400' }}
        title="2. System & Deployment Architecture"
        id="architecture"
      >
        <ProjectSubPageParagraph>
          The entire platform is hosted on a custom VPS and deployed via GitHub
          Actions. Each application runs as a Node.js process managed by PM2,
          with Nginx acting as a reverse proxy and entry point.
        </ProjectSubPageParagraph>

        <div className="grid gap-5 sm:grid-cols-3">
          <ProjectSubPageInfoCard
            title="VPS & Runtime"
            icon={Terminal}
            iconColor="text-emerald-300"
            items={[
              'VPS provider: Hostinger.',
              'OS: Ubuntu Linux.',
              'Node.js runtime managed via PM2.',
              'Each app runs as an independent process.'
            ]}
          />

          <ProjectSubPageInfoCard
            title="Deployment"
            icon={Layers}
            iconColor="text-purple-400"
            items={[
              'Custom GitHub Actions workflows.',
              'Deployment script executed on the VPS.',
              'Build step followed by controlled restarts via PM2.',
              'No platform-specific abstractions.'
            ]}
          />

          <ProjectSubPageInfoCard
            title="Networking & Security"
            icon={ShieldCheck}
            iconColor="text-blue-400"
            items={[
              'Nginx reverse proxy for domain and subdomain routing.',
              'HTTPS enabled for each subdomain individually.',
              'Environment variables managed via per-project .env files.'
            ]}
          />
        </div>
      </ProjectSubPageSectionLayout>

      {/* 3. SUBDOMAINS */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Layers, color: 'text-purple-400' }}
        title="3. Subdomain-Based Service Model"
        id="subdomains"
      >
        <ProjectSubPageParagraph>
          Instead of a single monolithic site, the platform is split into
          multiple subdomains. Each subdomain represents a focused application
          or service with its own responsibility.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            <>
              <code className="text-xs">krouskystepan.com</code> — main
              portfolio site with projects, tools, and interactive features.
            </>,
            <>
              <code className="text-xs">darts.krouskystepan.com</code> — a
              simple static darts score tracker (501 countdown).
            </>,
            <>
              <code className="text-xs">overlay.chat.krouskystepan.com</code> —
              frontend chat overlay.
            </>,
            <>
              <code className="text-xs">overlay.alerts.krouskystepan.com</code>{' '}
              — frontend alerts overlay.
            </>,
            <>
              <code className="text-xs">overlay.server.krouskystepan.com</code>{' '}
              — backend WebSocket service for overlays.
            </>
          ]}
        />

        <Alert
          type="note"
          title="Separation of Concerns"
          description="Each subdomain can evolve independently. Larger systems, such as the overlay infrastructure, are intentionally documented in their own dedicated case study."
        />
      </ProjectSubPageSectionLayout>

      {/* 4. FRONTEND */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Globe, color: 'text-cyan-400' }}
        title="4. Frontend Architecture (Next.js)"
        id="frontend"
      >
        <ProjectSubPageParagraph>
          The portfolio frontend is built using Next.js with the App Router. The
          application is built using <code className="text-xs">next build</code>{' '}
          and served via <code className="text-xs">next start</code> as a
          Node.js server.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'App Router-based structure.',
            'Primarily static content with no runtime server-side rendering.',
            'Tailwind CSS with custom styling conventions.',
            'No global state management required due to limited complexity.'
          ]}
        />
      </ProjectSubPageSectionLayout>

      {/* 5. ACHIEVEMENTS */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Trophy, color: 'text-amber-400' }}
        title="5. Achievements System"
        id="achievements"
      >
        <ProjectSubPageParagraph>
          The portfolio includes a lightweight achievements system intended as
          an interactive UX feature rather than a core functional component.
          Achievements are configuration-driven and tracked entirely on the
          client.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Achievements defined via configuration objects.',
            'Unlocked based on user interactions (page visits, hover actions, feature usage).',
            'Progress and unlocked state stored in localStorage.',
            'Hidden page exposing all achievements and completion progress.'
          ]}
        />

        <Alert
          type="info"
          title="Design Intent"
          description="The system exists primarily as an experiment in lightweight gamification and user interaction, without introducing backend complexity."
        />
      </ProjectSubPageSectionLayout>

      {/* 6. TOOLS */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Wrench, color: 'text-emerald-400' }}
        title="6. Internal Tools & Utilities"
        id="tools"
      >
        <ProjectSubPageParagraph>
          The portfolio also serves as a host for small, self-contained frontend
          utilities. These tools are implemented as individual pages sharing a
          common layout and internal helper logic.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Text diff and comparison tool.',
            'JSON formatter and validator.',
            'UUID generator.',
            'Color format converter.',
            'Timestamp converter.',
            'Text case and alphabet sorting utilities.'
          ]}
        />
      </ProjectSubPageSectionLayout>

      {/* 7. TRADE-OFFS */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Clock, color: 'text-rose-400' }}
        title="7. Infrastructure Decisions & Trade-offs"
        id="tradeoffs"
      >
        <ProjectSubPageParagraph>
          Several deliberate trade-offs were made to keep the platform simple
          and maintainable.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'No database or backend persistence for portfolio-specific features.',
            'Client-side storage used where durability is not critical.',
            'Manual VPS management preferred over managed hosting for learning and control.',
            'HTTPS handled per subdomain instead of centralized wildcard setup.'
          ]}
        />
      </ProjectSubPageSectionLayout>

      {/* 8. FUTURE */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Terminal, color: 'text-neutral-400' }}
        title="8. Future Expansion"
        id="future"
      >
        <ProjectSubPageParagraph>
          The platform is intentionally open-ended. New subdomains, tools, and
          backend-backed services can be added without affecting the existing
          architecture.
        </ProjectSubPageParagraph>

        <Alert
          type="note"
          title="Living Project"
          description="This portfolio evolves alongside my skill set. As more complex services are added, individual subsystems are documented as separate case studies."
        />
      </ProjectSubPageSectionLayout>
    </div>
  )
}

export default PortfolioCaseStudyPage
