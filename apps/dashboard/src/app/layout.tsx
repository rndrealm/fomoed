import QueryProvider from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

import { UserProvider } from "@/components/providers/UserProvider";
import "../../node_modules/react-grid-layout/css/styles.css";

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
  description:
    "Navigate crypto emotions, access Altcoins, and get precise market sentiment analysis effortlessly.",
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
  metadataBase: new URL("https://fomoed.io"),
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
    <html lang="en" className="h-full" suppressHydrationWarning>
      {/* <head>
        <script
          crossOrigin="anonymous"
          src="//unpkg.com/react-scan/dist/auto.global.js"
        />
      </head> */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <QueryProvider>
          <NuqsAdapter>
            <UserProvider>{children}</UserProvider>
          </NuqsAdapter>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
