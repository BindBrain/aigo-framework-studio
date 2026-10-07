import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.INTERNAL_API_BASE_URL || "http://api:8000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
