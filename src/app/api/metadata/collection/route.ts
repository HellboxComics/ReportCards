import { collectionMetadata } from "../../../../../collection/src/index";

/** Contract-level metadata (contractURI): GET /api/metadata/collection. */
export async function GET() {
  return Response.json(collectionMetadata(), {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" },
  });
}
