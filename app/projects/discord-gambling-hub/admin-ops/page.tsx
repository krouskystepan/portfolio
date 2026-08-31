import {
  BarChart3,
  Presentation,
  Settings2,
  ShieldCheck,
  Users,
} from 'lucide-react'
import Alert from '@/components/Alert'
import {
  ProjectCaseStudyBreadcrumb,
  ProjectSubPageBulletList,
  ProjectSubPageDescription,
  ProjectSubPageExternalLinks,
  ProjectSubPageFigure,
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

const { prev, next } = getChapterNeighbors('admin-ops')

const AdminOpsPage = () => {
  return (
    <>
      <ProjectCaseStudyBreadcrumb
        projectId="discord-gambling-hub"
        chapter="Admin & Ops"
      />

      <header className="mb-8">
        <ProjectSubPageTag text="Chapter 5" />
        <ProjectSubPageTitle title="Admin Dashboard & Ops" />
        <ProjectSubPageDescription
          description="The dashboard is the ops console for the ecosystem: Discord OAuth, guild-scoped permissions, settings forms backed by shared Zod schemas, ATM queues, audits, health, and reports. Workers, tests, and failure-mode design are covered in the next chapter."
        />
      </header>

      <ProjectSubPageFigure
        alt="Admin dashboard overview"
        src="/images/projects/discord-gambling-hub/admin-overview.png"
        caption="Admin dashboard overview with guild snapshot and health signals."
        priority
      />

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: ShieldCheck, color: 'text-emerald-400' }}
        title="Access model"
        id="access"
      >
        <ProjectSubPageParagraph>
          After Discord OAuth (NextAuth), users pick a guild where they are
          Administrator or hold the configured manager role. Routes live under{' '}
          <code className="text-xs">/dashboard/g/[guildId]/…</code> with gates
          for bot presence, role checks, and Discord API rate-limit handling.
          Settings UIs can be limited so managers who only need users /
          transactions never see dangerous knobs.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Guild picker after login - only guilds where access is allowed.',
            'Manager role is itself a guild setting - configurable without redeploy.',
            'Discord Administrator vs manager distinction keeps day-to-day ops safer.',
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: BarChart3, color: 'text-blue-400' }}
        title="General & manage surfaces"
        id="surfaces"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <ProjectSubPageInfoCard
            title="General"
            icon={BarChart3}
            iconColor="text-emerald-300"
            className="h-full"
            items={[
              'Overview - guild snapshot and quick health signals.',
              'System health - runtime / config checks (incl. casino side bets).',
              'Transactions - filters, search, cash-flow and game PnL panels.',
              'Reports - exportable ops views.',
              'Staff actions & settings-change audits - who changed what.',
            ]}
          />
          <ProjectSubPageInfoCard
            title="Manage"
            icon={Users}
            iconColor="text-blue-300"
            className="h-full"
            items={[
              'Users - register/unregister, deposit, withdraw, bonus, reset.',
              'ATM approval queue - approve/deny deposit & withdraw requests.',
              'VIPs - active VIP channels table.',
              'Predictions, raffles, quests - create/inspect from the web.',
              'Bans & moderation - ban table and Discord role sync.',
            ]}
          />
        </div>
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Settings2, color: 'text-amber-400' }}
        title="Settings (Zod-backed)"
        id="settings"
      >
        <ProjectSubPageParagraph>
          Settings forms validate through shared Zod schemas so the dashboard
          cannot save shapes the bot cannot read. Saves go through server
          actions into the same GuildConfiguration the bot consumes.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Channels - ATM, casino, prediction, raffle, worker-log bindings.',
            'Global / manager role - who can open the dashboard beyond Discord Administrator.',
            'VIP - pricing, roles, category, multi-member fees.',
            'Bonuses - streak model + live calendar preview.',
            'Pay - fee percent, min/max, daily transfer caps.',
            'Moderation - guild moderation knobs.',
            'Casino accordion - every game with enable toggle, bet limits, multipliers, nested side-bet editors, and live RTP headers (warnings when RTP ≤ 90% or ≥ 100%).',
          ]}
        />

        <ProjectSubPageFigure
          alt="Casino settings with RTP preview"
          src="/images/projects/discord-gambling-hub/admin-casino-settings.png"
          caption="Casino settings accordion: per-game enable flags and live RTP."
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Presentation, color: 'text-rose-400' }}
        title="Presentation / demo mode"
        id="presentation"
      >
        <ProjectSubPageParagraph>
          The admin app ships an always-on read-only demo at{' '}
          <code className="text-xs">/present/*</code> in the same deploy - not a
          second site. A sentinel demo guild and an internal presentation header
          feed synthetic session + fixture data so reviewers can walk the full UI
          without Discord OAuth or production guild access.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Reads come from static fixtures (guild, members, transactions, ATM queue, health, audits) with realistic avatars.',
            'Writes are blocked with rejectDemoMutation / assertNotDemoMutation so demo never mutates real data.',
            'Bot-side /mock-db seeds parallel mock users and MockUserProfile docs (usernames + avatar URLs) for local/dev dashboards.',
            'Next image config allows the avatar host so presentation and mock tables render real portraits instead of broken images.',
          ]}
        />

        <Alert
          type="note"
          title="Public casino overview"
          description="Guilds can also expose a read-only /[guildId] casino card view (bets, multipliers, RTP) for transparent house rules without full dashboard access."
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageExternalLinks
        title="Repos & community"
        items={[
          {
            label: 'gambling-bot-admin',
            href: GAMBLING_HUB_LINKS.admin,
            description: 'Next.js admin panel.',
          },
          {
            label: 'gambling-bot-discord',
            href: GAMBLING_HUB_LINKS.discord,
            description: 'Bot + workers.',
          },
          {
            label: 'gambling-bot-shared',
            href: GAMBLING_HUB_LINKS.shared,
            description: 'Shared domain package.',
          },
          {
            label: 'Public Discord',
            href: GAMBLING_HUB_LINKS.community,
            description: 'Explore the live system.',
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

export default AdminOpsPage
