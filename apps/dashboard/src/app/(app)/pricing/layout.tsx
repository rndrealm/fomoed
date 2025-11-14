import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Plans | Fomoed",
  description: "Choose the perfect plan for your crypto trading journey. Access essential widgets, real-time data for 44+ crypto assets, smart signals, and advanced analytics. Plans starting from free.",
  keywords: [
    "crypto pricing",
    "crypto subscription plans",
    "trading platform pricing",
    "crypto analytics pricing",
    "defi dashboard pricing",
    "cryptocurrency tools",
    "crypto market data subscription",
  ],
  openGraph: {
    title: "Pricing Plans | Fomoed",
    description: "Choose the perfect plan for your crypto trading journey. Access real-time data for 44+ crypto assets, smart signals, and advanced analytics.",
    images: "/og2.png",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing Plans | Fomoed",
    description: "Choose the perfect plan for your crypto trading journey. Plans starting from free.",
    images: "/og2.png",
  },
};

export default function PricingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
