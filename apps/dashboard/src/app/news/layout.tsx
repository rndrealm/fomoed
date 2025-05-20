import { Navbar } from "@/components/shared";
import { Fragment } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Fragment>
      <div className="absolute inset-x-0 top-0">
        <Navbar isNews />
      </div>
      {children}
    </Fragment>
  );
}
