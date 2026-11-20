import type { MetadataRoute } from "next";
import { INDEXED_ROUTES, absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return INDEXED_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    ...(route.path === "/" ? { images: [absoluteUrl("/og-image.png")] } : {}),
  }));
}
