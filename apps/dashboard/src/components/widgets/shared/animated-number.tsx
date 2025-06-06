"use client";
import React from "react";
import { motion } from "motion/react";
import { RenderIf } from "@/components/shared";
import { cn } from "@/lib/utils";

interface IProps {
  value: number;
  height?: number;
  showSign?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface IAnimNum {
  value: number;
  height: number;
  className?: string;
  style: React.CSSProperties;
}

export const spring = {
  type: "spring",
  damping: 20,
  stiffness: 150,
};

function AnimatedNum(props: IAnimNum) {
  const { value, height, className, style } = props;

  return (
    <motion.div
      animate={{
        y: `${-height * value}px`,
      }}
      transition={spring}
      style={{ height: `${height}px` }}
      className="flex flex-col"
    >
      {Array(10)
        .fill(0)
        .map((_, index) => (
          <p
            key={index}
            className={cn(className)}
            style={{ height: `${height}px`, ...style }}
          >
            {index}
          </p>
        ))}
    </motion.div>
  );
}

export function AnimatedNumber(props: IProps) {
  const {
    value,
    height = 41,
    showSign = true,
    className = "",
    style = {},
  } = props;
  const absValue = Math.abs(value);
  const isPositiveNum = Math.sign(value) === 1;
  const digits = absValue.toString().split("");

  return (
    <div className="flex items-center">
      <RenderIf condition={showSign}>
        <p className={cn("text-white", className)} style={{ ...style }}>
          {isPositiveNum ? "+" : "-"}
        </p>
      </RenderIf>
      {digits?.map((num, index) => {
        if (num === ".") {
          return (
            <p key={index} className={cn(className)} style={{ ...style }}>
              {num}
            </p>
          );
        }

        return (
          <AnimatedNum
            key={index}
            height={height}
            value={parseInt(num)}
            className={className}
            style={style}
          />
        );
      })}
    </div>
  );
}
