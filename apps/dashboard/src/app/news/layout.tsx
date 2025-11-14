import { NavbarNews } from "@/components/shared/navbar-news";
import { Fragment } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crypto News | Fomoed",
  description: "Stay updated with the latest cryptocurrency news, market insights, and blockchain developments. Real-time crypto news coverage across 44+ digital assets.",
  keywords: [
    "crypto news",
    "cryptocurrency news",
    "bitcoin news",
    "ethereum news",
    "blockchain news",
    "altcoin news",
    "defi news",
    "web3 news",
    "crypto market news",
  ],
  openGraph: {
    title: "Crypto News | Fomoed",
    description: "Stay updated with the latest cryptocurrency news, market insights, and blockchain developments.",
    images: "/og3.png",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crypto News | Fomoed",
    description: "Stay updated with the latest cryptocurrency news and market insights.",
    images: "/og3.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Fragment>
      <div className="absolute inset-x-0 top-0">
        <NavbarNews isNews />
      </div>
      <div className="bg-black pt-[64px] md:pt-[86px]">
        <div className="relative flex h-full w-full flex-col px-4 sm:px-6">
          <div className="ml-0 md:ml-[64px]">{children}</div>
        </div>
      </div>
    </Fragment>
  );
}
