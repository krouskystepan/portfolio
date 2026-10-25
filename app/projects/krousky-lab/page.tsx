import {
  Brain,
  Calculator,
  Dices,
  Globe,
  Layers,
  Server,
  Share2,
  Sparkles
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
  ProjectSubPageSectionLayout,
  ProjectSubPageTableOfContents,
  ProjectSubPageTag,
  ProjectSubPageTitle
} from '@/components/SubPageComponents'

const KrouskyLabCaseStudyPage = () => {
  return (
    <>
      <ProjectCaseStudyBreadcrumb projectId="krousky-lab" />

      <header className="mb-8">
        <ProjectSubPageTag text="Case Study" />
        <ProjectSubPageTitle title="Krouský Lab - Games, Solvers, and the Step in Between" />
        <ProjectSubPageDescription
          description={`A single Vite app of playable puzzles and the tools that explain them.\nEach game started as something I wanted to understand by shipping it: neighbor counts, unique sudoku, duplicate-letter scoring, forced mate, sliding blocks, lights over GF(2).\nThe solvers sit next to the games and show the forced next step.`}
        />
      </header>

      <Alert
        type="info"
        title="Where it runs"
        description="The lab is available at lab.krouskystepan.com. It is a client-side app: English and Czech, no accounts, no database. Boards and preferences stay in the browser."
      />

      <ProjectSubPageFigure
        alt="Krouský Lab hub with games and solvers"
        src="/images/projects/krousky-lab.png"
        caption="The hub: eight games and five solvers, with an English / Czech switch."
        priority
      />

      <ProjectSubPageTableOfContents
        title="Contents"
        items={[
          { label: 'Motivation', href: '#motivation' },
          { label: 'One shell, many apps', href: '#shell' },
          { label: 'Shared board files', href: '#boards' },
          { label: 'Games', href: '#games' },
          { label: 'Solvers', href: '#solvers' },
          { label: 'Deployment', href: '#deployment' },
          { label: 'Trade-offs', href: '#tradeoffs' }
        ]}
      />

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Sparkles, color: 'text-amber-400' }}
        title="1. Motivation"
        id="motivation"
      >
        <ProjectSubPageParagraph>
          It started with mines. I wanted a board I could play, then a solver
          that could say why a cell is safe, then the next puzzle that had the
          same shape: small rules, a lot of hidden structure. Sudoku, Wordle,
          Rush Hour, Lights Out, a planarity toy, a geography quiz, mental
          arithmetic, mirror symmetry, and school algebra followed in that
          order.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Games are for playing. Solvers are for seeing the reason.',
            'A paired game and helper share the same board math.',
            'New apps are a catalog entry, a route, and a pair of locale files.',
            'The UI is English and Czech. Puzzle data stays in the language the dataset actually uses.'
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Layers, color: 'text-purple-400' }}
        title="2. One shell, many apps"
        id="shell"
      >
        <ProjectSubPageParagraph>
          React Router renders one app per path. A catalog registry is the
          list the hub, the themes, and the routes all read. Each app wraps
          itself in a theme scope: accent color and page glow as CSS variables,
          so Minesweeper stays green and Rush Hour stays red without a second
          stylesheet.
        </ProjectSubPageParagraph>

        <div className="grid gap-5 sm:grid-cols-3">
          <ProjectSubPageInfoCard
            title="Catalog"
            icon={Layers}
            iconColor="text-purple-400"
            items={[
              'Game or solver, path, icon, theme, live status.',
              'Hub search matches title, blurb, and id.',
              'Unknown slugs fall through to a coming-soon page.'
            ]}
          />
          <ProjectSubPageInfoCard
            title="Copy"
            icon={Globe}
            iconColor="text-blue-400"
            items={[
              'English catalogs are the source of message keys.',
              'Czech is a parallel catalog, merged the same way.',
              'The language switch is on the hub and inside each app.'
            ]}
          />
          <ProjectSubPageInfoCard
            title="Shared chrome"
            icon={Sparkles}
            iconColor="text-amber-400"
            items={[
              'Help tips, hotkey bars, and toolbars repeat per app.',
              'Preferences and in-progress boards live in localStorage.',
              'Export and import use one JSON envelope.'
            ]}
          />
        </div>
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Share2, color: 'text-cyan-400' }}
        title="3. Shared board files"
        id="boards"
      >
        <ProjectSubPageParagraph>
          Games and solvers exchange a versioned file,{' '}
          <code className="text-xs">krouskylab.board</code>. The public part is
          what a player can already see. A game export can also carry a private
          session (the mine map, the sudoku solution, the timer). Solvers
          ignore that payload. Minesweeper and Sudoku round-trip between the
          playable board and the helper.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'One format and version, with a family field per puzzle.',
            'Mine Helper never receives the hidden mine layout from a game file.',
            'Sudoku Helper receives the clues. The solution stays on the game side.',
            'The same buttons download and read the file in every app that has a board.'
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Dices, color: 'text-emerald-400' }}
        title="4. Games"
        id="games"
      >
        <ProjectSubPageParagraph>
          Each game is a small ruleset I wanted to feel from the inside. The
          interesting part was usually generation or scoring, not the board
          chrome.
        </ProjectSubPageParagraph>

        <div className="grid gap-5 sm:grid-cols-2">
          <ProjectSubPageInfoCard
            title="Minesweeper"
            icon={Dices}
            iconColor="text-emerald-400"
            items={[
              'A number is the count of neighboring mines. Opening a zero floods through the empty region.',
              'Chord opens the hidden neighbors once the flags around a revealed number match that count.',
              'The paired solver is Mine Helper, fed by the same neighbor math.'
            ]}
          />
          <ProjectSubPageInfoCard
            title="Sudoku"
            icon={Dices}
            iconColor="text-amber-400"
            items={[
              'Filling a valid grid is the easy half. The generator then digs clues and puts a clue back if the puzzle stops having exactly one solution.',
              'Digit, band, and stack shuffles vary that grid without a second search.',
              'Play is paint: pick a digit, then click cells. Notes are a separate mode, so selecting a digit never fills the focused cell by itself.'
            ]}
          />
          <ProjectSubPageInfoCard
            title="Wordle"
            icon={Dices}
            iconColor="text-green-400"
            items={[
              'Scoring is two passes. Greens lock first. Yellows then spend what is left of each answer letter.',
              'A second B in a guess against ABBEY is absent once the answer’s B is already used.',
              'The keyboard color is the strongest mark that letter has already earned.'
            ]}
          />
          <ProjectSubPageInfoCard
            title="Rush Hour"
            icon={Dices}
            iconColor="text-rose-400"
            items={[
              'One slide of any length is one move. The hint searches every legal head position, not single steps.',
              'The red car may sit one cell past the lot, so it can occupy the exit column. Drag is a clamped float along the axis and snaps on release.',
              'Easy is a sparse 6×6. Medium packs that lot (10–20 slides). Hard steps up to 7×7 with blocks (20–28). Expert is a dense 6×6 (28–35). Insane is 36–60 slides, still on 6×6. Padding the same puzzles out to 8×8 only made them easier.'
            ]}
          />
          <ProjectSubPageInfoCard
            title="Lights Out"
            icon={Dices}
            iconColor="text-yellow-300"
            items={[
              'A press toggles a cell and its plus-shaped neighbors. Order does not matter, and pressing twice cancels, so a random press set on a dark board is always solvable.',
              'The shortest solution tries every first-row mask (2ⁿ of them), then chases each light that is still on by pressing the cell below. The last row is the consistency check.',
              'The length that counts is that minimum, not the random presses used to build the puzzle.'
            ]}
          />
          <ProjectSubPageInfoCard
            title="Untangle"
            icon={Dices}
            iconColor="text-violet-400"
            items={[
              'Drag vertices until nothing crosses. A shared corner stays clean. A real intersection, or two segments lying on top of each other, turns the edge red.',
              'The hint tries small nudges and keeps the landing that removes the most problems.',
              'It never sees the clean layout the generator threw away.'
            ]}
          />
          <ProjectSubPageInfoCard
            title="Geo Quiz"
            icon={Globe}
            iconColor="text-sky-400"
            items={[
              'Names, capitals, and Czech translations come from the mledoze world-countries list (jsDelivr). Flags come from flagcdn. REST Countries was a dead end: older versions are gone, and the current one wants a browser API key.',
              'The slim country list is cached in localStorage. Flags still need the CDN.',
              'A round is a region. Europe means the independent European states, not the countries with the biggest populations. You can jump around the round from the flag strip, and the result keeps a first-try count beside later guesses.'
            ]}
          />
          <ProjectSubPageInfoCard
            title="Mental Math"
            icon={Brain}
            iconColor="text-cyan-400"
            items={[
              'Exact division is built backwards: pick the divisor and the quotient, multiply, and the answer is an integer.',
              'Subtraction swaps the operands so the result stays non-negative. Mix picks the operation first, then the numbers, so the mix does not collapse into easy addition.',
              'Endless timed mode is a sprint clock. The round ends when the clock hits zero.'
            ]}
          />
        </div>
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Calculator, color: 'text-blue-400' }}
        title="5. Solvers"
        id="solvers"
      >
        <ProjectSubPageParagraph>
          The solvers are the other half of the same questions. They are
          useful when they show which move is forced, and why, and stay quiet
          when the position still has a real choice.
        </ProjectSubPageParagraph>

        <div className="grid gap-5 sm:grid-cols-2">
          <ProjectSubPageInfoCard
            title="Mine Helper"
            icon={Calculator}
            iconColor="text-emerald-400"
            items={[
              'Each revealed number becomes a constraint on its unknown neighbors. Propagation paints the cells that are already safe or already mines.',
              'When the frontier is too big to enumerate, small overlapping pockets are solved locally. A 1-of-3 clue can still show 33% while the rest of the board is open.',
              'If nothing is forced, cells are ranked by entropy: how uncertain the cell is, plus a small push toward the goal. Auto-solve paints the forced set. Stepping through the same engine is what made the rules stick.'
            ]}
          />
          <ProjectSubPageInfoCard
            title="Sudoku Helper"
            icon={Calculator}
            iconColor="text-amber-400"
            items={[
              'It imports the game’s board checks, so the helper and the puzzle agree on what a legal digit is.',
              'It surfaces naked singles and hidden singles one step at a time.',
              'Auto-solve after an edit is optional. It is also a stress test for undo, because the board keeps reshaping under you.'
            ]}
          />
          <ProjectSubPageInfoCard
            title="Chess Mate"
            icon={Calculator}
            iconColor="text-slate-300"
            items={[
              'A line is mate only if every defender reply still loses. One escape and it is not forced.',
              'Moves are ordered: mates, then checks, then captures. That keeps mate-in-2 puzzles short.',
              'chess.js generates the legal moves, including en passant and castling. The search runs in a worker so the board stays responsive.'
            ]}
          />
          <ProjectSubPageInfoCard
            title="Mirror Helper"
            icon={Calculator}
            iconColor="text-teal-300"
            items={[
              'Built after Mine Helper’s hunt mode: which mirror axis can still be true when only some cards are known.',
              'Each enabled family is a reflection of the board onto itself: vertical, horizontal, and the diagonals on a square.',
              'An axis dies when a mark and its reflection disagree. A cell is certain when every surviving axis forces the same partner. Fewer marks leave more axes alive, which is the point.'
            ]}
          />
          <ProjectSubPageInfoCard
            title="Equation Steps"
            icon={Calculator}
            iconColor="text-blue-400"
            items={[
              'Coefficients stay exact integer fractions, so clearing x/2 + 1/3 is an LCM, not a float.',
              'The write-up is one pedagogical rewrite at a time: expand, clear denominators, move a term, divide.',
              'Quadratics try integer factor pairs first. The formula is the fallback, and the radical is square-free. Degree 3 and higher is refused. That is a different lesson.'
            ]}
          />
        </div>
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Server, color: 'text-emerald-400' }}
        title="6. Deployment"
        id="deployment"
      >
        <ProjectSubPageParagraph>
          The lab ships to the same VPS as the rest of the platform. The public
          URL is <code className="text-xs">lab.krouskystepan.com</code>. Nginx
          reverse-proxies that subdomain and terminates HTTPS. PM2 keeps the
          production process up.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'Vite production build. The browser does the puzzle work.',
            'Nginx routes the subdomain, the same way the other services on the box are routed.',
            'PM2 starts and restarts the production process.',
            'Auto-deploy is a GitHub Actions workflow plus a deploy config on the VPS. The workflow builds the app and restarts the PM2 process.'
          ]}
        />

        <ProjectSubPageExternalLinks
          title="Play it"
          items={[
            {
              label: 'lab.krouskystepan.com',
              href: 'https://lab.krouskystepan.com',
              description: 'The live hub: games, solvers, English and Czech.'
            }
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Brain, color: 'text-rose-400' }}
        title="7. Trade-offs"
        id="tradeoffs"
      >
        <ProjectSubPageParagraph>
          The app stays a static client. That keeps deploy simple and makes the
          puzzle code the thing that has to be right.
        </ProjectSubPageParagraph>

        <ProjectSubPageBulletList
          items={[
            'No accounts and no server state. A cleared browser is a fresh lab.',
            'Sudoku Helper stops at naked and hidden singles. Heavier puzzles stay for the player.',
            'Mine Helper reports probabilities when a region is too large to enumerate completely.',
            'Chess legality is delegated to chess.js, on purpose.',
            'Geo Quiz can play from the cached country list, and still asks the CDN for flag images.',
            'Adding a game is a catalog entry, a route, and locale files on this same app.'
          ]}
        />

        <Alert
          type="note"
          title="One step at a time"
          description="Auto-solve paints the forced set. Stepping through the same engine, one move at a time, is what made the rules stick."
        />
      </ProjectSubPageSectionLayout>
    </>
  )
}

export default KrouskyLabCaseStudyPage
