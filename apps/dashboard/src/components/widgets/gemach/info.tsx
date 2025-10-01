import React, { Fragment } from "react";
import { ExternalLink, HyperliquidStar, Question } from "@/components/icons/icons";
import { HowItWorks } from "./how-it-works";
import { useAtomValue, useSetAtom } from "jotai";
import { showHowItWorksAtom, toggleHowItWorksAtom } from "@/lib/atoms/gemach";

export function Info() {
  const toggleHowItWorks = useSetAtom(toggleHowItWorksAtom);
  const howItWorks = useAtomValue(showHowItWorksAtom);

  return (
    <Fragment>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-[20px] h-[20px] rounded-full bg-[#114833]">
            <HyperliquidStar />
          </div>

          <h3 className="text-sm font-medium text-white leading-[1.25]">Top Perp Traders</h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              toggleHowItWorks(true);
            }}
          >
            <div className="flex gap-1 items-center border border-[#242424] py-[6px] px-2 rounded-2xl">
              <div className="w-[14px] h-[14px] flex items-center justify-center">
                <Question />
              </div>
              <p className="text-[#fafafa] text-xs leading-[16px] tracking-[-0.4%]">How It works</p>
            </div>
          </button>

          <button type="button">
            <div className="flex gap-1 items-center border border-[#242424] py-[6px] px-2 rounded-2xl">
              <div className="w-[14px] h-[14px] flex items-center justify-center">
                <ExternalLink />
              </div>
              <p className="text-[#fafafa] text-xs leading-[16px] tracking-[-0.4%]">Docs</p>
            </div>
          </button>
        </div>
      </div>

      <HowItWorks
        open={howItWorks}
        handleClose={() => {
          toggleHowItWorks(false);
        }}
      />
    </Fragment>
  );
}
