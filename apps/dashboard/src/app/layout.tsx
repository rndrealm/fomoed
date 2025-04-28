import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvideer";

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
    title: "Fomoed Dashbaords",
    description: "Everything you need.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // Keep h-full for filling vertical space in iframes.
        <html lang="en" className="h-full">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}>
                <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
                    <QueryProvider>{children}</QueryProvider>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
