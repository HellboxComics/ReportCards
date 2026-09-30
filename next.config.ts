import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The OG image renderers read the self-hosted fonts from disk.
  outputFileTracingIncludes: {
    "/opengraph-image": ["./assets/fonts/**/*"],
    "/card/[address]/opengraph-image": ["./assets/fonts/**/*"],
  },
};

export default nextConfig;
