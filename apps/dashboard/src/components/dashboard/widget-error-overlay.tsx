import { Button } from "@/components/ui/button";
import { Drag } from "../icons/icons";
import { motion } from "motion/react";

interface WidgetErrorOverlayProps {
  error: Error;
  resetErrorBoundary?: () => void;
}

function WidgetErrorOverlay({ resetErrorBoundary }: WidgetErrorOverlayProps) {
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
      <div className="flex justify-center">
        <button type="button" className="cursor-grab">
          <Drag />
        </button>
      </div>

      <div className="font-medium font-inter text-2xl text-white h-full flex flex-col pb-8">
        <div className="font-medium">Something went wrong</div>

        <div className="flex-grow flex flex-col">
          <div className="flex-grow"></div>
          <div className="text-white font-inter text-mid gap-y-4 font-medium">Try solving the issue...</div>
          <div className="flex gap-x-2 pt-5">
            <Button
              onClick={resetErrorBoundary}
              className="bg-white hover:bg-white hover:opacity-50 text-[#464646] font-semibold border border-[#E6E6E6]"
            >
              Reload Widget
            </Button>
            <a href="mailto:support@fomoed.io">
              <Button className="text-white border border-[#E6E6E6]">Help & Support</Button>
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default WidgetErrorOverlay;
