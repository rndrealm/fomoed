import { Navbar } from "@/components/shared";
import { NavbarNews } from "@/components/shared/navbar-news";
import { Fragment } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Fragment>
      <div className="absolute inset-x-0 top-0">
        <NavbarNews />
      </div>
      {children}
    </Fragment>
  );
}
