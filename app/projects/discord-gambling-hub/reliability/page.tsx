import {
  CircleDollarSign,
  FileText,
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
          description="A Discord-first financial surface fails in ways a typical web app does not. Background workers close abandoned sessions, reconciliation recovers stuck locks, and Vitest covers the math and ledger paths both apps share. The bot also ships generated catalogs of every slash command and worker job."
        />
      </header>

      <ProjectSubPageFigure
        alt="Worker logs or test coverage overview"
        caption="Reliability surfaces: worker log channel, health panel, or CI check output."
        filenameHint="reliability-workers-tests.png"
      />

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
            title="Economy & engagement (~1m / 6h / 1d)"
            icon={Workflow}
            iconColor="text-violet-300"
            items={[
              'VIP expiry warning + VIP expiration (~1 min).',
              'Prediction autolock (~1 min).',
              'Raffle auto-draw (~1 min) with recurring reschedule.',
              'Guild settings sync (~6h) - backfill/normalize older configs.',
              'Ban role sync (~6h) - Discord banned roles vs DB ban state.',
              'Guild orphan cleanup (~1d) - purge data for guilds the bot left.',
            ]}
          />
          <ProjectSubPageInfoCard
            title="Session recovery"
            icon={CircleDollarSign}
            iconColor="text-amber-300"
            items={[
              'Casino in-flight recovery (~1 min) - finish or refund mid-deal/spin after crash.',
              'Idle nudge + idle close for blackjack, baccarat, mines, roulette, slots, plinko (~1h jobs; ~3h nudge / ~24h close).',
              'Blackjack autostand on long-stalled hands (declines stuck insurance).',
              'Mines auto-resolve: cash out if any safe reveals, else forfeit.',
              'Hi-Lo: DM after ~30m waiting; timeout (~1h) cash-out or safest auto-guess; idle-close abandoned tables (~24h).',
              'Locked balance reconciliation (~15m) - unlock leftovers that no longer match an active bet.',
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
            'Dev helpers (/mock-db, /mock-worker-db, /clear-mock-db) seed realistic or intentionally broken state to exercise admin UI and workers.',
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
            'Unit: blackjack/baccarat/mines/hilo engines (incl. continuous streak settle), roulette math, plinko path/render, RTP helpers (incl. side bets), bet validation, cooldowns, slip merge helpers.',
            'Integration: casinoBet sessions, plinko session DB + recovery, daily bonus claims, prediction bets, raffle DB, VIP DB, workers (autolock, raffle draw, blackjack autostand, idle resolve).',
            'mongodb-memory-server for hermetic database tests.',
            'Shared package tests cover domain math used by both bot and admin.',
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
