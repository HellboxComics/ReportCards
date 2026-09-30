import { headers } from "next/headers";

/** First value of a possibly comma-separated forwarded header. */
const first = (v: string | null) => v?.split(",")[0]?.trim() || null;

/**
 * Absolute origin for share links and unfurls. Set NEXT_PUBLIC_SITE_URL in
 * production (e.g. https://reportcards.example); otherwise the request's
 * forwarded host/proto are used. Never throws on a malformed value.
 */
export async function siteOrigin(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) {
    try {
      return new URL(/^https?:\/\//.test(env) ? env : `https://${env}`).origin;
    } catch {
      // fall through to the request headers
    }
  }
  const h = await headers();
  const host = first(h.get("x-forwarded-host")) ?? first(h.get("host")) ?? "localhost:3000";
  const local = /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(host);
  const proto = first(h.get("x-forwarded-proto")) ?? (local ? "http" : "https");
  try {
    return new URL(`${proto}://${host}`).origin;
  } catch {
    return "http://localhost:3000";
  }
}
