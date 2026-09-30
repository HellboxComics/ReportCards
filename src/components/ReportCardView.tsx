import type { CSSProperties } from "react";
import { shortAddress } from "@/lib/reportCard";
import { bestVice, statusLines, statusTone, textWidth, worstSubject } from "@/lib/share";
import type { Incident, LetterGrade, ReportCard } from "@/lib/types";

const SCHOOL_NAMES: Record<ReportCard["school"], string> = {
  public: "ROBINHOOD CHAIN PUBLIC SCHOOL NO. 46",
  catholic: "ST. SATOSHI OF THE PERPETUAL DIP CATHOLIC SCHOOL",
  summer: "SUMMER SCHOOL — REMEDIAL FINANCE",
  detention: "OFFICE OF STUDENT DISCIPLINE — DETENTION FORM",
};

function gradeTone(g: LetterGrade) {
  if (g === "I") return "g-inc";
  if (g.startsWith("A")) return "g-a";
  if (g === "F") return "g-f";
  if (g.startsWith("D")) return "g-d";
  return "g-mid";
}

/** Loose hand-drawn loop, drawn around the worst grade. */
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

function Attachment({ incident, card }: { incident: Incident; card: ReportCard }) {
  switch (incident) {
    case "WHALE":
      return null; // rendered as the sticker, see below
    case "RUGGED":
      return (
        <div className="slip slip-nurse">
          <span className="clip" aria-hidden />
          <strong>NURSE&apos;S OFFICE PASS</strong>
          <p>Felt dizzy after the floor was pulled out from under them.</p>
          <p className="slip-pen">Ice pack. Back to class. — RN</p>
        </div>
      );
    case "LIQUIDATED":
      return (
        <div className="slip slip-withdrawal">
          <span className="staple" aria-hidden />
          <strong>NOTICE OF WITHDRAWAL</strong>
          <p>
            {card.studentName} is withdrawn effective immediately. Collateral returned to the
            district.
          </p>
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
          <p>
            Incident: <b>FIGHT IN CAFETERIA</b>
          </p>
          <p>12+ trades exchanged in a single lunch period.</p>
        </div>
      );
  }
}

export function ReportCardView({ card, animate = true }: { card: ReportCard; animate?: boolean }) {
  const worst = worstSubject(card.subjects);
  const vice = bestVice(card.subjects);
  const stamp = statusLines(card.status);
  const tone = statusTone(card.status);
  const nameIsAddress = card.studentName === shortAddress(card.address);
  const slips = card.incidents.filter((i) => i !== "WHALE");
  const attendanceLong = card.attendance.label.length > 9;

  return (
    <article
      className={`paper era-${card.era} school-${card.school}${animate ? " reveal" : ""}`}
      aria-label={`Report card: ${card.status}`}
    >
      <div className="holes" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div className="coffee" aria-hidden />
      <div className="crease" aria-hidden />

      {card.source === "mock" && (
        <p className="demo-tag">
          SAMPLE — DEMO DATA
          <small>not this wallet&apos;s real history</small>
        </p>
      )}

      {card.incidents.includes("WHALE") && (
        <div className="whale-sticker" aria-label="Gifted and Talented sticker, whale division">
          <span>GIFTED &amp; TALENTED</span>
          <b>WHALE</b>
          <small>DIVISION</small>
        </div>
      )}

      <header className="rc-head">
        <p className="dept">{SCHOOL_NAMES[card.school]}</p>
        <h1 className="rc-title">STUDENT PROGRESS REPORT</h1>
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
      </header>

      <ol className="rows">
        <li className="row row-head" aria-hidden>
          <span>SUBJECT</span>
          <span>GRADE</span>
        </li>
        {card.subjects.map((s, i) => {
          const isWorst = s === worst;
          return (
            <li
              key={s.key}
              className={`row${isWorst ? " is-worst" : ""}`}
              style={{ "--i": i } as CSSProperties}
            >
              <span className="subj">
                <span className="subj-name">{s.name}</span>
                <span className="remark">{s.remark}</span>
              </span>
              {isWorst && (
                <span className="see-me" aria-label="Teacher note: see me">
                  SEE ME
                  <PenArrow />
                </span>
              )}
              {!isWorst && s === vice && <span className="not-comp">not a compliment</span>}
              <span className={`g ${gradeTone(s.grade)}`}>
                <span className="g-letter">{s.grade}</span>
                {isWorst && <PenCircle />}
              </span>
            </li>
          );
        })}
        <li className="row row-att" style={{ "--i": card.subjects.length } as CSSProperties}>
          <span className="subj">
            <span className="subj-name">Attendance</span>
            <span className="remark">
              {card.attendance.daysPresent}/{card.attendance.daysInSession} days present
            </span>
          </span>
          <span className={`g g-att${attendanceLong ? " g-att-long" : ""}`}>
            <span className="g-letter">{card.attendance.label}</span>
          </span>
        </li>
      </ol>

      <div className={`stamp stamp-${tone}`} role="img" aria-label={`Status: ${card.status}`}>
        <span className="stamp-inner">
          {stamp.kicker && <span className="stamp-kicker">{stamp.kicker}</span>}
          <span
            className="stamp-main"
            style={{ "--len": Math.max(7, textWidth(stamp.main)) } as CSSProperties}
          >
            {stamp.main}
          </span>
        </span>
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

      <footer className="rc-foot">
        <div className="sig">
          PARENT SIGNATURE <span className="line" />
        </div>
        <div className="foot-row">
          <p className="return">RETURN SIGNED BY MONDAY</p>
        </div>
        <p className="term-state">
          {card.locked
            ? "REPORT CARD LOCKED — ELIGIBLE FOR PERMANENT RECORD"
            : "SEMESTER IN PROGRESS — GRADES MAY GET WORSE"}
        </p>
      </footer>

      {slips.length > 0 && (
        <div className={`attachments n-${slips.length}`}>
          {slips.map((i) => (
            <Attachment key={i} incident={i} card={card} />
          ))}
        </div>
      )}
    </article>
  );
}
