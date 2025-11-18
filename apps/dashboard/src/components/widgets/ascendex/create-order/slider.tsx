import React, { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";

interface SliderProps {
  value?: number; // percentage value (0-100)
  onChange?: (percentage: number) => void;
}

export default function Slider({ value = 0, onChange }: SliderProps) {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [percentage, setPercentage] = useState(Math.round(value));
  const [sliderX, setSliderX] = useState(0);

  // Sync internal percentage with external value
  useEffect(() => {
    const intValue = Math.round(value);
    setPercentage(intValue);
    // Calculate sliderX based on percentage
    if (constraintsRef.current) {
      const containerWidth = constraintsRef.current.offsetWidth;
      const sliderWidth = 12;
      const maxDragDistance = containerWidth - sliderWidth;
      const newX = (intValue / 100) * maxDragDistance;
      setSliderX(newX);
    }
  }, [value]);

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
    const intPct = Math.round(newPercentage);
    setPercentage(intPct);
    onChange?.(intPct);
  };

  const handleClick = (event: React.MouseEvent) => {
    if (!constraintsRef.current || !sliderRef.current) return;

    const { percentage: newPercentage, x: newX } = calculatePosition(event.clientX);
    const intPct = Math.round(newPercentage);
    setPercentage(intPct);
    setSliderX(newX);
    onChange?.(intPct);
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
