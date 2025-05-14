"use client";

import { RenderIf } from "@/components/shared";
import dashboard from "@/lib/assets/dashboard";
import { useGetUserPlans } from "@/services/queries/subscriptions";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import React, { Fragment, ReactNode } from "react";

interface IProps {
  children: ReactNode;
}

const PremiumOverlay = (props: IProps) => {
  const { children } = props;
  const { data: userPlans } = useGetUserPlans();

  return (
    <>
      <RenderIf condition={!userPlans?.hasPlan}>
        <div
          className="absolute w-full h-full top-0 left-0  z-[10] backdrop-blur-[14px] rounded-[20px]"
          style={{
            background:
              "linear-gradient(180deg, #080808 -8.63%, rgba(0, 0, 0, 0.4) 92.88%)",
          }}
        >
          <div></div>
          <div className="flex flex-col items-center justify-center h-full text-white">
            <div className="text-[15px] font-semibold font-inter text-center">
              Get the next level plan to unlock more!
            </div>

            <div className="flex justify-center mt-3 ">
              <Image
                alt="Fomoed Logo"
                src={dashboard.premiumLogo}
                width={139}
                height={24}
              />
            </div>

            <div className="mt-8">
              <a
                href="https://app.fomoed.io/plans"
                className="flex justify-center"
              >
                <button className="flex items-center gap-[17px] justify-center border border-[#323232] bg-[white] rounded-[10px] px-4 py-[10px]">
                  <span className="text-xs font-semibold tracking-[-0.31px] text-black">
                    Select Your Plan
                  </span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </button>
              </a>
            </div>
          </div>
        </div>
      </RenderIf>
      <RenderIf condition={!!userPlans?.hasPlan}>{children}</RenderIf>
    </>
  );
};

export default PremiumOverlay;
