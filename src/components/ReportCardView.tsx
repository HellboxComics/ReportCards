import type { Incident, LetterGrade, ReportCard } from "@/lib/types";

const SCHOOL_NAMES: Record<ReportCard["school"], string> = {
  public: "ROBINHOOD CHAIN PUBLIC SCHOOL NO. 46",
  catholic: "ST. SATOSHI OF THE PERPETUAL DIP CATHOLIC SCHOOL",
  summer: "SUMMER SCHOOL — REMEDIAL FINANCE",
  detention: "OFFICE OF STUDENT DISCIPLINE — DETENTION FORM",
};

const STATUS_CLASS: Record<ReportCard["status"], string> = {
  "HONOR ROLL": "good",
  "NEEDS IMPROVEMENT": "meh",
  "ACADEMIC PROBATION": "bad",
  "HELD BACK": "bad",
  SUSPENDED: "bad",
  EXPELLED: "bad",
  "MOST LIKELY TO BECOME EXIT LIQUIDITY": "bad",
};

function gradeClass(g: LetterGrade) {
  if (g === "I") return "grade incomplete";
  if (g.startsWith("A")) return "grade a";
  if (g === "F" || g.startsWith("D")) return "grade f";
  return "grade";
}

function Attachment({ incident, card }: { incident: Incident; card: ReportCard }) {
  switch (incident) {
    case "WHALE":
      return (
        <div className="sticker" aria-label="Gifted program sticker">
          <span>GIFTED &amp; TALENTED</span>
          <small>WHALE DIVISION</small>
        </div>
      );
    case "RUGGED":
      return (
        <div className="slip nurse">
          <strong>NURSE&apos;S OFFICE PASS</strong>
          <p>Student reported feeling dizzy after the floor was pulled out from under them.</p>
          <p className="pen">Ice pack. Sent back to class. — RN</p>
        </div>
      );
    case "LIQUIDATED":
      return (
        <div className="slip withdrawal">
          <strong>NOTICE OF WITHDRAWAL</strong>
          <p>
            Student {card.studentName} has been withdrawn from enrollment effective immediately.
            Collateral has been returned to the district.
          </p>
          <p>Reason: <span className="pen">LIQUIDATED</span></p>
        </div>
      );
    case "FIGHT_IN_CAFETERIA":
      return (
        <div className="slip discipline">
          <span className="staple" aria-hidden />
          <strong>DISCIPLINARY REFERRAL</strong>
          <p>Incident: FIGHT IN CAFETERIA</p>
          <p>Twelve or more trades were exchanged within a single lunch period.</p>
        </div>
      );
  }
}

export function ReportCardView({ card }: { card: ReportCard }) {
  return (
    <article className={`paper card era-${card.era} school-${card.school}`}>
      <div className="holes" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div className="coffee" aria-hidden />
      <div className="crease" aria-hidden />

      <header>
        <p className="dept">{SCHOOL_NAMES[card.school]}</p>
        <h1>STUDENT PROGRESS REPORT</h1>
        <div className="meta">
          <span>
            STUDENT: <b>{card.studentName.toUpperCase()}</b>
          </span>
          <span>
            {card.semester.label} — TERM {card.semester.term}
          </span>
          <span className="addr">ID# {card.address}</span>
        </div>
      </header>

      <table className="grades">
        <thead>
          <tr>
            <th>SUBJECT</th>
            <th>GRADE</th>
            <th>REMARKS</th>
          </tr>
        </thead>
        <tbody>
          {card.subjects.map((s) => (
            <tr key={s.key}>
              <td>{s.name.toUpperCase()}</td>
              <td className={gradeClass(s.grade)}>{s.grade}</td>
              <td className="remark">{s.remark}</td>
            </tr>
          ))}
          <tr>
            <td>ATTENDANCE</td>
            <td className={card.attendance.label === "PERFECT" ? "grade a" : "grade"}>
              {card.attendance.label}
            </td>
            <td className="remark">
              {card.attendance.daysPresent}/{card.attendance.daysInSession} days present
            </td>
          </tr>
        </tbody>
      </table>

      <section className="comments">
        <h2>TEACHER COMMENTS</h2>
        {card.teacherComments.map((c) => (
          <p key={c} className="pen">
            {c}
          </p>
        ))}
        <p className="signed">— Harrow, Homeroom</p>
      </section>

      <div className={`stamp ${STATUS_CLASS[card.status]}`}>{card.status}</div>

      <footer>
        <div className="sig">
          Parent signature: <span className="line" />
        </div>
        <p className="return">RETURN SIGNED BY MONDAY</p>
        {card.source === "mock" && <p className="demo">SAMPLE — DEMO DATA, NOT THIS WALLET&apos;S REAL HISTORY</p>}
        {card.locked ? (
          <p className="locked">REPORT CARD LOCKED — ELIGIBLE FOR PERMANENT RECORD</p>
        ) : (
          <p className="inprogress">SEMESTER IN PROGRESS — GRADES MAY GET WORSE</p>
        )}
      </footer>

      <div className="attachments">
        {card.incidents.map((i) => (
          <Attachment key={i} incident={i} card={card} />
        ))}
      </div>
    </article>
  );
}
