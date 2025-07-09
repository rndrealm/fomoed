import React from "react";

export default function ElipseBackground() {
  return (
    <svg width="440" height="440" viewBox="0 0 440 440" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_f_6182_276828)">
        <circle cx="220" cy="220" r="100" fill="#212121" fillOpacity="0.6" />
      </g>
      <defs>
        <filter
          id="filter0_f_6182_276828"
          x="0"
          y="0"
          width="440"
          height="440"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="60" result="effect1_foregroundBlur_6182_276828" />
        </filter>
      </defs>
    </svg>
  );
}
