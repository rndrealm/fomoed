import { Button } from "@/components/ui/button";
import { Drag } from "../icons/icons";
import { motion } from "motion/react";

interface WidgetErrorOverlayProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function WidgetErrorOverlay({ error, resetErrorBoundary }: WidgetErrorOverlayProps) {
  const isApiError =
    error.message?.includes("fetch") ||
    error.message?.includes("API") ||
    error.message?.includes("network") ||
    error.message?.includes("timeout");

  const errorTitle = isApiError ? "Service Temporarily Unavailable" : "Something went wrong";
  const errorMessage = isApiError
    ? "This widget is currently undergoing maintenance. Please try again in a few moments."
    : "An unexpected error occurred while loading this widget.";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full bg-[#080808] border border-[#1b1b1b] rounded-2xl overflow-hidden px-6 py-3 flex flex-col gap-4"
      style={{
        backgroundImage: "url(/media/images/dashboard/widget-error-bg.svg)",
        backgroundSize: "cover",
        backgroundPositionX: "10px",
      }}
    >
      <div className="flex cursor-grab justify-center pt-4 pb-1">
        <div className="h-[5px] w-[36px] rounded-[2px] bg-[#444]"></div>
      </div>

      <div className="font-medium font-inter text-2xl text-white h-full flex flex-col pb-8">
        <div className="font-medium text-xl sm:text-2xl">{errorTitle}</div>

        <div className="flex-grow flex flex-col justify-end">
          <div className="text-white/70 font-inter text-sm sm:text-base font-normal mb-6">{errorMessage}</div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-x-2">
            <Button
              onClick={resetErrorBoundary}
              className="bg-white hover:bg-white hover:opacity-80 text-[#464646] font-semibold border border-[#E6E6E6] transition-opacity"
            >
              Reload Widget
            </Button>
            <a href="mailto:support@fomoed.io" className="w-full sm:w-auto">
              <Button className="w-full text-white border border-[#E6E6E6] bg-transparent hover:bg-white/10">
                Help & Support
              </Button>
            </a>
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-3 bg-black/30 rounded-lg border border-red-500/20">
              <p className="text-xs text-red-400 font-mono break-all">{error.message}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default WidgetErrorOverlay;
