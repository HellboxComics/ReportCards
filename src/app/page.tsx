import type { CSSProperties } from "react";
import Link from "next/link";
import { Candles } from "@/components/Candles";
import { ReportCardView } from "@/components/ReportCardView";
import { HERO_DESK, Stickers } from "@/components/Stickers";
import { Quote, Ticker } from "@/components/Ticker";
import { TopBar } from "@/components/TopBar";
import { WalletForm } from "@/components/WalletForm";
import { DEMO_STUDENTS } from "@/lib/providers/mock";
import { sampleCard } from "@/lib/sample";
import { daysUntilLock, semesterAt, SEMESTER_DAYS } from "@/lib/semester";
import { cardPath, statusLines } from "@/lib/share";
import { STATUS_THEME } from "@/lib/theme";
import type { Status } from "@/lib/types";

/** Jokes, not metrics. */
const HEADLINES = [
  "LOCAL WALLET GETS F IN TAKING PROFIT",
  "HONOR ROLL STUDENT ACCUSED OF COPYING TRADES",
  "PARENTS ADVISED TO HIDE THEIR WALLETS",
  "BAGHOLDER RECEIVES A+, ASKS IF THAT IS GOOD",
  "STUDENT INSISTS THE TEST IS “STILL EARLY”",
  "NURSE RUNS OUT OF ICE PACKS",
  "WHALE SENT TO GIFTED PROGRAM",
  "CAFETERIA FIGHT: TWELVE TRADES, ONE HOUR",
  "REPORT CARDS GO HOME MONDAY",
];

const QUOTES: [string, string, boolean][] = [
  ["TOP", "A+", true],
  ["PROFIT", "F", false],
  ["RISK", "D-", false],
  ["BAGS", "A", true],
  ["MEMES", "A+", true],
  ["PAPERHANDS", "B", true],
  ["ATTENDANCE", "PERFECT", true],
];

const SYLLABUS: { name: string; grade: string; how: string }[] = [
  { name: "BUYING THE TOP", grade: "A+", how: "Buys within 10% of the 7-day high." },
  { name: "TAKING PROFIT", grade: "F", how: "Sells that made money. Never sold? F." },
  { name: "RISK MANAGEMENT", grade: "D-", how: "Spread out, low memes, some stables." },
  { name: "HOLDING BAGS", grade: "A", how: "Bags down 40% or more." },
  { name: "CHASING MEMES", grade: "A+", how: "Anything with a dog on it." },
  { name: "SELLING TOO EARLY", grade: "B", how: "Sold, then it ran 30%+ that week." },
  { name: "ATTENDANCE", grade: "PERFECT", how: "Trading during the fire drill counts." },
];

const STATUSES: Status[] = [
  "MOST LIKELY TO BECOME EXIT LIQUIDITY",
  "HONOR ROLL",
  "EXPELLED",
  "NEEDS IMPROVEMENT",
  "SUSPENDED",
  "ACADEMIC PROBATION",
  "HELD BACK",
];

const TILT = [-5, 4, -3, 6, -6, 2, -4];

const demo = (label: string) => DEMO_STUDENTS.find((d) => d.label === label)!.address;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const now = Date.now();
  const semester = semesterAt(now);
  const left = daysUntilLock(semester, now);
  const term = semester.term;
  const front = sampleCard(now);
  const behindL = sampleCard(now, "EXPELLED");
  const behindR = sampleCard(now, "HONOR ROLL");
  const link = (label: string) => cardPath(demo(label), term);

  return (
    <main className="home">
      <Ticker badge="BREAKING" items={HEADLINES} seconds={70} />
      <TopBar
        right={
          <span className="term-pill">
            <i aria-hidden /> TERM {term}
            <span className="hide-sm"> IN SESSION</span> · LOCKS IN {left}D
          </span>
        }
      />

      <section className="hero">
        <Candles className="hero-candles" seed={1987} count={44} annotate />
        <div className="hero-copy">
          <p className="hero-kicker">
            <span className="hazard-chip">{semester.label}</span> REPORT CARDS ARE OUT
          </p>
          <h1 className="hero-h1">
            <span>YOUR WALLET</span>
            <span>
              GOT <em>GRADED.</em>
            </span>
          </h1>
          <p className="hero-sub">
            Paste a <b>Robinhood Chain</b> wallet. Harrow grades what it <u>actually did</u>{" "}
            onchain. <span className="hl">Parents will be notified.</span>
          </p>
          <WalletForm error={!!error} id="enroll" />
          <p className="demo-links">
            OR TRY A DEMO:
            <Link href={link("EXPELLED")}>EXPELLED</Link>
            <Link href={link("HONOR ROLL")}>HONOR ROLL</Link>
            <Link href={link("WHALE")}>WHALE</Link>
          </p>
        </div>

        <div className="hero-cards" aria-label="Sample report cards">
          <Stickers items={HERO_DESK} className="hero-stickers" />
          <div className="fan fan-l" aria-hidden>
            <ReportCardView card={behindL} animate={false} />
          </div>
          <div className="fan fan-r" aria-hidden>
            <ReportCardView card={behindR} animate={false} />
          </div>
          <div className="fan fan-c">
            <ReportCardView card={front} />
            <span className="tag tag-burst st-exhibit" aria-hidden>
              EXHIBIT
              <br />A
            </span>
            <span className="tag tag-box st-worse" aria-hidden>
              YOURS IS PROBABLY WORSE
            </span>
          </div>
        </div>
      </section>

      <Ticker
        variant="tape"
        seconds={28}
        reverse
        label="Sample grades ticker"
        items={QUOTES.map(([s, g, up]) => (
          <Quote key={s} sym={s} grade={g} up={up} />
        ))}
      />

      <section className="shout" aria-label="Show me your grades">
        <Ticker variant="shout" seconds={22} items={["SHOW ME YOUR GRADES", "POST YOUR REPORT CARD"]} />
      </section>

      <section className="block syllabus">
        <div className="chalkboard">
          <p className="chalk-kicker">THE SYLLABUS · 7 SUBJECTS · ZERO MERCY</p>
          <h2 className="chalk-h">
            An <span className="chalk-a">A+</span> in Buying the Top means you are really good at
            buying the top.
          </h2>
          <ol className="chalk-list">
            {SYLLABUS.map((c) => (
              <li key={c.name}>
                <span className="chalk-name">{c.name}</span>
                <span className="chalk-how">{c.how}</span>
                <span className={`chalk-grade${c.grade.length > 2 ? " long" : ""}`}>{c.grade}</span>
              </li>
            ))}
            <li className="chalk-note">
              Personality test,
              <br />
              but it&apos;s your PnL.
            </li>
          </ol>
          <span className="chalk-eraser" aria-hidden />
        </div>
      </section>

      <section className="block statuses">
        <div className="statuses-copy">
          <p className="block-kicker">PERMANENT RECORD</p>
          <h2 className="block-h">
            WHICH ONE
            <br />
            <span className="yolk">ARE YOU?</span>
          </h2>
          <p className="block-sub">
            Seven possible stamps. It goes on your permanent record, your parents will see it, and so
            will the timeline. Tap one to see a sample card.
          </p>
        </div>
        <div className="stamp-wall">
          {STATUSES.map((s, i) => {
            const l = statusLines(s);
            const t = STATUS_THEME[s];
            const d = DEMO_STUDENTS.find((x) => x.wants.status === s)!;
            return (
              <Link
                key={s}
                href={cardPath(d.address, term)}
                className={`neon-stamp${s.length > 20 ? " wide" : ""}`}
                style={{ "--tilt": `${TILT[i]}deg`, "--tone": t.key === "honor" ? t.hot : t.bg } as CSSProperties}
              >
                {l.kicker && <small>{l.kicker}</small>}
                {l.main}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="block incidents">
        <div className="block-head">
          <p className="block-kicker">RARE DROPS</p>
          <h2 className="block-h">
            SOME CARDS COME
            <br />
            <span className="pink">HOME DAMAGED.</span>
          </h2>
        </div>
        <div className="incident-grid">
          <Link className="incident" href={link("WHALE")}>
            <span className="rare">RARE</span>
            <div className="inc-art art-whale">
              <span className="mini-sticker">
                GIFTED &amp;
                <br />
                TALENTED
                <b>WHALE</b>
              </span>
            </div>
            <h3>WHALE</h3>
            <p className="inc-what">Gold gifted-program sticker</p>
            <p>Move $1M+ and the district refers you to Gifted &amp; Talented. Parents are advised to hide their wallets.</p>
          </Link>
          <Link className="incident" href={link("SUSPENDED")}>
            <span className="rare">RARE</span>
            <div className="inc-art art-nurse">
              <span className="mini-slip pink">
                NURSE&apos;S PASS
                <em>ice pack. back to class.</em>
              </span>
            </div>
            <h3>RUGGED</h3>
            <p className="inc-what">Paper-clipped nurse&apos;s pass</p>
            <p>Hold a meme that went -90% and the floor gets pulled out from under you.</p>
          </Link>
          <Link className="incident" href={link("EXPELLED")}>
            <span className="rare">RARE</span>
            <div className="inc-art art-withdrawal">
              <span className="mini-slip white">
                NOTICE OF WITHDRAWAL
                <em>reason: LIQUIDATED</em>
              </span>
            </div>
            <h3>LIQUIDATED</h3>
            <p className="inc-what">Withdrawal paperwork</p>
            <p>Automatic EXPELLED. Please collect your belongings from the front office.</p>
          </Link>
          <Link className="incident" href={link("WHALE")}>
            <span className="rare">RARE</span>
            <div className="inc-art art-fight">
              <span className="mini-slip orange">
                <i className="mini-staple" aria-hidden />
                DISCIPLINARY REFERRAL
                <em>fight in cafeteria</em>
              </span>
            </div>
            <h3>FIGHT IN CAFETERIA</h3>
            <p className="inc-what">Stapled disciplinary referral</p>
            <p>Twelve trades inside one hour. That&apos;s not a strategy, that&apos;s a fight.</p>
          </Link>
        </div>
      </section>

      <section className="block tabloid" aria-label="The Daily Detention">
        <div className="paper-news">
          <header className="news-mast">
            <span className="news-ear">
              PRICE:
              <br />
              ONE HALL PASS
            </span>
            <h2>The Daily Detention</h2>
            <span className="news-ear">
              FORECAST:
              <br />
              RED CANDLES. CHANCE OF RUG.
            </span>
          </header>
          <p className="news-dateline">
            {semester.label} · ROBINHOOD CHAIN UNIFIED SCHOOL DISTRICT · TERM {term}
          </p>
          <div className="news-cols">
            <article>
              <h3>HONOR ROLL ANNOUNCED. FACULTY “FRANKLY SUSPICIOUS.”</h3>
              <p>
                Students who took profit and wore a helmet were recognized at assembly. Harrow has
                asked to see their notes.
              </p>
            </article>
            <article>
              <h3>STUDENT BUYS TOP, CALLS IT “CONVICTION”</h3>
              <p>
                An A+ in Buying the Top was entered into the permanent record today. The student
                asked if that was good. It was not.
              </p>
            </article>
            <article className="classifieds">
              <h3>CLASSIFIEDS</h3>
              <p>
                <b>LOST:</b> 40% of portfolio. Last seen near the top. No reward.
              </p>
              <p>
                <b>FOR SALE:</b> Diamond hands. Barely used.
              </p>
              <p>
                <b>WANTED:</b> Exit liquidity. Ask at lunch.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="block semester">
        <div className="countdown">
          <span className="cd-num">{left}</span>
          <span className="cd-label">
            DAYS UNTIL
            <br />
            TERM {term} LOCKS
          </span>
        </div>
        <div className="semester-copy">
          <p className="block-kicker">{SEMESTER_DAYS}-DAY SEMESTERS</p>
          <h2 className="block-h">
            THEN IT LOCKS.
            <br />
            <span className="red">FOREVER.</span>
          </h2>
          <p className="block-sub">
            Every {SEMESTER_DAYS} days the bell rings, your card is locked as a permanent snapshot,
            and the next semester starts blank. Old cards become your transcript:{" "}
            <span className="transcript-line">Fall 2026: EXPELLED. Winter 2027: honor roll?</span>
          </p>
        </div>
      </section>

      <section className="final">
        <h2 className="final-h">
          SHOW ME
          <br />
          YOUR <em>GRADES.</em>
        </h2>
        <WalletForm compact />
      </section>

      <footer className="site-foot">
        <p>REPORT CARDS · GRADED FROM ROBINHOOD CHAIN ACTIVITY · TEACHER: HARROW</p>
        <p className="foot-fine">
          Not financial advice. Barely educational advice. Not affiliated with any brokerage or
          school district. Grades are final.
        </p>
      </footer>
    </main>
  );
}
