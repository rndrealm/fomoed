import { takeScreenshot } from "@/charts/helpers";
import { useScreenshotWithWatermark } from "@/hooks/useScreenshotWithWatermark";
import dashboard from "@/lib/assets/dashboard";
import { cn } from "@/lib/utils";
import { Camera } from "lucide-react";
import Image from "next/image";
import React, { useRef } from "react";

interface IProps {
  refetch: () => void;
  file: string;
  isFetching: boolean;
  chartRef: React.RefObject<HTMLDivElement | null>;
}

const CameraAndRefresh = (props: IProps) => {
  const { refetch, file, isFetching, chartRef } = props;
  // const takeScreenshot = useScreenshotWithWatermark({ file });
  return (
    <>
      <button
        className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#121212]"
        onClick={() => {
          takeScreenshot({ elementRef: chartRef, file });
        }}
      >
        <Camera className="w-4 text-[#636363]" />
      </button>
      <button
        className={cn("flex h-8 w-8 items-center justify-center rounded-sm bg-[#121212]", {
          "cursor-not-allowed": isFetching,
        })}
        onClick={() => refetch()}
      >
        <div
          className={cn({
            "animate-spin": isFetching,
          })}
        >
          <Image src={dashboard.refresh} alt="Refresh button" />
        </div>
      </button>
    </>
  );
};

export default CameraAndRefresh;
