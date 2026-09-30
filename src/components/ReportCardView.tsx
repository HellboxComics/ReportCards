import type { CSSProperties } from "react";
import { FORM_TITLES, SCHOOL_NAMES } from "@/lib/paperwork";
import { shortAddress } from "@/lib/reportCard";
import { isBackhanded, statusLines, textWidth, worstSubject } from "@/lib/share";
import { statusTheme } from "@/lib/theme";
import type { Incident, LetterGrade, ReportCard } from "@/lib/types";
import { Moon, Rocket, UpCandles, Wagmi } from "./Doodles";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/** Handwriting never sits straight. Fixed per row so every print matches. */
const TILT = [-6, 4, -3, 7, -5, 3, -2];

function gradeTone(g: LetterGrade) {
  if (g === "I") return "g-inc";
  if (g.startsWith("A")) return "g-a";
  if (g === "F") return "g-f";
  if (g.startsWith("D")) return "g-d";
  return "g-mid";
}

/** Loose hand-drawn loop around the worst grade. */
function PenCircle() {
  return (
    <svg className="pen-circle" viewBox="0 0 120 90" preserveAspectRatio="none" aria-hidden>
      <path
        d="M30 12 C 62 0, 112 10, 114 42 C 116 74, 70 88, 40 82 C 10 76, 2 50, 12 30 C 20 14, 44 6, 70 8"
        pathLength={1}
      />
    </svg>
  );
}

function PenArrow() {
  return (
    <svg className="pen-arrow" viewBox="0 0 60 24" aria-hidden>
      <path d="M2 16 C 18 6, 36 6, 54 12 M44 3 L 56 12 L 43 20" pathLength={1} />
    </svg>
  );
}

function Slip({ incident }: { incident: Incident }) {
  switch (incident) {
    case "RUGGED":
      return (
        <div className="slip slip-nurse">
          <span className="clip" aria-hidden />
          <strong>NURSE&apos;S OFFICE PASS</strong>
          <p>Dizzy. The floor was pulled out.</p>
          <p className="slip-pen">Ice pack. Back to class. — RN</p>
        </div>
      );
    case "LIQUIDATED":
      return (
        <div className="slip slip-withdrawal">
          <span className="staple" aria-hidden />
          <strong>NOTICE OF WITHDRAWAL</strong>
          <p>Effective immediately. Collateral kept by the district.</p>
          <p>
            Reason: <span className="slip-pen">LIQUIDATED</span>
          </p>
        </div>
      );
    case "FIGHT_IN_CAFETERIA":
      return (
        <div className="slip slip-discipline">
          <span className="staple" aria-hidden />
          <strong>DISCIPLINARY REFERRAL</strong>
          <p>CAFETERIA. 12+ trades in one lunch.</p>
          <p className="slip-pen">Parent conference required.</p>
        </div>
      );
    default:
      return null; // WHALE is the gold sticker in the corner
  }
}

export function ReportCardView({ card, animate = true }: { card: ReportCard; animate?: boolean }) {
  const worst = worstSubject(card.subjects);
  const stamp = statusLines(card.status);
  const theme = statusTheme(card.status);
  const nameIsAddress = card.studentName === shortAddress(card.address);
  const whale = card.incidents.includes("WHALE");
  const slips = card.incidents.filter((i) => i !== "WHALE");
  const title = FORM_TITLES[card.school];
  const att = card.attendance.label;

  return (
    <article
      className={[
        "paper",
        `era-${card.era}`,
        `school-${card.school}`,
        `st-${theme.key}`,
        slips.length ? "has-slips" : "",
        whale ? "has-whale" : "",
        animate ? "reveal" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--stamp-ink": theme.ink } as Vars}
      aria-label={`Report card: ${card.status}`}
    >
      <i className="fx fx-crumple" aria-hidden />
      <i className="fx fx-grain" aria-hidden />
      <i className="fx fx-crease" aria-hidden />
      <i className="fx fx-coffee" aria-hidden />
      <div className="holes" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <span className="tape tape-l" aria-hidden />
      <span className="tape tape-r" aria-hidden />
      <Rocket className="doodle d-rocket" />

      {card.source === "mock" && (
        <p className="demo-tag">
          SAMPLE · DEMO DATA <small>not this wallet&apos;s real history</small>
        </p>
      )}

      <header className="rc-head">
        <div className="rc-head-main">
          <p className="dept">{SCHOOL_NAMES[card.school]}</p>
          <h1 className="rc-title" style={{ "--tlen": title.length } as Vars}>
            {title}
          </h1>
        </div>
        <div className="corner" aria-hidden={!whale}>
          {whale ? (
            <div className="whale-sticker" aria-label="Gifted and Talented sticker, whale division">
              <span>GIFTED &amp; TALENTED</span>
              <b>WHALE</b>
              <small>DIVISION</small>
            </div>
          ) : (
            <UpCandles className="doodle d-candles" />
          )}
        </div>
      </header>

      <div className="meta">
        <span>
          STUDENT:{" "}
          <b className={nameIsAddress ? "is-addr" : undefined}>
            {nameIsAddress ? card.studentName : card.studentName.toUpperCase()}
          </b>
        </span>
        <span>
          {card.semester.label} · TERM {card.semester.term}
        </span>
      </div>
      <p className="rc-id">ID# {card.address}</p>

      <ol className="rows">
        <li className="row row-head" aria-hidden>
          <span>SUBJECT</span>
          <span>GRADE</span>
        </li>
        {card.subjects.map((s, i) => {
          const isWorst = s === worst;
          const backhanded = isBackhanded(s);
          return (
            <li
              key={s.key}
              className={`row${isWorst ? " is-worst" : ""}`}
              style={{ "--i": i, "--r": `${TILT[i]}deg` } as Vars}
            >
              <span className="subj">
                <span className="subj-name">{s.name}</span>
                <span className="remark">{s.remark}</span>
              </span>
              {isWorst ? (
                <span className="see-me" aria-label="Teacher note: see me">
                  SEE ME
                  <PenArrow />
                </span>
              ) : (
                backhanded && <span className="not-comp">not a compliment</span>
              )}
              <span className={`g ${gradeTone(s.grade)}`}>
                <span className="g-letter">{s.grade}</span>
                {isWorst && <PenCircle />}
              </span>
            </li>
          );
        })}
        <li className="row row-att" style={{ "--i": card.subjects.length } as Vars}>
          <span className="subj">
            <span className="subj-name">Attendance</span>
            <span className="remark">
              {card.attendance.daysPresent}/{card.attendance.daysInSession} days present
            </span>
          </span>
          <span className={`g g-att${att.length > 9 ? " g-att-long" : ""}`}>
            <span className="g-letter" style={{ "--alen": att.length } as Vars}>
              {att}
            </span>
            {att === "PERFECT" && <i className="gold-star" aria-label="Gold star" />}
          </span>
        </li>
      </ol>

      <div className="stamp-slot">
        <div className="stamp" role="img" aria-label={`Status: ${card.status}`}>
          <span className="stamp-inner">
            {stamp.kicker && <span className="stamp-kicker">{stamp.kicker}</span>}
            <span className="stamp-main" style={{ "--len": Math.max(6.5, textWidth(stamp.main)) } as Vars}>
              {stamp.main}
            </span>
            <span className="stamp-arc">
              ★ {card.semester.label} · H. HARROW ★
            </span>
          </span>
        </div>
      </div>

      <section className="comments">
        <h2>TEACHER COMMENTS</h2>
        {card.teacherComments.map((c, i) => (
          <p key={c} className={`pen-line${i > 0 ? " pen-line-2" : ""}`}>
            {c}
          </p>
        ))}
        <p className="signed">— Harrow, Homeroom</p>
      </section>

      {slips.length > 0 && (
        <div className={`attachments n-${slips.length}`}>
          {slips.map((i) => (
            <Slip key={i} incident={i} />
          ))}
        </div>
      )}

      <footer className="rc-foot">
        <div className="sig">
          PARENT SIGNATURE
          <span className="line">
            <span className="forged">Mom</span>
          </span>
        </div>
        <div className="foot-row">
          <p className="return">RETURN SIGNED BY MONDAY</p>
          <Wagmi className="doodle d-wagmi" />
        </div>
        <p className="term-state">
          {card.locked
            ? "REPORT CARD LOCKED — ELIGIBLE FOR PERMANENT RECORD"
            : "SEMESTER IN PROGRESS — GRADES MAY GET WORSE"}
        </p>
        <Moon className="doodle d-moon" />
      </footer>
    </article>
  );
}
