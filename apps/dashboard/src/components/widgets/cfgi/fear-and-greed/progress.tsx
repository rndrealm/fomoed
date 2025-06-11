import React, { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { AnimatedNumber } from "../../shared";
import { handleFearGreedLabel } from "@/lib/utils";

interface IProps {
  progress?: number; // 0 - 100 range
}

export function Progress(props: IProps) {
  const { progress = 0 } = props;
  const size = 220;
  const strokeWidth = 10;
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const A = Math.PI + Math.PI * 0.74;
  const startAngle = Math.PI + Math.PI * 0.37;
  const endAngle = 2 * Math.PI - Math.PI * 0.37;
  const startX = cx - r * Math.cos(startAngle);
  const startY = -r * Math.sin(startAngle) + cy;
  const endX = cx - r * Math.cos(endAngle);
  const endY = -r * Math.sin(endAngle) + cy;
  const d = `M ${startX} ${startY} A ${r} ${r} 0 1 0 ${endX} ${endY}`;

  const circum = r * A;

  const fearIndex = useMotionValue(progress);
  const fearColor = useTransform(
    fearIndex,
    [0, 20, 40, 60, 80, 100],
    ["#FF004D", "#FF540B", "#FFD600", "#90FF00", "#03EBF3", "#03EBF3"]
  );

  useEffect(() => {
    animate(fearIndex, progress, { duration: 1 });
    // eslint-disable-next-line
  }, [progress]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          width={size}
          height={size}
          style={{
            transform: "rotateY(180deg)",
          }}
        >
          <path
            d={d}
            stroke="#1c1c1c"
            fill="none"
            strokeDasharray={`${circum} ${circum}`}
            strokeWidth={strokeWidth * 0.2}
            strokeDashoffset={circum * 0}
            strokeLinecap="round"
          />

          <motion.path
            d={d}
            // stroke="red"
            fill="none"
            strokeDasharray={`${circum} ${circum}`}
            strokeWidth={strokeWidth}
            // strokeDashoffset={circum * -0.0}
            strokeLinecap="round"
            transition={{
              type: "spring",
              stiffness: 155,
              damping: 13.5,
              mass: 1,
            }}
            initial={{
              strokeDashoffset: circum,
            }}
            animate={{
              strokeDashoffset: circum * (1 - progress * 0.01),
            }}
            style={{
              stroke: fearColor,
            }}
          />
        </svg>

        <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 flex flex-col items-center">
          <div className="h-[70px] overflow-hidden">
            <AnimatedNumber
              value={progress}
              className="text-[56px] leading-[1.35] font-medium text-white text-center"
              showSign={false}
              height={70}
            />
          </div>
          <p className="text-[#878787] text-center text-base leading-[1.35] font-medium no-wrap">
            {handleFearGreedLabel(progress)}
          </p>
        </div>
      </div>

      <div
        className=""
        style={{
          transform: "translateY(-90%)",
        }}
      >
        <p className="text-[#878787] text-center text-base leading-[1.35] font-bold">
          2025
        </p>
      </div>
    </div>
  );
}
