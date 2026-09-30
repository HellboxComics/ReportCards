import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The share-image renderers read the self-hosted fonts and paper texture
  // from disk; make sure serverless bundles ship them.
  outputFileTracingIncludes: {
    "/opengraph-image": ["./assets/**/*"],
    "/card/[address]/opengraph-image": ["./assets/**/*"],
  },
};

export default nextConfig;
