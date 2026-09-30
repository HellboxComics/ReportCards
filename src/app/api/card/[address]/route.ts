import { loadReportCard } from "@/lib/load";
import { isAddress } from "@/lib/providers";

export async function GET(req: Request, ctx: { params: Promise<{ address: string }> }) {
  const { address } = await ctx.params;
  if (!isAddress(address)) {
    return Response.json({ error: "not a wallet address" }, { status: 400 });
  }
  const url = new URL(req.url);
  const card = await loadReportCard(address, {
    name: url.searchParams.get("name") ?? undefined,
    term: url.searchParams.get("term") ?? undefined,
  });
  return Response.json(card);
}
