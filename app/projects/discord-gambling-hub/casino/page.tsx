import {
  Coins,
  Disc,
  Dices,
  Gamepad2,
  Gem,
  HandCoins,
  HandMetal,
  LineChart,
  Shapes,
  Ticket,
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
  ProjectSubPageNumberedList,
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

const { prev, next } = getChapterNeighbors('casino')

const CasinoPage = () => {
  return (
    <>
      <ProjectCaseStudyBreadcrumb
        projectId="discord-gambling-hub"
        chapter="Casino"
      />

      <div className="mb-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:items-start lg:gap-12">
        <header className="min-w-0">
          <ProjectSubPageTag text="Chapter 3" />
          <ProjectSubPageTitle title="Casino Engine & Fairness" />
          <ProjectSubPageDescription
            description="A full suite of configurable games, from instant rolls to multi-bet interactive sessions, share one reserve/settle pipeline. RTP is computed from guild settings and probability models, not marketing labels. Per-game enable toggles let ops turn titles on or off without redeploying."
          />
        </header>

        <aside className="mx-auto w-full max-w-sm lg:row-span-2 lg:mx-0 lg:sticky lg:top-24 lg:max-w-none">
          <ProjectSubPageFigure
            alt="Blackjack multi-hand session in Discord"
            caption="Session UX in Discord."
            filenameHint="blackjack-session.png"
            aspect="embed"
            className="my-0 mx-0 max-w-none"
          />
        </aside>

        <div className="min-w-0">
          <ProjectSubPageSectionLayout
            iconStyle={{ icon: Gamepad2, color: 'text-sky-400' }}
            title="Shared play pipeline"
            id="pipeline"
            className="mt-8 lg:mt-0"
          >
            <ProjectSubPageNumberedList
              items={[
                'Check registration, casino channels, per-game enabled flag, and cooldowns.',
                'Validate bet against min/max and available cash + bonus.',
                'reserveCasinoBet with a generated betId (or multi-bet slip for session games).',
                'Run game logic - RNG for instant games, button-driven state for interactive ones.',
                'settleCasinoWinnings / refunds and render result embeds.',
              ]}
            />
          </ProjectSubPageSectionLayout>
        </div>
      </div>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Dices, color: 'text-blue-400' }}
        title="Instant games"
        id="instant"
      >
        <ProjectSubPageParagraph>
          Instant titles still share the reserve/settle pipeline, channel gates,
          cooldowns, and per-game enable flags. They just resolve in one
          interaction instead of a multi-message session.
        </ProjectSubPageParagraph>

        <div className="grid gap-4 sm:grid-cols-2">
          <ProjectSubPageInfoCard
            title="Dice"
            icon={Dices}
            iconColor="text-sky-300"
            className="h-full"
          >
            <ProjectSubPageBulletList
              className="text-sm"
              items={[
                'Pick a side (1-6); optional multi-roll in one command.',
                'Win when the roll matches; payout scales with guild winMultiplier.',
                'RTP model: (1/6) x winMultiplier from shared calculateRTP.',
              ]}
            />
          </ProjectSubPageInfoCard>

          <ProjectSubPageInfoCard
            title="Limbo"
            icon={LineChart}
            iconColor="text-cyan-300"
            className="h-full"
          >
            <ProjectSubPageBulletList
              className="text-sm"
              items={[
                'Target-multiplier risk: players choose how far to push.',
                'House edge and minimum multiplier are guild-configurable.',
                'Designed as a high-agency instant game next to dice/coinflip.',
              ]}
            />
          </ProjectSubPageInfoCard>

          <ProjectSubPageInfoCard
            title="Coinflip"
            icon={Coins}
            iconColor="text-yellow-300"
            className="h-full"
          >
            <ProjectSubPageBulletList
              className="text-sm"
              items={[
                'Heads/tails with optional multi-flip.',
                'winMultiplier sets payout and RTP (0.5 × multiplier).',
              ]}
            />
          </ProjectSubPageInfoCard>

          <ProjectSubPageInfoCard
            title="Lottery"
            icon={Ticket}
            iconColor="text-purple-300"
            className="h-full"
          >
            <ProjectSubPageBulletList
              className="text-sm"
              items={[
                'Pick numbers; draws use fixed shared pool sizes.',
                'Match-count payouts; RTP from combinatoric odds.',
              ]}
            />
          </ProjectSubPageInfoCard>

          <ProjectSubPageInfoCard
            title="Golden Jackpot"
            icon={Gem}
            iconColor="text-amber-400"
            className="sm:col-span-2"
          >
            <ProjectSubPageBulletList
              className="text-sm"
              items={[
                'High-variance tickets against oneInChance with a large winMultiplier.',
                'RTP ≈ winMultiplier / oneInChance.',
                'Moderator simulation helpers exist for stress-testing jackpot math.',
              ]}
            />
          </ProjectSubPageInfoCard>
        </div>
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: HandCoins, color: 'text-amber-400' }}
        title="Interactive sessions"
        id="interactive"
      >
        <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_16rem] md:gap-10">
          <div className="min-w-0 space-y-4">
            <ProjectSubPageParagraph>
              Unlike instant titles (dice, coinflip, limbo, lottery, golden
              jackpot), these games stay open across messages. Each keeps a
              durable MongoDB session, Discord button UI, locked balances, and
              workers that nudge or settle when a player walks away: blackjack,
              baccarat, mines, hi-lo, plinko, roulette, and slots.
            </ProjectSubPageParagraph>

            <h3 className="text-base font-semibold text-neutral-100">
              How a session runs
            </h3>
            <ProjectSubPageParagraph>
              The player opens a table, configures a stake (or a multi-line
              slip), plays through buttons, then rebet / change / close without
              restarting the command. While a stake is live, balances stay locked
              so a refresh, reconnect, or mid-hand crash cannot double-spend.
              House edge and multipliers are snapshotted when the round locks so
              mid-play config edits cannot rewrite an open hand.
            </ProjectSubPageParagraph>

            <h3 className="text-base font-semibold text-neutral-100">
              What keeps it safe
            </h3>
            <ProjectSubPageBulletList
              className="text-sm"
              items={[
                'Shared lifecycle: open table → configure bet → play → rebet / change / close.',
                'Locks held until settle, cash-out, refund, or idle recovery.',
                'Idle nudge workers DM after long inactivity; timeout workers auto-resolve or close and refund.',
                'Orphan cleanup and lock reconciliation cover guild leaves and stuck in-flight rows.',
                'Multi-bet slips where it matters - baccarat sides, blackjack insurance and pairs.',
                'Per-game enable flags and channel gates still apply before a session can open.',
              ]}
            />
          </div>

          <aside className="mx-auto w-full max-w-sm md:mx-0 md:sticky md:top-24 md:max-w-none">
            <ProjectSubPageFigure
              alt="Baccarat multi-bet slip"
              caption="Multi-bet session in Discord."
              filenameHint="baccarat-multibet.png"
              aspect="embed"
              className="my-0 mx-0 max-w-none"
            />
          </aside>
        </div>
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: HandCoins, color: 'text-sky-400' }}
        title="Blackjack"
        id="blackjack"
      >
        <ProjectSubPageParagraph>
          Full table blackjack inside Discord: persistent shoe state, multi-hand
          play, insurance, and optional Perfect Pairs / 21+3 side bets - all
          settled through the same reserve/settle ledger as every other game.
        </ProjectSubPageParagraph>

        <ProjectSubPageInfoCard
          title="Core play"
          icon={HandCoins}
          iconColor="text-sky-300"
        >
          <ProjectSubPageBulletList
            className="text-sm"
            items={[
              'Hit, stand, double, and split from Discord buttons on a persisted session (phases: betting, insurance, player, dealer, result).',
              'Multi-split up to 4 hands total. Matching ranks only; Aces split once from the original deal (no Ace resplit) and auto-finish after one card each.',
              'Double only on two-card hands: it reserves an equal extra stake and doubles that hand bet.',
              'Natural blackjack settled at dealer peek: player BJ pays the blackjack multiplier, both BJ pushes, dealer BJ loses the main. Mid-hand 21 pays normal win, not BJ.',
              'Dealer stands on soft 17 (S17). Fresh shoe every hand from guild deckCount (2-8, default 6).',
            ]}
          />
        </ProjectSubPageInfoCard>

        <ProjectSubPageInfoCard
          title="Insurance & side bets"
          icon={Gem}
          iconColor="text-amber-300"
        >
          <ProjectSubPageBulletList
            className="text-sm"
            items={[
              'Insurance offered when the dealer upcard is Ace and insurance multiplier is enabled. Stake is half the main bet; pays only if dealer has blackjack.',
              'Perfect Pairs on the player first two: perfect / colored / mixed, each with its own multiplier.',
              '21+3 on player two + dealer up: suited trips, straight flush, three of a kind, straight, flush (suited trips require enough decks).',
              'Side bets and insurance disable cleanly by setting multipliers to 0 in guild config. Shared RTP helpers compute live percentages in the admin panel.',
            ]}
          />
        </ProjectSubPageInfoCard>

        <ProjectSubPageInfoCard
          title="Idle & recovery"
          icon={Workflow}
          iconColor="text-violet-300"
        >
          <ProjectSubPageBulletList
            className="text-sm"
            items={[
              'Idle nudge after hours of inactivity; auto-stand after a long stall (declines insurance if stuck there).',
              'Empty tables idle-close with lock cleanup. Rebet / Change / Close between hands so tables stay usable without restarting the command.',
              'Main-game RTP approximated from S17 outcome weights; insurance / pairs / 21+3 use exact helpers vs shoe size.',
            ]}
          />
        </ProjectSubPageInfoCard>
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Gem, color: 'text-rose-400' }}
        title="Baccarat"
        id="baccarat"
      >
        <ProjectSubPageParagraph>
          Punto banco on a fresh 8-deck shoe each round, with a multi-side betting
          slip instead of a single stake. Players tap sides, enter amounts, then
          Deal - same side can be topped up by merging amounts on the slip.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Main lines: Player, Banker, Tie. Player/Banker push on tie (1x return). Banker pays a slightly lower multiplier by default to encode commission-style edge.',
            'Side lines: player/banker/either/perfect pairs, big (5-6 cards), small (4 cards), player/banker Dragon Bonus (tiered win-by-4-9 + natural rules), Lucky 6 (banker total 6 with 2-card vs 3-card tiers).',
            'Slip resolution pays each line independently; total winnings sum stake x multiplier across the slip.',
            'Session UI supports Rebet / Change between rounds. Idle nudge and 24h close refund a locked slip if the player abandons mid-table.',
            'Per-side RTP from published 8-deck probabilities in the shared package - dashboard editors show the same numbers the bot uses.',
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Shapes, color: 'text-emerald-400' }}
        title="Mines"
        id="mines"
      >
        <ProjectSubPageParagraph>
          A 5x4 (20-cell) board with a fisher-yates mine layout. Players reveal
          safe cells as the fair multiplier climbs, then cash out - or clear the
          board for an automatic cash-out. Hitting a mine busts the round.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Mine count is guild-configurable (default 1-10, hard max 19 so at least one safe cell exists). Board size is fixed for consistent Discord UX.',
            'Payout = fair combinatorial multiplier x (1 - houseEdge). House edge (default 3%) is snapshotted on the session so mid-game setting edits cannot rewrite an open board.',
            'Cash-out requires at least one safe reveal. Clearing all safe cells auto cash-outs.',
            'Session states: SETUP, ACTIVE, RESULT. Idle nudge; after 24h ACTIVE games auto-resolve (cash out if any safe reveals, otherwise forfeit).',
            'Reported RTP is simply (1 - houseEdge) x 100 - transparent and tunable from the admin casino accordion.',
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: LineChart, color: 'text-cyan-400' }}
        title="Hi-Lo"
        id="hilo"
      >
        <ProjectSubPageParagraph>
          Continuous streak table on a full 52-card deck without replacement.
          Open a table, set a bet, Deal, then guess Higher / Draw / Lower to
          compound the multiplier. Cash out after a correct guess, or bust on a
          miss. After a round: Rebet, Change bet, or Close.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Phases: BETTING → WAITING → SETTLING → RESULT, with remaining deck, streak, and compound multiplier persisted on the session.',
            'Step multiplier is fair given remaining cards and the chosen guess, then scaled by (1 - houseEdge). Same-rank outcomes lose Higher/Lower (Draw is its own choice).',
            'Correct guesses CONTINUE the streak (card-to-beat updates); empty deck forces cash-out; bust ends the round at 0.',
            'Optional skipAnimations for faster table play. House edge is snapshotted when the round locks.',
            'Idle: DM nudge after ~30m waiting. After ~1h, an active streak auto cash-outs; otherwise the safest first guess is auto-played. Abandoned BETTING/RESULT tables close after ~24h.',
            'RTP tracks (1 - houseEdge) x 100: same mental model as Mines for managers.',
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Shapes, color: 'text-pink-400' }}
        title="Plinko"
        id="plinko"
      >
        <ProjectSubPageParagraph>
          Plinko is no longer a one-shot slash reply. It is a durable board
          session: set a unit bet, then Drop x1 / x5 / x10 as many times as you
          want. Each ball pays the bin multiplier where it lands. Rebet / Change
          / Close sit between drops the same way as other interactive tables.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Session phases: ready → dropping → result. Pending ball paths are predetermined for an in-flight batch and recovered if the process restarts mid-drop.',
            'Unit bet + ballsCount (1-10) lock exposure up front; activeBetId + lockedAmount track the open batch until settle.',
            'RTP still uses binomial path probabilities over nine bins (Galton-board 50/50 steps). Bin multipliers are editable with live RTP preview; mirrored bin editors keep the board symmetric.',
            'Optional skipAnimations. Idle nudge after ~3h; boards close after ~24h with no new drop (locks refunded via the same recovery path as other session games).',
            'Covered by plinkoIdleNudge / plinkoIdleClose workers, locked-balance reconciliation, and orphan cleanup when a guild leaves.',
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Disc, color: 'text-red-400' }}
        title="Mini Roulette"
        id="roulette"
      >
        <ProjectSubPageParagraph>
          Custom 19-pocket wheel (0-18: one green, nine red, nine black) with a
          multi-bet slip, up to 8 lines per spin. Same type+value lines merge by
          summing amounts before the wheel spins.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Bet types: straight number, color, parity, range (low 1-9 / high 10-18), dozen bands, and columns. Zero loses color/parity/range/dozen/column.',
            'Live table session: betting, spinning, result, then Rebet / Change. Idle nudge and close refund locked slip funds.',
            'Default multipliers encode the mini-wheel geometry (e.g. number 18x). Per-type RTP is derived from the 19-pocket layout in shared calculateRTP.',
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Shapes, color: 'text-pink-400' }}
        title="Slots"
        id="slots"
      >
        <ProjectSubPageParagraph>
          Interactive machine session - not a single slash reply. Players set a
          unit bet and batch 1-10 spins, locking the full exposure up front, then
          spin through weighted reels in Discord.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Three independent weighted symbol picks; only exact triples listed in winMultipliers pay (defaults like cherry/blueberry/watermelon/bell/seven with rising payouts).',
            'Mid-batch spinning phase is recoverable via casino in-flight recovery if the process restarts mid-spin.',
            'Idle nudge / 24h close refunds a mid-spin lock. RTP = sum of P(symbol)^3 x triple multiplier from guild weights.',
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: HandMetal, color: 'text-indigo-400' }}
        title="Rock Paper Scissors (PvP)"
        id="rps"
      >
        <ProjectSubPageParagraph>
          Player-vs-player challenge with matched stakes under one shared betId.
          Both balances lock before choices; timeouts cancel with full refunds.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Challenger tags a non-bot user. Target picks first, then challenger (about 30s each) or cancel and refund both.',
            'Winner takes pot x (1 - houseEdge). Default house edge 2.5% (legacy casinoCut migrated to houseEdge). Draw refunds both players.',
            'No long-lived table document, only ephemeral Discord collectors, but locked-balance reconciliation still understands pending RPS pairs so stuck locks do not rot.',
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: LineChart, color: 'text-cyan-400' }}
        title="RTP & per-game controls"
        id="rtp"
      >
        <ProjectSubPageParagraph>
          <code className="text-xs">calculateRTP</code> in gambling-bot-shared
          derives effective return from settings and game-specific probability,
          not hardcoded marketing labels. The dashboard shows live RTP (with
          warnings when RTP ≤ 90% or ≥ 100%) while editing casino settings. Each
          game also has an <code className="text-xs">enabled</code> flag so
          managers can kill a title without touching global betting switches.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          className="text-sm"
          items={[
            'Dice: (1/6) x winMultiplier.',
            'Coinflip: 0.5 x winMultiplier.',
            'Slots: Σ P(symbol)^3 x triple multiplier from guild weights.',
            'Lottery: hypergeometric match probabilities x tier multipliers.',
            'Roulette: separate RTP per bet type from the 19-pocket MINI_NUMBERS layout.',
            'Plinko: binomial path probabilities x bin multipliers (interactive Drop batches on a durable board).',
            'RPS: (1 - houseEdge) x 100 on the matched pot.',
            'Golden Jackpot: winMultiplier / oneInChance.',
            'Blackjack: ~99.5% main-game baseline at S17 defaults; exact helpers for insurance, Perfect Pairs, and 21+3 vs shoe size.',
            'Baccarat: per-side RTP from published 8-deck probabilities (player/banker/tie + side bets).',
            'Mines & Hi-Lo: (1 - houseEdge) x 100 with fair combinatorial / remaining-deck streak math underneath.',
            'Limbo: house-edge aware target-multiplier model.',
            'Prediction / raffle markets: odds and house cut are explicit; not folded into the same auto-RTP map as table games.',
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
          title="Tunable without redeploy"
          description="Multipliers, weights, cuts, bet limits, side-bet payouts, deckCount, mine ranges, and per-game enable flags live in GuildConfiguration.casinoSettings and are editable from the admin casino accordion without restarting the bot."
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageExternalLinks
        items={[
          {
            label: 'gambling-bot-discord (commands & sessions)',
            href: GAMBLING_HUB_LINKS.discord,
          },
          {
            label: 'gambling-bot-shared (casino / RTP)',
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

export default CasinoPage
