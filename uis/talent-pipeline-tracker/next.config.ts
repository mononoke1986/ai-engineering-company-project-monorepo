import type { NextConfig } from "next";

const healthcoreApiOrigin =
  process.env.NEXT_PUBLIC_HEALTHCORE_API_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Reenvía las llamadas de HealthCore desde Next.js para evitar bloqueos del navegador.
  async rewrites() {
    return [
      {
        source: "/users/:path*",
        destination: `${healthcoreApiOrigin}/users/:path*`,
      },
      {
        source: "/auth/:path*",
        destination: `${healthcoreApiOrigin}/auth/:path*`,
      },
      {
        source: "/profiles/:path*",
        destination: `${healthcoreApiOrigin}/profiles/:path*`,
      },
      {
        source: "/healthcore-api/:path*",
        destination: `${healthcoreApiOrigin}/:path*`,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
