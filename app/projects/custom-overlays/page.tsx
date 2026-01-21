import {
  Globe,
  Server,
  Layers,
  Radio,
  ShieldCheck,
  Terminal,
  Share2,
  Clock
} from 'lucide-react'
import Alert from '@/components/Alert'
import {
  ProjectSubPageBulletList,
  ProjectSubPageDescription,
  ProjectSubPageFlowDiagram,
  ProjectSubPageInfoCard,
  ProjectSubPageParagraph,
  ProjectSubPageSectionLayout,
  ProjectSubPageTableOfContents,
  ProjectSubPageTag,
  ProjectSubPageTitle
} from '@/components/SubPageComponents'

const CustomOverlaysCaseStudyPage = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-12">
      {/* HEADER */}
      <header className="mb-8">
        <ProjectSubPageTag text="Case Study" />
        <ProjectSubPageTitle title="Custom Streaming Overlays – Real-Time Event Platform (Kick & StreamElements)" />
        <ProjectSubPageDescription
          description={`A full-stack real-time overlay platform built around a custom Node.js WebSocket server.\nThe system aggregates live events from Kick and StreamElements, normalizes them, and pushes them to browser-based overlays used directly in OBS.\nThe entire project is structured as a TypeScript monorepo with a shared contract layer.`}
        />
      </header>

      <Alert
        type="info"
        title="Project Scope"
        description="The platform focuses exclusively on real-time delivery. No persistence, no dashboards, and no historical data — only low-latency event flow from streaming platforms to on-screen overlays."
      />

      {/* TOC */}
      <ProjectSubPageTableOfContents
        title="Contents"
        items={[
          { label: 'Motivation & Scope', href: '#motivation' },
          { label: 'Monorepo Architecture', href: '#monorepo' },
          { label: 'High-Level System Architecture', href: '#architecture' },
          { label: 'Event Pipeline & Flow', href: '#flow' },
          { label: 'WebSocket Design', href: '#ws' },
          { label: 'Kick Integration', href: '#kick' },
          { label: 'Security & Production Setup', href: '#security' },
          { label: 'Trade-offs & Constraints', href: '#tradeoffs' },
          { label: 'Future Work', href: '#future' }
        ]}
      />

      {/* 1. MOTIVATION */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Radio, color: 'text-cyan-400' }}
        title="1. Motivation & Scope"
        id="motivation"
      >
        <ProjectSubPageParagraph>
          The goal of this project was to build a single, controllable entry
          point for real-time streaming events and expose them to browser-based
          overlays without relying on third-party realtime services.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Aggregate events from multiple external providers.',
            'Normalize different event formats into a single internal model.',
            'Push events to overlays with minimal latency.',
            'Keep the system stateless and simple to operate.'
          ]}
        />
      </ProjectSubPageSectionLayout>

      {/* 2. MONOREPO */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Layers, color: 'text-purple-400' }}
        title="2. Monorepo Architecture"
        id="monorepo"
      >
        <ProjectSubPageParagraph>
          The project is implemented as a TypeScript monorepo using PNPM
          workspaces. This allows the server and overlays to share a strict,
          versioned contract without duplicating logic or types.
        </ProjectSubPageParagraph>

        <div className="grid gap-5 sm:grid-cols-3">
          <ProjectSubPageInfoCard
            title="Server"
            icon={Server}
            iconColor="text-emerald-400"
            items={[
              'Node.js + Express.',
              'HTTP endpoints for webhooks and OAuth.',
              'WebSocket server for real-time delivery.',
              'Stateless runtime.'
            ]}
          />

          <ProjectSubPageInfoCard
            title="Shared Package"
            icon={Share2}
            iconColor="text-purple-400"
            items={[
              'Strongly typed event contracts.',
              'Shared constants (ports, channel names).',
              'Used by server, overlays, and scripts.'
            ]}
          />

          <ProjectSubPageInfoCard
            title="Overlays"
            icon={Globe}
            iconColor="text-blue-400"
            items={[
              'Vite + TypeScript.',
              'Frameworkless by design.',
              'Optimized for OBS browser sources.'
            ]}
          />
        </div>
      </ProjectSubPageSectionLayout>

      {/* 3. ARCHITECTURE */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Server, color: 'text-emerald-400' }}
        title="3. High-Level System Architecture"
        id="architecture"
      >
        <ProjectSubPageParagraph>
          A single Node.js server acts as the central aggregation point for all
          incoming events and outgoing WebSocket traffic. Overlays connect
          directly to this server and listen for normalized events.
        </ProjectSubPageParagraph>
      </ProjectSubPageSectionLayout>

      {/* 4. FLOW */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Share2, color: 'text-indigo-400' }}
        title="4. Event Pipeline & Flow"
        id="flow"
      >
        <ProjectSubPageFlowDiagram
          steps={[
            'Kick / StreamElements',
            'Webhook verification',
            'Event normalization',
            'WebSocket broadcast',
            'OBS browser overlays'
          ]}
        />

        <ProjectSubPageBulletList
          className="mt-6"
          items={[
            'Kick events are received via signed webhooks.',
            'Kick chat messages are consumed via a persistent WebSocket connection.',
            'StreamElements alerts are verified and mapped into internal event types.',
            'All valid events are broadcast immediately to connected overlays.'
          ]}
        />
      </ProjectSubPageSectionLayout>

      {/* 5. WS */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Radio, color: 'text-cyan-400' }}
        title="5. WebSocket Design"
        id="ws"
      >
        <ProjectSubPageParagraph>
          The WebSocket layer is intentionally simple. Clients connect once and
          receive a continuous stream of events relevant to the configured
          channel.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Broadcast-based model.',
            'Channel selection via shared configuration.',
            'Designed for frequent reconnects (OBS reloads).',
            'No per-client state stored on the server.'
          ]}
        />
      </ProjectSubPageSectionLayout>

      {/* 6. KICK */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Globe, color: 'text-green-400' }}
        title="6. Kick Integration"
        id="kick"
      >
        <ProjectSubPageParagraph>
          The platform integrates with Kick on multiple levels: REST APIs,
          signed webhooks, OAuth token handling, and live chat consumption via
          WebSockets.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'OAuth-based token retrieval and refresh.',
            'Automatic event subscription on startup.',
            'RSA signature verification for incoming webhooks.',
            'Live chat consumption via Kick’s Pusher-based WS.'
          ]}
        />
      </ProjectSubPageSectionLayout>

      {/* 7. SECURITY */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: ShieldCheck, color: 'text-emerald-400' }}
        title="7. Security & Production Setup"
        id="security"
      >
        <ProjectSubPageParagraph>
          In production, the server runs behind Nginx with HTTPS termination.
          Access to webhook endpoints and overlays is restricted using CORS and
          environment-based configuration.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'HTTPS terminated at Nginx.',
            'CORS allowlist for known overlay origins.',
            'Secrets stored per-project in environment variables.',
            'Mock endpoints available only in development mode.'
          ]}
        />
      </ProjectSubPageSectionLayout>

      {/* 8. TRADE-OFFS */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Clock, color: 'text-rose-400' }}
        title="8. Trade-offs & Constraints"
        id="tradeoffs"
      >
        <ProjectSubPageParagraph>
          The system deliberately avoids persistence and horizontal scaling.
          Every design decision favors low latency and operational simplicity.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'No database or event storage.',
            'No replay or recovery of missed events.',
            'Single-server deployment.',
            'Optimized for live usage, not analytics.'
          ]}
        />
      </ProjectSubPageSectionLayout>

      {/* 9. FUTURE */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Terminal, color: 'text-neutral-400' }}
        title="9. Future Work"
        id="future"
      >
        <ProjectSubPageParagraph>
          The current architecture leaves room for multi-channel support,
          authentication, and additional event sources without rewriting the
          core pipeline.
        </ProjectSubPageParagraph>

        <Alert
          type="note"
          title="Extensibility"
          description="Because the system is stateless and contract-driven, new providers or overlay types can be added with minimal impact on existing code."
        />
      </ProjectSubPageSectionLayout>
    </div>
  )
}

export default CustomOverlaysCaseStudyPage
