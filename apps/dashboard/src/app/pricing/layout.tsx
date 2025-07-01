import { Navbar } from "@/components/shared";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="absolute inset-x-0 top-0 z-[9] ">
        <Navbar />
      </div>
      {children}
    </>
  );
}
