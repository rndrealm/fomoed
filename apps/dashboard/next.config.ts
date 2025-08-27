import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/auth/login", // applies only to /auth/login
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0", // disable caching
          },
        ],
      },
      {
        source: "/auth/callback", // applies only to /auth/login
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0", // disable caching
          },
        ],
      },
      {
        source: "/auth/forgot-password", // applies only to /auth/forgot-password
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0", // disable caching
          },
        ],
      },

      {
        source: "/auth/mail-authenticate", // applies only to /auth/mail-authenticate
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0", // disable caching
          },
        ],
      },
      {
        source: "/auth/update-password", // applies only to /auth/update-password
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0", // disable caching
          },
        ],
      },
    ];
  },
  productionBrowserSourceMaps: true,
};

export default nextConfig;
