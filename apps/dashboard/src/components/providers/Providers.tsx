"use client";

import React, { ReactNode } from "react";
import QueryProvider from "./QueryProvider";
import { SupabaseAuthProvider } from "./SupabaseAuthProvider";
import { NotificationProvider } from "./NotificationProvider";
import AnalyticsProvider from "./AnalyticsProvider";
import DexProvider from "./DexProvider";
// Import ThemeProvider with correct name once the typo is fixed

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <SupabaseAuthProvider>
        <DexProvider>
          <NotificationProvider>
            <AnalyticsProvider>
              {/* Wrap with ThemeProvider once available */}
              {children}
            </AnalyticsProvider>
          </NotificationProvider>
        </DexProvider>
      </SupabaseAuthProvider>
    </QueryProvider>
  );
}
