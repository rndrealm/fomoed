"use client";

import { AnimatePresence, motion } from "motion/react";
import { ModalContainer } from "../shared";
import { LayoutType } from "@/lib/atoms/layoutAtom";

const WidgetModalWrapper = ({ children, widget, isFullscreen, setIsFullscreen }: { children: React.ReactNode; widget: LayoutType["widgets"][0], isFullscreen: boolean, setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const layoutId = `${widget.id}`;

    return (
        <>
            <AnimatePresence mode="wait">
                {!isFullscreen && (
                    <motion.div
                        key="inline"
                        layoutId={layoutId}
                        transition={{
                            layout: { duration: 0., ease: "none" }
                        }}
                        style={{ willChange: "transform" }}
                        className="h-full"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
            <ModalContainer
                open={isFullscreen}
                handleClose={() => {
                    setIsFullscreen(false);
                }}
                className="!max-w-[90%] h-full overflow-hidden"
            >
                {children}
            </ModalContainer>
        </>

    );
}

export default WidgetModalWrapper