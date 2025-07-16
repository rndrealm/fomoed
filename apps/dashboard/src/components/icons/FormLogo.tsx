import * as React from "react";

function FormLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="56px" height="56px" viewBox="0 0 298 298" fill="none" {...props}>
      <g filter="url(#prefix__filter0_i_4541_49454)">
        <rect width={298} height={298} rx={89.4} fill="url(#prefix__paint0_radial_4541_49454)" />
      </g>
      <mask
        id="prefix__a"
        style={{
          maskType: "alpha",
        }}
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={298}
        height={298}
      >
        <rect width={298} height={298} rx={89.4} fill="#D9D9D9" />
      </mask>
      <g filter="url(#prefix__filter1_f_4541_49454)" mask="url(#prefix__a)">
        <ellipse cx={149} cy={-14.9} rx={113.24} ry={26.82} fill="#BF340A" fillOpacity={0.5} />
      </g>
      <g filter="url(#prefix__filter2_d_4541_49454)" stroke="#fff">
        <path
          d="M207.262 80.268l-9.802-1.553c-21.084-3.34-40.883 11.046-44.223 32.13l-12.91 81.511c-3.339 21.084-23.138 35.469-44.222 32.129l-6.707-1.062M113.412 127.834l69.645 11.031"
          strokeWidth={25.072}
        />
        <path
          d="M161.094 138.518l-3.922 24.762s1.189-7.502 7.838-11.215c6.231-3.479 15.711-.567 15.711-.567l1.525-9.63-21.152-3.35z"
          fill="#fff"
          strokeWidth={1.045}
        />
      </g>
      <defs>
        <filter
          id="prefix__filter0_i_4541_49454"
          x={0}
          y={-35.76}
          width={298}
          height={333.76}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy={-47.68} />
          <feGaussianBlur stdDeviation={17.88} />
          <feComposite in2="hardAlpha" operator="arithmetic" k2={-1} k3={1} />
          <feColorMatrix values="0 0 0 0 0.921569 0 0 0 0 0.584314 0 0 0 0 0.333333 0 0 0 0.3 0" />
          <feBlend in2="shape" result="effect1_innerShadow_4541_49454" />
        </filter>
        <filter
          id="prefix__filter1_f_4541_49454"
          x={-42.912}
          y={-120.392}
          width={383.824}
          height={210.984}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation={39.336} result="effect1_foregroundBlur_4541_49454" />
        </filter>
        <filter
          id="prefix__filter2_d_4541_49454"
          x={85.348}
          y={65.696}
          width={130.143}
          height={182.255}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dx={2.089} dy={6.268} />
          <feGaussianBlur stdDeviation={2.089} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_4541_49454" />
          <feBlend in="SourceGraphic" in2="effect1_dropShadow_4541_49454" result="shape" />
        </filter>
        <radialGradient
          id="prefix__paint0_radial_4541_49454"
          cx={0}
          cy={0}
          r={1}
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(0 263.615 -369.893 0 149 57.308)"
        >
          <stop offset={0.339} stopColor="#020100" />
          <stop offset={0.631} stopColor="#631B06" />
          <stop offset={0.72} stopColor="#8B2505" />
          <stop offset={0.835} stopColor="#BD4618" />
          <stop offset={0.91} stopColor="#F7984B" />
        </radialGradient>
      </defs>
    </svg>
  );
}

const MemoFormLogo = React.memo(FormLogo);
export default MemoFormLogo;
