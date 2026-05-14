import {
  AppWindow,
  FolderTree,
  HardDrive,
  Layers,
  LayoutDashboard,
  Monitor,
  MousePointer2,
  PanelBottom,
  Save,
  Scale,
  Sparkles
} from 'lucide-react'
import Alert from '@/components/Alert'
import {
  ProjectSubPageBulletList,
  ProjectSubPageDescription,
  ProjectSubPageFlowDiagram,
  ProjectSubPageInfoCard,
  ProjectSubPageParagraph,
  ProjectSubPageSectionLayout,
  ProjectSubPageTableOfContents,
  ProjectSubPageTag,
  ProjectSubPageTitle
} from '@/components/SubPageComponents'

const WebosNextCaseStudyPage = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-12">
      <header className="mb-8">
        <ProjectSubPageTag text="Case Study" />
        <ProjectSubPageTitle title="WebOS Next - desktop shell in the browser" />
        <ProjectSubPageDescription
          description={`WebOS Next is a client-only “web OS” experiment: a full-viewport shell with wallpaper, light/dark theme and accent colors, draggable desktop icons, a taskbar with Start menu, and floating windows managed in Zustand.\nThe file layer is a persisted virtual filesystem in localStorage-create, rename, move, copy, soft-delete to Trash, and open files into the right program via extension and shortcut rules.\nThe codebase stays constants-driven (timing, z-index layers, MIME types, storage keys) so the shell stays coherent as more programs are added.`}
        />
      </header>

      <Alert
        type="info"
        title="Project overview"
        description="The shell composes ShellThemeRoot, a full-viewport Desktop, and a Taskbar. State is split across focused stores (windows, VFS, desktop layout, personalization, trash metadata, context menu) with selective Zustand persistence-no server-side database in the core design."
      />

      <ProjectSubPageTableOfContents
        title="Contents"
        items={[
          { label: 'Motivation & goals', href: '#motivation' },
          { label: 'User experience', href: '#experience' },
          { label: 'Architecture', href: '#architecture' },
          { label: 'State & persistence', href: '#state' },
          { label: 'Virtual filesystem & Explorer', href: '#vfs' },
          { label: 'Built-in programs', href: '#programs' },
          { label: 'Windows, taskbar & desktop', href: '#windows' },
          { label: 'Trade-offs', href: '#tradeoffs' },
          { label: 'Future work', href: '#future' }
        ]}
      />

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: LayoutDashboard, color: 'text-blue-400' }}
        title="1. Motivation & goals"
        id="motivation"
      >
        <ProjectSubPageParagraph>
          Most web apps are single-surface SPAs. This project explores desktop
          affordances-spatial icon layout, several windows at once, and files as
          the unit of work-without relying on a backend for core state.
        </ProjectSubPageParagraph>
        <ProjectSubPageBulletList
          items={[
            'Ship a credible miniature desktop: taskbar, clock, Start menu, window chrome, focus and z-order, minimize, maximize, and close.',
            'Implement a virtual filesystem with CRUD, soft delete to Trash, and associations that launch the correct program.',
            'Keep the data layer offline-capable: files, layout, and personalization persist locally.',
            'Stay maintainable as programs multiply: a typed program registry, shared constants, and small Zustand stores instead of one global object.'
          ]}
        />
        <Alert
          type="note"
          title="Scope"
          description="Non-goals for the current design include real multi-user sync, native file system access as the primary store, and a production security model-the surface is intentionally a personal, local-first desk toy."
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: MousePointer2, color: 'text-cyan-400' }}
        title="2. User experience"
        id="experience"
      >
        <ProjectSubPageParagraph>
          After hydration, users see Desktop and Taskbar inside ShellThemeRoot
          (theme classes and CSS variables from the personalization store). The
          Start menu exposes wallpaper presets, custom wallpaper upload (image/*
          as a data URL), theme chips, and accent swatches. Pinned VFS items and
          a capped Recent files list open through the same helper as
          double-click-so Start, Explorer, and desktop shortcuts stay
          consistent.
        </ProjectSubPageParagraph>
        <ProjectSubPageBulletList
          items={[
            'Launch Explorer to browse folders, open files, rename, and drag items; drag from Explorer onto the desktop to create shortcuts (HTML5 DnD with a dedicated in-app MIME type).',
            'Edge snap with preview, marquee multi-select on the desktop, and taskbar grouping of open windows.',
            'Unknown routes render a branded not-found page still wrapped in ShellThemeRoot, with a path back to the desktop.'
          ]}
        />
        <ProjectSubPageFlowDiagram
          steps={[
            'Shell loads → persist middleware hydrates stores',
            'User opens Explorer or an app from Start',
            'User creates or opens files and arranges windows / desktop icons',
            'Reload → windows, VFS tree, and layout restore from localStorage'
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Layers, color: 'text-emerald-400' }}
        title="3. Architecture"
        id="architecture"
      >
        <ProjectSubPageParagraph>
          The app uses the Next.js App Router for the shell entry, client
          components for interaction, and Tailwind v4 with global design tokens.
          Major pieces: a program registry (typed ProgramId to component, icon,
          default window geometry, Explorer metadata, optional onCreateWindow
          hooks), a window manager, the VFS store with action helpers, a desktop
          store for icon grid and selection, personalization, trash coordination
          with the program store, and context menus.
        </ProjectSubPageParagraph>
        <div className="grid gap-5 sm:grid-cols-3">
          <ProjectSubPageInfoCard
            title="Shell"
            icon={PanelBottom}
            iconColor="text-emerald-300"
            items={[
              'ShellThemeRoot applies theme, accent, and wallpaper.',
              'Layout pins full-viewport height with overflow hidden.',
              'Desktop + Taskbar composition matches a classic desktop metaphor.'
            ]}
          />
          <ProjectSubPageInfoCard
            title="Program host"
            icon={AppWindow}
            iconColor="text-purple-400"
            items={[
              'Typed ProgramId union reduces wiring bugs.',
              'Registry supplies window defaults and optional open-time seeding.',
              'Window chrome, resize handles, and z-order live in the window store.'
            ]}
          />
          <ProjectSubPageInfoCard
            title="Data layer"
            icon={HardDrive}
            iconColor="text-sky-400"
            items={[
              'VFS graph of nodes under a synthetic root (display name “Desktop” on disk vs wallpaper surface).',
              'Zustand persist per slice with distinct storage keys.',
              'Settings can export/import a single JSON backup of persisted keys.'
            ]}
          />
        </div>
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Monitor, color: 'text-amber-400' }}
        title="4. State & persistence"
        id="state"
      >
        <ProjectSubPageBulletList
          items={[
            'Stores are split by domain to limit rerenders and keep persistence boundaries clear.',
            'On rehydrate, saved windows are forced unfocused so users do not get invisible focus after reload.',
            'Legacy migration maps stored programId apps → explorer on load.',
            'The VFS persist wrapper can catch QuotaExceededError and record a session flag so Settings can show a quota-hit banner.'
          ]}
        />
        <Alert
          type="note"
          title="Local-first backup"
          description="Settings gathers parsed JSON for configured persist keys and downloads webos-backup.json; import writes those keys back and reloads after a short delay for a portable desk snapshot."
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: FolderTree, color: 'text-violet-400' }}
        title="5. Virtual filesystem & Explorer"
        id="vfs"
      >
        <ProjectSubPageParagraph>
          The VFS is a directed tree keyed by id with a synthetic root folder.
          Soft delete sets deletedAt on a node and its subtree and strips
          matching desktop vfs-node tiles; Trash lists program-store metadata
          written before delete and coordinates restore and empty with the VFS
          and desktop shortcuts.
        </ProjectSubPageParagraph>
        <ProjectSubPageBulletList
          items={[
            'Explorer is a hybrid: virtual System and Apps (from the registry), plus real VFS folders with Back/Up, in-folder filter, toolbar CRUD, breadcrumbs, and keyboard shortcuts (Enter, Delete, F2).',
            'Opening by extension routes e.g. .txt → Notepad, .paint → Paint; .app / .oslink files carry JSON { programId } like OS shortcuts.',
            'Explorer windows can carry deep-link fields so other surfaces reopen or retarget an existing Explorer instead of spawning duplicates.'
          ]}
        />
        <Alert
          type="warning"
          title="Storage pressure"
          description="Large Paint documents embed raster data in JSON; together with other slices this can hit browser quota. Paint’s persist path downscales and re-encodes under byte caps so saves fail gracefully with user-visible errors instead of silent corruption."
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Sparkles, color: 'text-pink-400' }}
        title="6. Built-in programs"
        id="programs"
      >
        <ProjectSubPageBulletList
          items={[
            'Explorer - navigation, DnD, and launcher surface for the rest of the shell.',
            'Notepad - TipTap rich text; dynamic import without SSR; multiple documents tied to VFS where applicable.',
            'Paint - pencil, brush, eraser, fill, picker, line, rectangle, palette, and a versioned JSON document codec.',
            'Calculator - single-instance four-function utility with expression building.',
            'Trash - single-instance UI over trash entries plus VFS restore/purge.',
            'Settings - storage meter against an assumed localStorage budget, JSON export/import, full reset, and quota UX.'
          ]}
        />
        <ProjectSubPageParagraph>
          A Browser iframe prototype exists in the codebase but is commented out
          of the registry until sandbox and navigation UX are production-minded.
        </ProjectSubPageParagraph>
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: AppWindow, color: 'text-sky-400' }}
        title="7. Windows, taskbar & desktop"
        id="windows"
      >
        <ProjectSubPageBulletList
          items={[
            'createWindow seeds geometry from per-program defaults; openWindow applies a cascaded pixel offset so rapid opens stay readable and clamps floating positions so title bars stay grabbable.',
            'Single-instance programs (e.g. Settings, Trash, Calculator) focus an existing window; Explorer can bump a navigation request timestamp on an existing instance.',
            'Edge snap uses a snapPreview state (left, right, top) before commit; desktop uses a grid with drag reposition, marquee selection, bounds clamping on resize, and optional notice when icons drift off-screen.'
          ]}
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Scale, color: 'text-rose-400' }}
        title="8. Engineering trade-offs"
        id="tradeoffs"
      >
        <ProjectSubPageBulletList
          items={[
            'Zustand per domain beats a single mega-context for high-frequency window and pointer updates and per-slice persist middleware.',
            'String-based file bodies are simple to serialize but grow storage cost for large assets-mitigated for Paint with raster downscale and format steps before JSON hits localStorage.',
            'A constants-heavy src/constants layout trades verbosity for predictable cross-cutting tuning (MIME, z-index, storage keys, timing).'
          ]}
        />
        <Alert
          type="info"
          title="Why client-only"
          description="No auth layer: appropriate for a portfolio-grade experiment where the priority is composable UI architecture and user-owned persistence rather than multi-tenant security."
        />
      </ProjectSubPageSectionLayout>

      <ProjectSubPageSectionLayout
        iconStyle={{ icon: Save, color: 'text-neutral-400' }}
        title="9. Future work"
        id="future"
      >
        <ProjectSubPageBulletList
          items={[
            'Finish or replace the Browser program with iframe navigation, clear sandbox policy, and safe defaults.',
            'Per-file import/export beyond the full backup JSON.',
            'Accessibility pass on window chrome, Explorer lists, and context menus.',
            'IndexedDB or OPFS behind the same VFS API for larger attachments while keeping the shell UI unchanged.',
            'Touch gestures and reduced-motion polish for marquee and window drag.'
          ]}
        />
      </ProjectSubPageSectionLayout>

      <section className="mt-8 border-t border-neutral-800 pt-8">
        <p className="text-sm text-neutral-400">
          WebOS Next is a disciplined React application: composable stores,
          explicit constants, and local-first persistence-useful as a portfolio
          centerpiece for complex frontend engineering without a traditional
          backend.
        </p>
      </section>
    </div>
  )
}

export default WebosNextCaseStudyPage
