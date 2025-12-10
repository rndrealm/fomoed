import { NavbarNews } from "@/components/shared/navbar-news";
import "simplebar-react/dist/simplebar.min.css";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="absolute inset-x-0 top-0 z-[9]">
        <NavbarNews isDashboard />
      </div>
      <div className="ml-0 h-screen overflow-hidden bg-black md:ml-[64px]">{children}</div>
    </>
  );
}
