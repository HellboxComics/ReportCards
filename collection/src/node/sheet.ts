/** Contact sheets: a grid of thumbnails with labels, rendered by resvg. */
import { FONTS } from "../fonts";
import { renderSvg } from "./render";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export interface SheetItem {
  png: Buffer;
  label: string;
  sublabel?: string;
}

/** Grid of `cell`px thumbnails, `cols` wide, with two label lines under each. */
export function contactSheet(items: readonly SheetItem[], opts: { cols?: number; cell?: number; title?: string } = {}): Buffer {
  const cols = opts.cols ?? 6;
  const cell = opts.cell ?? 300;
  const pad = 16;
  const labelH = 58;
  const titleH = opts.title ? 70 : 0;
  const rows = Math.ceil(items.length / cols);
  const W = cols * (cell + pad) + pad;
  const H = titleH + rows * (cell + labelH + pad) + pad;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#161616"/>`;
  if (opts.title) s += `<text x="${pad}" y="48" font-family="${FONTS.condensed}" font-size="40" fill="#FFFFFF">${esc(opts.title)}</text>`;
  items.forEach((it, i) => {
    const x = pad + (i % cols) * (cell + pad);
    const y = titleH + pad + Math.floor(i / cols) * (cell + labelH + pad);
    s += `<image x="${x}" y="${y}" width="${cell}" height="${cell}" href="data:image/png;base64,${it.png.toString("base64")}"/>`;
    s += `<text x="${x}" y="${y + cell + 24}" font-family="${FONTS.mono}" font-weight="bold" font-size="19" fill="#FFFFFF">${esc(it.label.slice(0, 30))}</text>`;
    if (it.sublabel) s += `<text x="${x}" y="${y + cell + 48}" font-family="${FONTS.mono}" font-size="16" fill="#BBBBBB">${esc(it.sublabel.slice(0, 34))}</text>`;
  });
  s += `</svg>`;
  return renderSvg(s, { width: W });
}
