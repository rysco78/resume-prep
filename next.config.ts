import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "mammoth"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
