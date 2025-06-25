import DexProvider from "@/components/providers/DexProvider";
import { Navbar } from "@/components/shared";
import "@rainbow-me/rainbowkit/styles.css";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DexProvider>
      <div className="absolute inset-x-0 top-0 z-[9] ">
        <Navbar />
      </div>
      {children}
    </DexProvider>
  );
}
