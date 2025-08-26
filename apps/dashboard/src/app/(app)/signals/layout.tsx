"use client";

import { AutoShowUpgradePopup } from "@/components/modals/upgrade-popups/autoShowUpgradePopup";
import React from "react";
import { LoaderCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { AppRoutes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const pathName = usePathname();
  const [planLoaded, setPlanLoaded] = React.useState(false);

  const isMarketplacePage = pathName.includes(
    AppRoutes.signals.community.marketplace.path,
  );

  console.log(pathName, isMarketplacePage);
  return (
    <>
      <AutoShowUpgradePopup
        upgradeToPlan="pro"
        onPlanLoaded={() => setPlanLoaded(true)}
      />

      <div className="w-full bg-black h-full dark text-white overflow-scroll">
        <div
          className={cn("h-full", !isMarketplacePage && "max-w-4xl mx-auto")}
        >
          {(planLoaded && <div className="w-full h-full">{children}</div>) || (
            <div className="w-full h-full grid place-items-center pb-64">
              <LoaderCircle className="w-10 h-10 animate-spin text-[#838383] duration-1000" />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Layout;
