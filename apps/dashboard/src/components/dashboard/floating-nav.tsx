"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import {
  FloatingAdd,
  FloatingCloud,
  FloatingLayout,
  FloatingSearch,
  FloatingSettings,
  ToolbarLayout,
} from "../icons/icons";

const options = ["layout", "save", "add", "search", "settings"];
type IActive = "layout" | "save" | "add" | "search" | "settings";

export function FloatingNav() {
  const [isActive, setIsActive] = useState<IActive>("layout");

  return (
    <div className="fixed bottom-[24px] left-[50%] py-[9px] px-3 rounded-[10px] translate-x-[-50%] bg-[rgba(22,22,22,0.8)] backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="w-[24px] h-[24px] relative flex items-center justify-center"
          onClick={() => {
            setIsActive("layout");
          }}
        >
          <div className="relative z-[2]">
            <FloatingLayout active={isActive === "layout"} />
          </div>
          {isActive === "layout" && (
            <motion.div
              layoutId="floating-nav"
              className="absolute z-[1] top-[0] left-[0] w-full h-full bg-[#1d1d1d] rounded-md"
            ></motion.div>
          )}
        </button>

        <button
          type="button"
          className="w-[24px] h-[24px] relative flex items-center justify-center"
          onClick={() => {
            setIsActive("save");
          }}
        >
          <div className="relative z-[2]">
            <FloatingCloud active={isActive === "save"} />
          </div>
          {isActive === "save" && (
            <motion.div
              layoutId="floating-nav"
              className="absolute z-[1] top-[0] left-[0] w-full h-full bg-[#1d1d1d] rounded-md"
            ></motion.div>
          )}
        </button>

        <button
          type="button"
          className="w-[24px] h-[24px] relative flex items-center justify-center"
          onClick={() => {
            setIsActive("add");
          }}
        >
          <div className="relative z-[2]">
            <FloatingAdd active={isActive === "add"} />
          </div>

          {isActive === "add" && (
            <motion.div
              layoutId="floating-nav"
              className="absolute z-[1] top-[0] left-[0] w-full h-full bg-[#1d1d1d] rounded-md"
            ></motion.div>
          )}
        </button>

        <button
          type="button"
          className="w-[24px] h-[24px] relative flex items-center justify-center"
          onClick={() => {
            setIsActive("search");
          }}
        >
          <div className="relative z-[2]">
            <FloatingSearch active={isActive === "search"} />
          </div>

          {isActive === "search" && (
            <motion.div
              layoutId="floating-nav"
              className="absolute z-[1] top-[0] left-[0] w-full h-full bg-[#1d1d1d] rounded-md"
            ></motion.div>
          )}
        </button>

        <button
          type="button"
          className="w-[24px] h-[24px] relative flex items-center justify-center"
          onClick={() => {
            setIsActive("settings");
          }}
        >
          <div className="relative z-[2]">
            <FloatingSettings active={isActive === "settings"} />
          </div>

          {isActive === "settings" && (
            <motion.div
              layoutId="floating-nav"
              className="absolute z-[1] top-[0] left-[0] w-full h-full bg-[#1d1d1d] rounded-md"
            ></motion.div>
          )}
        </button>
      </div>
    </div>
  );
}
