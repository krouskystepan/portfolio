import {
  CircleDollarSign,
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
          description="A Discord-first financial surface fails in ways a typical web app does not. Background workers close abandoned sessions, reconciliation recovers stuck locks, and Vitest covers the math and ledger paths both apps share."
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
          scheduler starts on clientReady and runs idempotent jobs on intervals.
          Optional worker-log channels surface what ran.
        </ProjectSubPageParagraph>

        <div className="grid gap-4 sm:grid-cols-2">
          <ProjectSubPageInfoCard
            title="Economy & engagement"
            icon={Workflow}
            iconColor="text-violet-300"
            items={[
              'VIP expiration (~1 min) + expiry warning before lapse.',
              'Prediction autolock (~1 min).',
              'Raffle auto-draw (~1 min) with recurring reschedule.',
              'Guild settings sync (hours) - refresh cached config from MongoDB.',
              'banRoleSync, guildOrphanCleanup.',
            ]}
          />
          <ProjectSubPageInfoCard
            title="Session recovery"
            icon={CircleDollarSign}
            iconColor="text-amber-300"
            items={[
              'Idle nudge (~3h) + idle close (~24h) for blackjack, baccarat, mines, hilo, roulette, slots.',
              'Blackjack autostand on long-stalled hands (declines stuck insurance).',
              'Mines auto-resolve: cash out if any safe reveals, else forfeit.',
              'Hi-Lo timeout (~1h): cash out or safest auto-guess then cash out.',
              'casinoInFlightRecovery + lockedBalanceReconciliation for stuck money / mid-deal state.',
            ]}
          />
        </div>
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
            'Unit: blackjack/baccarat/mines/hilo engines, roulette math, plinko path/render, RTP helpers (incl. side bets), bet validation, cooldowns, slip merge helpers.',
            'Integration: casinoBet sessions, daily bonus claims, prediction bets, raffle DB, VIP DB, workers (autolock, raffle draw, blackjack autostand, idle resolve).',
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
            'Abandoned sessions - multi-step Discord UIs (blackjack splits, baccarat slips, mines boards) need idle workers, in-flight recovery, and lock reconciliation.',
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
            description: 'Bot + workers + integration tests.',
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
