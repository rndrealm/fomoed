import { SentryBuildOptions, withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
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
        source: "/auth", // applies only to /auth/*
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
        source: "/auth/confirm", // applies only to /auth/login
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
  productionBrowserSourceMaps: false,
};

const sentryConfig: SentryBuildOptions = {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "fomoed",

  project: "fomoed-dashboard-fe",

  authToken: process.env.SENTRY_AUTH_TOKEN,

  sourcemaps: {
    disable: false, // Source maps are enabled by default
    ignore: ["**/node_modules/**"], // Files to exclude
    deleteSourcemapsAfterUpload: true, // Security: delete after upload
  },

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
};

if (process.env.TURBOPACK) {
  module.exports = nextConfig;
} else {
  module.exports = withSentryConfig(nextConfig, sentryConfig);
}
