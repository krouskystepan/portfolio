# Case study screenshots

Drop images here, then set the matching `src` on `ProjectSubPageFigure` components
(or keep placeholders until you are ready).

Figures keep the image’s natural aspect ratio (`h-auto w-full`). Do not pad Discord
shots to fake a wide frame.

Pass `aspect="embed"` on Discord figures (placeholder ≈ 3:4, max-width). Admin /
composite figures stay default `aspect="wide"` (placeholder ≈ 16:9).

## Aspect ratios

| Source | Ratio | Why |
|--------|-------|-----|
| Admin dashboard | ~16:9 (or 16:10) | Wide UI; looks intentional full-bleed |
| Discord embeds / bot UI | ~3:4 or 4:5 (tight crop) | Embeds are tall cards; 16:9 leaves empty chrome |
| Composites (e.g. hub overview) | Whatever fits the collage | Can stay wide |

For Discord: crop to the embed plus a little channel context. Skip padding to 16:9.

## Suggested filenames

| File | Where it appears | Typical crop |
|------|------------------|--------------|
| `architecture-overview.png` | Hub + Architecture chapter | Composite / wide OK |
| `economy-transactions.png` | Economy chapter | Discord embed crop |
| `blackjack-session.png` | Casino chapter (interactive session) | Discord embed crop |
| `baccarat-multibet.png` | Casino chapter (multi-bet) | Discord embed crop |
| `mines-board.png` | Casino chapter (mines) - optional | Discord embed crop |
| `hilo-streak.png` | Casino chapter (hi-lo) - optional | Discord embed crop |
| `engagement-vip-quests.png` | Engagement chapter | Discord embed crop |
| `admin-overview.png` | Admin & Ops chapter | Admin ~16:9 |
| `admin-casino-settings.png` | Admin & Ops chapter (settings / RTP) | Admin ~16:9 |
| `reliability-workers-tests.png` | Testing & Reliability chapter | Admin or terminal; wide OK |

Path prefix in Next.js:

`/images/projects/discord-gambling-hub/<filename>`
