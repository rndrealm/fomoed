"use client";

import GeneralErrorScreen from "@/components/screens/general-error-screen";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <GeneralErrorScreen></GeneralErrorScreen>
      </body>
    </html>
  );
}
