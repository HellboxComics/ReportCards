import { ImageResponse } from "next/og";
import { marginNotes, type MarginNote } from "@/lib/notes";
import { FORM_TITLES, SCHOOL_NAMES, headlineComment } from "@/lib/paperwork";
import { shortAddress } from "@/lib/reportCard";
import {
  INCIDENT_LABEL,
  customName,
  isBackhanded,
  leadSubject,
  statusLines,
  textWidth,
  withArticle,
  worstSubject,
} from "@/lib/share";
import { statusTheme } from "@/lib/theme";
import type { Incident, LetterGrade, ReportCard, SubjectGrade } from "@/lib/types";
import { ogAssets } from "./assets";

/*
 * The report card as a 1200x630 share image: the paper on the left with every
 * grade big enough to read at timeline size, the verdict huge on the right.
 * Satori rules: flexbox only, and every element with more than one child
 * needs display:flex.
 */

export const OG_SIZE = { width: 1200, height: 630 };

const C = {
  ink: "#24211d",
  mimeo: "#5a3d96",
  pen: "#d3170f",
  green: "#0e8a3c",
  rule: "rgba(36,33,29,0.26)",
  hazard: "#ffd400",
  black: "#0a0a0a",
  paper: "#f6f1e2",
};

/** Handwriting never sits straight. Fixed per subject so every render matches. */
const TILT = [-7, 5, -4, 8, -6, 4];
/** Two columns, three rows: the viral pair (Taking Profit, Holding Bags) sit side by side. */
const ORDER = [0, 3, 1, 4, 2, 5];

const PAPER = { left: 26, top: 70, width: 660, height: 530 };

function gradeSize(g: LetterGrade): number {
  if (g === "I") return 58;
  if (g === "F") return 92;
  return g.length > 1 ? 72 : 84;
}

/** Split into at most two lines and find the biggest Anton size that fits. */
function fitStatus(main: string, maxW: number, maxH: number, cap: number) {
  const words = main.split(" ");
  const options: string[][] = [[main]];
  for (let i = 1; i < words.length; i++) options.push([words.slice(0, i).join(" "), words.slice(i).join(" ")]);
  let best = { lines: [main], size: 0 };
  for (const lines of options) {
    const widest = Math.max(...lines.map(textWidth));
    const size = Math.floor(Math.min(cap, maxW / (widest * 0.5), maxH / (lines.length * 0.92)));
    if (size > best.size) best = { lines, size };
  }
  return best;
}

function PenLoop({ w, h }: { w: number; h: number }) {
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 120 90"
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      <path
        d="M30 12 C 62 0, 112 10, 114 42 C 116 74, 70 88, 40 82 C 10 76, 2 50, 12 30 C 20 14, 44 6, 70 8"
        fill="none"
        stroke={C.pen}
        strokeWidth={5}
        strokeLinecap="round"
      />
    </svg>
  );
}

function Check({ size }: { size: number }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 30 24" style={{ marginRight: 4 }}>
      <path
        d="M3 13 C 7 15, 9 18, 11 21 C 15 12, 21 6, 28 2"
        fill="none"
        stroke={C.green}
        strokeWidth={3.6}
        strokeLinecap="round"
      />
    </svg>
  );
}

function GradeCell({ s, i, worst, note }: { s: SubjectGrade; i: number; worst: boolean; note?: MarginNote }) {
  const backhanded = isBackhanded(s);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: 280,
        height: 80,
        borderBottom: `2px dashed ${C.rule}`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: 160 }}>
        <div
          style={{
            display: "flex",
            fontFamily: "Courier Prime",
            fontWeight: 700,
            fontSize: 18,
            lineHeight: 1.05,
            padding: "1px 4px",
            marginLeft: -4,
            backgroundColor: worst ? "rgba(255,226,0,0.85)" : "transparent",
          }}
        >
          {s.name.toUpperCase()}
        </div>
        {worst ? (
          <div
            style={{
              display: "flex",
              fontFamily: "Permanent Marker",
              fontSize: 24,
              color: C.pen,
              marginTop: 4,
              transform: "rotate(-6deg)",
            }}
          >
            {backhanded ? "SEE ME (not a compliment)" : "SEE ME →"}
          </div>
        ) : note ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              whiteSpace: "nowrap",
              fontFamily: "Nanum Pen Script",
              fontSize: Math.min(27, Math.floor(172 / (note.text.length * 0.4 + (note.tone === "green" ? 2 : 0)))),
              lineHeight: 1,
              color: note.tone === "green" ? C.green : C.pen,
              marginTop: 4,
              transform: `rotate(${note.tone === "green" ? -3 : -4}deg)`,
            }}
          >
            {note.tone === "green" && <Check size={22} />}
            {note.text}
          </div>        ) : (
          <div style={{ display: "flex", fontSize: 14, opacity: 0.62, marginTop: 3 }}>{s.remark}</div>
        )}
      </div>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 116,
          height: 80,
        }}
      >
        {worst && <PenLoop w={116} h={80} />}
        <div
          style={{
            display: "flex",
            fontFamily: "Permanent Marker",
            fontSize: gradeSize(s.grade),
            lineHeight: 1,
            marginTop: 12,
            color: s.grade === "I" ? "#8a877f" : C.pen,
            transform: `rotate(${TILT[i]}deg)`,
          }}
        >
          {s.grade}
        </div>
      </div>
    </div>
  );
}

function Stamp({ card, width }: { card: ReportCard; width: number }) {
  const { kicker, main } = statusLines(card.status);
  const ink = statusTheme(card.status).ink;
  const fit = fitStatus(main, width, 62, 62);
  return (
    <div
      style={{
        display: "flex",
        padding: 4,
        border: `6px solid ${ink}`,
        borderRadius: 12,
        color: ink,
        transform: "rotate(-7deg)",
        opacity: 0.92,
        backgroundColor: `${ink}1c`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "4px 12px 3px",
          border: `2px solid ${ink}`,
          borderRadius: 6,
        }}
      >
        {kicker && (
          <div style={{ display: "flex", fontFamily: "Anton", fontSize: 15, letterSpacing: 2 }}>{kicker}</div>
        )}
        {fit.lines.map((l) => (
          <div key={l} style={{ display: "flex", fontFamily: "Anton", fontSize: fit.size, lineHeight: 0.95 }}>
            {l}
          </div>
        ))}
        <div
          style={{ display: "flex", fontFamily: "Courier Prime", fontWeight: 700, fontSize: 11, letterSpacing: 3, marginTop: 3 }}
        >
          {`★ ${card.semester.label} · H. HARROW ★`}
        </div>
      </div>
    </div>
  );
}

/** "0x0000…0002" with the ellipsis lifted off the baseline (it reads as "_" otherwise). */
function Addr({ value, size }: { value: string; size: number }) {
  const [a, b] = value.split("…");
  if (b === undefined) return <div style={{ display: "flex" }}>{value}</div>;
  return (
    <div style={{ display: "flex" }}>
      <div style={{ display: "flex" }}>{a}</div>
      <div style={{ display: "flex", transform: `translateY(${-Math.round(size * 0.3)}px)`, letterSpacing: -1 }}>…</div>
      <div style={{ display: "flex" }}>{b}</div>
    </div>
  );
}

/** Which attachment gets clipped to the share image: the rarest one. */
const SLIP_ORDER: Incident[] = ["LIQUIDATED", "FIGHT_IN_CAFETERIA", "RUGGED"];

function Paper({ card, paper }: { card: ReportCard; paper: string }) {
  const worst = worstSubject(card.subjects);
  const notes = marginNotes(card, { skip: worst?.key, prefer: leadSubject(card)?.key });
  const slip = SLIP_ORDER.find((i) => card.incidents.includes(i));
  const whale = card.incidents.includes("WHALE");
  const honor = card.status === "HONOR ROLL";
  const name = customName(card);
  const comment = headlineComment(card.teacherComments);
  const hole = statusTheme(card.status).bg2;
  return (
    <div
      style={{
        position: "absolute",
        left: PAPER.left,
        top: PAPER.top,
        width: PAPER.width,
        height: PAPER.height,
        display: "flex",
        flexDirection: "column",
        padding: "22px 24px 14px 64px",
        color: C.ink,
        fontFamily: "Courier Prime",
        backgroundColor: C.paper,
        transform: "rotate(-1.3deg)",
        boxShadow: "0 26px 60px rgba(0,0,0,0.55), 0 4px 10px rgba(0,0,0,0.35)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img
        src={paper}
        width={PAPER.width}
        height={PAPER.height}
        style={{ position: "absolute", left: 0, top: 0, width: PAPER.width, height: PAPER.height }}
      />
      {/* three-hole punch */}
      {[62, 250, 438].map((t) => (
        <div
          key={t}
          style={{
            position: "absolute",
            left: 20,
            top: t,
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: hole,
            boxShadow: "inset 2px 3px 4px rgba(0,0,0,0.6)",
          }}
        />
      ))}
      {/* masking tape */}
      <div
        style={{
          position: "absolute",
          left: -22,
          top: 4,
          width: 120,
          height: 32,
          backgroundColor: "rgba(232,218,170,0.88)",
          transform: "rotate(-32deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -26,
          top: 8,
          width: 120,
          height: 32,
          backgroundColor: "rgba(232,218,170,0.85)",
          transform: "rotate(34deg)",
        }}
      />

      {card.source === "mock" && (
        <div
          style={{
            position: "absolute",
            left: 96,
            top: -14,
            display: "flex",
            padding: "4px 10px",
            border: `2px solid ${C.pen}`,
            color: C.pen,
            backgroundColor: "#fffdf4",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1,
            transform: "rotate(2deg)",
            boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
          }}
        >
          SAMPLE — DEMO DATA · NOT THIS WALLET&apos;S REAL HISTORY
        </div>
      )}

      <div style={{ display: "flex", flexShrink: 0, fontSize: 14, fontWeight: 700, letterSpacing: 2, color: C.mimeo }}>
        {SCHOOL_NAMES[card.school]}
      </div>
      <div
        style={{
          display: "flex",
          flexShrink: 0,
          fontSize: FORM_TITLES[card.school].length > 24 ? 25 : 30,
          fontWeight: 700,
          letterSpacing: 1,
          color: C.mimeo,
          marginTop: 2,
        }}
      >
        {FORM_TITLES[card.school]}
      </div>
      <div
        style={{
          display: "flex",
          flexShrink: 0,
          justifyContent: "space-between",
          fontSize: 17,
          marginTop: 5,
          padding: whale ? "6px 58px 5px 0" : "6px 0 5px",
          borderTop: `4px solid ${C.ink}`,
          borderBottom: `1px solid ${C.ink}`,
        }}
      >
        <div style={{ display: "flex" }}>
          STUDENT:&nbsp;
          <div style={{ display: "flex", fontWeight: 700 }}>
            {name ? name.toUpperCase() : <Addr value={shortAddress(card.address)} size={17} />}
          </div>
        </div>
        <div style={{ display: "flex" }}>{`${card.semester.label} · TERM ${card.semester.term}`}</div>
      </div>

      <div style={{ display: "flex", flexShrink: 0, flexWrap: "wrap", justifyContent: "space-between", marginTop: 0 }}>
        {ORDER.map((i) => (
          <GradeCell
            key={i}
            s={card.subjects[i]}
            i={i}
            worst={card.subjects[i] === worst}
            note={notes[card.subjects[i].key]}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexShrink: 0,
          alignItems: "center",
          height: 44,
          fontSize: 18,
          fontWeight: 700,
          borderBottom: `2px dashed ${C.rule}`,
        }}
      >
        <div style={{ display: "flex" }}>ATTENDANCE</div>
        <div
          style={{
            display: "flex",
            fontFamily: "Permanent Marker",
            fontWeight: 400,
            fontSize: card.attendance.label.length > 10 ? 24 : 32,
            color: C.pen,
            marginLeft: 18,
            marginTop: 6,
            transform: "rotate(-3deg)",
          }}
        >
          {card.attendance.label}
        </div>
        <div style={{ display: "flex", fontWeight: 400, fontSize: 14, opacity: 0.7, marginLeft: 14 }}>
          {`${card.attendance.daysPresent}/${card.attendance.daysInSession} days present`}
        </div>
      </div>

      <div style={{ display: "flex", flexGrow: 1, alignItems: "center", paddingTop: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", width: slip ? 262 : 300 }}>
          <div style={{ display: "flex", fontSize: 12, fontWeight: 700, letterSpacing: 3 }}>TEACHER COMMENTS</div>
          <div
            style={{
              display: "flex",
              fontFamily: "Nanum Pen Script",
              fontSize: comment.length > 64 ? (slip ? 25 : 27) : 31,
              lineHeight: 0.95,
              color: C.pen,
              marginTop: 4,
            }}
          >
            {`${comment} — Harrow`}
          </div>
        </div>
        <div style={{ display: "flex", flexGrow: 1, justifyContent: slip ? "flex-start" : "flex-end", marginLeft: 10 }}>
          <div style={{ display: "flex", position: "relative" }}>
            <Stamp card={card} width={slip ? 190 : 236} />
            {honor && (
              <div style={{ display: "flex", position: "absolute", left: -30, top: -34 }}>
                <GoldStar size={74} rot={-14} />
              </div>
            )}
            {honor && (
              <div style={{ display: "flex", position: "absolute", right: -18, bottom: -16 }}>
                <GoldStar size={44} rot={16} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const burstPoints = (n: number, r1: number, r2: number, c: number) =>
  Array.from({ length: n * 2 }, (_, i) => {
    const r = i % 2 ? r2 : r1;
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    return `${(c + Math.cos(a) * r).toFixed(1)},${(c + Math.sin(a) * r).toFixed(1)}`;
  }).join(" ");

function GoldStar({ size, rot }: { size: number; rot: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: `rotate(${rot}deg)` }}>
      <defs>
        <linearGradient id="gs" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff6b0" />
          <stop offset="0.4" stopColor="#ffc400" />
          <stop offset="0.55" stopColor="#fff3a0" />
          <stop offset="0.85" stopColor="#d18a00" />
        </linearGradient>
      </defs>
      <polygon points={burstPoints(5, 48, 20, 50)} fill="url(#gs)" stroke="#9a5a00" strokeWidth={2} />
    </svg>
  );
}

/** The gold WHALE seal, slapped over the paper's top-right corner. */
function WhaleSeal() {
  const size = 150;
  return (
    <div
      style={{
        position: "absolute",
        left: 566,
        top: 22,
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: "rotate(-12deg)",
      }}
    >
      <svg width={size} height={size} viewBox="0 0 150 150" style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <radialGradient id="foil" cx="0.36" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#fffbd0" />
            <stop offset="0.34" stopColor="#ffd84a" />
            <stop offset="0.66" stopColor="#f4a90c" />
            <stop offset="1" stopColor="#b86a00" />
          </radialGradient>
          <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0.55">
            <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.45" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="0.56" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={burstPoints(20, 75, 64, 75)} fill="#5a2c00" opacity="0.45" transform="translate(3 6)" />
        <polygon points={burstPoints(20, 73, 62, 75)} fill="url(#foil)" />
        <polygon points={burstPoints(20, 73, 62, 75)} fill="url(#shine)" />
        <circle cx="75" cy="75" r="47" fill="none" stroke="#5a2c00" strokeOpacity="0.55" strokeWidth="2.5" strokeDasharray="5 5" />
      </svg>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "Anton",
          color: "#4a2400",
          lineHeight: 0.95,
        }}
      >
        <div style={{ display: "flex", fontSize: 14 }}>GIFTED &amp; TALENTED</div>
        <div style={{ display: "flex", fontSize: 44 }}>WHALE</div>
        <div style={{ display: "flex", fontSize: 13, letterSpacing: 2 }}>DIVISION</div>
      </div>
    </div>
  );
}

const SLIPS: Record<Exclude<Incident, "WHALE">, { bg: string; title: string; body: string; pen: string }> = {
  RUGGED: { bg: "#ffd3dc", title: "NURSE'S OFFICE PASS", body: "Dizzy. The floor was pulled out.", pen: "Ice pack. Back to class.\u00a0—\u00a0RN" },
  LIQUIDATED: { bg: "#ffffff", title: "NOTICE OF WITHDRAWAL", body: "Collateral kept by the district.", pen: "Reason: LIQUIDATED" },
  FIGHT_IN_CAFETERIA: { bg: "#ffc47f", title: "DISCIPLINARY REFERRAL", body: "CAFETERIA. 12+ trades in one lunch.", pen: "Parent conference required." },
};

/** One attachment stapled to the paper's bottom-right corner, hanging off the edge. */
function SlipArt({ incident }: { incident: Exclude<Incident, "WHALE"> }) {
  const slip = SLIPS[incident];
  return (
    <div
      style={{
        position: "absolute",
        left: 536,
        top: 470,
        width: 184,
        height: 150,
        display: "flex",
        flexDirection: "column",
        padding: "16px 14px 10px",
        backgroundColor: slip.bg,
        color: "#2a2522",
        fontFamily: "Courier Prime",
        border: incident === "LIQUIDATED" ? "1px solid #c4c4c4" : "none",
        transform: "rotate(7deg)",
        boxShadow: "0 12px 22px rgba(0,0,0,0.45)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 22,
          top: -5,
          width: 50,
          height: 9,
          borderRadius: 4,
          backgroundImage: "linear-gradient(#f4f4f4, #9aa0a6 45%, #5f656b 55%, #d9dde0)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
          transform: "rotate(-5deg)",
        }}
      />
      <div style={{ display: "flex", fontSize: 15, fontWeight: 700, letterSpacing: 1 }}>{slip.title}</div>
      <div style={{ display: "flex", fontSize: 13, lineHeight: 1.2, marginTop: 5 }}>{slip.body}</div>
      <div style={{ display: "flex", fontFamily: "Nanum Pen Script", fontSize: 27, lineHeight: 0.95, color: C.pen, marginTop: 6 }}>
        {slip.pen}
      </div>
    </div>
  );
}

function Hype({ card }: { card: ReportCard }) {
  const theme = statusTheme(card.status);
  const { kicker, main } = statusLines(card.status);
  const lead = leadSubject(card);
  const name = customName(card);
  // Whatever height the chips below don't need goes to the status.
  const chipRows = Math.ceil(card.incidents.length / 2);
  const room = 530 - 30 - (kicker ? 52 : 14) - (lead ? 118 : 0) - (chipRows ? 16 + chipRows * 42 : 0) - 96;
  const fit = fitStatus(main, 460, room, 170);
  const subject = lead ? `IN ${lead.name.toUpperCase()}` : "";
  const subjectSize = Math.min(40, Math.floor(336 / (textWidth(subject) * 0.47)));
  return (
    <div
      style={{
        position: "absolute",
        left: 716,
        top: 72,
        width: 462,
        height: 530,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontFamily: "Space Mono",
          fontSize: 17,
          letterSpacing: 2,
          color: "#fff",
        }}
      >
        <div
          style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: C.hazard, marginRight: 10 }}
        />
        OFFICIAL RESULT ·&nbsp;
        {name ? name.toUpperCase() : <Addr value={shortAddress(card.address)} size={17} />}
      </div>
      {kicker && (
        <div
          style={{
            display: "flex",
            fontFamily: "Anton",
            fontSize: 40,
            lineHeight: 1,
            color: "#fff",
            marginTop: 14,
            textShadow: "3px 3px 0 #000",
          }}
        >
          {kicker}
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: kicker ? 6 : 14,
          fontFamily: "Anton",
          fontSize: fit.size,
          lineHeight: 0.92,
          color: theme.hot,
          textShadow: "6px 6px 0 #000",
        }}
      >
        {fit.lines.map((l) => (
          <div key={l} style={{ display: "flex" }}>
            {l}
          </div>
        ))}
      </div>
      {lead && (
        <div style={{ display: "flex", alignItems: "center", marginTop: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 92,
              height: 92,
              paddingTop: 12,
              backgroundColor: C.paper,
              color: C.pen,
              fontFamily: "Permanent Marker",
              fontSize: lead.grade.length > 1 ? 54 : 66,
              lineHeight: 1,
              transform: "rotate(-6deg)",
              boxShadow: "6px 6px 0 #000",
            }}
          >
            {lead.grade}
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginLeft: 22, fontFamily: "Anton", lineHeight: 1 }}>
            <div style={{ display: "flex", fontSize: 22, letterSpacing: 2, color: C.hazard }}>
              {isBackhanded(lead) ? "NOT A COMPLIMENT" : "WORST GRADE"}
            </div>
            <div
              style={{ display: "flex", fontSize: subjectSize, color: "#fff", marginTop: 4, textShadow: "3px 3px 0 #000" }}
            >
              {subject}
            </div>
          </div>
        </div>
      )}
      {card.incidents.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", marginTop: 16 }}>
          {card.incidents.map((i) => (
            <div
              key={i}
              style={{
                display: "flex",
                padding: "5px 10px 3px",
                marginRight: 8,
                marginBottom: 8,
                backgroundColor: C.black,
                color: C.hazard,
                fontFamily: "Anton",
                fontSize: 19,
                letterSpacing: 1,
                border: `2px solid ${C.hazard}`,
              }}
            >
              {`+ ${INCIDENT_LABEL[i]}`}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", flexGrow: 1 }} />
      <div
        style={{
          display: "flex",
          flexShrink: 0,
          alignSelf: "flex-start",
          padding: "14px 22px 10px",
          backgroundColor: C.hazard,
          color: "#000",
          fontFamily: "Anton",
          fontSize: 40,
          lineHeight: 1,
          border: "4px solid #000",
          boxShadow: "8px 8px 0 #000",
        }}
      >
        SHOW ME YOUR GRADES →
      </div>
    </div>
  );
}

/** Headline for the tape: "EXPELLED ■ AN F IN TAKING PROFIT ■ SHOW ME YOUR GRADES". */
function tape(card: ReportCard): string {
  const lead = leadSubject(card);
  const bits = [
    card.status,
    lead
      ? `${withArticle(lead.grade).toUpperCase()} IN ${lead.name.toUpperCase()}${isBackhanded(lead) ? " (NOT A COMPLIMENT)" : ""}`
      : "ALL INCOMPLETE",
    "SHOW ME YOUR GRADES",
    "REPORT CARDS",
    "RETURN SIGNED BY MONDAY",
  ];
  return `${bits.join("  ■  ")}  ■  `.repeat(3);
}

export async function renderCardImage(card: ReportCard, init?: ResponseInit): Promise<ImageResponse> {
  const { fonts, paper } = await ogAssets();
  const theme = statusTheme(card.status);
  const slip = SLIP_ORDER.find((i): i is Exclude<Incident, "WHALE"> => i !== "WHALE" && card.incidents.includes(i));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: theme.bg2,
          fontFamily: "Space Mono",
        }}
      >
        {/* the verdict floods the stage */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1200,
            height: 630,
            display: "flex",
            backgroundImage: `radial-gradient(circle at 78% 45%, ${theme.bg} 0%, ${theme.bg2} 78%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1200,
            height: 630,
            display: "flex",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* tape */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1200,
            height: 46,
            display: "flex",
            alignItems: "center",
            paddingLeft: 14,
            overflow: "hidden",
            whiteSpace: "nowrap",
            backgroundColor: C.hazard,
            color: "#000",
            fontFamily: "Anton",
            fontSize: 24,
            letterSpacing: 1,
            borderBottom: "4px solid #000",
          }}
        >
          {tape(card)}
        </div>
        <Paper card={card} paper={paper} />
        <Hype card={card} />
        {slip && <SlipArt incident={slip} />}
        {card.incidents.includes("WHALE") && <WhaleSeal />}
      </div>
    ),
    { ...OG_SIZE, fonts, ...init },
  );
}

/** For a bad address: still an image, still a joke. */
export async function renderFallbackImage(text = "HALL PASS DENIED"): Promise<ImageResponse> {
  const { fonts } = await ogAssets();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b0b0d",
          color: C.hazard,
          fontFamily: "Anton",
        }}
      >
        <div style={{ display: "flex", fontSize: 150, lineHeight: 1 }}>{text}</div>
        <div style={{ display: "flex", fontSize: 44, color: "#fff", marginTop: 20 }}>SHOW ME YOUR GRADES</div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
