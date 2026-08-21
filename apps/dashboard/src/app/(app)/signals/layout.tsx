"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AppRoutes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const pathName = usePathname();

  const isMarketplacePage = pathName.includes(
    AppRoutes.signals.community.marketplace.path,
  );

  return (
    <div className="w-full bg-black h-full dark text-white overflow-scroll">
      <div
        className={cn("h-full", !isMarketplacePage && "max-w-4xl mx-auto")}
      >
        <div className="w-full h-full">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
