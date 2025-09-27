import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

const ResizeIndicator = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const el = document.elementFromPoint(event.clientX, event.clientY);
      if (el?.className.includes("resizable-handle")) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    };

    window.addEventListener("pointermove", handleMouseMove);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener("pointermove", handleMouseMove);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute z-10 right-[-14px] bottom-[-16px]">
      <div className="pointer-events-none relative h-full w-full">
        {/* animated stuff */}
        {/* <div className="absolute bottom-0 left-0 h-3.5 w-full">
              <div className="relative h-full w-full overflow-hidden rounded-tl-[5px] rounded-br-[5px] rounded-bl-[5px] p-[1px] shadow-2xl">
                <div className="gradient_border" />
                <div className="bg-gradient-100 relative h-full w-full rounded-tl-[5px] rounded-br-[5px] rounded-bl-[5px]" />
              </div>
            </div>
            <div className="absolute right-0 bottom-0 z-10 h-full w-3.5">
              <div className="relative h-full w-full overflow-hidden rounded-tl-[5px] rounded-tr-[5px] rounded-br-[5px] rounded-bl-[5px] p-[1px] shadow-2xl">
                <div className="gradient_border" />
                <div className="bg-gradient-100 relative h-full w-full rounded-tl-[5px] rounded-tr-[5px] rounded-br-[5px] rounded-bl-[5px]" />
              </div>
            </div> */}

        {/* svg from jason */}
        <motion.div
          animate={{ scale: isActive ? 1 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className=""
        >
          <ResizeIndicatorIcon />
        </motion.div>
      </div>
    </div>
  );
};

const ResizeIndicatorIcon = () => {
  return (
    <svg width="61" height="54" viewBox="0 0 61 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_di_398_1331060)">
        <path
          d="M5 37V36.0769C5 31.6586 8.58172 28.0769 13 28.0769H32C35.866 28.0769 39 24.9429 39 21.0769V8C39 4.13401 42.134 1 46 1H49C52.866 1 56 4.13401 56 8V32C56 39.1797 50.1797 45 43 45H13C8.58172 45 5 41.4183 5 37Z"
          fill="url(#paint0_linear_398_1331060)"
        />
        <path
          d="M5 37V36.0769C5 31.6586 8.58172 28.0769 13 28.0769H32C35.866 28.0769 39 24.9429 39 21.0769V8C39 4.13401 42.134 1 46 1H49C52.866 1 56 4.13401 56 8V32C56 39.1797 50.1797 45 43 45H13C8.58172 45 5 41.4183 5 37Z"
          stroke="url(#paint1_linear_398_1331060)"
        />
      </g>
      <defs>
        <filter
          id="filter0_di_398_1331060"
          x="0.5"
          y="0.5"
          width="60"
          height="53"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_398_1331060" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_398_1331060" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="6" dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.196078 0 0 0 0 0.196078 0 0 0 0 0.196078 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="shape" result="effect2_innerShadow_398_1331060" />
        </filter>
        <linearGradient
          id="paint0_linear_398_1331060"
          x1="-150.788"
          y1="-245"
          x2="64.5"
          y2="127.89"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#7F7F7F" />
          <stop offset="1" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_398_1331060"
          x1="8.5"
          y1="0.999996"
          x2="151"
          y2="143.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.154386" stopColor="#2D2D2D" />
          <stop offset="0.57193" stopColor="#C5C5C5" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default ResizeIndicator;
