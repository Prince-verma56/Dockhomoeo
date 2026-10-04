import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The hero's social-proof avatars are remote placeholders. next/image
    // refuses remote hosts unless they are declared here.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
