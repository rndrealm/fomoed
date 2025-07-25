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
      <div className="ml-0 h-screen overflow-hidden bg-black pt-4 md:ml-12 md:pt-4">{children}</div>

      {/* <div className="h-[100vh] overflow-hidden bg-[red] bg-black pt-[60px] md:pt-[64px]">
        <div className="relative flex h-full w-full flex-col overflow-hidden">
          <div className="ml-0 overflow-hidden md:ml-12">{children}</div>
        </div>
      </div> */}
    </DexProvider>
  );
}
