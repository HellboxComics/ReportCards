import { headers } from "next/headers";

/** Absolute origin for share links and unfurls. NEXT_PUBLIC_SITE_URL wins when set. */
export async function siteOrigin(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/+$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const local = /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(host);
  const proto = h.get("x-forwarded-proto")?.split(",")[0] ?? (local ? "http" : "https");
  return `${proto}://${host}`;
}
