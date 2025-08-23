import React, { Fragment } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { getOverlayRoot } from "@/lib/utils";
import { FullScreen } from "@/components/icons/icons";

interface IProps {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

export function FullscreenControls(props: IProps) {
  const { isFullscreen, toggleFullscreen } = props;
  const overlayRoot = getOverlayRoot();

  return (
    <Fragment>
      {overlayRoot &&
        isFullscreen &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-auto fixed top-0 right-0 left-0 z-[60] flex items-center justify-end bg-black/20 px-4 backdrop-blur-2xl py-2"
            >
              <div className="flex gap-4 items-center">
                <button
                  onClick={toggleFullscreen}
                  className="flex h-10 w-10 items-center justify-center rounded-md bg-black/40 text-white hover:bg-black/60"
                >
                  <FullScreen />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>,
          overlayRoot,
        )}
    </Fragment>
  );
}
