# Report Cards

**GET YOUR WALLET'S REPORT CARD.**

Connect a Robinhood Chain wallet and it prints a brutally nostalgic school report card based on
what the wallet actually did onchain.

| Subject           | Grade   |
| ----------------- | ------- |
| Buying the Top    | A+      |
| Taking Profit     | F       |
| Risk Management   | D−      |
| Holding Bags      | A       |
| Chasing Memes     | A+      |
| Selling Too Early | B       |
| Attendance        | PERFECT |

> *Teacher comment:* Participates enthusiastically but continues to make terrible financial decisions.
>
> Parent signature: ________________

The question this project answers: **what stupid thing from childhood can judge what grown adults
are doing with their money?**

## The idea

- **Semesters are 44 days.** Every wallet gets one report card per semester. When the semester
  ends the card is **LOCKED** and can be minted as a permanent snapshot. Next semester starts blank.
- Old cards become a transcript: *Fall 2026 — EXPELLED, Winter 2027 — HONOR ROLL…*
- **Statuses:** HONOR ROLL · NEEDS IMPROVEMENT · ACADEMIC PROBATION · HELD BACK · SUSPENDED ·
  EXPELLED · MOST LIKELY TO BECOME EXIT LIQUIDITY
- **Incidents physically alter the document:** WHALE → gifted-program sticker, RUGGED → nurse's
  office pass, LIQUIDATED → withdrawal paperwork, FIGHT IN CAFETERIA → stapled disciplinary referral.
- **Eras and schools are traits:** 1987 carbon copy, 1994 dot matrix, 1999 school-office printout,
  2004 inkjet; public, Catholic, summer school, detention form.
- **Not slick crypto UI.** Off-white cardstock, purple mimeograph, red teacher pen, coffee ring,
  three-hole punch, backpack fold crease. RETURN SIGNED BY MONDAY.

The viral loop is the grade itself: *"It gave me an F in Taking Profit."* → *"Post your report card."*

## How grading works

Each subject scores 0–100 for **how much the wallet does the thing the subject names** — an A+ in
Buying the Top means you are extremely good at buying the top. Academic standing (which drives the
status stamp) inverts the vice subjects.

| Subject           | Measured as                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| Buying the Top    | USD share of buys within 10% of the prior 7-day high                         |
| Taking Profit     | Share of sells that were profitable, scaled by how much was ever sold. Never selling = F |
| Risk Management   | Diversification, low meme exposure, some stables. Liquidated = F             |
| Holding Bags      | Share of held (non-stable) value down 40%+                                   |
| Chasing Memes     | Meme share of buy volume                                                     |
| Selling Too Early | USD share of sells followed by a 30%+ run within 7 days                      |
| Attendance        | Active days / days in session                                                |

Subjects without enough data get an **I (Incomplete)** — "Did not turn in work." Everything is
deterministic per wallet + semester: the same card prints every time.

Code map:

- `src/lib/grading.ts` — subjects, letter grades, incidents, status
- `src/lib/comments.ts` — Harrow's teacher comment bank
- `src/lib/semester.ts` — 44-day semesters from genesis (2026-01-01 UTC)
- `src/lib/reportCard.ts` — assembles a card (era, school, comments)
- `src/lib/providers/` — where wallet activity comes from
- `src/lib/share.ts` — which grade gets circled ("SEE ME"), the prefilled post, share links
  (always pinned to a term), the card page ticker
- `src/lib/theme.ts` — the stage color per status (red EXPELLED, pink/purple EXIT LIQUIDITY, …)
- `src/lib/sample.ts` — the landing page's sample cards (always demo data)
- `src/components/ReportCardView.tsx`, `src/app/styles/paper.css` — the paperwork
- `src/app/styles/` — `base.css` (tokens, tickers, stickers, form), `card-page.css`, `landing.css`
- `src/components/og/CardImage.tsx` — the card as a 1200x630 share image, served by
  `src/app/card/[address]/opengraph-image/route.tsx` (reads `?term=` and `?name=`, so a shared
  link unfurls as exactly that card; also what SAVE IMAGE downloads)
- `src/app/opengraph-image.tsx` — the landing page's share image
- `assets/fonts/`, `assets/og/` — self-hosted fonts and the paper texture, used by the pages
  (`next/font/local`) and the image renderer

The circled grade follows one rule: a D or F in Taking Profit or Risk Management first, then an
A-range grade in a vice subject ("A+ in Buying the Top" — not a compliment), then the weakest
virtue grade. An F in Buying the Top is good behavior and is never circled.

## Data providers

Set `DATA_PROVIDER` (see `.env.example`):

- `mock` (default) — deterministic fake activity per address, drawn from trader archetypes
  (degen, honor student, bagholder, paper hands, cafeteria-fighting whale, liquidated).
  Cards are stamped **SAMPLE — DEMO DATA**. The pinned demo students `0x000…0000` to
  `0x000…0007` land the same status every semester: EXPELLED (rugged + liquidated), EXIT
  LIQUIDITY, HONOR ROLL, SUSPENDED (rugged), ACADEMIC PROBATION, WHALE + FIGHT IN CAFETERIA,
  NEEDS IMPROVEMENT, HELD BACK. The landing page links to them.
- `blockscout` — reads a Blockscout API v2 explorer (`BLOCKSCOUT_API_URL`). Swaps are inferred
  from token transfers in the same transaction. v1 limits: USD uses current exchange rates, no
  historical prices (Buying the Top / Selling Too Early are Incomplete), no cost basis (PnL
  unknown), no liquidation detection. Stock tokens are classified via `STOCK_TOKEN_ADDRESSES`.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm test
npm run typecheck
```

- `/card/<address>?term=<n>&name=<display name>` — the report card
- `/card/<address>/opengraph-image?term=<n>&name=<display name>` — its 1200x630 share image
- `/api/card/<address>` — the same card as JSON

Set `NEXT_PUBLIC_SITE_URL` in production (e.g. `https://reportcards.example`) so share links and
`og:image` URLs are absolute and stable; without it they are built from the request's
`x-forwarded-host` / `x-forwarded-proto`.

## Roadmap

1. **Real grades:** historical prices + cost basis (DEX pool indexing or a price API) so every
   subject is graded; lending-protocol liquidation detection.
2. **Share:** ~~OG image per card; one-tap "post your grades"~~ (done). Next: native share sheet with the image.
3. **Wallet connect** instead of pasting an address.
4. **Lock & mint:** at semester end, mint the locked card as a permanent onchain snapshot.
5. **Later, still stupid:** detention slips for horrible trades, hall passes for transfers,
   diploma after N semesters, DROPOUT for inactive wallets, an end-of-year yearbook of the
   chain's legendary wallets.
