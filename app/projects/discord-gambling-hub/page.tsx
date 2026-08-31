import { Gamepad2, Globe, Layers, Server, Terminal } from 'lucide-react'
import Alert from '@/components/Alert'
import {
  ProjectCaseStudyBreadcrumb,
  ProjectSubPageBulletList,
  ProjectSubPageChapterNav,
  ProjectSubPageDescription,
  ProjectSubPageExternalLinks,
  ProjectSubPageFigure,
  ProjectSubPageFlowDiagram,
  ProjectSubPageInfoCard,
  ProjectSubPageParagraph,
  ProjectSubPageSectionLayout,
  ProjectSubPageTag,
  ProjectSubPageTitle
} from '@/components/SubPageComponents'
import { GAMBLING_HUB_CHAPTERS, GAMBLING_HUB_LINKS } from './_data/chapters'

const GamblingBotHubPage = () => {
  return (
    <>
      <ProjectCaseStudyBreadcrumb projectId="discord-gambling-hub" />

      <header className="mb-8">
        <ProjectSubPageTag text="Case Study" />
        <ProjectSubPageTitle title="Discord Gambling Hub" />
        <ProjectSubPageDescription
          description={`A multi-repo virtual economy and casino platform for Discord communities: configurable games, gated ATM deposits, predictions, raffles, VIP rooms, quests, and a Next.js admin panel.\nBuilt as three applications: Discord bot, admin dashboard, and a shared NPM package. Schemas, math, and configuration never drift between Discord and the web.`}
        />
      </header>

      <Alert
        type="info"
        title="Status"
        description="Shipped for the current scope: multi-repo economy and casino, European roulette, interactive sessions, engagement systems, admin ops, presentation demo, workers, CI/VPS deploy, and Vitest coverage. Core platform is complete."
      />

      <ProjectSubPageFigure
        alt="Discord Gambling Hub overview"
        src="/images/projects/discord-gambling-hub/hub-overview.png"
        caption="Discord bot and admin dashboard overview."
      />

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Gamepad2, color: 'text-blue-400' }}
        title="How it grew"
        id="evolution"
      >
        <ProjectSubPageParagraph>
          The project did not start as a three-repo platform. It grew in layers
          as the problem got harder:
        </ProjectSubPageParagraph>

        <ProjectSubPageFlowDiagram
          steps={[
            'Discord bot & casino commands',
            'Next.js admin panel',
            'Shared NPM package',
            'Full multi-app ecosystem'
          ]}
        />

        <ProjectSubPageBulletList
          items={[
            'Phase 1 - Discord bot: slash commands, virtual currency, and early casino games living in one Node process.',
            'Phase 2 - Admin dashboard: guild managers needed tables, settings, and ATM approval without digging through Discord embeds.',
            'Phase 3 - Shared package: duplicated schemas and payout math were a drift risk, so models, Zod forms, and RTP helpers moved into gambling-bot-shared.',
            'Phase 4 - Ecosystem: interactive multi-bet games, quests, pay, workers for abandoned sessions, audits, and per-game ops controls.'
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Gamepad2, color: 'text-sky-400' }}
        title="Motivation & goals"
        id="motivation"
      >
        <ProjectSubPageParagraph>
          The target was a persistent, auditable casino in Discord - deeper than
          one-off fun commands. Moderators tune the economy without redeploying;
          players get transparent rules, history, and fair odds.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Per-guild virtual currency with immutable transaction logs and admin-approved deposits/withdrawals (suited to RP servers).',
            'Configurable casino games with computed RTP, not magic numbers - including multi-bet interactive sessions.',
            'Engagement systems: daily bonuses, VIP rooms, predictions, raffles, and quests.',
            'A web dashboard for managers to inspect users, cash flow, ATM queues, health, and settings.',
            'One shared TypeScript package so bot and dashboard never disagree on schemas or math.'
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Server, color: 'text-emerald-400' }}
        title="System at a glance"
        id="snapshot"
      >
        <ProjectSubPageParagraph>
          Each app deploys independently and talks to the same MongoDB. The bot
          owns gameplay and Discord side effects; the dashboard owns OAuth,
          forms, and ops views; the shared package owns the rules both must
          agree on.
        </ProjectSubPageParagraph>

        <div className="grid gap-5 sm:grid-cols-3">
          <ProjectSubPageInfoCard
            title="Discord Bot"
            icon={Terminal}
            iconColor="text-blue-400"
            items={[
              'discord.js v14 + CommandKit',
              'Casino, ATM, VIP, predictions, raffles, quests, mod tools',
              'Background workers for sessions & economy hygiene',
              'Vitest + mongodb-memory-server'
            ]}
          />
          <ProjectSubPageInfoCard
            title="Shared Package"
            icon={Layers}
            iconColor="text-purple-400"
            items={[
              'Domain subpath exports (casino, vip, quests, …)',
              'Mongoose models + Zod form schemas',
              'RTP math, bet validators, defaults',
              'Versioned independently; bot & admin pin together'
            ]}
          />
          <ProjectSubPageInfoCard
            title="Admin Dashboard"
            icon={Globe}
            iconColor="text-emerald-400"
            items={[
              'Next.js 16, React 19, Tailwind 4',
              'Discord OAuth + guild-scoped access',
              'Users, ATM queue, reports, health, audits',
              'Live RTP while editing casino settings'
            ]}
          />
        </div>
      </ProjectSubPageSectionLayout>

      <ProjectSubPageChapterNav
        title="Deep dives"
        items={GAMBLING_HUB_CHAPTERS.map((c) => ({
          title: c.title,
          summary: c.summary,
          href: c.href
        }))}
      />

      <ProjectSubPageExternalLinks
        items={[
          {
            label: 'gambling-bot-discord',
            href: GAMBLING_HUB_LINKS.discord,
            description: 'Discord bot - slash commands, workers, gameplay.'
          },
          {
            label: 'gambling-bot-admin',
            href: GAMBLING_HUB_LINKS.admin,
            description: 'Admin panel - config, tables, ATM queue, reports.'
          },
          {
            label: 'gambling-bot-shared',
            href: GAMBLING_HUB_LINKS.shared,
            description: 'Shared package - models, schemas, RTP, domain logic.'
          },
          {
            label: 'Public Discord community',
            href: GAMBLING_HUB_LINKS.community,
            description: 'Try the bot and follow development updates.'
          }
        ]}
      />

      <section className="mt-4 border-t border-neutral-800 pt-8">
        <p className="text-sm text-neutral-400">
          Hiring-oriented case study: architecture and product decisions, not a
          setup guide. Screenshots: add files under{' '}
          <code className="text-xs">
            public/images/projects/discord-gambling-hub/
          </code>{' '}
          using the filename hints on each figure placeholder.
        </p>
      </section>
    </>
  )
}

export default GamblingBotHubPage
