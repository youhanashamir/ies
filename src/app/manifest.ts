import type { MetadataRoute } from "next";
import { SITE } from "@/lib/content";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#faf9ff",
    theme_color: "#faf9ff",
    icons: [{ src: "/favicon.png", sizes: "158x160", type: "image/png" }],
  };
}
