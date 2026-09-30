/**
 * Rendering (node-only): SVG -> PNG with resvg and the bundled fonts, then
 * the deterministic RGB encoder. Same seed + same layer files -> same bytes.
 */
import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import path from "node:path";
import { FONTS } from "../fonts";
import { DEFAULT_SEED, assertTokenId } from "../constants";
import { selectCollection, type Token } from "../select";
import { composeTokenSvg, type ComposeOptions } from "./compose";
import { FONTS_DIR } from "./paths";
import { encodeRgbPng } from "./png";

let fontFiles: string[] | null = null;
export function bundledFontFiles(): string[] {
  fontFiles ??= fs
    .readdirSync(FONTS_DIR)
    .filter((f) => f.endsWith(".ttf"))
    .sort()
    .map((f) => path.join(FONTS_DIR, f));
  return fontFiles;
}

export interface RenderOptions {
  /** Output width in px (square). Default 2000. */
  width?: number;
}

/** Render an SVG document to PNG bytes. */
export function renderSvg(svg: string, opts: RenderOptions = {}): Buffer {
  const width = opts.width ?? 2000;
  const r = new Resvg(svg, {
    font: { fontFiles: bundledFontFiles(), loadSystemFonts: false, defaultFontFamily: FONTS.mono },
    fitTo: width === 2000 ? { mode: "original" } : { mode: "width", value: width },
    shapeRendering: 2,
    textRendering: 1,
    imageRendering: 0,
    background: "#ffffff",
  });
  const img = r.render();
  return encodeRgbPng(img.pixels, img.width, img.height);
}

export interface TokenRenderOptions extends RenderOptions, ComposeOptions {
  seed?: string;
}

export function composeToken(id: number, opts: TokenRenderOptions = {}): string {
  assertTokenId(id);
  const token: Token = selectCollection(opts.seed ?? DEFAULT_SEED).tokens[id - 1];
  return composeTokenSvg(token, opts);
}

/** PNG for one token (2000x2000 unless `width` is given). */
export function renderToken(id: number, opts: TokenRenderOptions = {}): Buffer {
  return renderSvg(composeToken(id, opts), opts);
}
