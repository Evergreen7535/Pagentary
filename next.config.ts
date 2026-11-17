import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // Contestant photos are uploaded through an authenticated server action.
      // Keep this slightly above the 5 MB file validation limit for multipart overhead.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
