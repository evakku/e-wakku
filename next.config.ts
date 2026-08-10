import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1 MB; PDF + cover uploads need more headroom.
      bodySizeLimit: "50mb",
    },
  },
};
export default nextConfig;
