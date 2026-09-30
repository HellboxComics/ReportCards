import type { NextRequest } from "next/server";
import { renderCardImage, renderFallbackImage } from "@/components/og/CardImage";
import { loadReportCard } from "@/lib/load";
import { isAddress } from "@/lib/providers";

/**
 * The card's share image. A route handler (not the opengraph-image file
 * convention) so it can read ?term= and ?name= and unfurl the exact card that
 * was shared. generateMetadata points og:image and twitter:image here.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  if (!isAddress(address)) return renderFallbackImage();
  const sp = req.nextUrl.searchParams;
  const card = await loadReportCard(address, {
    name: sp.get("name") ?? undefined,
    term: sp.get("term") ?? undefined,
  });
  // A locked semester never changes; the current one can change daily.
  const cache = card.locked
    ? "public, max-age=86400, s-maxage=31536000, immutable"
    : "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400";
  return renderCardImage(card, { headers: { "Cache-Control": cache } });
}
