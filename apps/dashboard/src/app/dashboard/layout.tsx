// import Navbar from "@/components/ui/navbar";
import { UserProvider } from "@/components/providers/UserProvider";
import { Navbar } from "@/components/shared";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider>
      <div className="absolute inset-x-0 top-0">
        <Navbar />
      </div>
      {children}
    </UserProvider>
  );
}
