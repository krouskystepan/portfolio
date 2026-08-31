import {
  CircleDollarSign,
  FileText,
  Rocket,
  TestTube2,
  Workflow,
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

const { prev, next } = getChapterNeighbors('reliability')

const ReliabilityPage = () => {
  return (
    <>
      <ProjectCaseStudyBreadcrumb
        projectId="discord-gambling-hub"
        chapter="Testing & Reliability"
      />

      <header className="mb-8">
        <ProjectSubPageTag text="Chapter 6" />
        <ProjectSubPageTitle title="Testing & Reliability" />
        <ProjectSubPageDescription
          description="A Discord-first financial surface fails in ways a typical web app does not. Background workers close abandoned sessions, reconciliation recovers stuck locks, and Vitest covers the math and ledger paths both apps share. CI gates merges, the shared package auto-publishes to npm, and the bot redeploys to a VPS under PM2 so production does not stay down."
        />
      </header>

      <ProjectSubPageFigure
        alt="Worker schedule and reliability checks"
        src="/images/projects/discord-gambling-hub/reliability-workers-tests.png"
        caption="Worker schedule and reliability checks from the ops tooling."
      />

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Rocket, color: 'text-sky-400' }}
        title="CI, release & VPS deploy"
        id="deploy"
      >
        <ProjectSubPageParagraph>
          Ops reliability is not only workers and tests. The three-repo split
          has an explicit ship path: quality gates on every PR, automatic npm
          publish for shared, and SSH deploy of the Discord bot to a VPS under
          PM2. (The admin panel is a separate web deploy and is not the focus
          here.)
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'gambling-bot-discord PRs: GitHub Actions runs coverage, Prettier, ESLint, tsc, build, and Vitest before merge.',
            'Push to main triggers deploy: Actions opens SSH to the VPS (retries on flaky connections) and runs the host deploy script as a dedicated deploy user.',
            'Production process is PM2 (ecosystem.config.cjs): fork mode, autorestart, 300M memory restart, logs under /var/log/gambling-bot, env loaded from a path outside the app tree.',
            'Deploy updates the app and reloads the supervised process so the bot does not stay offline - PM2 keeps it alive and brings it back under the same service definition.',
            'gambling-bot-shared: version bump → merge main → release workflow runs checks, builds, and publishes to npm (skips if that version is already on the registry). Consumers bump the dependency when ready.',
            'Shared bump script (pnpm bump) + CI release keeps Discord and admin on the same published package instead of drifting private copies.',
          ]}
        />

        <Alert
          type="info"
          title="Why this belongs in the case study"
          description="A casino bot that is correct in tests but dies for minutes on every release still loses money and trust. Supervised VPS deploys and an npm release train are part of the reliability story, not side chores."
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Workflow, color: 'text-violet-400' }}
        title="Background workers"
        id="workers"
      >
        <ProjectSubPageParagraph>
          Long-running Discord bots cannot rely on players to finish every
          session. A shared <code className="text-xs">runWorkerLoop</code>{' '}
          scheduler starts on clientReady and runs idempotent jobs on intervals
          defined in <code className="text-xs">workerDefinitions.ts</code>.
          Optional worker-log channels surface what ran. The full schedule is
          cataloged in <code className="text-xs">docs/WORKERS_STRUCTURE.txt</code>.
        </ProjectSubPageParagraph>

        <div className="grid gap-4 sm:grid-cols-2">
          <ProjectSubPageInfoCard
            title="Economy & engagement"
            icon={Workflow}
            iconColor="text-violet-300"
            className="h-full"
            items={[
              'VIP expiry warning + expiration (~1 min).',
              'Prediction autolock (~1 min).',
              'Raffle auto-draw (~1 min) with reschedule.',
              'Guild settings sync (~6h) - normalize configs.',
              'Ban role sync (~6h) - Discord roles vs DB.',
              'Guild orphan cleanup (~1d) - left guilds.',
            ]}
          />
          <ProjectSubPageInfoCard
            title="Session recovery"
            icon={CircleDollarSign}
            iconColor="text-amber-300"
            className="h-full"
            items={[
              'In-flight recovery (~1 min) - finish or refund after crash.',
              'Idle nudge / close for table games (~3h / ~24h).',
              'Blackjack autostand on stalled hands.',
              'Mines auto-resolve: cash out or forfeit.',
              'Hi-Lo idle: nudge, cash-out, or auto-guess.',
              'Lock reconciliation (~15m) - clear stuck locks.',
            ]}
          />
        </div>
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: FileText, color: 'text-blue-400' }}
        title="Command & worker catalogs"
        id="catalogs"
      >
        <ProjectSubPageParagraph>
          The Discord repo keeps machine-readable docs next to the code so the
          player/mod surface and the background schedule stay reviewable without
          spelunking folders.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            <>
              <code className="text-xs">docs/COMMANDS_STRUCTURE.txt</code> -
              full slash-command tree: player (misc) ATM / casino / utils vs mod
              auth, setup-*, events, and ops tools (ban, history, manage-balance,
              money-manager, …).
            </>,
            <>
              <code className="text-xs">docs/WORKERS_STRUCTURE.txt</code> -
              every job with interval, start delay, and a one-line purpose (from
              VIP expiry to plinko idle close).
            </>,
            'Generated / updated from the live CommandKit command tree and workerDefinitions so docs do not quietly drift from production behavior.',
            'Dev helpers (/mock-db, /mock-worker-db, /clear-mock-db) seed users, MockUserProfile avatars, and intentionally broken state for admin UI and workers.',
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: TestTube2, color: 'text-teal-400' }}
        title="Testing & quality"
        id="testing"
      >
        <ProjectSubPageParagraph>
          Correctness is part of the product. All three repos run Vitest (unit +
          integration where relevant), ESLint, Prettier, and{' '}
          <code className="text-xs">tsc --noEmit</code> via{' '}
          <code className="text-xs">pnpm check</code>.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Unit: blackjack/baccarat/mines/hilo engines (incl. continuous streak settle), European roulette planSpin/infer, plinko path/render, RTP helpers (incl. side bets), bet validation, cooldowns, slip merge helpers.',
            'Integration: casinoBet sessions, plinko session DB + recovery, daily bonus claims, prediction bets, raffle DB, VIP DB, workers (autolock, raffle draw, blackjack autostand, idle resolve).',
            'mongodb-memory-server for hermetic database tests.',
            'Shared package tests cover domain math used by both bot and admin (incl. roulette win/RTP over the European wheel).',
            'Moderator simulate / audit scripts for economy stress and jackpot-style math checks.',
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: CircleDollarSign, color: 'text-red-400' }}
        title="Hard problems"
        id="challenges"
      >
        <ProjectSubPageParagraph>
          Building a Discord-first financial surface forces trade-offs a typical
          web app does not hit as hard.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Concurrency - MongoDB transactions + unique betId indexes prevent double-spend and duplicate settlement when users spam interactions.',
            'Dual balance - bonus-first bet consumption and locked balance keep withdrawable cash honest while still rewarding streak/quest play.',
            'Abandoned sessions - multi-step Discord UIs (blackjack splits, baccarat slips, mines boards, plinko drop batches, hi-lo streaks) need idle workers, in-flight recovery, and lock reconciliation.',
            'Config drift - central package + Zod schemas + guild sync worker keep bot memory and dashboard writes aligned.',
            'Permission model - dashboard distinguishes Discord Administrator vs configured manager role; settings UI hidden from limited managers.',
            'RP safety - gated ATM and audited staff actions document every sensitive balance change for moderator review.',
            'Multi-bet complexity - slips and multi-hand blackjack must lock the right totals, settle line-by-line, and still refund cleanly on cancel/idle close.',
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageExternalLinks
        title="Repos & community"
        items={[
          {
            label: 'gambling-bot-discord',
            href: GAMBLING_HUB_LINKS.discord,
            description: 'Bot + workers + command/worker docs + integration tests.',
          },
          {
            label: 'gambling-bot-shared',
            href: GAMBLING_HUB_LINKS.shared,
            description: 'Shared domain math and models under test.',
          },
          {
            label: 'gambling-bot-admin',
            href: GAMBLING_HUB_LINKS.admin,
          },
          {
            label: 'Public Discord',
            href: GAMBLING_HUB_LINKS.community,
          },
        ]}
      />

      <Alert
        type="info"
        title="Scope"
        description="The platform is complete for its current product surface. New games or dashboard panels can still be added, but the multi-repo architecture, economy, casino sessions, engagement systems, workers, and admin ops are in place."
      />

      <ProjectSubPagePrevNext
        prev={prev ? { title: prev.title, href: prev.href } : null}
        next={next ? { title: next.title, href: next.href } : null}
      />
    </>
  )
}

export default ReliabilityPage
