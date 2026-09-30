import type { CSSProperties } from "react";
import { Candles } from "@/components/Candles";
import { ReportCardView } from "@/components/ReportCardView";
import { Quote, Ticker } from "@/components/Ticker";
import { TopBar } from "@/components/TopBar";
import { WalletForm } from "@/components/WalletForm";
import { sampleCard } from "@/lib/sample";
import { daysUntilLock, semesterAt, SEMESTER_DAYS } from "@/lib/semester";
import { statusLines, statusTone } from "@/lib/share";
import type { Status } from "@/lib/types";

/** Jokes, not metrics. */
const HEADLINES = [
  "LOCAL WALLET GETS F IN TAKING PROFIT",
  "0x7a…3f EXPELLED AFTER CAFETERIA INCIDENT",
  "HONOR ROLL STUDENT ACCUSED OF COPYING TRADES",
  "PARENTS ADVISED TO HIDE THEIR WALLETS",
  "BAGHOLDER RECEIVES A+, ASKS IF THAT IS GOOD",
  "STUDENT INSISTS THE TEST IS “STILL EARLY”",
  "NURSE RUNS OUT OF ICE PACKS",
  "0xb4…91 MOST LIKELY TO BECOME EXIT LIQUIDITY",
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

const CURRICULUM: { name: string; how: string; grade: string; quip: string }[] = [
  { name: "BUYING THE TOP", grade: "A+", how: "Share of your buys within 10% of the 7-day high.", quip: "An A+ means you're elite at it. Congrats?" },
  { name: "TAKING PROFIT", grade: "F", how: "Sells that made money, scaled by how much you ever sold.", quip: "Never sold? Automatic F." },
  { name: "RISK MANAGEMENT", grade: "D-", how: "Diversification, meme exposure, keeping some stables.", quip: "Liquidated? Automatic F." },
  { name: "HOLDING BAGS", grade: "A", how: "Share of your bags down 40% or more.", quip: "Strong back. Weak portfolio." },
  { name: "CHASING MEMES", grade: "A+", how: "Meme share of everything you bought.", quip: "Anything with a dog on it." },
  { name: "SELLING TOO EARLY", grade: "B", how: "Sells followed by a 30%+ run within a week.", quip: "Left before dessert." },
  { name: "ATTENDANCE", grade: "PERFECT", how: "Days you showed up to trade.", quip: "Trading during the fire drill counts." },
];

const STATUSES: Status[] = [
  "HONOR ROLL",
  "MOST LIKELY TO BECOME EXIT LIQUIDITY",
  "NEEDS IMPROVEMENT",
  "EXPELLED",
  "ACADEMIC PROBATION",
  "SUSPENDED",
  "HELD BACK",
];

const TILT = [-6, 3, -2, 5, -4, 2, -7];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const now = Date.now();
  const semester = semesterAt(now);
  const left = daysUntilLock(semester, now);
  const sample = sampleCard(now);

  return (
    <main className="home">
      <Ticker items={HEADLINES} seconds={60} />
      <TopBar
        right={
          <span className="term-pill">
            <i aria-hidden /> TERM {semester.term}
            <span className="hide-sm"> IN SESSION</span> · LOCKS IN {left}D
          </span>
        }
      />

      <section className="hero">
        <Candles className="hero-candles" seed={1987} count={44} annotate />
        <div className="hero-copy">
          <p className="hero-kicker">
            <span className="hazard-chip">WARNING</span> {semester.label} REPORT CARDS ARE OUT
          </p>
          <h1 className="hero-h1">
            <span className="h1-a">YOUR WALLET</span>
            <span className="h1-b">
              GOT <em>GRADED.</em>
            </span>
          </h1>
          <p className="hero-sub">
            Paste a <b>Robinhood Chain</b> wallet. Get the brutally honest school report card of
            everything it did onchain. <span className="hl">Parents will be notified.</span>
          </p>
          <WalletForm error={!!error} id="enroll" />
        </div>

        <div className="hero-card">
          <span className="sticker st-sample">
            SAMPLE
            <br />
            STUDENT
          </span>
          <span className="sticker st-worse">YOURS IS PROBABLY WORSE</span>
          <div className="spotlight" aria-hidden />
          <ReportCardView card={sample} />
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
        <Ticker variant="acid" seconds={22} items={["SHOW ME YOUR GRADES", "POST YOUR REPORT CARD"]} />
      </section>

      <section className="block curriculum">
        <div className="block-head">
          <div>
            <p className="block-kicker">THE CURRICULUM</p>
            <h2 className="block-h">
              7 SUBJECTS.
              <br />
              <span className="red">ZERO MERCY.</span>
            </h2>
          </div>
          <p className="block-sub">
            Every grade measures how much your wallet <b>does the thing</b>. An A+ in Buying the
            Top means you are extremely good at buying the top.{" "}
            <span className="pen-note">That is not a compliment.</span>
          </p>
        </div>
        <ol className="subjects">
          {CURRICULUM.map((c, i) => (
            <li key={c.name} className="subject">
              <span className="subject-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="subject-body">
                <span className="subject-name">{c.name}</span>
                <span className="subject-how">{c.how}</span>
                <span className="subject-quip">{c.quip}</span>
              </span>
              <span className={`subject-grade${c.grade.length > 2 ? " long" : ""}`}>{c.grade}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="block statuses">
        <div>
          <p className="block-kicker">PERMANENT RECORD</p>
          <h2 className="block-h">
            WHICH ONE
            <br />
            <span className="acid">ARE YOU?</span>
          </h2>
          <p className="block-sub">
            Seven possible outcomes. The stamp goes on your permanent record. Your parents will
            see it. So will the timeline.
          </p>
        </div>
        <div className="stamp-cloud">
          {STATUSES.map((s, i) => {
            const l = statusLines(s);
            return (
              <span
                key={s}
                className={`neon-stamp tone-${statusTone(s)}${s.length > 20 ? " wide" : ""}`}
                style={{ "--tilt": `${TILT[i]}deg` } as CSSProperties}
              >
                {l.kicker && <small>{l.kicker}</small>}
                {l.main}
              </span>
            );
          })}
        </div>
      </section>

      <section className="block incidents">
        <p className="block-kicker">RARE INCIDENTS</p>
        <h2 className="block-h">
          SOME CARDS COME
          <br />
          <span className="hazard">HOME DAMAGED.</span>
        </h2>
        <div className="incident-grid">
          <article className="incident">
            <span className="rare">RARE</span>
            <div className="inc-art art-whale">
              <span className="mini-sticker">
                GIFTED &amp;
                <br />
                TALENTED
              </span>
            </div>
            <h3>WHALE</h3>
            <p className="inc-what">Gifted-program sticker</p>
            <p>Move $1M+ and the district refers you to Gifted &amp; Talented. Parents are advised to hide their wallets.</p>
          </article>
          <article className="incident">
            <span className="rare">RARE</span>
            <div className="inc-art art-nurse">
              <span className="mini-slip pink">
                NURSE&apos;S PASS
                <em>ice pack. back to class.</em>
              </span>
            </div>
            <h3>RUGGED</h3>
            <p className="inc-what">Nurse&apos;s office pass</p>
            <p>Hold a meme that went -90% and the floor gets pulled out from under you.</p>
          </article>
          <article className="incident">
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
          </article>
          <article className="incident">
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
          </article>
        </div>
      </section>

      <section className="block semester">
        <div className="countdown">
          <span className="cd-num">{left}</span>
          <span className="cd-label">
            DAYS UNTIL
            <br />
            TERM {semester.term} LOCKS
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
            <span className="transcript-line">FALL 2026 — EXPELLED. WINTER 2027 — HONOR ROLL?</span>
          </p>
        </div>
      </section>

      <section className="final">
        <Candles className="final-candles" seed={44} count={36} shape="dump" />
        <h2 className="final-h">
          SHOW ME
          <br />
          YOUR <em>GRADES.</em>
        </h2>
        <WalletForm compact />
      </section>

      <footer className="site-foot">
        <p>
          REPORT CARDS · GRADED FROM ROBINHOOD CHAIN ACTIVITY · TEACHER: HARROW
        </p>
        <p className="foot-fine">
          Not financial advice. Barely educational advice. Not affiliated with any brokerage or
          school district. Grades are final.
        </p>
      </footer>
    </main>
  );
}
