import React, { Fragment } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { cn, getOverlayRoot } from "@/lib/utils";
import { FullScreen } from "@/components/icons/icons";
import StarFilled from "@/components/icons/StarFilled";

interface IProps {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  handleShowAll: () => void;
  handleShowFavorites: () => void;
  showFavorites: boolean;
}

export function FullscreenControls(props: IProps) {
  const {
    isFullscreen,
    toggleFullscreen,
    handleShowAll,
    handleShowFavorites,
    showFavorites,
  } = props;
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
              className="pointer-events-auto fixed top-0 right-0 left-0 z-[60] flex items-center justify-between bg-black/20 px-2 backdrop-blur-2xl py-2"
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={cn(
                    "flex h-[32px] items-center gap-2 rounded-[10px] border border-[#212121] bg-[#181818] px-6 text-sm leading-[1] text-[#8E8E93]",
                    !showFavorites && "bg-white text-[#0C0C0C]",
                  )}
                  onClick={handleShowAll}
                >
                  All
                </button>

                <button
                  type="button"
                  className={cn(
                    "flex h-[32px] items-center gap-2 rounded-[10px] border border-[#212121] bg-[#181818] px-6 text-sm leading-[1] text-[#8E8E93]",
                    showFavorites && "bg-white text-[#0C0C0C]",
                  )}
                  onClick={handleShowFavorites}
                >
                  <StarFilled />
                  Favourites
                </button>
              </div>
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
