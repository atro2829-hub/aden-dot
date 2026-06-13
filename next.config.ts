import type { NextConfig } from "next";

const isExport = process.env.NEXT_EXPORT === '1';

const nextConfig: NextConfig = {
  output: isExport ? "export" : "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: isExport ? { unoptimized: true } : undefined,
  trailingSlash: isExport ? true : undefined,
};

export default nextConfig;
