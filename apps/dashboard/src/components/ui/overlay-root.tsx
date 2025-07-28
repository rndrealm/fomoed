"use client";

import { useWindowHeight } from "@/lib/hooks/use-window-height";

export default function OverlayRoot() {
  const windowHeight = useWindowHeight();

  return (
    <div
      id="overlay-root"
      className="pointer-events-none fixed z-50 w-screen"
      style={{ height: windowHeight || 0 }}
    ></div>
  );
}
