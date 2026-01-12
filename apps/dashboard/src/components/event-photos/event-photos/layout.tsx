import { NavbarNews } from "@/components/shared/navbar-news";
import "@rainbow-me/rainbowkit/styles.css";
import "simplebar-react/dist/simplebar.min.css";

export default function ReferralLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="absolute inset-x-0 top-0 z-[9]">
        <NavbarNews isDashboard />
      </div>

      <div className="min-h-screen bg-[#0C0C0C] pt-5">
        <div className="relative flex h-full w-full flex-col px-4 sm:px-6">
          <div className="ml-0 md:ml-[64px]">{children}</div>
        </div>
      </div>
    </>
  );
}
