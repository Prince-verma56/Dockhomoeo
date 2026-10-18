import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "gsap"],
  },
  env: {
    NEXT_PUBLIC_BUILD_TIME: String(Date.now()),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // The hero's social-proof avatars are remote placeholders. next/image
    // refuses remote hosts unless they are declared here.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
  // Proxy API and upload calls to the backend on port 4000
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_URL}/api/:path*` },
      { source: "/uploads/:path*", destination: `${API_URL}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
