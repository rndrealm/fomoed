"use client";

import { useState, useEffect } from "react";

export function useWindowHeight() {
  const [height, setHeight] = useState<number | null>(null); // Allow both null and number

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => setHeight(window.innerHeight);

    setHeight(window.innerHeight); // Set initial height on client-side
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return height;
}
