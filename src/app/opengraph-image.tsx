import { ImageResponse } from "next/og";
import { ogAssets } from "@/components/og/assets";

export const alt = "Report Cards: your wallet got graded. Show me your grades.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STAMPS = [
  { kicker: "MOST LIKELY TO BECOME", main: "EXIT LIQUIDITY", color: "#ff2a9d", rot: -7, top: 96, left: 742, size: 58 },
  { main: "HONOR ROLL", color: "#c8ff3d", rot: 5, top: 262, left: 812, size: 56 },
  { main: "EXPELLED", color: "#ff3b3b", rot: -4, top: 408, left: 734, size: 70 },
];

/** The landing page's unfurl. No dates or counts, so it can be prerendered. */
export default async function Image() {
  const { fonts, paper } = await ogAssets();
  const tape =
    "LOCAL WALLET GETS F IN TAKING PROFIT  ■  PARENTS ADVISED TO HIDE THEIR WALLETS  ■  RETURN SIGNED BY MONDAY  ■  ";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#0b0610",
          color: "#fff",
          fontFamily: "Anton",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1200,
            height: 630,
            display: "flex",
            backgroundImage: "radial-gradient(circle at 80% 55%, #c2126f 0%, #3a0d6b 45%, #0b0610 80%)",
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
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
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
            backgroundColor: "#ffd400",
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

        <div style={{ position: "absolute", left: 60, top: 96, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontFamily: "Space Mono",
              fontSize: 22,
              letterSpacing: 3,
              color: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                backgroundColor: "#ff2e3b",
                color: "#fff",
                fontFamily: "Anton",
                padding: "2px 10px",
                marginRight: 14,
                letterSpacing: 2,
              }}
            >
              BREAKING
            </div>
            REPORT CARDS ARE OUT
          </div>
          <div style={{ display: "flex", fontSize: 140, lineHeight: 0.88, marginTop: 22, textShadow: "6px 6px 0 #000" }}>
            YOUR WALLET
          </div>
          <div style={{ display: "flex", fontSize: 140, lineHeight: 0.88, textShadow: "6px 6px 0 #000" }}>
            GOT&nbsp;<span style={{ color: "#ffe600" }}>GRADED.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 38 }}>
            <div
              style={{
                display: "flex",
                padding: "14px 22px 10px",
                backgroundColor: "#ffd400",
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
          <div
            style={{
              display: "flex",
              marginTop: 30,
              fontFamily: "Space Mono",
              fontSize: 20,
              color: "#f4dcff",
              letterSpacing: 2,
            }}
          >
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
              backgroundColor: "rgba(0,0,0,0.35)",
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
            left: 1036,
            top: 398,
            width: 124,
            height: 124,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 14,
            color: "#d3170f",
            fontFamily: "Permanent Marker",
            fontSize: 92,
            transform: "rotate(10deg)",
            boxShadow: "6px 6px 0 #000",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={paper} width={124} height={124} style={{ position: "absolute", left: 0, top: 0 }} />
          F
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
