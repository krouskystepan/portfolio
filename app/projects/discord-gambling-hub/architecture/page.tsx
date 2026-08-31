import {
  Database,
  Layers,
  Package,
  Server,
  Terminal,
  Workflow,
} from 'lucide-react'
import Alert from '@/components/Alert'
import {
  ProjectCaseStudyBreadcrumb,
  ProjectSubPageBulletList,
  ProjectSubPageDescription,
  ProjectSubPageExternalLinks,
  ProjectSubPageFigure,
  ProjectSubPageFlowDiagram,
  ProjectSubPageInfoCard,
  ProjectSubPageParagraph,
  ProjectSubPagePrevNext,
  ProjectSubPageSectionLayout,
  ProjectSubPageTag,
  ProjectSubPageTitle,
} from '@/components/SubPageComponents'
import {
  GAMBLING_HUB_LINKS,
  getChapterNeighbors,
} from '../_data/chapters'

const { prev, next } = getChapterNeighbors('architecture')

const ArchitecturePage = () => {
  return (
    <>
      <ProjectCaseStudyBreadcrumb
        projectId="discord-gambling-hub"
        chapter="Architecture"
      />

      <header className="mb-8">
        <ProjectSubPageTag text="Chapter 1" />
        <ProjectSubPageTitle title="Architecture & Shared Package" />
        <ProjectSubPageDescription
          description="Three independently deployable apps share one MongoDB and one published TypeScript package. The design goal: Discord gameplay and the web dashboard can never disagree on schemas, bet math, or guild configuration."
        />
      </header>

      <ProjectSubPageFigure
        alt="Multi-repo architecture diagram"
        src="/images/projects/discord-gambling-hub/architecture-diagram.png"
        caption="System diagram: Discord bot, shared package, admin, MongoDB."
      />

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Server, color: 'text-emerald-400' }}
        title="Ownership boundaries"
        id="ownership"
      >
        <ProjectSubPageParagraph>
          Splitting repos was not about ceremony. It was about failure modes.
          Gameplay latency and Discord API quirks stay in the bot. OAuth, dense
          tables, and form UX stay in Next.js. Anything both must trust lives in
          gambling-bot-shared.
        </ProjectSubPageParagraph>

        <div className="grid gap-5 sm:grid-cols-3">
          <ProjectSubPageInfoCard
            title="Discord bot"
            icon={Terminal}
            iconColor="text-blue-400"
            items={[
              'CommandKit slash commands & events',
              'Interaction UX (embeds, buttons, multi-step games)',
              'Background workers & Discord permission sync',
              'MongoDB write paths for bets, VIP, ATM requests',
            ]}
          />
          <ProjectSubPageInfoCard
            title="Admin dashboard"
            icon={Package}
            iconColor="text-emerald-400"
            items={[
              'NextAuth Discord OAuth',
              'Guild-scoped routes under /dashboard/g/[guildId]',
              'Server actions + Zod-validated settings',
              'Ops: ATM queue, reports, health, audits',
            ]}
          />
          <ProjectSubPageInfoCard
            title="Shared package"
            icon={Layers}
            iconColor="text-purple-400"
            items={[
              'Mongoose models & indexes',
              'Zod form schemas for dashboard editors',
              'RTP helpers, validators, defaults',
              'Domain services both apps import',
            ]}
          />
        </div>

        <ProjectSubPageFlowDiagram
          steps={[
            'Slash command / dashboard action',
            'Shared validation & guild config',
            'MongoDB session write',
            'Discord embed or web UI update',
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Layers, color: 'text-purple-400' }}
        title="Domain subpath exports"
        id="shared-exports"
      >
        <ProjectSubPageParagraph>
          The shared package is organized by domain, not by “utils dump.”
          Consumers import only what they need, e.g.{' '}
          <code className="text-xs">gambling-bot-shared/casino</code> or{' '}
          <code className="text-xs">gambling-bot-shared/quests</code> so the
          public surface stays intentional as the system grew.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Economy & users: ./user, ./transactions, ./atm, ./pay, ./bonus',
            'Casino: ./casino plus game modules (./blackjack, ./baccarat, ./mines, ./roulette, ./slots, …)',
            'Engagement: ./vip, ./predictions, ./raffle, ./quests',
            'Guild ops: ./guild (GuildConfiguration, defaults, global settings)',
            'Infra helpers: ./mongoose, ./common, ./dev',
          ]}
        />

        <ProjectSubPageParagraph>
          Inside those domains live the contracts both apps must share:
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Models & indexes: User, Transaction, GuildConfiguration, Prediction, VipRoom, AtmRequest, Raffle, quest progress, plus session docs (BlackjackGame, Baccarat, Mines, Hi-Lo, Plinko, Roulette, Slots, …).',
            'Defaults & labels: defaultCasinoSettings, readableGameNames / readableGameValueNames for admin form copy.',
            'Zod forms: casino settings (including nested side-bet records), channels, bonus, VIP, pay, manager role, moderation, and more.',
            'Utilities: calculateRTP (per game + side bets), calculateBonusReward, generateBonusPreview, validateBetAmount, validatePredictionBet, fair mines/hilo multipliers.',
            'Constants: European roulette layout (0-36), lottery draw sizes, baccarat 8-deck probs, transaction type/source enums.',
          ]}
        />

        <Alert
          type="note"
          title="Publish workflow"
          description="gambling-bot-shared versions independently. Bot and admin pin the same package version so schema migrations and RTP changes ship together. Local workspaces link the package for day-to-day development."
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Database, color: 'text-amber-400' }}
        title="Why shared beats duplication"
        id="anti-drift"
      >
        <ProjectSubPageParagraph>
          Early on, types and payout rules lived in the bot. The dashboard then
          needed the same shapes for forms and RTP previews. Copy-paste would
          have worked for a weekend demo, and failed the first time a multiplier
          changed in one place only.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'One GuildConfiguration model drives Discord channel checks and dashboard settings forms.',
            'calculateRTP and game defaults power both slash-command help and live RTP headers in the admin UI.',
            'Zod schemas validate dashboard saves; the bot trusts the same shape when reading config from MongoDB.',
            'Guild settings sync worker refreshes cached config so long-running bot processes stay aligned with dashboard writes.',
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Workflow, color: 'text-violet-400' }}
        title="Runtime shape"
        id="runtime"
      >
        <ProjectSubPageBulletList
          items={[
            'Bot: CommandKit app with services per domain (casino, atm, vip, predictions, raffles, quests, moderation, guild, discord).',
            'Admin: feature folders (general / manage / settings / dev) over Next.js App Router + server actions + TanStack Table.',
            'Shared MongoDB: users scoped per guild; session documents for interactive games (blackjack, baccarat, mines, hi-lo, plinko, roulette, slots); append-only transactions.',
            'Generated catalogs: docs/COMMANDS_STRUCTURE.txt and docs/WORKERS_STRUCTURE.txt mirror the live slash-command tree and worker schedule.',
            'Structured logging (Pino) on the bot; Vitest + mongodb-memory-server across repos; pnpm check (format, lint, types, coverage).',
            'Local linking scripts keep all three repos on one shared package during development; CI publishes shared independently.',
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageExternalLinks
        items={[
          {
            label: 'gambling-bot-shared',
            href: GAMBLING_HUB_LINKS.shared,
            description: 'Domain package - models, schemas, RTP.',
          },
          {
            label: 'gambling-bot-discord',
            href: GAMBLING_HUB_LINKS.discord,
          },
          {
            label: 'gambling-bot-admin',
            href: GAMBLING_HUB_LINKS.admin,
          },
        ]}
      />

      <ProjectSubPagePrevNext
        prev={prev ? { title: prev.title, href: prev.href } : null}
        next={next ? { title: next.title, href: next.href } : null}
      />
    </>
  )
}

export default ArchitecturePage
