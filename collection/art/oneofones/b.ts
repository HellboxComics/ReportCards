/**
 * ONEOFONES-B GROUP — one-of-ones 18-33 (placeholder pass). Each gag is a
 * quick sketch of the piece's `thumbnail` idea from collection/copy/oneOfOnes.ts
 * around the shared mini card + stamp (common.ts). Artists replace these.
 */
import { FONTS, n, scallopPath, starPath, text } from "../lib";
import type { ArtModule } from "../types";
import { oneOfOneFiles, RED, type Gag } from "./common";

const GAGS: Record<string, Gag> = {
  "parent-teacher-conference": () => {
    const under = `<rect x="0" y="1500" width="2000" height="500" fill="#4A2C1A"/><circle cx="1750" cy="250" r="130" fill="#FFFFFF" stroke="#333" stroke-width="12"/><path d="M1750 250 V170 M1750 250 L1810 280" stroke="#333" stroke-width="12"/>` + text("6:47", 1750, 440, { font: FONTS.condensed, size: 60, fill: "#333", anchor: "middle" });
    let over = `<rect x="1350" y="1340" width="220" height="180" fill="#FFFFFF" stroke="#999" stroke-width="6"/><path d="M1420 1340 q 30 -90 60 0" fill="#FFFFFF" stroke="#999" stroke-width="5"/>`;
    over += `<rect x="1620" y="1330" width="160" height="190" rx="20" fill="#FFFFFF" stroke="#333" stroke-width="6"/>` + text("HARROW", 1700, 1440, { font: FONTS.condensed, size: 36, fill: "#333", anchor: "middle" });
    over += `<rect x="560" y="1500" width="880" height="60" fill="#FF8C00"/><path d="M600 1560 V1900 M1400 1560 V1900" stroke="#FF8C00" stroke-width="40"/>`;
    over += `<rect x="200" y="1350" width="360" height="180" fill="#FFF59D" transform="rotate(-6 380 1440)"/>` + text("MOTHER REQUESTED", 380, 1430, { font: FONTS.kid, size: 34, fill: "#333", anchor: "middle", rotate: -6 }) + text("CONFERENCE", 380, 1480, { font: FONTS.kid, size: 34, fill: "#333", anchor: "middle", rotate: -6 });
    return { under, over, card: { x: 1000, y: 950, rot: -4, scale: 0.95 } };
  },
  "grade-10-attempt-26": () => {
    let over = "";
    for (let g = 0; g < 6; g++) {
      const y = 380 + g * 230;
      for (let k = 0; k < 4 && g * 5 + k < 26; k++) over += `<path d="M${120 + k * 30} ${y} v160" stroke="${RED}" stroke-width="12" stroke-linecap="round"/>`;
      if (g < 5) over += `<path d="M100 ${y + 140} L${240} ${y + 20}" stroke="${RED}" stroke-width="12" stroke-linecap="round"/>`;
    }
    over += `<circle cx="1500" cy="1500" r="110" fill="none" stroke="#3D3D3D" stroke-width="16"/><circle cx="1750" cy="1500" r="110" fill="none" stroke="#3D3D3D" stroke-width="16"/><path d="M1610 1500 h30" stroke="#3D3D3D" stroke-width="16"/>`;
    over += `<rect x="1350" y="250" width="560" height="340" fill="#FFFFFF" transform="rotate(8 1630 420)"/>` + text("PAST DUE", 1630, 460, { font: FONTS.stamp, size: 110, fill: RED, anchor: "middle", rotate: 8, opacity: 0.9 });
    over += text("GRADE 10 — ATTEMPT 26", 1000, 1920, { font: FONTS.condensed, size: 90, fill: "#FFFFFF", anchor: "middle" });
    return { over };
  },
  "gifted-and-talented-whale": (_p, r) => {
    let under = `<path d="M100 1100 C 100 400, 1500 300, 1800 900 C 1950 800, 2000 600, 1980 1000 C 1950 1300, 1500 1700, 700 1700 C 300 1700, 100 1450, 100 1100 Z" fill="#00A8E8"/>`;
    under += `<path d="M150 1250 C 500 1450, 1100 1500, 1700 1250 L1750 1350 C 1200 1650, 500 1650, 150 1350 Z" fill="#E8F6FF"/>`;
    for (let i = 0; i < 30; i++) under += `<circle cx="${r.int(0, 2000)}" cy="${r.int(150, 2000)}" r="${r.int(10, 40)}" fill="none" stroke="#FFFFFF" stroke-width="5"/>`;
    const over = `<path d="${scallopPath(1500, 1500, 200, 28, 0.06)}" fill="#FFD700" stroke="#8A6400" stroke-width="6"/>` + text("GIFTED &", 1500, 1480, { font: FONTS.condensed, size: 60, fill: "#5A3D00", anchor: "middle" }) + text("TALENTED", 1500, 1550, { font: FONTS.condensed, size: 60, fill: "#5A3D00", anchor: "middle" });
    return { under, over, card: { x: 800, y: 900, rot: -10, scale: 0.8 } };
  },
  "nurses-punch-card": () => {
    let under = `<rect x="120" y="180" width="1760" height="700" rx="50" fill="#FF8FC7" stroke="#FFFFFF" stroke-width="16"/><rect x="200" y="250" width="120" height="120" fill="${RED}"/><rect x="240" y="265" width="40" height="90" fill="#FFFFFF"/><rect x="215" y="290" width="90" height="40" fill="#FFFFFF"/>`;
    under += text("NURSE'S OFFICE REWARDS", 1080, 350, { font: FONTS.condensed, size: 90, fill: "#FFFFFF", anchor: "middle" });
    for (let i = 0; i < 10; i++) under += `<circle cx="${260 + i * 160}" cy="620" r="60" fill="#2B2B2B"/>`;
    under += text("10TH ICE PACK FREE", 1000, 820, { font: FONTS.condensed, size: 60, fill: "#FFFFFF", anchor: "middle" });
    const over = `<rect x="1500" y="1500" width="380" height="260" rx="60" fill="#6EC6FF"/>`;
    return { under, over, card: { x: 1000, y: 1300, rot: 4, scale: 0.8 } };
  },
  "confiscated-pager": (_p, r) => {
    let under = "";
    for (let y = 0; y < 2000; y += 90) under += `<rect x="0" y="${y}" width="2000" height="86" fill="#3A2716"/>`;
    for (let i = 0; i < 20; i++) under += `<circle cx="${r.int(0, 2000)}" cy="${r.int(0, 2000)}" r="${r.int(40, 70)}" fill="${r.pick(["#FF2BD6", "#FFD400", "#18E5FF", "#FF8FA3"])}"/>`;
    let over = `<rect x="600" y="700" width="820" height="420" rx="50" fill="#1A1A1A" transform="rotate(-8 1010 910)"/><rect x="680" y="780" width="660" height="200" rx="10" fill="#9BE564" transform="rotate(-8 1010 880)"/>` + text("BUY BUY BUY 100X", 1010, 910, { font: FONTS.crt, size: 100, fill: "#1A2A10", anchor: "middle", rotate: -8 });
    for (let i = 0; i < 3; i++) over += `<path d="M${540 - i * 40} ${760 + i * 10} q -30 150 0 300 M${1480 + i * 40} ${640 + i * 10} q 30 150 0 300" stroke="#FFFFFF" stroke-width="10" fill="none"/>`;
    return { under, over, card: { x: 1000, y: 1250, rot: 6, scale: 0.95 } };
  },
  "i-will-not-buy-the-top": () => {
    let under = "";
    for (let i = 0; i < 24; i++) under += text("I WILL NOT BUY THE TOP", 60 + (i % 2) * 20, 200 + i * 72, { font: FONTS.kid, size: 60, fill: "#FFFFFF", opacity: 0.85, rotate: i / 6 });
    const over = text("I WILL BUY THE TOP", 1000, 1930, { font: FONTS.kid, size: 130, fill: "#FFFFFF", anchor: "middle" }) + `<path d="M300 1955 H1700 M320 1975 H1680" stroke="#FFFFFF" stroke-width="10"/>`;
    return { under, over, card: { x: 1180, y: 900, rot: 3, scale: 0.9 } };
  },
  "the-forgery-kit": () => {
    const under = `<circle cx="1000" cy="900" r="1000" fill="#FFB000" fill-opacity="0.15"/><rect x="120" y="1300" width="700" height="600" fill="#F5F5DC" transform="rotate(-8 470 1600)"/>` + [0, 1, 2, 3, 4].map((i) => text("Mom", 200 + (i % 2) * 120, 1420 + i * 100, { font: FONTS.cursive, size: 70, fill: "#1E3A8A", rotate: -8 })).join("");
    const over = `<rect x="1550" y="1250" width="220" height="380" rx="40" fill="#FFFFFF" stroke="#999" stroke-width="8"/><rect x="1600" y="1170" width="120" height="100" fill="#1E3A8A"/>` + text("EXCELLED", 1000, 580, { font: FONTS.stamp, size: 220, fill: "#E3122B", anchor: "middle", rotate: -10, opacity: 0.85 });
    return { under, over };
  },
  "show-and-tell": () => {
    const words = ["1 BANANA", "2 CRAYON", "3 RECESS", "4 GRAVY", "5 LOCKER", "6 TOTS", "7 HAMSTER", "8 BUS", "9 GLUE", "10 NAPTIME", "11 DODGEBALL", "12 OOPS"];
    let under = `<rect x="80" y="220" width="1840" height="1250" fill="#FFFFFF" stroke="#999" stroke-width="12"/>`;
    words.forEach((w, i) => (under += text(w, 160 + (i % 3) * 600, 380 + Math.floor(i / 3) * 280, { font: FONTS.kid, size: 80, fill: "#0057FF" })));
    let over = "";
    for (let i = 0; i < 14; i++) over += `<path d="M${80 + i * 140} 2000 V${1760 - (i % 3) * 40} M${80 + i * 140} ${1760 - (i % 3) * 40} l-18 -60 M${80 + i * 140} ${1760 - (i % 3) * 40} l18 -64" stroke="#5A5A5A" stroke-width="30" stroke-linecap="round"/>`;
    return { under, over, card: { x: 1400, y: 1300, rot: 8, scale: 0.6 } };
  },
  "the-class-hamster": () => {
    let under = "";
    for (let x = 0; x < 2000; x += 60) under += `<path d="M${x} 0 V2000" stroke="#C0C0C0" stroke-width="6"/>`;
    under += `<circle cx="1700" cy="400" r="260" fill="none" stroke="#9A9A9A" stroke-width="30"/>` + text("TREASURY", 1700, 410, { font: FONTS.condensed, size: 60, fill: "#555", anchor: "middle" });
    const over = `<ellipse cx="1000" cy="1350" rx="420" ry="330" fill="#F4A81D"/><circle cx="830" cy="1170" r="70" fill="#F4A81D"/><circle cx="1170" cy="1170" r="70" fill="#F4A81D"/><circle cx="900" cy="1280" r="26" fill="#111"/><circle cx="1100" cy="1280" r="26" fill="#111"/><ellipse cx="1000" cy="1340" rx="30" ry="20" fill="#FF8FA3"/><ellipse cx="820" cy="1400" rx="110" ry="80" fill="#FFD27A"/><ellipse cx="1180" cy="1400" rx="110" ry="80" fill="#FFD27A"/><path d="${starPath(1000, 1560, 70, 30)}" fill="#FFD700"/>`;
    return { under, over, card: { x: 1000, y: 900, rot: -2, scale: 1.0 } };
  },
  "harrows-own-report-card": (_p, r) => {
    let under = "";
    for (let i = 0; i < 40; i++) under += `<path d="${scallopPath(i * 52, 30, 30, 8, 0.2)}" fill="#1646FF"/><path d="${scallopPath(i * 52, 1970, 30, 8, 0.2)}" fill="#1646FF"/>`;
    let over = "";
    for (let i = 0; i < 12; i++) {
      const x = r.int(150, 1850);
      const y = r.int(200, 1850);
      over += `<circle cx="${x}" cy="${y}" r="48" fill="#FFE45C" stroke="#E0A800" stroke-width="5"/><circle cx="${x - 16}" cy="${y - 10}" r="6" fill="#111"/><circle cx="${x + 16}" cy="${y - 10}" r="6" fill="#111"/><path d="M${x - 22} ${y + 14} q 22 18 44 0" stroke="#111" stroke-width="5" fill="none"/>`;
    }
    over += text("TEACHER: HARROW", 1000, 380, { font: FONTS.kidPrint, size: 100, fill: "#FF2BD6", anchor: "middle", rotate: -3 });
    return { over, under };
  },
  "made-it-to-the-moon": (_p, r) => {
    let under = `<rect width="2000" height="2000" fill="#000000"/>`;
    for (let i = 0; i < 120; i++) under += `<circle cx="${r.int(0, 2000)}" cy="${r.int(0, 1300)}" r="${n(r.float(1.5, 5))}" fill="#FFFFFF"/>`;
    under += `<circle cx="1700" cy="300" r="140" fill="#1E90FF"/><path d="M1620 250 q 60 -40 120 20 q -40 60 -110 40 Z" fill="#2E8B57"/>`;
    under += `<path d="M0 1450 C 500 1350, 1500 1400, 2000 1380 V2000 H0 Z" fill="#BFBFBF"/>`;
    for (let i = 0; i < 12; i++) under += `<ellipse cx="${r.int(0, 2000)}" cy="${r.int(1500, 1950)}" rx="${r.int(50, 140)}" ry="${r.int(15, 40)}" fill="#9A9A9A"/>`;
    under += `<path d="M560 1500 V420" stroke="#DDDDDD" stroke-width="22"/>`;
    const over = `<circle cx="1450" cy="1650" r="120" fill="#FFFFFF" stroke="#999" stroke-width="10"/><ellipse cx="1450" cy="1650" rx="80" ry="60" fill="#18FF6D" fill-opacity="0.7"/>`;
    return { under, over, card: { x: 950, y: 800, rot: 4, scale: 0.7 } };
  },
  "stuck-under-the-desk": (_p, r) => {
    let under = `<rect x="80" y="80" width="1840" height="1840" fill="#5A5A5A" stroke="#333" stroke-width="30"/>`;
    for (let i = 0; i < 30; i++) under += `<circle cx="${r.int(120, 1880)}" cy="${r.int(120, 1880)}" r="${r.int(30, 70)}" fill="${r.pick(["#FF4FA3", "#39FF14", "#00B7FF", "#FFE600"])}"/>`;
    let over = "";
    for (const [x, y] of [[520, 420], [1480, 420], [520, 1760], [1480, 1760]]) over += `<circle cx="${x}" cy="${y}" r="80" fill="#FF4FA3"/><circle cx="${x - 20}" cy="${y - 20}" r="24" fill="#FFB3D6"/>`;
    over += `<rect x="1500" y="1000" width="340" height="90" fill="#C0C0C0" transform="rotate(-30 1670 1045)"/><rect x="1760" y="900" width="200" height="70" fill="#6B3A1E" transform="rotate(-30 1860 935)"/>` + text("DESK 14", 250, 1900, { font: FONTS.stencil, size: 70, fill: "#BDBDBD" });
    return { under, over, card: { x: 1000, y: 1090, rot: 0, scale: 1.2 } };
  },
  "scratch-and-sniff": (_p, r) => {
    const labels = ["TOP", "PROFIT", "RISK", "BAGS", "MEMES", "EARLY"];
    const cols = ["#FF7A00", "#FFE600", "#9A9A9A", "#7CFC00", "#B266FF", "#FFFFFF"];
    let over = "";
    labels.forEach((l, i) => {
      const x = 1480 + (i % 2) * 260;
      const y = 400 + Math.floor(i / 2) * 400;
      over += `<circle cx="${x}" cy="${y}" r="110" fill="${cols[i]}" stroke="#333" stroke-width="6"/>` + text(l, x, y + 14, { font: FONTS.condensed, size: 42, fill: "#111", anchor: "middle" });
      for (let k = 0; k < 3; k++) over += `<path d="M${x - 40 + k * 40} ${y - 130} q 20 -30 0 -60 q -20 -30 0 -60" stroke="#333" stroke-width="6" fill="none"/>`;
    });
    void r;
    return { over, card: { x: 720, y: 1000, rot: -5, scale: 1.0 } };
  },
  "the-airdrop": () => {
    let under = `<path d="M400 1600 C 100 1200, 500 800, 900 1100 C 1300 1400, 1500 700, 1100 600 C 700 500, 900 1300, 1500 1500" fill="none" stroke="#FFFFFF" stroke-width="14" stroke-dasharray="30 24"/>`;
    under += `<path d="M1400 1400 H1900 L1840 1980 H1460 Z" fill="#9E9E9E" stroke="#666" stroke-width="10"/>`;
    for (let i = 0; i < 5; i++) under += `<path d="M${1480 + i * 80} 1420 l60 -80 l20 90 Z" fill="#FFFFFF" stroke="#999" stroke-width="4"/>`;
    under += `<path d="M0 0 L500 120 L0 240 Z" fill="#1B1B1B"/>`;
    const over = `<path d="M300 700 L1200 1000 L500 1150 Z" fill="#FFFFFF" stroke="#999" stroke-width="6"/><path d="M500 1150 L620 960 L1200 1000" fill="#EEEEEE" stroke="#999" stroke-width="6"/>` + text("AIRDROP", 700, 980, { font: FONTS.condensed, size: 70, fill: RED, anchor: "middle", rotate: 18 });
    return { under, over, card: { x: 1600, y: 700, rot: 18, scale: 0.45 } };
  },
  "chain-letter": () => {
    let under = "";
    for (let i = 0; i < 10; i++) under += `<rect x="${300 + i * 20}" y="${300 + i * 10}" width="1400" height="1500" fill="#D9D9D9" stroke="#222" stroke-opacity="0.4" stroke-width="4" transform="rotate(${-20 + i * 4} 1000 1000)"/>`;
    const over =
      text("THIS REPORT CARD HAS BEEN SENT TO YOU", 1000, 330, { font: FONTS.kidPrint, size: 64, fill: "#222", anchor: "middle", rotate: -2 }) +
      text("FOR GOOD LUCK. SEND TO 10 FRIENDS", 1000, 410, { font: FONTS.kidPrint, size: 64, fill: "#222", anchor: "middle", rotate: -2 }) +
      `<ellipse cx="1000" cy="385" rx="720" ry="110" fill="none" stroke="${RED}" stroke-width="10"/>` +
      text("DO NOT BREAK THE CHAIN", 1000, 1920, { font: FONTS.kidPrint, size: 80, fill: "#222", anchor: "middle" }) +
      `<rect x="400" y="1860" width="1200" height="80" fill="#FFF200" fill-opacity="0.5"/>`;
    return { under, over };
  },
  "sent-to-the-corner": () => {
    const under = `<path d="M0 0 L1000 700 L1000 2000 L0 2000 Z" fill="#C99400"/><path d="M2000 0 L1000 700 L1000 2000 L2000 2000 Z" fill="#E1A800"/><path d="M1000 700 V2000" stroke="#6B4E00" stroke-width="10"/>` + `<rect x="760" y="1500" width="480" height="60" fill="#8B5A2B"/><path d="M800 1560 L740 2000 M1200 1560 L1260 2000 M1000 1560 V2000" stroke="#8B5A2B" stroke-width="36"/>` + text("FACE THE WALL. NOT THE CHART.", 1500, 1000, { font: FONTS.harrow, size: 64, fill: RED, anchor: "middle", rotate: 30 });
    const over = `<path d="M1000 120 L760 640 L1240 640 Z" fill="#FFFFFF" stroke="#333" stroke-width="10"/>` + text("D", 1000, 560, { font: FONTS.slab, size: 170, fill: "#111", anchor: "middle" });
    return { under, over, card: { x: 1000, y: 1080, rot: 0, scale: 0.85 } };
  },
};

export const oneOfOnesB: ArtModule = {
  group: "oneofones-b",
  owns: ["1of1 (one-of-ones 18-33)"],
  files: () => oneOfOneFiles([18, 33], GAGS),
};
