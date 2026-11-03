import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // React Compiler en dev compila mucho y suele dejar el overlay en "Compiling" minutos u horas.
  reactCompiler: isProd,
  experimental: {
    serverActions: {
      // Fotos (comprimidas) y PDF de factura hasta 10 MB vía FormData en uploadCarImageStorageAction.
      bodySizeLimit: "11mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/farmacia-la-salud",
        destination: "/TheCarsPlace",
        permanent: true,
      },
      {
        source: "/farmacia-la-salud/:path*",
        destination: "/TheCarsPlace/:path*",
        permanent: true,
      },
      {
        source: "/farmamuni",
        destination: "/TheCarsPlace",
        permanent: true,
      },
      {
        source: "/farmamuni/:path*",
        destination: "/TheCarsPlace/:path*",
        permanent: true,
      },
      {
        source: "/TheCarsPlace/flota-vehicular",
        destination: "/TheCarsPlace/vehiculos",
        permanent: true,
      },
      {
        source: "/TheCarsPlace/flota-vehicular/:path*",
        destination: "/TheCarsPlace/vehiculos/:path*",
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
        destination: "/TheCarsPlace/vehiculos/inventario",
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
