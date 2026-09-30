import { isTokenId, MAX_SUPPLY, tokenMetadata } from "../../../../../collection/src/index";

/**
 * Live per-token metadata: GET /api/metadata/417 (or /api/metadata/417.json).
 * Generated from the token id + the collection seed, byte-for-byte the same
 * JSON as collection/output/metadata/417.json. 404 outside 1..3333.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: raw } = await ctx.params;
  const m = /^(\d{1,4})(?:\.json)?$/.exec(raw);
  const id = m ? Number(m[1]) : NaN;
  if (!isTokenId(id)) {
    return Response.json({ error: `no such token: ids are 1..${MAX_SUPPLY}` }, { status: 404 });
  }
  return Response.json(tokenMetadata(id), {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" },
  });
}
