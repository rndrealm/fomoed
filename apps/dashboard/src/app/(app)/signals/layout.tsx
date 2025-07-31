"use client";

import { AutoShowUpgradePopup } from "@/components/modals/upgrade-popups/autoShowUpgradePopup";
import React from "react";
import { LoaderCircle } from "lucide-react";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const [planLoaded, setPlanLoaded] = React.useState(false);

  return (
    <>
      <AutoShowUpgradePopup
        upgradeToPlan="PRO"
        onPlanLoaded={() => setPlanLoaded(true)}
      />

      <div className="w-full pt-8 bg-black min-h-screen p-2 h-full dark text-white">
        <div className="w-full max-w-7xl mx-auto mt-10 h-full">
          {(planLoaded && <div className="w-full">{children}</div>) || (
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
