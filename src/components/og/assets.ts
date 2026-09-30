import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Self-hosted fonts and textures for ImageResponse (Satori needs raw ttf data).
 * Read once per server instance. next.config.ts traces assets/** into the
 * serverless bundle for every route that renders an image.
 */
const asset = (...p: string[]) => readFile(path.join(process.cwd(), "assets", ...p));

let loaded: ReturnType<typeof load> | null = null;

async function load() {
  const [anton, mono, courier, courierBold, marker, pen, paper] = await Promise.all([
    asset("fonts", "Anton-Regular.ttf"),
    asset("fonts", "SpaceMono-Bold.ttf"),
    asset("fonts", "CourierPrime-Regular.ttf"),
    asset("fonts", "CourierPrime-Bold.ttf"),
    asset("fonts", "PermanentMarker-Regular.ttf"),
    asset("fonts", "NanumPenScript-Latin.ttf"),
    asset("og", "paper.jpg"),
  ]);
  return {
    fonts: [
      { name: "Anton", data: anton, weight: 400 as const, style: "normal" as const },
      { name: "Space Mono", data: mono, weight: 700 as const, style: "normal" as const },
      { name: "Courier Prime", data: courier, weight: 400 as const, style: "normal" as const },
      { name: "Courier Prime", data: courierBold, weight: 700 as const, style: "normal" as const },
      { name: "Permanent Marker", data: marker, weight: 400 as const, style: "normal" as const },
      { name: "Nanum Pen Script", data: pen, weight: 400 as const, style: "normal" as const },
    ],
    paper: `data:image/jpeg;base64,${paper.toString("base64")}`,
  };
}

export function ogAssets() {
  loaded ??= load().catch((e) => {
    loaded = null;
    throw e;
  });
  return loaded;
}
