import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Increase timeout for serverless API routes on Vercel
  serverExternalPackages: ["canvas", "jsdom"],
};

export default nextConfig;
