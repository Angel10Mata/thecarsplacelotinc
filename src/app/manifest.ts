import { MetadataRoute } from "next";
import { APP_LOGO_PATH, APP_NAME_UPPER, PUBLIC_CATALOG_PATH } from "@/lib/app-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME_UPPER,
    short_name: APP_NAME_UPPER,
    description: "THE CARS PLACE LOT INC — gestión vehicular",
    start_url: PUBLIC_CATALOG_PATH,
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: APP_LOGO_PATH,
        sizes: "64x64 192x192 512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: APP_LOGO_PATH,
        sizes: "64x64 192x192 512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
