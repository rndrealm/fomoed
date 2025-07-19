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
      <div className="bg-black pt-[64px] md:pt-[86px]">
        <div className="relative flex h-full w-full flex-col px-6">
          <div className="ml-11">{children}</div>
        </div>
      </div>
    </Fragment>
  );
}
