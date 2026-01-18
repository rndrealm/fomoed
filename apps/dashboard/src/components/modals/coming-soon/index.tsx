import React, { useState, useEffect } from "react";
import { ModalContainer, RenderIf } from "@/components/shared";
import { Gemach } from "./gemach";
import { Ascendex } from "./ascendex";
import { cn } from "@/lib/utils";

const COMING_SOON_GEMACH_ASCENDEX_SHOWN_KEY = "fomoed_coming_soon_gemach_ascendex_shown";

export function ComingSoon() {
  const [showGemach, setShowGemach] = useState(false);
  const [showAscendex, setShowAscendex] = useState(false);

  // useEffect(() => {
    // Check if the coming-soon modals have been shown before
    // const hasShown = localStorage.getItem(COMING_SOON_GEMACH_ASCENDEX_SHOWN_KEY);

    // Only show the modal flow if it hasn't been shown before
    // if (!hasShown) {
    //   setShowGemach(true);
    // }
  // }, []);

  return (
    <ModalContainer
      open={showGemach || showAscendex}
      handleClose={() => {}}
      noHeader
      className={cn(
        "bg-[linear-gradient(180deg,rgba(0,0,0,0.2)_47.75%,rgba(18,18,21,0.2)_64.64%,rgba(0,0,0,0.2)_81.31%)] border border-[#282828] rounded-[30px] !max-w-[700px] w-full !max-h-[450px] h-full app_coming_soon_gemach",
        showAscendex && "ascendex",
      )}
      dialogOverlayClassName="backdrop-blur-[2px] bg-[rgba(12,12,12,0.6)]"
    >
      <RenderIf condition={showGemach}>
        <Gemach
          handleClose={() => {
            setShowAscendex(true);
            setShowGemach(false);
          }}
        />
      </RenderIf>
      <RenderIf condition={showAscendex}>
        <Ascendex
          handleClose={() => {
            setShowAscendex(false);
            // Mark the modal flow as shown when the user closes the last modal
            localStorage.setItem(COMING_SOON_GEMACH_ASCENDEX_SHOWN_KEY, "true");
          }}
        />
      </RenderIf>
    </ModalContainer>
  );
}
