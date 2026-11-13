import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Remote images (company logos / avatars) can be allowed here once the backend host is known.
    remotePatterns: [],
  },
};

export default nextConfig;
