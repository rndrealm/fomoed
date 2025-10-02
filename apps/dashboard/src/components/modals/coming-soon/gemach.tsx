import React from "react";

interface IProps {
  handleClose: () => void;
}

export function Gemach(props: IProps) {
  const { handleClose } = props;

  return (
    <div className="h-full w-full relative flex flex-col justify-between py-8">
      <div className="flex flex-col gap-4 items-center">
        <div className="max-w-[200px] w-full h-[24px] app_coming_soon_gemach_logo"></div>

        <p className="text-center text-xs leading-[1.35] tracking-[-5.4%] text-[#A5A5A5] font-medium">
          Copy Trading On Hyperliquid
        </p>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          className="w-[104px] h-[32px] app_coming_soon_gemach_button outline-none focus:ring-0 focus:border-0"
        ></button>
      </div>

      <div className="absolute w-[32px] h-[32px] top-[24px] right-[24px]">
        <button
          className="w-full h-full rounded-full app_coming_soon_gemach_close flex items-center justify-center outline-none focus:ring-0 focus:border-0"
          type="button"
          onClick={handleClose}
        ></button>
      </div>
    </div>
  );
}
