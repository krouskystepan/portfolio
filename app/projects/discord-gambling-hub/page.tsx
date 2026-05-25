import {
  Gamepad2,
  Globe,
  ShieldCheck,
  Database,
  LineChart,
  Lock,
  Trophy,
  Users,
  Server,
  Terminal,
  BarChart3,
  Clock,
  Coins,
  Disc,
  Gem,
  HandMetal,
  Shapes,
  Ticket,
  HandCoins,
  Layers,
  Dices,
  CircleDollarSign,
  Workflow,
  TestTube2,
  Gift
} from 'lucide-react'
import Alert from '@/components/Alert'
import {
  ProjectSubPageBulletList,
  ProjectSubPageDescription,
  ProjectSubPageFlowDiagram,
  ProjectSubPageInfoCard,
  ProjectSubPageNumberedList,
  ProjectSubPageParagraph,
  ProjectSubPageSectionLayout,
  ProjectSubPageTableOfContents,
  ProjectSubPageTag,
  ProjectSubPageTitle
} from '@/components/SubPageComponents'

const GamblingBotCaseStudyPage = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-12">
      <header className="mb-8">
        <ProjectSubPageTag text="Case Study" />
        <ProjectSubPageTitle title="Gambling BOT – Discord Casino & Admin Dashboard Ecosystem" />
        <ProjectSubPageDescription
          description={`A multi-repo virtual economy and casino platform for Discord communities: eleven configurable games, gated ATM deposits, predictions, scheduled raffles, VIP rooms, and a Next.js admin panel.\nAll three apps-Discord bot, admin dashboard, and shared NPM package-read the same Mongoose models, Zod schemas, and RTP math so configuration never drifts between Discord and the web.`}
        />
      </header>

      <Alert
        type="info"
        title="Project overview"
        description="Three repositories (gambling-bot-discord, gambling-bot-admin, gambling-bot-shared) share MongoDB and gambling-bot-shared. The bot runs on CommandKit with background workers; the dashboard uses Next.js 16, NextAuth (Discord OAuth), and TanStack Table for guild-scoped management."
      />

      <ProjectSubPageTableOfContents
        title="Contents"
        items={[
          { label: 'Motivation & Goals', href: '#motivation' },
          { label: 'System Architecture', href: '#architecture' },
          { label: 'Shared Package', href: '#shared' },
          { label: 'Economy & Transactions', href: '#economy' },
          { label: 'Casino Game Engine', href: '#engine' },
          { label: 'RTP & Fairness', href: '#rtp' },
          { label: 'Daily Bonus', href: '#daily-bonus' },
          { label: 'VIP Rooms', href: '#vip' },
          { label: 'Predictions', href: '#predictions' },
          { label: 'Raffles', href: '#raffles' },
          { label: 'Admin Dashboard', href: '#dashboard' },
          { label: 'Background Workers', href: '#workers' },
          { label: 'Testing & Quality', href: '#testing' },
          { label: 'Technical Challenges', href: '#challenges' }
        ]}
      />

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Gamepad2, color: 'text-blue-400' }}
        title="1. Motivation & Goals"
        id="motivation"
      >
        <ProjectSubPageParagraph>
          The project started as a way to bring a persistent, auditable casino
          into Discord-deeper than one-off fun commands. The target was a single
          economic model that moderators can tune without redeploying the bot,
          while players get transparent rules, history, and fair odds.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Per-guild virtual currency with immutable transaction logs and admin-approved deposits/withdrawals (suited to RP servers).',
            'Configurable casino games with computed RTP, not magic numbers.',
            'Engagement systems: daily bonuses, VIP rooms, predictions, and recurring raffles.',
            'A web dashboard for managers and server admins to inspect users, cash flow, and settings.',
            'One shared TypeScript package so bot and dashboard never disagree on schemas or math.'
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Server, color: 'text-emerald-400' }}
        title="2. System Architecture"
        id="architecture"
      >
        <ProjectSubPageParagraph>
          Each application deploys independently but stays aligned through{' '}
          <strong>gambling-bot-shared</strong> and a single MongoDB database.
          The Discord bot owns gameplay, workers, and Discord API side effects;
          the dashboard owns OAuth, forms, and read-heavy analytics.
        </ProjectSubPageParagraph>

        <div className="grid gap-5 sm:grid-cols-3">
          <ProjectSubPageInfoCard
            title="Discord Bot"
            icon={Terminal}
            iconColor="text-blue-400"
            items={[
              'discord.js v14 + CommandKit (slash commands, events, workers).',
              'Casino, ATM, VIP, predictions, raffles, and mod tooling.',
              'MongoDB transactions for bets, VIP purchases, and refunds.',
              'Vitest unit/integration tests with mongodb-memory-server.',
              'Structured logging via Pino.'
            ]}
          />

          <ProjectSubPageInfoCard
            title="Shared Package"
            icon={Layers}
            iconColor="text-purple-400"
            items={[
              'Mongoose schemas: User, Transaction, GuildConfiguration, Prediction, VipRoom, etc.',
              'Zod form schemas mirrored in the dashboard.',
              'calculateRTP, bonus streak helpers, bet validators, formatters.',
              'Subpath exports: root, ./server, ./schemas.'
            ]}
          />

          <ProjectSubPageInfoCard
            title="Admin Dashboard"
            icon={Globe}
            iconColor="text-emerald-400"
            items={[
              'Next.js 16 App Router, React 19, Tailwind 4, Radix UI.',
              'NextAuth Discord OAuth; guild access via manager role or Administrator.',
              'Server actions + shared Zod schemas for settings persistence.',
              'TanStack Table: users, transactions (filters, PnL summaries).',
              'Live RTP preview while editing casino settings.'
            ]}
          />
        </div>

        <ProjectSubPageFlowDiagram
          steps={[
            'Player runs slash command in Discord',
            'Bot validates guild config + balances',
            'MongoDB session writes User + Transaction',
            'Embed / buttons update in channel',
            'Manager adjusts settings or reviews logs in dashboard'
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Layers, color: 'text-purple-400' }}
        title="3. Shared Package"
        id="shared"
      >
        <ProjectSubPageParagraph>
          Duplicating types or payout math between bot and dashboard would
          eventually desync. Everything that defines “what a guild is allowed to
          configure” lives in the published package and is imported by both
          apps.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Models: User, Transaction, GuildConfiguration, Prediction, VipRoom, BlackjackGame, AtmRequest, Raffle, and related indexes.',
            'defaultCasinoSettings and readableGameNames for UI labels.',
            'Zod: casinoSettingsSchema, channelsFormSchema, bonusFormSchema, vipSettingsFormSchema, managerRoleFormSchema.',
            'Utilities: calculateRTP (per game), calculateBonusReward, generateBonusPreview, validateBetAmount, validatePredictionBet.',
            'Constants: roulette layout (MINI_NUMBERS), lottery draw sizes, transaction type/source enums.'
          ]}
        />

        <Alert
          type="note"
          title="Publish workflow"
          description="The shared repo versions independently. Bot and admin pin the same version so schema migrations and RTP changes ship together."
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Database, color: 'text-amber-400' }}
        title="4. Economy & Transactions"
        id="economy"
      >
        <ProjectSubPageParagraph>
          Users are scoped per guild. Balances split into three buckets so
          bonuses, withdrawable cash, and in-flight bets stay separable.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            <>
              <code className="text-xs">balance</code> - withdrawable cash (ATM
              withdrawals only touch this).
            </>,
            <>
              <code className="text-xs">bonusBalance</code> - non-withdrawable
              funds from daily bonuses and admin grants; spent first on casino
              bets.
            </>,
            <>
              <code className="text-xs">lockedBalance</code> - funds reserved
              while a bet is open; released on settle or refund.
            </>,
            <>
              <code className="text-xs">Transaction</code> - append-only log:
              types deposit, withdraw, bet, win, refund, bonus, vip; sources
              command, manual, web, system, casino; optional{' '}
              <code className="text-xs">betId</code> for correlated rounds.
            </>
          ]}
        />

        <ProjectSubPageParagraph>
          Casino bets use <code className="text-xs">reserveCasinoBet</code> /
          <code className="text-xs">settleCasinoWinnings</code> inside MongoDB
          multi-document transactions: duplicate betId is rejected, bonus
          balance is consumed before cash, and locked balance tracks exposure
          until settlement.
        </ProjectSubPageParagraph>

        <Alert
          type="warning"
          title="Gated ATM"
          description="Deposits and withdrawals are request-based. Admins approve in Discord or via dashboard actions (register, deposit, withdraw, bonus grant, reset). The bot never moves real in-game currency without human approval-important for GTA RP-style servers."
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Gamepad2, color: 'text-sky-400' }}
        title="5. Casino Game Engine"
        id="engine"
      >
        <ProjectSubPageParagraph>
          Eleven game configs exist in GuildConfiguration (dice, coinflip,
          slots, lottery, roulette, rps, goldenJackpot, blackjack, prediction
          limits, raffle house cut, plinko). Playable slash games share the same
          pipeline:
        </ProjectSubPageParagraph>

        <ProjectSubPageNumberedList
          items={[
            'Check registration, allowed casino channels, and per-game cooldowns.',
            'Validate bet against min/max and available cash + bonus.',
            'reserveCasinoBet with a generated betId.',
            'Run game logic (RNG, buttons, multi-step embeds).',
            'settleCasinoWinnings and render result embeds.'
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <ProjectSubPageInfoCard
            title="Dice"
            icon={Dices}
            iconColor="text-sky-300"
          >
            <ProjectSubPageParagraph className="text-sm">
              Pick a side (1–6), optional multi-roll. Win when the roll matches;
              payout scales with guild winMultiplier. Simple 1/6 probability
              model feeds RTP.
            </ProjectSubPageParagraph>
          </ProjectSubPageInfoCard>

          <ProjectSubPageInfoCard
            title="Plinko"
            icon={Shapes}
            iconColor="text-pink-400"
          >
            <ProjectSubPageParagraph className="text-sm">
              Drop 1–10 balls through an animated board; each path lands in a
              bin with configured multipliers. RTP uses binomial probabilities
              over nine bins (Galton-board style 50/50 left-right steps).
            </ProjectSubPageParagraph>
          </ProjectSubPageInfoCard>
        </div>

        <ProjectSubPageInfoCard
          title="Blackjack"
          icon={HandCoins}
          iconColor="text-sky-300"
        >
          <ProjectSubPageBulletList
            className="text-sm"
            items={[
              'Persistent BlackjackGame document; one active hand per user per guild.',
              'Button interactions: hit, stand, double; dealer hits to 17 with soft-17 rules.',
              'Background worker auto-stands stale games after one hour.',
              'Blackjack detection on initial deal for player and dealer.'
            ]}
          />
        </ProjectSubPageInfoCard>

        <ProjectSubPageInfoCard
          title="Mini Roulette"
          icon={Disc}
          iconColor="text-red-400"
        >
          <ProjectSubPageBulletList
            className="text-sm"
            items={[
              'Custom 19-pocket wheel (0–18) via MINI_NUMBERS color map.',
              'Bet types: number, color, parity, range, dozen, column-multiple bets per command.',
              'Per-bet-type RTP returned as a map (not a single percentage).'
            ]}
          />
        </ProjectSubPageInfoCard>

        <div className="grid gap-4 sm:grid-cols-3">
          <ProjectSubPageInfoCard
            title="Lottery"
            icon={Ticket}
            iconColor="text-purple-300"
          >
            <ProjectSubPageParagraph className="text-sm">
              Players pick numbers; draws use fixed pool sizes. Payout tiers by
              match count; combinatorics drive RTP.
            </ProjectSubPageParagraph>
          </ProjectSubPageInfoCard>

          <ProjectSubPageInfoCard
            title="Coinflip"
            icon={Coins}
            iconColor="text-yellow-300"
          >
            <ProjectSubPageParagraph className="text-sm">
              Heads/tails with optional multi-flip; guild winMultiplier sets
              RTP.
            </ProjectSubPageParagraph>
          </ProjectSubPageInfoCard>

          <ProjectSubPageInfoCard
            title="Slots"
            icon={Shapes}
            iconColor="text-pink-400"
          >
            <ProjectSubPageParagraph className="text-sm">
              Weighted emoji reels; only triple matches pay using per-combo
              multipliers in settings.
            </ProjectSubPageParagraph>
          </ProjectSubPageInfoCard>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <ProjectSubPageInfoCard
            title="RPS (PvP)"
            icon={HandMetal}
            iconColor="text-indigo-300"
          >
            <ProjectSubPageParagraph className="text-sm">
              Challenge flow: matched bets, winner takes pot minus casinoCut;
              shared betId across both players’ transactions.
            </ProjectSubPageParagraph>
          </ProjectSubPageInfoCard>

          <ProjectSubPageInfoCard
            title="Golden Jackpot"
            icon={Gem}
            iconColor="text-amber-400"
          >
            <ProjectSubPageParagraph className="text-sm">
              High-variance tickets against oneInChance; large winMultiplier;
              optional simulation commands for moderators.
            </ProjectSubPageParagraph>
          </ProjectSubPageInfoCard>
        </div>
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: LineChart, color: 'text-cyan-400' }}
        title="6. RTP & Fairness Controls"
        id="rtp"
      >
        <ProjectSubPageParagraph>
          <code className="text-xs">calculateRTP</code> in the shared package
          derives effective return from guild settings and game-specific
          probability-not hardcoded labels. The dashboard shows live RTP (with
          warnings when RTP ≤ 90% or ≥ 100%) while editing casino settings.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          className="text-sm"
          items={[
            'Dice: (1/6) × winMultiplier.',
            'Coinflip: 0.5 × winMultiplier.',
            'Slots: Σ P(3-of-a-kind per symbol) × multiplier.',
            'Lottery: hypergeometric match probabilities × tier multipliers.',
            'Roulette: separate RTP per bet type from wheel layout.',
            'Plinko: binomial path probabilities × bin multipliers.',
            'RPS: 1 − casinoCut; Golden Jackpot: winMultiplier / oneInChance.',
            'Blackjack: documented ~99.4% baseline; prediction/raffle RTP not auto-calculated.'
          ]}
        />

        <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
          <h4 className="mb-3 text-sm font-semibold tracking-wide text-neutral-100">
            Example: Plinko RTP (binomial bins)
          </h4>
          <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-neutral-950 p-3 text-xs text-neutral-200">
            {`for (let k = 0; k <= N; k++) {
  const p = C(N,k) * 0.5^k * 0.5^(N-k)
  rtp += p * binMultipliers[k]
}
return rtp * 100`}
          </pre>
        </div>

        <Alert
          type="info"
          title="Per-guild tuning"
          description="All sensitive knobs (multipliers, weights, cuts, bet limits) live in GuildConfiguration.casinoSettings and are editable from the dashboard without restarting the bot."
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Clock, color: 'text-amber-400' }}
        title="7. Daily Bonus & Streaks"
        id="daily-bonus"
      >
        <ProjectSubPageParagraph>
          <code className="text-xs">bonusSettings</code> per guild controls
          linear or exponential streak growth, caps, reset-on-max, and weekly /
          monthly milestone bonuses. Rewards credit{' '}
          <code className="text-xs">bonusBalance</code> only-keeping farmed
          value inside the casino economy.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          className="text-sm"
          items={[
            '/bonus check - 28-day preview calendar (shared generateBonusPreview).',
            '/bonus claim - 24h cooldown enforced in DB; streak + transaction logged.',
            'Dashboard: bonus form + live calendar preview when editing settings.',
            'Admin can grant or revoke bonus balance from the users table.'
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Lock, color: 'text-rose-400' }}
        title="8. VIP Rooms"
        id="vip"
      >
        <ProjectSubPageParagraph>
          Players buy private channels for a duration (days/weeks). Config
          covers category, owner/member roles, pricing per day, creation fee,
          and <strong>multi-member</strong> support (maxMembers,
          pricePerAdditionalMember).
        </ProjectSubPageParagraph>

        <div className="grid gap-5 sm:grid-cols-2">
          <ProjectSubPageInfoCard
            title="Purchase & extend"
            icon={Users}
            iconColor="text-rose-300"
          >
            <ProjectSubPageBulletList
              className="text-sm"
              items={[
                '/vip buy and /vip extend with atomic balance checks.',
                'reserveVipPurchase / finalizeVipPurchase pattern mirrors casino bets.',
                'VIP transactions and VipRoom documents track expiry.'
              ]}
            />
          </ProjectSubPageInfoCard>

          <ProjectSubPageInfoCard
            title="Membership"
            icon={Trophy}
            iconColor="text-yellow-300"
          >
            <ProjectSubPageBulletList
              className="text-sm"
              items={[
                '/vip add-member and remove-member with permission updates.',
                'Expired rooms: channel stays, write access revoked.',
                'vipExpiration worker runs every minute.',
                'Dashboard VIP settings form + VIP table (feature present; sidebar link optional).'
              ]}
            />
          </ProjectSubPageInfoCard>
        </div>
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: BarChart3, color: 'text-indigo-400' }}
        title="9. Predictions"
        id="predictions"
      >
        <ProjectSubPageParagraph>
          Moderators run a parimutuel-style market: create an event with up to
          three choices and odds, players bet in-channel, optional autolock,
          then resolve or cancel with full refunds.
        </ProjectSubPageParagraph>

        <ProjectSubPageFlowDiagram
          steps={[
            'Moderator creates prediction',
            'Players place bets',
            'Autolock (optional)',
            'Moderator resolves',
            'Payouts or refunds + transaction log'
          ]}
        />

        <ProjectSubPageBulletList
          className="text-sm"
          items={[
            'Dedicated prediction action/log channels in guild config.',
            'predictionAutolock worker (1 min) and predictionCleanup worker (daily).',
            'validatePredictionBet shared between bot and tests.',
            'Win payout: stake × odds; cancellations issue refund transactions.'
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Gift, color: 'text-orange-400' }}
        title="10. Raffles"
        id="raffles"
      >
        <ProjectSubPageParagraph>
          Scheduled ticket raffles complement the casino: moderators set ticket
          price, per-user max tickets, draw time, and repeat interval. Players
          buy tickets in the raffle channel; the pot pays out minus a
          configurable house cut.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          className="text-sm"
          items={[
            '/raffle create, cancel, and ticket purchase flows with atomic DB updates.',
            'raffleDraw worker checks every minute for due draws.',
            'Weighted random winner by ticket count; single-participant edge case refunds.',
            'Recurring raffles reschedule after each draw.',
            'Separate raffle action/log channels-configured in dashboard channel settings.'
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: ShieldCheck, color: 'text-emerald-400' }}
        title="11. Admin Web Dashboard"
        id="dashboard"
      >
        <ProjectSubPageParagraph>
          After Discord OAuth, users pick a guild where they are Administrator
          or hold the configured manager role. Routes live under{' '}
          <code className="text-xs">/dashboard/g/[guildId]/[section]</code> with
          permission gates (bot present, role check, Discord API rate-limit
          handling).
        </ProjectSubPageParagraph>

        <div className="grid gap-4 sm:grid-cols-2">
          <ProjectSubPageInfoCard
            title="General"
            icon={BarChart3}
            iconColor="text-emerald-300"
          >
            <ProjectSubPageBulletList
              className="text-sm"
              items={[
                'Transactions - paginated table, type/source/date filters, search, cash-flow and game PnL summary panels.',
                'Home - guild overview placeholder for future analytics.'
              ]}
            />
          </ProjectSubPageInfoCard>

          <ProjectSubPageInfoCard
            title="Manage"
            icon={Users}
            iconColor="text-blue-300"
          >
            <ProjectSubPageBulletList
              className="text-sm"
              items={[
                'Users - Discord member list with register/unregister, deposit, withdraw, bonus grant, balance reset.',
                'VIPs - active VIP channels table (management UI built).'
              ]}
            />
          </ProjectSubPageInfoCard>
        </div>

        <ProjectSubPageParagraph>
          Settings (admin-only sidebar group): channel bindings for ATM, casino,
          prediction, and raffle; manager role; VIP pricing and roles; bonus
          progression with calendar preview; full casino accordion per game with
          RTP headers and Zod-validated save.
        </ProjectSubPageParagraph>

        <Alert
          type="note"
          title="Public casino overview"
          description="A separate /[guildId] route can render read-only casino cards (bets, multipliers, RTP breakdown) for transparency pages-useful for communities that want players to inspect house rules without dashboard access."
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Workflow, color: 'text-violet-400' }}
        title="12. Background Workers"
        id="workers"
      >
        <ProjectSubPageParagraph>
          Long-running Discord bots cannot rely on players to finish every
          session. A shared <code className="text-xs">runWorkerLoop</code>{' '}
          scheduler starts on clientReady and runs idempotent jobs on intervals.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'VIP expiration - 1 min: revoke write access, sync permissions.',
            'Prediction autolock - 1 min: close betting at configured time.',
            'Raffle auto-draw - 1 min: pick winner, pay pot, reschedule repeats.',
            'Guild settings sync - 6 h: refresh cached config from MongoDB.',
            'Blackjack auto-stand - 1 h (delayed start): resolve abandoned hands.',
            'Prediction cleanup - daily: archive or remove stale documents.'
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: TestTube2, color: 'text-teal-400' }}
        title="13. Testing & Quality"
        id="testing"
      >
        <ProjectSubPageParagraph>
          The Discord bot repo treats correctness as part of the product: Vitest
          with separate unit and integration targets, ESLint + Prettier +{' '}
          <code className="text-xs">tsc --noEmit</code> in CI-style{' '}
          <code className="text-xs">pnpm check</code>.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          className="text-sm"
          items={[
            'Unit: blackjack engine, roulette math, plinko path/render, RTP helpers, bet validation, cooldowns.',
            'Integration: casinoBet sessions, daily bonus claims, prediction bets, raffle DB, VIP DB, workers (autolock, raffle draw, blackjack autostand).',
            'mongodb-memory-server for hermetic database tests.',
            'Moderator simulate-* commands for dice, slots, lottery, golden jackpot, and transaction stress tests.'
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: CircleDollarSign, color: 'text-red-400' }}
        title="14. Technical Challenges"
        id="challenges"
      >
        <ProjectSubPageParagraph>
          Building a Discord-first financial surface forces trade-offs that a
          typical web app does not hit as hard.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Concurrency - MongoDB transactions + unique betId indexes prevent double-spend and duplicate settlement when users spam interactions.',
            'Dual balance - bonus-first bet consumption and locked balance keep withdrawable cash honest while still rewarding streak play.',
            'Interaction latency - multi-step games (blackjack, plinko animations) need clear error handling and workers for abandoned state.',
            'Config drift - central package + Zod schemas + guild sync worker keep bot memory and dashboard writes aligned.',
            'Permission model - dashboard distinguishes Discord Administrator vs configured manager role; settings UI hidden from managers who only need transactions/users.',
            'RP safety - gated ATM and manual transaction source document every balance change for moderator review.'
          ]}
        />

        <Alert
          type="info"
          title="Community & repos"
          description="Public Discord: discord.gg/Y2mMQN5QVE. Open-source repos: gambling-bot-discord, gambling-bot-admin, gambling-bot-shared on GitHub (krouskystepan)."
        />
      </ProjectSubPageSectionLayout>

      <section className="mt-8 border-t border-neutral-800 pt-8">
        <p className="text-sm text-neutral-400">
          Living case study for the Gambling BOT ecosystem-updated as games,
          dashboard sections, and shared package releases ship.
        </p>
      </section>
    </div>
  )
}

export default GamblingBotCaseStudyPage
