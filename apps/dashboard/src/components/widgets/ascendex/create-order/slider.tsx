import React, { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";

export default function Slider() {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [percentage, setPercentage] = useState(0);
  const [sliderX, setSliderX] = useState(0);

  const calculatePosition = (clientX: number) => {
    if (!constraintsRef.current) return { percentage: 0, x: 0 };

    const containerRect = constraintsRef.current.getBoundingClientRect();
    const containerWidth = constraintsRef.current.offsetWidth;
    const sliderWidth = 12; // Width of the slider knob
    const maxDragDistance = containerWidth - sliderWidth;

    // Calculate position relative to container
    const relativeX = clientX - containerRect.left - sliderWidth / 2;
    const clampedX = Math.max(0, Math.min(relativeX, maxDragDistance));
    const calculatedPercentage = Math.round((clampedX / maxDragDistance) * 100);

    return { percentage: calculatedPercentage, x: clampedX };
  };

  const handleDrag = (_: any, info: any) => {
    const { percentage: newPercentage } = calculatePosition(info.point.x);
    setPercentage(newPercentage);
  };

  const handleClick = (event: React.MouseEvent) => {
    if (!constraintsRef.current || !sliderRef.current) return;

    const { percentage: newPercentage, x: newX } = calculatePosition(event.clientX);
    setPercentage(newPercentage);
    setSliderX(newX);
  };

  return (
    <motion.div className="w-full relative" ref={constraintsRef} onClick={handleClick}>
      <div className="absolute left-0 w-full top-[50%] h-[4px] rounded-sm bg-[#222329] -translate-y-[50%] flex items-center justify-between">
        {Array(5)
          .fill(0)
          .map((_, index) => {
            return <div key={index} className="w-[2px] h-[2px] rounded-full bg-[#515156]"></div>;
          })}
      </div>
      <motion.div
        ref={sliderRef}
        className="w-[12px] h-[12px] rounded-full bg-[#3E404B] relative z-1 cursor-gra cursor-pointer active:cursor-grabbing"
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        dragMomentum={false}
        onDrag={handleDrag}
        animate={{ x: sliderX }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    </motion.div>
  );
}
