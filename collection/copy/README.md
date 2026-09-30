# Comedy bible

All the words in the 3,333-piece Report Cards collection live here: trait names, Harrow's comments, the
permanent-record blurbs, the 33 one-of-ones, the placeholder and the marketing lines. The files hold
typed data plus a few tiny template helpers. Generation logic (quotas, PRNG, rendering) lives elsewhere
and reads from here. `collection/SPEC.md` has the final say on quotas and tiers.

```ts
import { BACKGROUNDS, COMMENTS, ONE_OF_ONES, fill, aGrade } from "../copy";
```

| File              | Exports                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| `types.ts`        | `Tier`, `StatusKey`, `IncidentKey`, `AttendanceKey`, `EraKey`, `SeasonKey`, `When`, `TraitValue` + subtypes |
| `traits.ts`       | `MAX_SUPPLY`, helpers, `LAYER_COPY`, `TIER_COPY`, `GRADE_COPY`, `SUBJECT_COPY`, one array per layer        |
| `comments.ts`     | `COMMENTS`: 153 Harrow comments, each ≤ 90 chars, tagged with `when`                                   |
| `descriptions.ts` | blurb templates, `fill`, `aGrade`, `cap`, `COLLECTION`, `UNREVEALED`, `PRINCIPAL_ONE_LINERS`                |
| `oneOfOnes.ts`    | `ONE_OF_ONES`: exactly 33 hand-composed pieces                                                             |
| `copy.test.ts`    | Checks the rules below: lengths, counts, unique ids, that every template fills, and a banned-brand scan   |

## Grade semantics (same as the app)

A subject's letter measures **how much the student does the named thing**. So an A+ in Buying the Top
means an elite top-buyer, which is bad. **Vice** subjects are Buying the Top, Holding Bags, Chasing Memes and
Selling Too Early. **Virtue** subjects are Taking Profit and Risk Management. Standing inverts the vices
(`academicStanding` in `src/lib/grading.ts`). Every joke here is written with that in mind: "high
buyingTheTop" comments roast top-buyers, and "low takingProfit" comments roast people who never sell.

## Shapes

### `TraitValue` (every layer entry)

```ts
{
  id: "cafeteria-gravy",          // kebab slug = layer file name (stains/cafeteria-gravy.svg|png)
  name: "Mystery Cafeteria Gravy", // marketplace attribute value, Title Case, ≤ 36 chars
  joke: "Beige, glossy, ...",      // one-liner for RARITY.md / docs
  tier: "Common",                  // writers' suggested tier
  when?: When,                     // allowed only when this matches (omitted = any card)
  phrase?: "a smear of mystery cafeteria gravy", // lowercase noun phrase for blurbs
  art?: "Glossy tan smear ...",    // brief for the layer artist
}
```

Layer-specific extras:

- `PaperValue`: `key: EraKey`, `year` (the printed year; the Semester value is `Season + year`).
- `SchoolValue`: `printed` (header text), `motto` (printed under it).
- `AttendanceValue`: `key` and `printed` use the app's label, e.g. `SPOTTY`. `name` is the funny
  attribute value, e.g. "Spotty (Green Days Only)".
- `StatusValue`: `key`, `printed` (stamp text), `subtext` (small stamp line) and `share`, the suggested
  fraction of the 3,300 generated tokens. Shares sum to 1.
- `IncidentValue`: `key` and `slip: { heading, lines }`, the exact text on the attached paperwork.

`SEASONS` are `SeasonValue`s (`key`, `id`, `name`, `printed`, `joke`, `tier`, `when?`). Use
`semesterName(season, paper.year)` to get "Fall 1994" and `semesterPrinted(...)` to get "FALL 1994".

### `When` (conditions)

All fields present must match (AND). Inside one field, any listed value matches (OR).

| Field        | Matches when                                                             |
| ------------ | ------------------------------------------------------------------------ |
| `status`     | the card's status is one of these                                        |
| `notStatus`  | the card's status is none of these                                       |
| `high`       | at least one listed subject is graded A+ … B- (A or B band)              |
| `low`        | at least one listed subject is graded D+ … F (D band or F)               |
| `anyGrade`   | any of the six subjects has one of these exact letters (e.g. `["F"]`)    |
| `incident`   | the card's incident is one of these                                      |
| `attendance` | the attendance key is one of these                                       |
| `era`        | the paper's `key` is one of these                                        |
| `season`     | the semester season is one of these                                      |
| `school`     | the school `id` is one of these                                          |

"I" (Incomplete) is neither high nor low.

### Coherence rules encoded in `when`

- `SUMMER` season ⇔ `summer-school` (both directions are encoded).
- `detention-office` school only on `SUSPENDED` (same as the app's detention form).
- `gold-foil` paper and the `gold-star` pen mark only on HONOR ROLL / VALEDICTORIAN. `hearts` only on VALEDICTORIAN.
- `liquidation-red` background only on EXPELLED.
- `LIQUIDATED` withdrawal notice ⇒ EXPELLED and low Risk Management. The app sets Risk Management to 0 when
  liquidated, so make it an F.
- `circled-f` and `grade-changed` need at least one F. `arrow-why` needs a high Buying the Top.
- `RUGGED` needs high Chasing Memes or Holding Bags. `CONFISCATED_NOTE` needs high Chasing Memes.
  `PERMISSION_SLIP` needs low Risk Management. `FIGHT_IN_CAFETERIA` never appears on honor roll or valedictorian.
- `scorched` stain only on the bad statuses.

Rules the generator must enforce itself. The foundation agent should check these against `determineStatus`:

- MOST LIKELY TO BECOME EXIT LIQUIDITY: Buying the Top ≥ 90 (A- or better), Chasing Memes ≥ 80, and Taking Profit below 60.
- VALEDICTORIAN (collection-only, ≤ 3): every vice subject F, every virtue subject A+, attendance PERFECT or EXCELLENT.
- GPA should follow standing (vice subjects inverted), so an A+ in Buying the Top lowers GPA. Otherwise
  HONOR ROLL cards could print a worse GPA than EXPELLED ones.

### `TeacherComment`

`{ id, text, tier, when? }`. `text` is handwritten on the card and is also the **Teacher Comment**
attribute value, so it has no placeholders and repeats across tokens. Suggested pick order: incident, then
status, then subject high/low, then grades (`anyGrade`), then attendance and era/season, then generic. The
most specific match wins. If the card prints a second line, fill it from the next tier down. Only the first
line is the attribute.

### Blurb templates (`descriptions.ts`)

Each token gets a 3–4 sentence permanent-record blurb, picked with its seeded PRNG:

1. `OPENERS` (22)
2. subject line:
   - HONOR ROLL / VALEDICTORIAN: `BEST_SUBJECT_LINES[bestSubject]`
   - worst subject is "I": `INCOMPLETE_LINES`
   - otherwise: `WORST_SUBJECT_LINES[worstSubject]`
3. `INCIDENT_LINES[incident]`, or `DETAIL_LINES` when the incident is NONE. On about 1 in 4 incident-free
   cards, use `GPA_LINES` instead (the first band with `max ≥ gpa`).
4. `STATUS_CLOSERS[status]`

"Worst subject" is the one that hurts standing most: the highest vice score or the lowest virtue score.
"Best" is the reverse. Break ties in `SUBJECT_COPY` order.

Fill with `fill(template, vars)`, which throws on a missing var. The vars are listed in `BlurbVar`.
`school` is the school's `phrase`, e.g. "summer school". `aGrade` is `aGrade(grade)`, giving "an A+" or
"a B-". `paper`, `background`, `stain`, `doodle`, `signature` and `penMarks` are the chosen values'
`phrase`s. Run `cap()` over each sentence start to be safe. The student id changes on every token, so every blurb is unique.

### Collection-level copy

- `COLLECTION`: name, symbol, tagline, description and a one-line about. Use it for `collection.json`.
- `UNREVEALED`: `name` (the var `{id}` is the zero-padded id), `description`, the image text (`headline`,
  `subhead`, `stamp`, `envelopeLines`, `handwritten`), an art brief, and placeholder `attributes`.
- `PRINCIPAL_ONE_LINERS`: 27 PA announcements for posts, mint pages and loading states.

### `OneOfOne`

```ts
{
  slug, title,             // metadata name: "Report Card #<id> — <title>"
  lore,                    // one paragraph; use it as the description
  thumbnail,               // the ONE idea that must read at 300px
  visual: { composition, props[], palette["#RRGGBB name"], text[] }, // brief for the illustrator
  grades: Record<SubjectKey, string>, // printed grade, bespoke allowed ("EATEN", "ASH", "A++")
  gpa,                     // number, 0 – 4.33
  traits: Record<"Background" | "Paper" | "School" | "Semester" | "Attendance" | "Teacher Comment" |
                 "Pen Marks" | "Doodle" | "Stain" | "Parent Signature" | "Incident" | "Status", string>,
  extra?: Record<string, string>, // bespoke extra attributes ("Dog's Grade": "B+")
}
```

The generator adds `"1 of 1": "Yes"` and `"Rarity Tier": "1 of 1"`. Every 1/1 is a different visual gag:
a chained folder, a chewed card, a fridge door, a snowdrift, a literal rug, a paper airplane, the moon and
so on. None of them is a recolor of a layer combo.

## Content rules

- Plain text "Robinhood Chain" only. No logo, feather or trade dress. The test checks that "Robinhood"
  never appears without "Chain".
- No real people, real schools, real brands or real tokens, and no meme-character likenesses. School-life
  nostalgia uses generic words: "bubble sheet", "correction fluid", "No. 2 pencil", "pager", "tots",
  "floppy disk". `copy.test.ts` keeps a banned-word list; add to it rather than working around it.
- The humor punches at degen behavior (buying tops, bags, leverage, rugs, paper hands) and at school
  bureaucracy, never at protected groups.
- "St. Satoshi of the Perpetual Dip" is kept on purpose. It comes from the brief and the app, and it parodies
  the pseudonym and the unit, not a person.

## Checks

```bash
npx tsc --noEmit                                    # types
npx vitest run collection/copy                      # once vitest's include covers collection/**/*.test.ts
```
