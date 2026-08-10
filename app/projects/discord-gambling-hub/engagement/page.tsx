import {
  BarChart3,
  Clock,
  Gift,
  Lock,
  Trophy,
  Users,
} from 'lucide-react'
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

const { prev, next } = getChapterNeighbors('engagement')

const EngagementPage = () => {
  return (
    <>
      <ProjectCaseStudyBreadcrumb
        projectId="discord-gambling-hub"
        chapter="Engagement"
      />

      <header className="mb-8">
        <ProjectSubPageTag text="Chapter 4" />
        <ProjectSubPageTitle title="Engagement Systems" />
        <ProjectSubPageDescription
          description="Retention is more than another game. Daily bonus streaks, VIP rooms, predictions markets, scheduled raffles, and quests keep guilds active between casino rounds, still on the same ledger and guild configuration."
        />
      </header>

      <ProjectSubPageFigure
        alt="VIP room or quests UI"
        caption="Engagement surfaces: VIP settings, quest board, raffle channel, or prediction market."
        filenameHint="engagement-vip-quests.png"
      />

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Clock, color: 'text-amber-400' }}
        title="Daily bonus & streaks"
        id="bonus"
      >
        <ProjectSubPageParagraph>
          Per-guild <code className="text-xs">bonusSettings</code> control
          linear or exponential streak growth, caps, reset-on-max, and weekly /
          monthly milestones. Rewards credit{' '}
          <code className="text-xs">bonusBalance</code> only, keeping farmed value
          inside the casino economy.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            '/bonus check - 28-day preview calendar (shared generateBonusPreview).',
            '/bonus claim - 24h cooldown enforced in DB; streak + transaction logged.',
            'Linear or exponential streak growth, caps, reset-on-max, weekly/monthly milestones - all guild-configurable.',
            'Dashboard bonus form with live calendar preview when editing settings.',
            'Admins can grant or revoke bonus balance from the users table without touching withdrawable cash.',
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Lock, color: 'text-rose-400' }}
        title="VIP rooms"
        id="vip"
      >
        <ProjectSubPageParagraph>
          Players buy private Discord channels for a duration. Config covers
          category, owner/member roles, pricing per day, creation fee, and
          multi-member support (maxMembers, pricePerAdditionalMember) so rooms
          can be shared without ad-hoc permission edits.
        </ProjectSubPageParagraph>

        <div className="grid gap-5 sm:grid-cols-2">
          <ProjectSubPageInfoCard
            title="Purchase & extend"
            icon={Users}
            iconColor="text-rose-300"
            items={[
              '/vip buy and /vip extend with atomic balance checks.',
              'reserveVipPurchase / finalizeVipPurchase mirrors casino bet locking.',
              'VipRoom documents + VIP transactions track expiry and ownership.',
              'Mod /manage-vip tooling for staff overrides when needed.',
            ]}
          />
          <ProjectSubPageInfoCard
            title="Lifecycle"
            icon={Trophy}
            iconColor="text-yellow-300"
            items={[
              '/vip add-member and remove-member with Discord permission updates.',
              'On expiry: channel stays, write access revoked (not a hard delete).',
              'vipExpiration worker (~1 min) + vipExpiryWarning before lapse.',
              'Dashboard VIP settings form + active VIP channels table.',
            ]}
          />
        </div>
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: BarChart3, color: 'text-indigo-400' }}
        title="Predictions"
        id="predictions"
      >
        <ProjectSubPageParagraph>
          Moderators run parimutuel-style event markets: create a prediction with
          up to three choices and odds, players bet in-channel, optional
          autolock, then resolve or cancel with full refunds. Shared
          validatePredictionBet keeps bot and tests aligned on stake rules.
        </ProjectSubPageParagraph>

        <ProjectSubPageFlowDiagram
          steps={[
            'Moderator creates prediction',
            'Players place bets',
            'Autolock (optional)',
            'Resolve or cancel',
            'Payouts / refunds + ledger',
          ]}
        />

        <ProjectSubPageBulletList
          className="mt-4"
          items={[
            'Dedicated prediction action/log channels in guild configuration.',
            'predictionAutolock worker (~1 min) closes betting at the configured time.',
            'Win payout: stake x odds; cancellations issue refund transactions.',
            'Dashboard manage UI for creating/inspecting predictions alongside Discord mod commands.',
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Gift, color: 'text-orange-400' }}
        title="Raffles"
        id="raffles"
      >
        <ProjectSubPageParagraph>
          Scheduled ticket raffles complement the casino: ticket price, per-user
          max tickets, draw time, and repeat interval. Players buy in the raffle
          channel; the pot pays out minus a configurable house cut. Recurring
          raffles reschedule after each draw.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            '/raffle create, cancel, and ticket purchase flows with atomic DB updates.',
            'raffleDraw worker (~1 min) picks a weighted random winner by ticket count.',
            'Single-participant edge case refunds the pot instead of charging a house cut.',
            'Separate raffle action/log channels - configured in dashboard channel settings.',
            'Dashboard manage/raffles for ops who prefer tables over Discord embeds.',
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Trophy, color: 'text-emerald-400' }}
        title="Quests"
        id="quests"
      >
        <ProjectSubPageParagraph>
          Quests are first-class in gambling-bot-shared: daily and normal kinds
          with conditions like casino wins/bets (optionally per game), bonus
          claims, and streak targets. Admins seed default templates or author
          custom quests; players track progress via{' '}
          <code className="text-xs">/quests</code>.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Example templates: win 3 blackjack, place 5 bets, claim daily bonus, first win, 7-day bonus streak.',
            'Rewards credit bonusBalance with ledger entries, the same non-withdrawable bucket as daily bonus.',
            'Dashboard manage/quests: create, wipe progress, diagnostics for stuck progression.',
            'Progress tracked per user per guild without polluting the casino bet pipeline.',
            'Seed is idempotent by template name - "Add defaults" will not duplicate existing quests.',
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageExternalLinks
        items={[
          {
            label: 'Public Discord community',
            href: GAMBLING_HUB_LINKS.community,
            description: 'Try VIP, predictions, raffles, and quests live.',
          },
          {
            label: 'gambling-bot-shared',
            href: GAMBLING_HUB_LINKS.shared,
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

export default EngagementPage
