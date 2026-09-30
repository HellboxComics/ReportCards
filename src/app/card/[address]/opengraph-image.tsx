import { ImageResponse } from "next/og";
import { series } from "@/components/Candles";
import { loadReportCard } from "@/lib/load";
import { isAddress } from "@/lib/providers";
import { hashString } from "@/lib/random";
import { shortAddress } from "@/lib/reportCard";
import { statusLines, statusTone, textWidth, widestWord, worstSubject } from "@/lib/share";
import type { LetterGrade, ReportCard } from "@/lib/types";
import { ogFonts } from "../../og-fonts";

export const alt = "Wallet report card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const C = {
  bg: "#060708",
  acid: "#b8ff1f",
  hazard: "#ffd400",
  alarm: "#ff2e3b",
  paper: "#f4efdd",
  ink: "#26221e",
  mimeo: "#5b3f8c",
  red: "#d3170f",
  rule: "#c9bfa5",
};

const TONE = { bad: C.alarm, meh: C.hazard, good: C.acid } as const;
const STAMP = { bad: "#dc1119", meh: "#d9650b", good: "#0c8a3a" } as const;

function gradeSize(g: LetterGrade) {
  return g === "F" ? 50 : g === "I" ? 34 : 44;
}

function CandleBackdrop({ seed }: { seed: number }) {
  const data = series(seed, 34, "pump-dump");
  const hi = Math.max(...data.map((d) => d.h));
  const lo = Math.min(...data.map((d) => d.l));
  const H = 330;
  const y = (v: number) => H - ((v - lo) / (hi - lo)) * H;
  return (
    <div style={{ position: "absolute", left: 610, top: 200, width: 590, height: H, display: "flex", opacity: 0.22 }}>
      {data.map((d, i) => {
        const up = d.c >= d.o;
        const top = y(Math.max(d.o, d.c));
        const bot = y(Math.min(d.o, d.c));
        const color = up ? "#57ff7a" : C.alarm;
        return (
          <div key={i} style={{ position: "absolute", left: i * 17, top: 0, width: 12, height: H, display: "flex" }}>
            <div style={{ position: "absolute", left: 5, top: y(d.h), width: 2, height: Math.max(2, y(d.l) - y(d.h)), background: color }} />
            <div style={{ position: "absolute", left: 0, top, width: 12, height: Math.max(3, bot - top), background: color }} />
          </div>
        );
      })}
    </div>
  );
}

function Paper({ card }: { card: ReportCard }) {
  const worst = worstSubject(card.subjects);
  const tone = statusTone(card.status);
  const stamp = statusLines(card.status);
  const rows = [
    ...card.subjects.map((s) => ({ key: s.key, name: s.name.toUpperCase(), grade: s.grade as string, size: gradeSize(s.grade), worst: s === worst })),
    { key: "att", name: "ATTENDANCE", grade: card.attendance.label, size: card.attendance.label.length > 9 ? 20 : 30, worst: false },
  ];
  const mainSize = Math.min(80, Math.floor(380 / (textWidth(stamp.main) * 0.5)));
  return (
    <div
      style={{
        position: "absolute",
        left: 44,
        top: 64,
        width: 560,
        height: 610,
        display: "flex",
        flexDirection: "column",
        padding: "20px 24px 16px 54px",
        background: C.paper,
        backgroundImage: "radial-gradient(ellipse at 25% 10%, rgba(255,255,255,0.7), rgba(255,255,255,0) 60%)",
        color: C.ink,
        fontFamily: "Courier Prime",
        transform: "rotate(-2deg)",
        boxShadow: "0 30px 60px rgba(0,0,0,0.8), 0 0 80px rgba(255,246,214,0.18)",
      }}
    >
      {/* three-hole punch */}
      {[70, 260, 450].map((t) => (
        <div key={t} style={{ position: "absolute", left: 16, top: t, width: 20, height: 20, borderRadius: 10, background: C.bg }} />
      ))}
      {/* coffee ring */}
      <div style={{ position: "absolute", right: 40, top: 250, width: 170, height: 170, borderRadius: 85, border: "8px solid rgba(128,78,30,0.12)" }} />
      <div style={{ display: "flex", fontSize: 13, fontWeight: 700, letterSpacing: 2, color: C.mimeo }}>
        ROBINHOOD CHAIN PUBLIC SCHOOL NO. 46
      </div>
      <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: C.mimeo, letterSpacing: 1, marginTop: 2 }}>
        STUDENT PROGRESS REPORT
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 17,
          marginTop: 6,
          padding: "6px 0",
          borderTop: `4px solid ${C.ink}`,
          borderBottom: `1px solid ${C.ink}`,
        }}
      >
        <div style={{ display: "flex" }}>
          STUDENT:&nbsp;<b>{card.studentName}</b>
        </div>
        <div style={{ display: "flex" }}>
          {card.semester.label} · TERM {card.semester.term}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 4 }}>
        {rows.map((r) => (
          <div
            key={r.key}
            style={{
              display: "flex",
              alignItems: "center",
              height: 44,
              borderBottom: `2px dashed ${C.rule}`,
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 20,
                fontWeight: 700,
                padding: "0 6px",
                marginLeft: -6,
                background: r.worst ? "rgba(255,228,0,0.85)" : "transparent",
              }}
            >
              {r.name}
            </div>
            {r.worst && (
              <div
                style={{
                  position: "absolute",
                  right: 124,
                  top: 4,
                  display: "flex",
                  fontFamily: "Permanent Marker",
                  fontSize: 24,
                  color: C.red,
                  transform: "rotate(-7deg)",
                }}
              >
                SEE ME<span style={{ fontFamily: "Anton", marginLeft: 6 }}>→</span>
              </div>
            )}
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: 120,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {r.worst && (
                <div
                  style={{
                    position: "absolute",
                    left: 18,
                    top: -6,
                    width: 86,
                    height: 56,
                    borderRadius: 43,
                    border: `4px solid ${C.red}`,
                    transform: "rotate(-8deg)",
                  }}
                />
              )}
              <div
                style={{
                  display: "flex",
                  fontFamily: "Permanent Marker",
                  fontSize: r.size,
                  color: r.grade === "I" ? "#666" : C.red,
                  transform: `rotate(${r.grade === "F" ? -9 : -4}deg)`,
                  marginTop: 6,
                }}
              >
                {r.grade}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* the stamp */}
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 0,
          bottom: 52,
          display: "flex",
          justifyContent: "center",
        }}
      >
      <div
        style={{
          display: "flex",
          padding: 6,
          border: `7px solid ${STAMP[tone]}`,
          borderRadius: 12,
          transform: "rotate(-7deg)",
          opacity: 0.92,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "6px 18px 4px",
            border: `3px solid ${STAMP[tone]}`,
            borderRadius: 6,
            color: STAMP[tone],
            fontFamily: "Anton",
            lineHeight: 0.95,
            background: "rgba(244,239,221,0.35)",
          }}
        >
          {stamp.kicker && <div style={{ display: "flex", fontSize: 22, letterSpacing: 3 }}>{stamp.kicker}</div>}
          <div style={{ display: "flex", fontSize: mainSize, letterSpacing: 1 }}>{stamp.main}</div>
        </div>
      </div>
      </div>
      {card.source === "mock" && (
        <div
          style={{
            position: "absolute",
            right: 40,
            top: -12,
            display: "flex",
            padding: "4px 10px",
            border: `2px solid ${C.red}`,
            color: C.red,
            fontSize: 12,
            fontWeight: 700,
            transform: "rotate(3deg)",
            background: "#fffdf4",
            boxShadow: "0 3px 6px rgba(0,0,0,0.35)",
          }}
        >
          SAMPLE — DEMO DATA · NOT THIS WALLET&apos;S REAL HISTORY
        </div>
      )}
    </div>
  );
}

export default async function Image({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  const fonts = await ogFonts();

  if (!isAddress(address)) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, color: C.acid, fontFamily: "Anton", fontSize: 120 }}>
          SHOW ME YOUR GRADES
        </div>
      ),
      { ...size, fonts },
    );
  }

  const card = await loadReportCard(address, {});
  const tone = statusTone(card.status);
  const stamp = statusLines(card.status);
  const worst = worstSubject(card.subjects);
  const who = shortAddress(address);
  const mainSize = Math.min(140, Math.floor(510 / (widestWord(stamp.main) * 0.47)));
  const tape = `REPORT CARDS ■ ${who} ■ ${card.status} ■ SHOW ME YOUR GRADES ■ RETURN SIGNED BY MONDAY ■ PARENTS HAVE BEEN NOTIFIED ■`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: C.bg,
          backgroundImage:
            "linear-gradient(rgba(184,255,31,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(184,255,31,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          fontFamily: "Space Mono",
          color: "#ecf7dc",
        }}
      >
        {/* spotlight */}
        <div
          style={{
            position: "absolute",
            left: -120,
            top: -40,
            width: 860,
            height: 760,
            display: "flex",
            backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255,249,222,0.22), rgba(255,249,222,0) 60%)",
          }}
        />
        <CandleBackdrop seed={hashString(address)} />

        {/* hazard tape */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1200,
            height: 44,
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            background: C.hazard,
            color: "#000",
            fontFamily: "Anton",
            fontSize: 24,
            letterSpacing: 1,
            whiteSpace: "nowrap",
            paddingLeft: 16,
            borderBottom: "4px solid #000",
          }}
        >
          {tape} {tape}
        </div>

        <Paper card={card} />

        {/* hype column */}
        <div
          style={{
            position: "absolute",
            left: 650,
            top: 72,
            width: 520,
            height: 540,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", fontSize: 20, color: C.acid, letterSpacing: 2 }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, background: C.alarm, marginRight: 12 }} />
            OFFICIAL RESULT · {who}
          </div>
          {stamp.kicker && (
            <div style={{ display: "flex", fontFamily: "Anton", fontSize: 40, marginTop: 14, lineHeight: 1 }}>
              {stamp.kicker}
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontFamily: "Anton",
              fontSize: mainSize,
              lineHeight: 0.9,
              marginTop: stamp.kicker ? 4 : 16,
              color: TONE[tone],
              textShadow: `0 0 30px ${TONE[tone]}`,
            }}
          >
            {stamp.main}
          </div>
          {worst && (
            <div style={{ display: "flex", alignItems: "center", marginTop: 26 }}>
              <div
                style={{
                  display: "flex",
                  padding: "6px 16px 0",
                  background: C.paper,
                  color: C.red,
                  fontFamily: "Permanent Marker",
                  fontSize: 64,
                  lineHeight: 1,
                  transform: "rotate(-6deg)",
                  boxShadow: "6px 6px 0 #000",
                }}
              >
                {worst.grade}
              </div>
              <div style={{ display: "flex", flexDirection: "column", marginLeft: 22, fontFamily: "Anton", lineHeight: 1 }}>
                <div style={{ display: "flex", fontSize: 22, color: C.hazard, letterSpacing: 2 }}>WORST GRADE</div>
                <div style={{ display: "flex", fontSize: 40 }}>IN {worst.name.toUpperCase()}</div>
              </div>
            </div>
          )}
          <div style={{ display: "flex", flexGrow: 1 }} />
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "14px 22px 10px",
              background: C.acid,
              color: "#000",
              fontFamily: "Anton",
              fontSize: 42,
              lineHeight: 1,
              border: "4px solid #000",
              boxShadow: "8px 8px 0 #000",
            }}
          >
            SHOW ME YOUR GRADES →
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
