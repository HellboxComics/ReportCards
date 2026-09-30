import { ImageResponse } from "next/og";
import { ogFonts } from "./og-fonts";

export const alt = "Report Cards — your wallet got graded. Show me your grades.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STAMPS = [
  { kicker: "MOST LIKELY TO BECOME", main: "EXIT LIQUIDITY", color: "#ff2e3b", rot: -7, top: 84, left: 736, size: 60 },
  { main: "HONOR ROLL", color: "#b8ff1f", rot: 5, top: 262, left: 790, size: 58 },
  { main: "EXPELLED", color: "#ff2e3b", rot: -4, top: 420, left: 730, size: 66 },
];

export default async function Image() {
  const fonts = await ogFonts();
  const tape =
    "LOCAL WALLET GETS F IN TAKING PROFIT ■ PARENTS ADVISED TO HIDE THEIR WALLETS ■ RETURN SIGNED BY MONDAY ■ ";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#060708",
          backgroundImage:
            "linear-gradient(rgba(184,255,31,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(184,255,31,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          color: "#ecf7dc",
          fontFamily: "Anton",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1200,
            height: 44,
            display: "flex",
            alignItems: "center",
            paddingLeft: 16,
            background: "#ffd400",
            color: "#000",
            fontSize: 24,
            letterSpacing: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            borderBottom: "4px solid #000",
          }}
        >
          {tape + tape}
        </div>

        <div style={{ position: "absolute", left: 60, top: 92, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", fontFamily: "Space Mono", fontSize: 22, color: "#b8ff1f", letterSpacing: 3 }}>
            <div style={{ display: "flex", background: "#ffd400", color: "#000", fontFamily: "Anton", padding: "2px 10px", marginRight: 14, letterSpacing: 2 }}>
              WARNING
            </div>
            REPORT CARDS ARE OUT
          </div>
          <div style={{ display: "flex", fontSize: 132, lineHeight: 0.88, marginTop: 18 }}>YOUR WALLET</div>
          <div style={{ display: "flex", fontSize: 132, lineHeight: 0.88 }}>
            GOT&nbsp;<span style={{ color: "#b8ff1f", textShadow: "0 0 36px #b8ff1f" }}>GRADED.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 40 }}>
            <div
              style={{
                display: "flex",
                padding: "14px 22px 10px",
                background: "#b8ff1f",
                color: "#000",
                fontSize: 44,
                lineHeight: 1,
                border: "4px solid #000",
                boxShadow: "8px 8px 0 #000",
              }}
            >
              SHOW ME YOUR GRADES →
            </div>
          </div>
          <div style={{ display: "flex", marginTop: 30, fontFamily: "Space Mono", fontSize: 20, color: "#b7c5b0", letterSpacing: 2 }}>
            PASTE A ROBINHOOD CHAIN WALLET · GET YOUR REPORT CARD
          </div>
        </div>

        {STAMPS.map((s) => (
          <div
            key={s.main}
            style={{
              position: "absolute",
              top: s.top,
              left: s.left,
              display: "flex",
              padding: 6,
              border: `7px solid ${s.color}`,
              borderRadius: 12,
              transform: `rotate(${s.rot}deg)`,
              boxShadow: `0 0 30px ${s.color}55`,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "6px 18px 2px",
                border: `3px solid ${s.color}`,
                borderRadius: 6,
                color: s.color,
                lineHeight: 0.95,
                textShadow: `0 0 20px ${s.color}`,
              }}
            >
              {s.kicker && <div style={{ display: "flex", fontSize: 20, letterSpacing: 3 }}>{s.kicker}</div>}
              <div style={{ display: "flex", fontSize: s.size }}>{s.main}</div>
            </div>
          </div>
        ))}

        <div
          style={{
            position: "absolute",
            left: 1050,
            top: 404,
            width: 110,
            height: 110,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 10,
            background: "#f4efdd",
            color: "#d3170f",
            fontFamily: "Permanent Marker",
            fontSize: 84,
            transform: "rotate(10deg)",
            boxShadow: "6px 6px 0 #000",
          }}
        >
          F
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
