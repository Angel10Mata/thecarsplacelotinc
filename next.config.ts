import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

const require = createRequire(import.meta.url);

function ensurePdfWorker() {
  try {
    const reactPdfDir = path.dirname(require.resolve("react-pdf/package.json"));
    const workerSrc = require.resolve("pdfjs-dist/build/pdf.worker.min.mjs", {
      paths: [reactPdfDir],
    });
    const destDir = path.join(process.cwd(), "public");
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(workerSrc, path.join(destDir, "pdf.worker.min.mjs"));
  } catch {
    /* ignore */
  }
}

ensurePdfWorker();

const isProd = process.env.NODE_ENV === "production";

const APP_BASE = "/panel";
const LEGACY_APP_BASES = ["/TheCarsPlace", "/TheCarsPlaceLotInc"] as const;

const nextConfig: NextConfig = {
  reactCompiler: isProd,
  transpilePackages: ["react-pdf", "pdfjs-dist"],
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
