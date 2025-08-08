import React, { useEffect, useRef } from "react";
import { FullscreenableContainer } from "./fullscreenable-container";

interface FullscreenableCanvasProps {
  isFullscreen: boolean;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
  onAnimationComplete?: () => void;
}

/**
 * A component that wraps a canvas element in a fullscreenable container
 */
export function FullscreenableCanvas(props: FullscreenableCanvasProps) {
  const { isFullscreen, onCanvasReady, onAnimationComplete } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Pass the canvas element to the callback when it's ready
  useEffect(() => {
    if (canvasRef.current) {
      onCanvasReady(canvasRef.current);
    }
  }, [onCanvasReady]);

  return (
    <FullscreenableContainer
      isFullscreen={isFullscreen}
      onAnimationComplete={onAnimationComplete}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-auto h-full w-full touch-none rounded-[10px]"
      />
    </FullscreenableContainer>
  );
}
