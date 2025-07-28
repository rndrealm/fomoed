import React, { useEffect, useRef } from "react";
import { getOverlayRoot } from "@/lib/utils";

interface FullscreenableCanvasProps {
  isFullscreen: boolean;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
  onAnimationComplete?: () => void;
}

const FullscreenableCanvas: React.FC<FullscreenableCanvasProps> = ({
  isFullscreen,
  onCanvasReady,
  onAnimationComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const originalPosition = useRef({ top: 0, left: 0, width: 0, height: 0 });
  const overlayRoot = getOverlayRoot();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Pass the canvas element to the callback
    onCanvasReady(canvasRef.current);

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    if (isFullscreen) {
      // Store original position and dimensions
      originalPosition.current = { top: rect.top, left: rect.left, width: rect.width, height: rect.height };

      // Create a wrapper for the canvas with fixed position
      const wrapper = document.createElement("div");
      wrapper.style.position = "fixed";
      wrapper.style.top = `${rect.top}px`;
      wrapper.style.left = `${rect.left}px`;
      wrapper.style.width = `${rect.width}px`;
      wrapper.style.height = `${rect.height}px`;
      wrapper.style.zIndex = "10";
      wrapper.style.backgroundColor = "#121212";
      wrapper.style.transition = "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)";
      wrapper.style.borderRadius = "0";
      wrapper.style.overflow = "hidden";

      // Move the canvas to the wrapper
      const parent = canvas.parentNode as HTMLElement; // Ensure parent is an HTMLElement
      parent?.removeChild(canvas);
      wrapper.appendChild(canvas);

      // Move the wrapper into the portal
      if (!overlayRoot) return; // Ensure overlayRoot is not null
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

        // Resize the canvas to fill the wrapper
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        // Trigger onAnimationComplete callback if provided
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 10);
    } else {
      const wrapper = canvas.parentElement;

      if (!wrapper || wrapper.parentElement !== overlayRoot) return;

      // Animate back to original position and size
      wrapper.style.transition = "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)";
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

        // Move the canvas back to its original container
        const container = containerRef.current; // Use container element
        if (container) {
          container.appendChild(canvas);
        }

        // Reset canvas styles
        canvas.style.width = "100%";
        canvas.style.height = "100%";
      }, 700);
    }
  }, [isFullscreen, onCanvasReady, overlayRoot, onAnimationComplete]);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <canvas ref={canvasRef} className="pointer-events-auto h-full w-full touch-none rounded-[10px]" />
    </div>
  );
};

export default FullscreenableCanvas;
