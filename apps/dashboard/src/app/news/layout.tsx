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
        <NavbarNews isNews />
      </div>
      <div className="bg-black pt-[64px] md:pt-[86px]">
        <div className="relative flex h-full w-full flex-col px-4 sm:px-6">
          <div className="ml-0 md:ml-[64px]">{children}</div>
        </div>
      </div>
    </Fragment>
  );
}
