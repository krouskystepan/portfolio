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
  ProjectSubPageTitle,
} from '@/components/SubPageComponents'

const GamblingBotCaseStudyPage = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-12">
      {/* HEADER */}
      <header className="mb-8">
        <ProjectSubPageTag text="Case Study" />
        <ProjectSubPageTitle title="Gambling BOT – Discord Casino & Admin Dashboard Ecosystem" />
        <ProjectSubPageDescription
          description={`Gambling BOT is a full-stack gambling and virtual-economy system built for Discord communities.\nIt combines a feature-rich casino engine, persistent user balances, VIP rooms, predictions, daily bonuses, and a powerful admin dashboard.\nAll gameplay, configuration, logging, and economy interactions share a unified database and a shared NPM package, ensuring consistency across the entire ecosystem.`}
        />
      </header>

      <Alert
        type="info"
        title="Project Overview"
        description="The system now consists of three tightly connected parts: a Discord bot for gameplay, an admin dashboard for configuration and insights, and a shared NPM package that provides all shared models, types, and utilities."
      />

      {/* TOC */}
      <ProjectSubPageTableOfContents
        title="Contents"
        items={[
          { label: 'Motivation & Goals', href: '#motivation' },
          { label: 'System Architecture', href: '#architecture' },
          { label: 'Shared Package Architecture', href: '#shared' },
          { label: 'Economy & Transaction Model', href: '#economy' },
          { label: 'Casino Game Engine', href: '#engine' },
          { label: 'RTP System & Fairness Logic', href: '#rtp' },
          { label: 'Daily Bonus System', href: '#daily-bonus' },
          { label: 'VIP Rooms & Access Control', href: '#vip' },
          { label: 'Predictions (Betting Market)', href: '#predictions' },
          { label: 'Admin Web Dashboard', href: '#dashboard' },
          { label: 'Future Work & Technical Challenges', href: '#future' },
        ]}
      />

      {/* 1. MOTIVATION */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Gamepad2, color: 'text-blue-400' }}
        title="1. Motivation & Goals"
        id="motivation"
      >
        <ProjectSubPageParagraph>
          Gambling BOT started as a way to introduce a structured, persistent
          casino experience into a Discord community—something deeper than
          simple “fun” commands. The goal was to design a unified system where
          all layers share the same logic, models, and economic rules.
        </ProjectSubPageParagraph>

        <ProjectSubPageParagraph>
          Over time, the project matured into a scalable multi-application
          ecosystem with:
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'A persistent virtual currency with complete transaction logging.',
            'Casino-style games with fully configurable RTP and fairness controls.',
            'VIP rooms that feel personal, private, automated, and temporary.',
            'A modern admin dashboard for analytics, management, and server customization.',
            'A shared NPM package providing schemas, validation, helpers, and strong typing across all apps.',
          ]}
        />
      </ProjectSubPageSectionLayout>

      {/* 2. ARCHITECTURE */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Server, color: 'text-emerald-400' }}
        title="2. High-Level Architecture"
        id="architecture"
      >
        <ProjectSubPageParagraph>
          The system is composed of three interconnected applications that share
          the same data structures and logic through a dedicated NPM package.
          Each runs independently but stays perfectly aligned thanks to shared
          schemas, helpers, constants, and TypeScript types.
        </ProjectSubPageParagraph>

        <div className="grid gap-5 sm:grid-cols-3">
          {/* DISCORD BOT */}
          <ProjectSubPageInfoCard
            title="Discord Bot"
            icon={Terminal}
            iconColor="text-blue-400"
            items={[
              'Built with discord.js and CommandKit.',
              'Implements all casino games, VIP management, predictions, and ATM logic.',
              'Handles gameplay, validation, messaging, cooldowns, and transactional state.',
              'Reads all models and types directly from gambling-bot-shared.',
            ]}
          />

          {/* SHARED PACKAGE */}
          <ProjectSubPageInfoCard
            title="Shared NPM Package"
            icon={Layers}
            iconColor="text-purple-400"
            items={[
              'Exports all TypeScript types, interfaces, enums, and constants.',
              'Contains all Mongoose schemas and models.',
              'Includes helper functions, validators, and probability utilities.',
              'Ensures 100% consistency across the bot and dashboard.',
            ]}
          />

          {/* DASHBOARD */}
          <ProjectSubPageInfoCard
            title="Admin Dashboard"
            icon={Globe}
            iconColor="text-emerald-400"
            items={[
              'Built using Next.js, React, Radix UI, Framer Motion, and Tailwind.',
              'Authentication via Discord OAuth with role-based access control.',
              'Provides transparency: transaction history, RTP controls, VIP management.',
              'Reads and updates the same MongoDB collections as the bot.',
              'Uses shared models and utilities from gambling-bot-shared.',
            ]}
          />
        </div>
      </ProjectSubPageSectionLayout>

      {/* 3. SHARED PACKAGE MINI-SECTION */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Layers, color: 'text-purple-400' }}
        title="3. Shared Package Architecture"
        id="shared"
      >
        <ProjectSubPageParagraph>
          To prevent desynchronization between the bot and the admin dashboard,
          all logic that defines the casino ecosystem lives inside a dedicated
          NPM package: <strong>gambling-bot-shared</strong>.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Mongoose schemas & models for User, Transaction, Games, Predictions, VIP Rooms, GuildConfiguration.',
            'Strongly typed constants and enums used by both applications.',
            'Shared helper functions including RTP calculations and probability utilities.',
            'Reusable validation logic for commands, forms, and internal systems.',
            'Utilities for formatting, randomization, state transitions, and gameplay rules.',
          ]}
        />

        <Alert
          type="note"
          title="Benefits of a Shared Core"
          description="By centralizing all shared logic, the ecosystem becomes easier to maintain, safer to extend, and impossible to desync. Both applications always run on the same logic by design."
        />
      </ProjectSubPageSectionLayout>

      {/* 4. ECONOMY */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Database, color: 'text-amber-400' }}
        title="4. Economy & Transaction Model"
        id="economy"
      >
        <ProjectSubPageParagraph>
          All economy-related schemas now come from the shared NPM package,
          guaranteeing identical behavior in both the Discord bot and the admin
          dashboard.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            <>
              <code className="text-xs">User</code> — stored per guild,
              containing <code className="text-xs">balance</code>,{' '}
              <code className="text-xs">lockedBalance</code>, and daily-streak
              metadata.
            </>,
            <>
              <code className="text-xs">Transaction</code> — immutable economic
              log entry with fields such as type (
              <code className="text-xs">deposit</code>,{' '}
              <code className="text-xs">withdraw</code>,{' '}
              <code className="text-xs">bet</code>,{' '}
              <code className="text-xs">win</code>,{' '}
              <code className="text-xs">bonus</code>,{' '}
              <code className="text-xs">vip</code>,{' '}
              <code className="text-xs">refund</code>), source (
              <code className="text-xs">command</code>,{' '}
              <code className="text-xs">web</code>,{' '}
              <code className="text-xs">system</code>,{' '}
              <code className="text-xs">casino</code>), and optional{' '}
              <code className="text-xs">betId</code>.
            </>,
          ]}
        />

        <ProjectSubPageParagraph>
          The bot never “just updates balance numbers” — every mutation is an
          atomic database operation paired with a transaction document. This
          enables full historical reconstruction for any player, guild, or
          administrative action, supported by compound indexes on guild, user,
          type, source, and betId for fast querying.
        </ProjectSubPageParagraph>

        <Alert
          type="warning"
          title="Gated Deposits & Withdrawals"
          description="Deposits and withdrawals are not automatic. Players create requests, and admins must approve them. This design makes the system safe for RP servers (e.g., GTA RP), preventing the bot from moving real or sensitive in-game currency on its own."
        />
      </ProjectSubPageSectionLayout>

      {/* 5. GAME ENGINE DESIGN */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Gamepad2, color: 'text-sky-400' }}
        title="5. Game Engine Design"
        id="engine"
      >
        <ProjectSubPageParagraph>
          The casino part of the bot offers several games, each implemented as a
          slash command with its own betting rules, fairness model, and UX flow.
          Despite their differences, all games follow the same high-level
          pattern:
        </ProjectSubPageParagraph>

        <ProjectSubPageNumberedList
          items={[
            'Validate registration and guild configuration (allowed channels, limits).',
            'Validate bet size using per-guild min/max limits and the user balance.',
            'Lock funds by decrementing balance and creating a bet transaction.',
            'Execute the game logic (single or multi-round flow, animations, embeds).',
            'Compute winnings, update balance, and create win transaction(s).',
            'Render a final summary embed with optional balance information.',
          ]}
        />

        {/* Blackjack */}
        <ProjectSubPageInfoCard
          title="Blackjack"
          icon={HandCoins}
          iconColor="text-sky-300"
        >
          <ProjectSubPageParagraph className="mb-2">
            Blackjack uses a strongly typed{' '}
            <code className="text-xs">Card</code> model, generating a shuffled
            deck and storing it in MongoDB along with player and dealer hands.
          </ProjectSubPageParagraph>

          <ProjectSubPageBulletList
            className="text-sm"
            items={[
              'Session stored in a dedicated BlackjackGame document.',
              'Only one active game per user per guild (unique index).',
              'Dealer hits until 17, with soft-17 support built into hand evaluation.',
              'Blackjack detection on the initial deal for both sides.',
              'Player actions implemented via interaction buttons (hit, stand, double).',
              'Dealer reveals cards with short delays, updating the embed each step.',
              'Final outcomes include win, loss, push, and blackjack-specific cases.',
            ]}
          />
        </ProjectSubPageInfoCard>

        {/* Roulette */}
        <ProjectSubPageInfoCard
          title="Mini Roulette"
          icon={Disc}
          iconColor="text-red-400"
        >
          <ProjectSubPageParagraph className="mb-2">
            Roulette is implemented as a custom 19-field wheel (0–18). Colors
            are defined using the strongly typed{' '}
            <code className="text-xs">MINI_NUMBERS</code> map. Players can
            submit multiple bets in a single command.
          </ProjectSubPageParagraph>

          <ProjectSubPageBulletList
            className="text-sm"
            items={[
              'Bet types: number, color, parity, range, dozen (D1–D3), and column (C1–C3).',
              'Bets parsed from comma-separated input like "10 red, 5 D2".',
              'Game logic resolves each bet using typed helpers.',
              'Supports multi-spin commands with persistent live results.',
            ]}
          />
        </ProjectSubPageInfoCard>

        {/* Lottery / Coinflip / Slots */}
        <div className="grid gap-4 sm:grid-cols-3">
          <ProjectSubPageInfoCard
            title="Lottery"
            icon={Ticket}
            iconColor="text-purple-300"
          >
            <ProjectSubPageParagraph className="text-sm">
              Users select a set of numbers. The bot draws unique numbers from a
              fixed pool, and payouts scale with the number of matches.
              Probabilities are handled combinatorially in the RTP logic.
            </ProjectSubPageParagraph>
          </ProjectSubPageInfoCard>

          <ProjectSubPageInfoCard
            title="Coinflip"
            icon={Coins}
            iconColor="text-yellow-300"
          >
            <ProjectSubPageParagraph className="text-sm">
              A simple, configurable game where users pick heads or tails and
              run multiple flips. Rewards use a configurable win multiplier that
              directly determines the RTP.
            </ProjectSubPageParagraph>
          </ProjectSubPageInfoCard>

          <ProjectSubPageInfoCard
            title="Slots"
            icon={Shapes}
            iconColor="text-pink-400"
          >
            <ProjectSubPageParagraph className="text-sm">
              Slots use weighted symbols for each spin. Three random symbols
              appear, and only 3-of-a-kind combinations pay out via configured
              multipliers in the guild settings.
            </ProjectSubPageParagraph>
          </ProjectSubPageInfoCard>
        </div>

        {/* RPS / Golden Jackpot */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <ProjectSubPageInfoCard
            title="Rock, Paper, Scissors (PvP)"
            icon={HandMetal}
            iconColor="text-indigo-300"
          >
            <ProjectSubPageParagraph className="text-sm">
              A peer-to-peer duel: one user challenges another, both place the
              same bet, and the winner takes the pot minus a casino cut. All
              transactions reference the same betId for clean traceability.
            </ProjectSubPageParagraph>
          </ProjectSubPageInfoCard>

          <ProjectSubPageInfoCard
            title="Golden Jackpot"
            icon={Gem}
            iconColor="text-amber-400"
          >
            <ProjectSubPageParagraph className="text-sm">
              A high-variance game with a one-in-N win chance and a large
              multiplier. Users buy multiple “tickets”, and the bot draws
              attempts with optional animations, logging each jackpot hit.
            </ProjectSubPageParagraph>
          </ProjectSubPageInfoCard>
        </div>
      </ProjectSubPageSectionLayout>

      {/* 6. RTP */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: LineChart, color: 'text-cyan-400' }}
        title="6. RTP Calculation & Fairness Controls"
        id="rtp"
      >
        <ProjectSubPageParagraph>
          Instead of treating RTP (Return to Player) as a vague concept, the
          system exposes it explicitly through a dedicated{' '}
          <code className="text-xs">calculateRTP</code> function. This function
          reads the guild’s casino settings and computes the real, effective RTP
          for every game using probability and configuration data — not
          hardcoded values.
        </ProjectSubPageParagraph>

        {/* Visual Layout Overview */}
        <div className="my-4 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
          <h4 className="mb-3 text-sm font-semibold tracking-wide text-neutral-100">
            How RTP Is Computed
          </h4>

          <div className="grid gap-4 text-sm sm:grid-cols-3">
            <div className="rounded-md bg-neutral-800/40 p-3">
              <p className="mb-1 font-medium text-neutral-200">Game Rules</p>
              <p className="text-neutral-300">
                Each game defines its probability model (dice odds, slot
                weights, lottery combinations, roulette layout…).
              </p>
            </div>

            <div className="rounded-md bg-neutral-800/40 p-3">
              <p className="mb-1 font-medium text-neutral-200">
                Guild Settings
              </p>
              <p className="text-neutral-300">
                Win multipliers, symbol weights, odds, and casino cuts are
                stored in <code className="text-xs">GuildConfiguration</code>.
              </p>
            </div>

            <div className="rounded-md bg-neutral-800/40 p-3">
              <p className="mb-1 font-medium text-neutral-200">RTP Function</p>
              <p className="text-neutral-300">
                The system computes expected value for every game, producing a
                transparent, configurable RTP %.
              </p>
            </div>
          </div>
        </div>

        {/* Bullet Details */}
        <ProjectSubPageBulletList
          className="text-sm"
          items={[
            <>
              <strong>Dice</strong> – a fixed 1/6 probability with a
              configurable win multiplier.
            </>,
            <>
              <strong>Coinflip</strong> – 50/50 outcome scaled by a guild
              multiplier.
            </>,
            <>
              <strong>Slots</strong> – RTP derived from weighted symbols +
              multiplier tables using probability across all 3-of-a-kind
              outcomes.
            </>,
            <>
              <strong>Lottery</strong> – uses combinatorics to compute exact
              match probabilities.
            </>,
            <>
              <strong>Mini Roulette</strong> – RTP per bet type (number, color,
              parity, range, dozen, column) based on custom 0–18 wheel.
            </>,
            <>
              <strong>RPS</strong> – simply{' '}
              <code className="text-xs">1 - casinoCut</code>.
            </>,
            <>
              <strong>Golden Jackpot</strong> –{' '}
              <code className="text-xs">winMultiplier / oneInChance</code>.
            </>,
            <>
              <strong>Blackjack</strong> – currently fixed at ~99.4% to match
              real-world expected return.
            </>,
          ]}
        />

        {/* Tiny Code Sample */}
        <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
          <h4 className="mb-3 text-sm font-semibold tracking-wide text-neutral-100">
            Example: RTP Calculation Snippet
          </h4>

          <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-neutral-950 p-1 text-[10px] text-neutral-200 sm:p-3 sm:text-xs">
            {`case 'coinflip': {
  const { winMultiplier } = settings;
  return 0.5 * Number(winMultiplier) * 100;
}

case 'slots': {
  const { symbolWeights, winMultipliers } = settings;
  const totalWeight = Object.values(symbolWeights).reduce((a, b) => a + b, 0);
  let rtp = 0;

  for (const [symbol, weight] of Object.entries(symbolWeights)) {
    const p = (weight / totalWeight) ** 3; // probability of 3-of-a-kind
    const multi = winMultipliers[symbol + symbol + symbol] ?? 0;
    rtp += p * multi;
  }

  return rtp * 100;
}`}
          </pre>
        </div>

        {/* Why RTP Matters */}
        <Alert
          type="note"
          title="Why RTP Matters"
          description="RTP gives admins predictable control over how generous or challenging the casino feels. Because the system computes RTP from real probabilities instead of static presets, servers can tune risk level in a transparent and mathematically correct way."
        />

        {/* Configurable */}
        <Alert
          type="info"
          title="Fully Configurable Per Guild"
          description="All RTP-sensitive values (win multipliers, symbol weights, odds, casino cut) are stored directly inside GuildConfiguration. Server admins can adjust them from the dashboard without restarting the bot."
        />
      </ProjectSubPageSectionLayout>

      {/* 7. DAILY BONUS */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Clock, color: 'text-amber-400' }}
        title="7. Daily Bonus & Streak System"
        id="daily-bonus"
      >
        <ProjectSubPageParagraph>
          To keep players engaged without forcing them to gamble constantly, the
          system includes a flexible daily bonus mechanic. The bonus logic is
          fully configurable per guild through{' '}
          <code className="text-xs">bonusSettings</code>, allowing each
          community to tune progression and pacing.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          className="text-sm"
          items={[
            'Linear or exponential reward mode.',
            'Base reward, streak increment or multiplier.',
            'Maximum reward with optional cycle reset behavior.',
            'Weekly and monthly milestone bonuses.',
          ]}
        />

        <ProjectSubPageParagraph>
          The <code className="text-xs">/bonus</code> command exposes two
          subcommands:
          <strong> check</strong> and <strong>claim</strong>. The check
          subcommand renders a 28-day calendar using emoji icons to represent
          past, current, and upcoming rewards. The claim subcommand enforces the
          24-hour cooldown, updates streak progression, writes a{' '}
          <code className="text-xs">bonus</code> transaction, and updates both
          <code className="text-xs"> balance</code> and{' '}
          <code className="text-xs">lockedBalance</code> on the user document.
        </ProjectSubPageParagraph>

        <Alert
          type="info"
          title="Locked Balance for Bonus Rewards"
          description="Daily bonuses are applied to both balance and lockedBalance. Locked funds cannot be withdrawn immediately and are intended for in-system usage, preventing pure farming behavior while keeping bonuses meaningful."
        />
      </ProjectSubPageSectionLayout>

      {/* 8. VIP ROOMS */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Lock, color: 'text-rose-400' }}
        title="8. VIP Rooms"
        id="vip"
      >
        <ProjectSubPageParagraph>
          VIP rooms are private text channels that players can purchase for a
          configurable duration. The system ties together the{' '}
          <code className="text-xs">GuildConfiguration</code>,{' '}
          <code className="text-xs">User</code>, and{' '}
          <code className="text-xs">VipRoom</code> models to manage pricing,
          ownership, permissions, and expiration.
        </ProjectSubPageParagraph>

        <div className="grid gap-5 sm:grid-cols-2">
          <ProjectSubPageInfoCard
            title="Purchasing Flow"
            icon={Users}
            iconColor="text-rose-300"
          >
            <ProjectSubPageBulletList
              className="text-sm"
              items={[
                <>
                  Purchase is initiated through{' '}
                  <code className="text-xs">/vip buy</code>.
                </>,
                'Duration can be specified in days or weeks (e.g., 3d, 1w).',
                'Total price is based on duration plus an optional creation fee.',
                'Balance is validated to ensure the user can afford the purchase.',
              ]}
            />
          </ProjectSubPageInfoCard>

          <ProjectSubPageInfoCard
            title="Channel & Role Handling"
            icon={Trophy}
            iconColor="text-yellow-300"
          >
            <ProjectSubPageBulletList
              className="text-sm"
              items={[
                'A private channel is created in the configured VIP category.',
                'Permissions restrict access so only the buyer can view and write.',
                'A VIP role is assigned for visibility and easier moderation.',
                <>
                  A corresponding <code className="text-xs">VipRoom</code> entry
                  stores the channel ID and expiration date.
                </>,
              ]}
            />
          </ProjectSubPageInfoCard>
        </div>

        <ProjectSubPageParagraph>
          When a VIP room expires, the channel remains visible but becomes
          locked — the user loses write permissions. This preserves message
          history for light auditing while maintaining the temporary nature of
          the perk.
        </ProjectSubPageParagraph>

        <Alert
          type="warning"
          title="Extending VIP Duration"
          description="Players can extend their VIP room using /vip extend. The system recalculates the total price based on the added time, updates the expiry timestamp, and logs the extension as a VIP transaction."
        />
      </ProjectSubPageSectionLayout>

      {/* 9. PREDICTIONS */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: BarChart3, color: 'text-indigo-400' }}
        title="9. Predictions"
        id="predictions"
      >
        <ProjectSubPageParagraph>
          Predictions function as an on-chain betting system inside the Discord
          server: moderators can create events with up to three choices, each
          with custom odds. Players place bets on one of the options, and
          payouts are calculated once the event resolves.
        </ProjectSubPageParagraph>

        {/* Flow Diagram */}
        <ProjectSubPageFlowDiagram
          steps={[
            'Admin creates prediction',
            'Users place bets',
            'Autolock triggers (optional)',
            'Admin resolves outcome',
            'Winners are paid / refunds issued',
          ]}
        />

        <ProjectSubPageBulletList
          className="mt-6 text-sm"
          items={[
            <>
              <strong>Prediction</strong> documents store title, guild, channel,
              creator, status, autolock time, and all choices with their odds
              and attached bets.
            </>,
            'Autolock automatically closes the prediction after a configured timeout.',
            'When resolved, winning bets are paid out as amount × odds.',
            'Cancelled predictions refund all users and create refund transactions.',
          ]}
        />

        <Alert
          type="info"
          title="Admin-Driven, Player-Visible"
          description="Predictions are created and resolved by moderators, but every step is visible to players through Discord embeds. All payouts and refunds are still logged internally for admins."
        />
      </ProjectSubPageSectionLayout>

      {/* TBD */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: ShieldCheck, color: 'text-emerald-400' }}
        title="10. Admin Web Dashboard (TBD)"
        id="dashboard"
      >
        <ProjectSubPageParagraph>
          The web dashboard is built using Next.js, React, Radix UI and Tailwind
          CSS. Authentication is handled through Discord OAuth, with access
          restricted to users who hold the manager role or the Administrator
          permission. The dashboard operates on the same Mongoose models as the
          bot, making it the central place for configuring every aspect of the
          casino.
        </ProjectSubPageParagraph>

        <Alert
          type="warning"
          title="TBD – Dashboard Management Views"
          description="Planned dashboard features include transaction analytics, casino settings management (including RTP controls), user inspectors, VIP room administration, and prediction control panels. This section will be expanded as the admin interface is fully implemented."
        />
      </ProjectSubPageSectionLayout>

      {/* TBD */}
      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Terminal, color: 'text-red-400' }}
        title="11. Future Work & Technical Challenges (TBD)"
        id="future"
      >
        <ProjectSubPageParagraph>
          Developing a unified Discord–web ecosystem brings a number of deeper
          engineering problems: ensuring consistency between rapid Discord
          interactions and database state, preventing race conditions in
          multiplayer flows, and designing indexes that remain efficient under
          transaction-heavy workloads.
        </ProjectSubPageParagraph>

        <Alert
          type="error"
          title="TBD – Challenges & Solutions"
          description="A detailed breakdown of the largest technical obstacles—concurrency, scaling, dashboard ergonomics, anti-abuse mechanisms—will be added as the project matures and real-world usage patterns emerge."
        />

        <ProjectSubPageParagraph className="mt-4">
          For now, the core effort focuses on strong typing, clean data
          modeling, and a unified user experience across Discord and the
          dashboard. As new features are introduced, this section will grow into
          a log of problems encountered and the architectural decisions that
          solved them.
        </ProjectSubPageParagraph>
      </ProjectSubPageSectionLayout>

      <section className="mt-8 border-t border-neutral-800 pt-8">
        <p className="text-sm text-neutral-400">
          This page is a living case study of the Gambling BOT ecosystem. As the
          dashboard, Discord bot, and shared package evolve, this write-up will
          be updated to reflect new architectural decisions and best practices.
        </p>
      </section>
    </div>
  )
}

export default GamblingBotCaseStudyPage
