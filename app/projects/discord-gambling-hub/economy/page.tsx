import {
  CircleDollarSign,
  Database,
  HandCoins,
  Lock,
  ShieldAlert,
} from 'lucide-react'
import Alert from '@/components/Alert'
import {
  ProjectCaseStudyBreadcrumb,
  ProjectSubPageBulletList,
  ProjectSubPageDescription,
  ProjectSubPageExternalLinks,
  ProjectSubPageFigure,
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

const { prev, next } = getChapterNeighbors('economy')

const EconomyPage = () => {
  return (
    <>
      <ProjectCaseStudyBreadcrumb
        projectId="discord-gambling-hub"
        chapter="Economy"
      />

      <header className="mb-8">
        <ProjectSubPageTag text="Chapter 2" />
        <ProjectSubPageTitle title="Economy & Trust" />
        <ProjectSubPageDescription
          description="A Discord casino is only interesting if the ledger is honest. Balances split into buckets, every movement leaves an immutable transaction, and ATM deposits/withdrawals require human approval, especially important for RP servers that map virtual cash to in-game currency."
        />
      </header>

      <ProjectSubPageFigure
        alt="Transaction log and balance buckets"
        caption="Economy surfaces: transactions table or ATM queue in the admin dashboard."
        filenameHint="economy-transactions.png"
      />

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Database, color: 'text-amber-400' }}
        title="Balance model"
        id="balances"
      >
        <ProjectSubPageParagraph>
          Users are scoped per guild. Funds are not a single number. Buckets keep
          bonuses, withdrawable cash, and open exposure separable.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            <>
              <code className="text-xs">balance</code> - withdrawable cash. ATM
              withdrawals only touch this bucket.
            </>,
            <>
              <code className="text-xs">bonusBalance</code> - non-withdrawable
              rewards from daily bonus, quests, and admin grants; consumed first
              on casino bets.
            </>,
            <>
              <code className="text-xs">lockedBalance</code> - reserved while a
              bet or multi-bet session is open; released on settle, refund, or
              recovery workers.
            </>,
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: CircleDollarSign, color: 'text-yellow-400' }}
        title="Immutable transaction log"
        id="transactions"
      >
        <ProjectSubPageParagraph>
          Every meaningful money move appends a{' '}
          <code className="text-xs">Transaction</code> document: type (deposit,
          withdraw, bet, win, refund, bonus, vip, transfer, …), source (command,
          manual, web, system, casino), optional{' '}
          <code className="text-xs">betId</code> / session references, and
          enough metadata for PnL and staff review.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            <>
              Casino bets use <code className="text-xs">reserveCasinoBet</code>{' '}
              / <code className="text-xs">settleCasinoWinnings</code> inside
              MongoDB multi-document transactions.
            </>,
            'Duplicate betId settlement is rejected so spam-clicks cannot double-pay.',
            'Bonus balance is consumed before cash; locked balance tracks open exposure until settle or refund.',
            'Dashboard transactions table: type/source/date filters, search, cash-flow and game PnL summary panels.',
            'Staff actions from the web are audited separately from raw ledger rows (who changed what, when).',
            'Session bet reference ids keep multi-hand / multi-bet rounds correlatable in the ledger.',
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: ShieldAlert, color: 'text-rose-400' }}
        title="Gated ATM"
        id="atm"
      >
        <ProjectSubPageParagraph>
          Deposits and withdrawals are request-based. Players open an ATM
          request in Discord; moderators approve or deny in Discord or via the
          admin ATM queue. The bot never silently mints or burns “real”
          in-game-mapped currency.
        </ProjectSubPageParagraph>

        <Alert
          type="warning"
          title="RP safety"
          description="Register, deposit, withdraw, bonus grant, and balance reset are explicit staff actions. That audit trail matters when virtual balances map to GTA RP (or similar) economies."
        />

        <ProjectSubPageBulletList
          className="mt-4"
          items={[
            'AtmRequest documents track pending approvals.',
            'Dashboard ATM queue for managers who prefer tables over channel embeds.',
            'Channel bindings for ATM actions/logs in guild configuration.',
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: HandCoins, color: 'text-sky-400' }}
        title="Player pay"
        id="pay"
      >
        <ProjectSubPageParagraph>
          <code className="text-xs">/pay</code> moves cash between registered
          users with guild-configurable fee percent, min/max amounts, and
          optional daily transfer caps (timezone-aware). Fees are burned from
          the sender so peer transfers stay economically controlled.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Shared pay settings defaults + dashboard Pay settings form.',
            'Gross debit / net credit split keeps fee accounting explicit in the ledger.',
            'Hard floor remains enforced even when minAmount is configured as uncapped.',
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Lock, color: 'text-violet-400' }}
        title="Locks & reconciliation"
        id="locks"
      >
        <ProjectSubPageParagraph>
          Interactive games (blackjack, baccarat, mines, hilo, slots, roulette)
          can leave money locked if a player walks away mid-session. Workers
          exist specifically for that failure mode, not as an afterthought.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'lockedBalanceReconciliation - finds stuck locks and restores consistency.',
            'casinoInFlightRecovery - recovers interrupted in-flight casino sessions.',
            'Per-game idle close / nudge / auto-resolve jobs for abandoned interactive UIs.',
            'Ban flows can sync Discord roles while preserving ledger integrity.',
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageExternalLinks
        items={[
          {
            label: 'gambling-bot-shared (transactions / atm / pay)',
            href: GAMBLING_HUB_LINKS.shared,
          },
          {
            label: 'Public Discord',
            href: GAMBLING_HUB_LINKS.community,
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

export default EconomyPage
