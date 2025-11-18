"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

interface SliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  showDots?: boolean;
  dotPositions?: number[];
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  showDots = false,
  dotPositions = [0, 25, 50, 75, 100],
  ...props
}: SliderProps) {
  const _values = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
    [value, defaultValue, min, max],
  );

  const orientation = props.orientation || "horizontal";

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-[#222329] relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-[#FF9D32] absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
          )}
        />
        {showDots &&
          dotPositions.map((position) => {
            const percentage = ((position - min) / (max - min)) * 100;
            // Check if any thumb has passed this dot position
            const isPassed = _values.some((thumbValue) => thumbValue >= position);
            return (
              <div
                key={position}
                className={cn(
                  "absolute rounded-full z-0 transition-colors",
                  isPassed ? "bg-[#E75E02]" : "bg-[#515156]",
                  orientation === "horizontal"
                    ? "size-1 top-1/2 -translate-y-1/2 -translate-x-1/2"
                    : "size-1 left-1/2 -translate-x-1/2 -translate-y-1/2",
                )}
                style={orientation === "horizontal" ? { left: `${percentage}%` } : { top: `${percentage}%` }}
              />
            );
          })}
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="border-[#FF6600] ring-ring/50 block size-4 shrink-0 rounded-full  border-[4px] bg-[#FF9D32] shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
