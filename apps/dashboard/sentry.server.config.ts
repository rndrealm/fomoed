// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://5007495d200fc87c0a3ca4363b9cf6ef@o4509983082414080.ingest.us.sentry.io/4509983136612352",

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  environment: process.env.NEXT_PUBLIC_SENTRY_ENV || "development",
});
