import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const APP_BASE = "/panel";
const LEGACY_APP_BASES = ["/TheCarsPlace", "/TheCarsPlaceLotInc"] as const;

const nextConfig: NextConfig = {
  reactCompiler: isProd,
  experimental: {
    serverActions: {
      bodySizeLimit: "11mb",
    },
  },
  async redirects() {
    const legacyRedirects = LEGACY_APP_BASES.flatMap((legacy) => [
      {
        source: legacy,
        destination: APP_BASE,
        permanent: true,
      },
      {
        source: `${legacy}/:path*`,
        destination: `${APP_BASE}/:path*`,
        permanent: true,
      },
    ]);

    return [
      ...legacyRedirects,
      {
        source: "/farmacia-la-salud",
        destination: APP_BASE,
        permanent: true,
      },
      {
        source: "/farmacia-la-salud/:path*",
        destination: `${APP_BASE}/:path*`,
        permanent: true,
      },
      {
        source: "/farmamuni",
        destination: APP_BASE,
        permanent: true,
      },
      {
        source: "/farmamuni/:path*",
        destination: `${APP_BASE}/:path*`,
        permanent: true,
      },
      {
        source: `${APP_BASE}/flota-vehicular`,
        destination: `${APP_BASE}/vehiculos`,
        permanent: true,
      },
      {
        source: `${APP_BASE}/flota-vehicular/:path*`,
        destination: `${APP_BASE}/vehiculos/:path*`,
        permanent: true,
      },
      {
        source: "/inventario",
        destination: "/",
        permanent: false,
      },
      {
        source: "/inventario/:path*",
        destination: "/:path*",
        permanent: false,
      },
      {
        source: "/",
        has: [{ type: "query", key: "from", value: "vehiculos" }],
        destination: `${APP_BASE}/vehiculos/inventario`,
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
