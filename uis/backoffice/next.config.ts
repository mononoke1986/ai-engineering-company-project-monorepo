import type { NextConfig } from "next";

const apiOrigin = process.env.HEALTHCORE_API_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
      {
        source: "/auth/:path*",
        destination: `${apiOrigin}/auth/:path*`,
      },
      {
        source: "/users/:path*",
        destination: `${apiOrigin}/users/:path*`,
      },
      {
        source: "/users",
        destination: `${apiOrigin}/users`,
      },
      {
        source: "/profiles/:path*",
        destination: `${apiOrigin}/profiles/:path*`,
      },
    ];
  },
};

export default nextConfig;
