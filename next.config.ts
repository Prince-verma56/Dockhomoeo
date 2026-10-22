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
  // Permanent redirects for legacy website URL structures
  async redirects() {
    return [
      {
        source: "/ReturnCancellation",
        destination: "/return-cancellation",
        permanent: true,
      },
      {
        source: "/returncancellation",
        destination: "/return-cancellation",
        permanent: true,
      },
      {
        source: "/form.pdf",
        destination: "/terms-and-conditions",
        permanent: true,
      },
      {
        source: "/shipping",
        destination: "/shipping-policy",
        permanent: true,
      },
      {
        source: "/refundPolicy",
        destination: "/refund-policy",
        permanent: true,
      },
      {
        source: "/refundpolicy",
        destination: "/refund-policy",
        permanent: true,
      },
      {
        source: "/PrivacyPolicy",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/privacypolicy",
        destination: "/privacy-policy",
        permanent: true,
      },
    ];
  },
  // Proxy API and upload calls to the backend on port 4000
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        { source: "/api/:path*", destination: `${API_URL}/api/:path*` },
        { source: "/uploads/:path*", destination: `${API_URL}/uploads/:path*` },
      ],
    };
  },
};

export default nextConfig;
