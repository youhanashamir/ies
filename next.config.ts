import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async redirects() {
    return [
      // One canonical host for search engines: www -> apex.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.internationalestimatingservice.com" }],
        destination: "https://internationalestimatingservice.com/:path*",
        permanent: true,
      },
      // The old Ask page now lives at /contact.
      { source: "/ask", destination: "/contact", permanent: true },
    ];
  },
};

export default nextConfig;
