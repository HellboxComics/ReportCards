import { readFile } from "node:fs/promises";
import path from "node:path";

/** Self-hosted fonts for ImageResponse (Satori needs raw ttf data). */
export async function ogFonts() {
  const font = (file: string) => readFile(path.join(process.cwd(), "assets/fonts", file));
  const [anton, mono, courier, courierBold, marker, pen] = await Promise.all([
    font("Anton-Regular.ttf"),
    font("SpaceMono-Bold.ttf"),
    font("CourierPrime-Regular.ttf"),
    font("CourierPrime-Bold.ttf"),
    font("PermanentMarker-Regular.ttf"),
    font("NanumPenScript-Latin.ttf"),
  ]);
  return [
    { name: "Anton", data: anton, weight: 400 as const, style: "normal" as const },
    { name: "Space Mono", data: mono, weight: 700 as const, style: "normal" as const },
    { name: "Courier Prime", data: courier, weight: 400 as const, style: "normal" as const },
    { name: "Courier Prime", data: courierBold, weight: 700 as const, style: "normal" as const },
    { name: "Permanent Marker", data: marker, weight: 400 as const, style: "normal" as const },
    { name: "Nanum Pen Script", data: pen, weight: 400 as const, style: "normal" as const },
  ];
}
