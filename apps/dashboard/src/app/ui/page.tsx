"use client";
import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import CFGI from "@/components/widgets/cfgi/fear-and-greed/cfgi";
import { useAtomValue } from "jotai";
import { geoLocationAtom } from "@/lib/atoms/geoLocation";

export default function Page() {
  const [num, setNum] = useState(0);
  const value = useMotionValue(0);

  const location = useAtomValue(geoLocationAtom);

  console.log(123, location);

  const randomize = () => {
    value.set(Math.random() * 100);
  };

  const background = useTransform(
    value,
    [0, 25, 50, 75, 100],
    ["#333", "#f00", "#ff0", "#00f", "#fff"]
  );

  useEffect(() => {
    value.on("change", (val) => {
      setNum(val);
    });

    randomize();

    return () => {
      value.clearListeners();
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div className="p-10">
      <p className="text-white">{num}</p>
      <motion.div
        className="h-[40px] bg-[red]"
        animate={{ width: `${num}%` }}
        transition={{
          type: "spring",
          stiffness: 180,
          damping: 12,
          mass: 1,
        }}
        style={{ background }}
      ></motion.div>
      <button type="button" onClick={randomize} className="text-white">
        randomize
      </button>
      <div className="py-4"></div>
      <div className="">
        <CFGI />
      </div>
    </div>
  );
}
