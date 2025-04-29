import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.coinstats.app",
      },
      new URL("https://lh3.googleusercontent.com/**"),
    ],
  },
};

export default nextConfig;
