/**
 * ONEOFONES-A GROUP — one-of-ones 1-17 (placeholder pass). Each gag is a
 * quick sketch of the piece's `thumbnail` idea from collection/copy/oneOfOnes.ts
 * around the shared mini card + stamp (common.ts). Artists replace these.
 */
import { FONTS, n, scallopPath, starPath, text, wobblyPath } from "../lib";
import type { ArtModule } from "../types";
import { oneOfOneFiles, RED, type Gag } from "./common";

const GAGS: Record<string, Gag> = {
  "the-permanent-record": (_p, r) => {
    let under = `<circle cx="1000" cy="900" r="900" fill="#FFF6D6" fill-opacity="0.12"/><rect x="420" y="330" width="1180" height="1420" rx="30" fill="#D9A441" transform="rotate(-4 1000 1000)"/><rect x="460" y="250" width="420" height="120" rx="20" fill="#D9A441" transform="rotate(-4 1000 1000)"/>`;
    under += text("EVERYTHING", 670, 340, { font: FONTS.condensed, size: 70, fill: "#5A3D00", anchor: "middle", rotate: -4 });
    for (let i = 0; i < 8; i++) under += `<rect x="${440 + i * 6}" y="${360 + i * 8}" width="1150" height="1380" fill="#F2E2B6" stroke="#B89A5A" stroke-width="3" transform="rotate(${-8 + i * 2} 1000 1000)"/>`;
    let over = "";
    for (let i = 0; i < 18; i++) over += `<ellipse cx="${260 + i * 85}" cy="${1450 - i * 60}" rx="46" ry="26" fill="none" stroke="#8A8F96" stroke-width="16" transform="rotate(${-35 + (i % 2) * 70} ${260 + i * 85} ${1450 - i * 60})"/>`;
    over += `<rect x="930" y="880" width="170" height="150" rx="16" fill="#B08D57" stroke="#6B5530" stroke-width="8"/><path d="M960 880 V820 a55 55 0 0 1 110 0 V880" fill="none" stroke="#6B5530" stroke-width="18"/><circle cx="1015" cy="950" r="18" fill="#3A2A10"/>`;
    void r;
    return { under, over };
  },
  "the-dog-ate-it": (p, r) => {
    const bg = p.visual.palette[0].split(" ")[0];
    let under = "";
    for (let y = 0; y < 2000; y += 200) for (let x = (y / 200) % 2 ? 200 : 0; x < 2000; x += 400) under += `<rect x="${x}" y="${y}" width="200" height="200" fill="#F7F7F2"/>`;
    let over = `<path d="M300 1500 C 450 1330, 700 1420, 850 1340 C 1000 1440, 1200 1330, 1400 1420 C 1550 1350, 1700 1450, 1800 1400 V2000 H300 Z" fill="${bg}"/>`;
    for (let i = 0; i < 12; i++) over += `<path d="M${420 + i * 110} ${1400 + (i % 2) * 40} l18 40 l18 -40" fill="none" stroke="#FFFFFF" stroke-width="8"/>`;
    over += `<ellipse cx="1650" cy="1560" rx="260" ry="220" fill="#8B5A2B"/><circle cx="1560" cy="1300" r="150" fill="#8B5A2B"/><ellipse cx="1450" cy="1330" rx="50" ry="110" fill="#5E3A18" transform="rotate(25 1450 1330)"/><circle cx="1600" cy="1290" r="16" fill="#111"/><ellipse cx="1500" cy="1350" rx="26" ry="18" fill="#111"/>`;
    over += `<rect x="1380" y="1370" width="120" height="50" fill="#FFFBEF" transform="rotate(-20 1440 1395)"/>` + text("PROFIT", 1440, 1406, { font: FONTS.mono, size: 26, fill: "#1B2A6B", anchor: "middle", rotate: -20, weight: "bold" });
    void r;
    return { under, over, card: { x: 950, y: 1000, rot: -5, scale: 1.15 } };
  },
  "laminated-by-mom": (_p, r) => {
    let under = `<rect x="1880" y="200" width="60" height="1600" rx="30" fill="#D8D8D8"/><rect x="0" y="0" width="2000" height="40" fill="#6E9100"/>`;
    under += `<rect x="120" y="1400" width="300" height="420" fill="#FFFFFF" transform="rotate(6 270 1610)"/>` + text("TAKEOUT", 270, 1480, { font: FONTS.condensed, size: 60, fill: RED, anchor: "middle", rotate: 6 });
    let over = "";
    for (let i = 0; i < 5; i++) over += `<path d="M${500 + i * 180} 300 L${700 + i * 180} 300 L${300 + i * 180} 1800 L${100 + i * 180} 1800 Z" fill="#FFFFFF" fill-opacity="${i % 2 ? 0.12 : 0.2}"/>`;
    const mags: [number, number, string][] = [[560, 300, "#E3122B"], [1450, 300, "#FFD400"], [560, 1720, "#FF8A00"], [1450, 1720, "#FFE14D"]];
    for (const [x, y, c] of mags) over += `<circle cx="${x}" cy="${y}" r="62" fill="${c}" stroke="#00000055" stroke-width="6"/><ellipse cx="${x - 18}" cy="${y - 20}" rx="18" ry="10" fill="#FFFFFF" fill-opacity="0.7"/>`;
    over += `<path d="${starPath(1000, 1560, 150, 64)}" fill="#FFD400" stroke="#A6800F" stroke-width="8"/>`;
    over += text("PROUD OF YOU!!", 360, 1900, { font: FONTS.kidPrint, size: 80, fill: "#FF5FA2", rotate: -6 });
    void r;
    return { under, over, card: { x: 1000, y: 1000, rot: 2, scale: 1.2 } };
  },
  "snow-day": (_p, r) => {
    let over = "";
    for (let i = 0; i < 260; i++) over += `<circle cx="${r.int(0, 2000)}" cy="${r.int(150, 2000)}" r="${r.int(4, 12)}" fill="#FFFFFF" fill-opacity="${n(r.float(0.5, 1))}"/>`;
    over += `<path d="M0 1500 C 400 1380, 700 1560, 1000 1470 C 1300 1390, 1600 1540, 2000 1440 V2000 H0 Z" fill="#FFFFFF"/><path d="M0 1560 C 500 1470, 1000 1620, 2000 1520" stroke="#1B3A5C" stroke-opacity="0.15" stroke-width="30" fill="none"/>`;
    over += `<circle cx="260" cy="1370" r="110" fill="#FFFFFF"/><circle cx="260" cy="1210" r="80" fill="#FFFFFF"/><path d="M260 1215 l60 12 l-60 12 Z" fill="#FF8A00"/><path d="M340 1300 L520 1100" stroke="#6B4423" stroke-width="12"/><rect x="520" y="1040" width="170" height="90" fill="${RED}"/>` + text("SELL", 605, 1105, { font: FONTS.condensed, size: 60, fill: "#FFFFFF", anchor: "middle" });
    over += `<path d="M1500 1500 q 200 -60 360 40 l-40 60 q -150 -80 -300 -40 Z" fill="${RED}"/>`;
    over += `<rect x="300" y="190" width="1400" height="90" fill="#FFFFFF" transform="rotate(-2 1000 235)"/>` + text("SCHOOL CLOSED — ALL DISTRICTS", 1000, 258, { font: FONTS.condensed, size: 64, fill: "#1B3A5C", anchor: "middle", rotate: -2 });
    return { over, card: { x: 1000, y: 1000, rot: -3, scale: 1.1 } };
  },
  "the-rug-pull": (_p, r) => {
    let under = `<rect x="0" y="1150" width="2000" height="850" fill="#000000"/>`;
    for (let i = 0; i < 9; i++) under += `<rect x="${r.int(200, 1700)}" y="${r.int(1250, 1900)}" width="90" height="90" fill="#6B6B6B" transform="rotate(${r.int(0, 90)} 1000 1500)"/>`;
    let over = `<path d="M700 1180 C 1100 1080, 1500 1260, 2000 1120 L2000 1340 C 1500 1450, 1100 1300, 760 1380 Z" fill="#B3122B"/>`;
    for (let i = 0; i < 6; i++) over += `<path d="M${900 + i * 180} ${1210 + (i % 2) * 20} l40 40 l-40 40 l-40 -40 Z" fill="#F2C14E"/>`;
    over += `<rect x="1760" y="1080" width="260" height="190" rx="60" fill="#9AA0A6"/><rect x="1690" y="1330" width="120" height="70" fill="#FFFFFF" transform="rotate(10 1750 1365)"/>` + text("DEV", 1750, 1380, { font: FONTS.condensed, size: 44, fill: "#111", anchor: "middle", rotate: 10 });
    for (let i = 0; i < 8; i++) over += `<circle cx="${r.int(500, 1500)}" cy="${r.int(250, 700)}" r="36" fill="#F2C14E" stroke="#A6800F" stroke-width="6"/>`;
    return { under, over, card: { x: 1000, y: 750, rot: -18, scale: 0.85 } };
  },
  "substitute-teacher": () => {
    let under = `<rect x="1400" y="1150" width="560" height="420" rx="30" fill="#2B2B2B"/><rect x="1440" y="1190" width="480" height="330" rx="20" fill="#9A9A9A"/>`;
    for (let i = 0; i < 30; i++) under += `<rect x="${1450 + ((i * 97) % 460)}" y="${1200 + ((i * 53) % 300)}" width="40" height="6" fill="#FFFFFF"/>`;
    under += `<rect x="1420" y="1570" width="520" height="30" fill="#2B2B2B"/><path d="M1460 1600 V1900 M1900 1600 V1900" stroke="#2B2B2B" stroke-width="20"/>`;
    let over = `<rect x="160" y="1200" width="420" height="300" fill="#FFF59D" transform="rotate(-8 370 1350)"/>` + text("Great job", 370, 1320, { font: FONTS.kid, size: 70, fill: "#1DB954", anchor: "middle", rotate: -8 }) + text("everyone!! — Sub", 370, 1400, { font: FONTS.kid, size: 50, fill: "#1DB954", anchor: "middle", rotate: -8 });
    over += text("NO.", 1500, 560, { font: FONTS.marker, size: 220, fill: RED, anchor: "middle", rotate: -12 });
    return { under, over };
  },
  "fire-drill": (_p, r) => {
    let under = `<rect x="0" y="1720" width="2000" height="40" fill="#FFD400"/><rect x="120" y="300" width="160" height="220" rx="12" fill="${RED}"/><rect x="170" y="380" width="60" height="110" fill="#FFFFFF"/>` + text("PULL IN CASE OF DUMP", 200, 580, { font: FONTS.condensed, size: 28, fill: "#FFFFFF", anchor: "middle" });
    under += `<path d="M1700 1900 L1800 1500 L1900 1900 Z" fill="#FF6A00"/><rect x="1690" y="1880" width="220" height="40" fill="#FF6A00"/><path d="M1745 1700 h110 M1770 1600 h60" stroke="#FFFFFF" stroke-width="30"/>`;
    let over = "";
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const x = 1000 + Math.cos(a) * 560;
      const y = 1090 + Math.sin(a) * 640;
      over += `<circle cx="${n(x)}" cy="${n(y)}" r="${r.int(140, 230)}" fill="#1A1008"/>`;
    }
    for (let i = 0; i < 60; i++) over += `<circle cx="${r.int(200, 1800)}" cy="${r.int(200, 1900)}" r="${r.int(3, 10)}" fill="${r.pick(["#FF6A00", "#FFD400", "#BDBDBD"])}"/>`;
    return { under, over, card: { x: 1000, y: 1090, rot: 4, scale: 1.25 } };
  },
  "y2k-time-capsule": (_p, r) => {
    let under = "";
    for (let i = 0; i < 40; i++) under += `<circle cx="${r.int(0, 2000)}" cy="${r.int(1300, 2000)}" r="${r.int(20, 70)}" fill="#4E3218"/>`;
    under += `<rect x="1350" y="220" width="560" height="460" rx="30" fill="#E8E0C8"/><rect x="1400" y="260" width="460" height="330" rx="20" fill="#0B0B0B"/>` + text("01/01/1900", 1630, 400, { font: FONTS.crt, size: 90, fill: "#00FF41", anchor: "middle" }) + text("PORTFOLIO NOT FOUND", 1630, 480, { font: FONTS.crt, size: 46, fill: "#00FF41", anchor: "middle" });
    let over = `<rect x="140" y="1480" width="320" height="330" rx="10" fill="#2B2B2B" transform="rotate(-10 300 1645)"/><rect x="190" y="1490" width="200" height="110" fill="#C0C0C0" transform="rotate(-10 300 1645)"/><rect x="180" y="1650" width="240" height="130" fill="#FFFFFF" transform="rotate(-10 300 1645)"/>` + text("MY PORTFOLIO", 300, 1730, { font: FONTS.kid, size: 36, fill: "#1C3A9E", anchor: "middle", rotate: -10 });
    return { under, over };
  },
  "the-kid-who-sold-the-top": () => {
    let under = "";
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      under += `<path d="M1000 1000 L${n(1000 + Math.cos(a) * 1500)} ${n(1000 + Math.sin(a) * 1500)} L${n(1000 + Math.cos(a + 0.08) * 1500)} ${n(1000 + Math.sin(a + 0.08) * 1500)} Z" fill="#FFD700" fill-opacity="${i % 2 ? 0.25 : 0.12}"/>`;
    }
    let over = `<ellipse cx="1000" cy="330" rx="330" ry="70" fill="none" stroke="#FFD700" stroke-width="34"/><ellipse cx="1000" cy="330" rx="330" ry="70" fill="none" stroke="#FFFFFF" stroke-width="10"/>`;
    over += `<path d="M300 1000 L500 820 L650 900 L850 620 L900 560" fill="none" stroke="#18FF6D" stroke-width="22"/>` + text("SELL", 900, 520, { font: FONTS.marker, size: 90, fill: "#FFD700", anchor: "middle" });
    return { under, over, card: { x: 1000, y: 1080, rot: 0, scale: 1.15 } };
  },
  "expelled-from-the-blockchain": () => {
    let under = "";
    for (let y = 150; y < 1900; y += 170) for (let x = -60; x < 1150; x += 170) under += `<rect x="${x}" y="${y}" width="150" height="150" rx="12" fill="#0038FF" stroke="#7FDBFF" stroke-width="8"/>`;
    for (let y = 225; y < 1900; y += 170) under += `<path d="M1090 ${y} h80" stroke="#BDBDBD" stroke-width="18"/>`;
    under += `<rect x="1150" y="1800" width="850" height="200" fill="#8A1A1A"/>`;
    const over = `<path d="M600 700 h420 v150 q140 10 180 110 q10 60 -60 70 h-540 Z" fill="#6B3A1E" stroke="#111" stroke-width="12"/>`;
    return { under, over, card: { x: 1350, y: 1150, rot: 22, scale: 1.0 } };
  },
  "principals-own-wallet": () => {
    const under = `<rect x="0" y="1650" width="2000" height="60" fill="#FFD400"/><rect x="180" y="300" width="1640" height="1400" rx="60" fill="#6B3E1F"/><path d="M1000 300 V1700" stroke="#4A2A12" stroke-width="16"/><rect x="1080" y="380" width="640" height="400" rx="20" fill="#FFFFFF"/><rect x="1120" y="420" width="200" height="250" fill="#9A9A9A"/>` + text("THE PRINCIPAL", 1520, 560, { font: FONTS.condensed, size: 54, fill: "#111", anchor: "middle" });
    const over = text("WORLD'S OKAYEST PRINCIPAL", 1000, 1880, { font: FONTS.condensed, size: 70, fill: "#FFFFFF", anchor: "middle" });
    return { under, over, card: { x: 700, y: 1030, rot: -8, scale: 0.95 } };
  },
  "hall-monitor": () => {
    let under = "";
    for (let i = 0; i < 12; i++) under += `<path d="M${i * 180} 0 L1000 1000 M${i * 180} 2000 L1000 1000" stroke="#0B2AB0" stroke-width="10"/>`;
    let over = `<path d="M150 450 L1850 1650 L1850 1820 L150 620 Z" fill="#FF6B00" fill-opacity="0.92"/><path d="M150 535 L1850 1735" stroke="#E8FF3A" stroke-width="20"/>`;
    over += `<circle cx="1650" cy="560" r="70" fill="#C0C0C0" stroke="#666" stroke-width="8"/>`;
    over += text("WHO BOUGHT THE TOP:", 1000, 1880, { font: FONTS.kid, size: 70, fill: "#FFFFFF", anchor: "middle" }) + text("EVERYONE", 1000, 1960, { font: FONTS.kid, size: 80, fill: "#FFE14D", anchor: "middle" });
    return { under, over };
  },
  "summer-school-lifer": () => {
    let under = "";
    for (let i = 0; i < 40; i++) under += `<rect x="${560 + (i % 3) * 8}" y="${1780 - i * 16}" width="880" height="14" fill="${i % 2 ? "#FFFFFF" : "#FFF3D6"}" stroke="#C9A46A" stroke-width="2"/>`;
    under += `<path d="M1500 260 A 380 300 0 0 1 2000 260 Z" fill="#FF4F81"/><path d="M1620 260 A 120 300 0 0 1 1880 260 Z" fill="#00C2FF"/><path d="M1750 260 V1300" stroke="#FFFFFF" stroke-width="16"/>`;
    const over = `<rect x="840" y="330" width="320" height="80" rx="40" fill="#111"/><circle cx="930" cy="370" r="46" fill="#111"/><circle cx="1070" cy="370" r="46" fill="#111"/>`;
    return { under, over, card: { x: 1000, y: 1020, rot: 1, scale: 1.1 } };
  },
  "wallet-sized": () => {
    let under = "";
    for (let i = 0; i < 9; i++) under += `<path d="M${-200 + i * 300} 2000 L${400 + i * 220} 0" stroke="${i % 2 ? "#FF2BD6" : "#18E5FF"}" stroke-width="18" stroke-opacity="0.8"/>`;
    for (let i = 0; i < 8; i++) under += `<rect x="${110 + (i % 4) * 460}" y="${1560 + Math.floor(i / 4) * 210}" width="400" height="180" fill="#FFFFFF" stroke="#999" stroke-width="4" stroke-dasharray="10 6"/>`;
    const over = `<ellipse cx="1000" cy="820" rx="560" ry="660" fill="none" stroke="#FFFFFF" stroke-width="40"/>` + text("RETAKE", 1000, 1000, { font: FONTS.stamp, size: 260, fill: RED, anchor: "middle", rotate: -20, opacity: 0.85 });
    return { under, over, card: { x: 1000, y: 820, rot: 0, scale: 0.9 } };
  },
  "bubble-sheet-masterpiece": () => {
    let under = "";
    for (let row = 0; row < 26; row++) {
      under += `<rect x="0" y="${row * 80}" width="2000" height="80" fill="${row % 2 ? "#CFF5D8" : "#FF9F8A"}" fill-opacity="0.5"/>`;
      for (let col = 0; col < 22; col++) {
        const filled = Math.abs(col - row * 0.8) < 1.2 || (col > row * 0.8 && col < row * 0.8 + 3 && row % 3 === 0);
        under += `<circle cx="${50 + col * 92}" cy="${40 + row * 80}" r="26" fill="${filled ? "#333333" : "none"}" stroke="#333" stroke-width="3"/>`;
      }
    }
    const over = `<rect x="200" y="1700" width="1300" height="60" rx="30" fill="#FFD000" transform="rotate(-18 850 1730)"/><rect x="180" y="1700" width="80" height="60" rx="10" fill="#FF8FA3" transform="rotate(-18 850 1730)"/>` + text("SCORE: 34", 1650, 1880, { font: FONTS.mono, size: 80, fill: "#111", anchor: "middle", weight: "bold" });
    return { under, over, card: { x: 1150, y: 900, rot: 8, scale: 0.95 } };
  },
  "science-fair-volcano": () => {
    const under = `<rect x="100" y="200" width="1800" height="1100" fill="#FFFFFF" stroke="#1646FF" stroke-width="30"/><path d="M700 200 V1300 M1300 200 V1300" stroke="#1646FF" stroke-width="10"/>` + text("MY PORTFOLIO: A VOLCANO", 1000, 330, { font: FONTS.condensed, size: 90, fill: "#1646FF", anchor: "middle" });
    let over = `<path d="M500 1950 L850 1250 L1150 1250 L1500 1950 Z" fill="#8B5A2B"/><path d="M850 1250 Q1000 1150 1150 1250 L1100 1300 L1050 1500 L1000 1320 L940 1600 L900 1300 Z" fill="#FF1A1A"/>`;
    for (let i = 0; i < 6; i++) over += `<rect x="${760 + i * 90}" y="${1000 - i * 40}" width="36" height="${120 + i * 20}" fill="#FF1A1A"/>`;
    over += `<path d="${scallopPath(1720, 520, 110, 20, 0.08)}" fill="#1646FF"/>` + text("HONORABLE", 1720, 515, { font: FONTS.condensed, size: 34, fill: "#FFFFFF", anchor: "middle" }) + text("MENTION", 1720, 555, { font: FONTS.condensed, size: 34, fill: "#FFFFFF", anchor: "middle" });
    return { under, over, card: { x: 1000, y: 850, rot: -3, scale: 0.8 } };
  },
  "signed-yearbook": (_p, r) => {
    const msgs = ["NEVER CHANGE!!", "stay cool, keep buying", "HAGS — sold you my bags lol", "thx for the exit <3", "2 good 2 be 4gotten, 2 late 2 sell", "keep holding!!", "ur the best exit", "LYLAS (sold)"];
    const colors = ["#FF2BD6", "#18E5FF", "#7CFC00", "#9B30FF", "#FF7A00"];
    let over = "";
    for (let i = 0; i < 26; i++) {
      over += text(r.pick(msgs), r.int(80, 1500), r.int(150, 1950), { font: r.pick([FONTS.kid, FONTS.harrow, FONTS.kidPrint]), size: r.int(44, 76), fill: r.pick(colors), rotate: r.int(-25, 25) });
    }
    return { over };
  },
};

void wobblyPath;

export const oneOfOnesA: ArtModule = {
  group: "oneofones-a",
  owns: ["1of1 (one-of-ones 1-17)"],
  files: () => oneOfOneFiles([1, 17], GAGS),
};
