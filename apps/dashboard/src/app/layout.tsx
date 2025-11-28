import QueryProvider from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

import { NotificationProvider } from "@/components/providers/NotificationProvider";
import { SupabaseAuthProvider } from "@/components/providers/SupabaseAuthProvider";
import "../../node_modules/react-grid-layout/css/styles.css";
import { headers } from "next/headers";
import OverlayRoot from "@/components/ui/overlay-root";
import AnalyticsProvider from "@/components/providers/AnalyticsProvider";
import ServiceWorkerRegister from "@/lib/sw/ServiceWorkerRegister";
import CookiesManager from "@/lib/cookies/cookies-manager";
import GeneralProvider from "@/components/providers/GeneralProvider";
import { ReactScan } from "@/components/shared/ReactScan";
// import { ReactScan } from "@/components/shared/ReactScan";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fomoed",
  description: "Navigate crypto emotions, access Altcoins, and get precise market sentiment analysis effortlessly.",
  keywords: [
    "web3",
    "ethereum",
    "crypto",
    "wallet",
    "swap",
    "bridge",
    "btc",
    "trading",
    "defi",
    "dashboard",
    "cfgi",
    "news",
  ],
  creator: "IDS",
  metadataBase: new URL("https://dashboard-dev.fomoed.io"),
  openGraph: {
    images: "/og2.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Keep h-full for filling vertical space in iframes.
    <html lang="en" className="h-full">
      {/* <ReactScan /> */}
      <ServiceWorkerRegister />
      <CookiesManager />
      <body className={`${geistSans.variable} ${geistMono.variable} h-full bg-[#0C0C0C] antialiased`}>
        <OverlayRoot />
        <Analytics />
        <div id="root" className="h-full">
          <GeneralProvider>{children}</GeneralProvider>

          <Toaster
            toastOptions={{
              style: {
                maxWidth: "523px",
                width: "100%",
                height: "56px",
                paddingTop: 0,
                paddingBottom: 0,
              },
            }}
          />
        </div>
      </body>
    </html>
  );
}
