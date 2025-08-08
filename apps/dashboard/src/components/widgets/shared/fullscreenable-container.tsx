import React, { useEffect, useRef, ReactNode } from "react";
import { getOverlayRoot } from "@/lib/utils";

interface FullscreenableContainerProps {
  isFullscreen: boolean;
  onAnimationComplete?: () => void;
  children: ReactNode;
}

export function FullscreenableContainer(props: FullscreenableContainerProps) {
  const { isFullscreen, onAnimationComplete, children } = props;
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const originalPosition = useRef({ top: 0, left: 0, width: 0, height: 0 });
  const overlayRoot = getOverlayRoot();

  useEffect(() => {
    if (!contentRef.current) return;

    const contentElement = contentRef.current;
    const rect = contentElement.getBoundingClientRect();

    if (isFullscreen) {
      originalPosition.current = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };

      // Create a wrapper for the content with fixed position
      const wrapper = document.createElement("div");
      wrapper.style.position = "fixed";
      wrapper.style.top = `${rect.top}px`;
      wrapper.style.left = `${rect.left}px`;
      wrapper.style.width = `${rect.width}px`;
      wrapper.style.height = `${rect.height}px`;
      wrapper.style.zIndex = "50";
      wrapper.style.backgroundColor = "#000";
      wrapper.style.transition = "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)";
      wrapper.style.borderRadius = "10px";
      wrapper.style.overflow = "hidden";

      // Move the content to the wrapper
      const parent = contentElement.parentNode as HTMLElement;
      parent?.removeChild(contentElement);
      wrapper.appendChild(contentElement);

      // Move the wrapper into the portal
      if (!overlayRoot) return;
      overlayRoot.appendChild(wrapper);

      // Force a reflow to ensure the initial position is set before animation
      wrapper.getBoundingClientRect();

      // Animate to fullscreen
      setTimeout(() => {
        wrapper.style.top = "0";
        wrapper.style.left = "0";
        wrapper.style.width = "100vw";
        wrapper.style.height = "100vh";
        wrapper.style.borderRadius = "0";

        // Resize the content to fill the wrapper
        contentElement.style.width = "100%";
        contentElement.style.height = "100%";

        // Trigger onAnimationComplete callback if provided
        if (onAnimationComplete) {
          setTimeout(() => {
            onAnimationComplete();
          }, 300);
        }
      }, 10);
    } else {
      const wrapper = contentElement.parentElement;

      if (!wrapper || wrapper.parentElement !== overlayRoot) return;

      // Animate back to original position and size
      wrapper.style.transition = "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)";
      wrapper.style.top = `${originalPosition.current.top}px`;
      wrapper.style.left = `${originalPosition.current.left}px`;
      wrapper.style.width = `${originalPosition.current.width}px`;
      wrapper.style.height = `${originalPosition.current.height}px`;
      wrapper.style.borderRadius = "10px";

      setTimeout(() => {
        // Trigger onAnimationComplete callback if provided
        if (onAnimationComplete) {
          onAnimationComplete();
        }

        // Ensure wrapper is removed from the DOM and reset styles
        if (wrapper.parentElement === overlayRoot) {
          overlayRoot?.removeChild(wrapper);
        }

        // Move the content back to its original container
        const container = containerRef.current;
        if (container) {
          container.appendChild(contentElement);
        }

        // Reset content styles
        contentElement.style.width = "100%";
        contentElement.style.height = "100%";
      }, 700);
    }
  }, [isFullscreen, overlayRoot, onAnimationComplete]);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <div
        ref={contentRef}
        className="pointer-events-auto h-full w-full touch-none rounded-[10px]"
      >
        {children}
      </div>
    </div>
  );
}
