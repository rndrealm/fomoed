import DexProvider from "@/components/providers/DexProvider";
import { Navbar } from "@/components/shared";
import { NavbarNews } from "@/components/shared/navbar-news";
import "@rainbow-me/rainbowkit/styles.css";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DexProvider>
      {/* <div className="absolute inset-x-0 top-0 z-[9] ">
        <Navbar />
      </div> */}
      {/* {children} */}

      <div className="absolute inset-x-0 top-0 z-[9]">
        <NavbarNews />
      </div>
      <div className="bg-black pt-[60px] md:pt-[64px]">
        <div className="relative flex h-full w-full flex-col">
          <div className="ml-0 md:ml-12">{children}</div>
        </div>
      </div>
    </DexProvider>
  );
}
