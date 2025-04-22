import React from "react";

export default function FormLogo() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_4391_993)">
        <rect
          x="4.5"
          y="4.5"
          width="47"
          height="47"
          rx="7.5"
          stroke="url(#paint0_linear_4391_993)"
          strokeOpacity="0.5"
          shapeRendering="crispEdges"
        />
        <path
          d="M29.8528 29.1247L28.8978 35.0725C28.3876 38.25 25.4231 40.4193 22.2577 39.9315L20.1587 39.6081L20.7418 36.1245L21.2374 36.2063C23.3596 36.5564 25.3613 35.1084 25.7046 32.9747L26.6699 26.976L23.4305 26.4225L24.0136 22.9715L27.2206 23.4924L27.6395 20.916C28.1594 17.719 31.1614 15.5524 34.3417 16.0788L36.8416 16.4926L36.2909 19.8786L33.9699 19.4996C32.6056 19.2769 31.3181 20.2021 31.0866 21.5715L30.6683 24.0458L33.5374 24.5342L32.9867 27.9852L31.7318 27.7719C30.8404 27.6203 29.9968 28.2277 29.8528 29.1247Z"
          fill="white"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_4391_993"
          x="0"
          y="0"
          width="56"
          height="56"
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
          <feMorphology
            radius="1"
            operator="dilate"
            in="SourceAlpha"
            result="effect1_dropShadow_4391_993"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="1.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.654902 0 0 0 0 0.286275 0 0 0 0 0.121569 0 0 0 0.05 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_4391_993"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_4391_993"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_4391_993"
          x1="28"
          y1="-57.5"
          x2="28"
          y2="81"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.244255" stopColor="#080808" />
          <stop offset="0.599801" stopColor="#331008" />
          <stop offset="0.895376" stopColor="#99230A" />
        </linearGradient>
      </defs>
    </svg>
  );
}
