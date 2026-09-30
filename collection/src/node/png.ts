/**
 * Deterministic RGB PNG encoder. resvg's own PNG output is RGBA with a fixed
 * filter; token images are always opaque, so dropping alpha and choosing a
 * filter per row (minimum sum of absolute differences) roughly halves file
 * size. Output bytes depend only on the pixels.
 */
import { deflateSync } from "node:zlib";

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf: Uint8Array): number {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type: string, data: Uint8Array): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "latin1"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

/** Encode RGBA pixels (alpha ignored; composite onto opaque art) as an 8-bit RGB PNG. */
export function encodeRgbPng(rgba: Uint8Array, width: number, height: number, level = 6): Buffer {
  const stride = width * 3;
  const raw = Buffer.alloc((stride + 1) * height);
  let prev = new Uint8Array(stride);
  let cur = new Uint8Array(stride);
  const cand = [new Uint8Array(stride), new Uint8Array(stride), new Uint8Array(stride), new Uint8Array(stride), new Uint8Array(stride)];
  for (let y = 0; y < height; y++) {
    const rowStart = y * width * 4;
    for (let x = 0, i = 0; x < width; x++, i += 3) {
      const s = rowStart + x * 4;
      cur[i] = rgba[s];
      cur[i + 1] = rgba[s + 1];
      cur[i + 2] = rgba[s + 2];
    }
    let best = 0;
    let bestSum = Infinity;
    for (let f = 0; f < 5; f++) {
      const o = cand[f];
      let sum = 0;
      for (let i = 0; i < stride; i++) {
        const a = i >= 3 ? cur[i - 3] : 0;
        const b = prev[i];
        const c = i >= 3 ? prev[i - 3] : 0;
        let p: number;
        if (f === 0) p = 0;
        else if (f === 1) p = a;
        else if (f === 2) p = b;
        else if (f === 3) p = (a + b) >> 1;
        else {
          const pa = Math.abs(b - c);
          const pb = Math.abs(a - c);
          const pc = Math.abs(a + b - 2 * c);
          p = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        }
        const v = (cur[i] - p) & 255;
        o[i] = v;
        sum += v < 128 ? v : 256 - v;
        if (sum >= bestSum) break;
      }
      if (sum < bestSum) {
        bestSum = sum;
        best = f;
      }
    }
    // The early-exit above may have left the winning candidate complete only
    // if it won; recompute it fully to be safe.
    writeFiltered(cand[best], best, cur, prev, stride);
    raw[y * (stride + 1)] = best;
    raw.set(cand[best], y * (stride + 1) + 1);
    const tmp = prev;
    prev = cur;
    cur = tmp;
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level })),
    chunk("IEND", new Uint8Array(0)),
  ]);
}

function writeFiltered(o: Uint8Array, f: number, cur: Uint8Array, prev: Uint8Array, stride: number): void {
  for (let i = 0; i < stride; i++) {
    const a = i >= 3 ? cur[i - 3] : 0;
    const b = prev[i];
    const c = i >= 3 ? prev[i - 3] : 0;
    let p: number;
    if (f === 0) p = 0;
    else if (f === 1) p = a;
    else if (f === 2) p = b;
    else if (f === 3) p = (a + b) >> 1;
    else {
      const pa = Math.abs(b - c);
      const pb = Math.abs(a - c);
      const pc = Math.abs(a + b - 2 * c);
      p = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
    }
    o[i] = (cur[i] - p) & 255;
  }
}
