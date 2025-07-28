import React, { useCallback, useState } from "react";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import CignalsDropdown from "./cignals-dropdown";
import { FullScreen } from "@/components/icons/icons";

interface CignalControlsProps {
  onSave: (newOptions: any) => void;
  chartOptions: any;
  toggleFullscreen: () => void;
}

const CignalControls: React.FC<CignalControlsProps> = ({ onSave, chartOptions, toggleFullscreen }) => {
  const [openOptionModal, setOpenOptionModal] = useState(false);

  const onSaveWrapper = useCallback(
    (newOptions: any) => {
      onSave(newOptions);

      setOpenOptionModal(false);
    },
    [onSave]
  );

  return (
    <div className="relative flex items-center gap-2">
      {/* Fullscreen button */}
      <button
        onClick={toggleFullscreen}
        className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#121212] p-2"
      >
        <FullScreen />
      </button>
      <button
        onClick={() => setOpenOptionModal(!openOptionModal)}
        className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#121212] p-2"
      >
        <Image src={dashboard.settings} alt="settings icon" />
      </button>
      {openOptionModal ? (
        <CignalsDropdown onClose={() => setOpenOptionModal(false)} onSave={onSaveWrapper} originalOptions={chartOptions} />
      ) : null}
    </div>
  );
};

export default CignalControls;
