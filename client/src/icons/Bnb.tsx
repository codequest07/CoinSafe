import * as React from "react";

function Bnb(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 20 20" fill="none" {...props}>
      <g filter="url(#prefix__filter0_b_344_16348)">
        <rect width={20} height={20} rx={10} fill="#1E1E1E" fillOpacity={0.6} />
        <rect
          x={0.5}
          y={0.5}
          width={19}
          height={19}
          rx={9.5}
          stroke="#fff"
          strokeOpacity={0.02}
        />
        <rect x={3} y={3} width={14} height={14} rx={7} fill="#fff" />
        <path
          d="M16.789 11.693a6.998 6.998 0 11-13.58-3.386 6.998 6.998 0 0113.58 3.386z"
          fill="#F3BA2F"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10 7.443L8.188 9.255 7.133 8.201 10 5.333l2.868 2.869-1.054 1.054L10 7.443zM6.39 8.945L5.334 10l1.055 1.054L7.443 10 6.39 8.945zm1.8 1.8L10 12.558l1.813-1.814 1.056 1.054L10 14.668 7.134 11.8l-.002-.002 1.056-1.053zm5.424-1.8l-1.055 1.056 1.054 1.054 1.055-1.054-1.054-1.055z"
          fill="#fff"
        />
        <path
          d="M11.07 10L10 8.93l-.79.79-.091.09-.188.188L8.93 10 8.93 10l1.07 1.07L11.07 10V10"
          fill="#fff"
        />
      </g>
      <defs>
        <filter
          id="prefix__filter0_b_344_16348"
          x={-2.3}
          y={-2.3}
          width={24.6}
          height={24.6}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB">
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImageFix" stdDeviation={1.15} />
          <feComposite
            in2="SourceAlpha"
            operator="in"
            result="effect1_backgroundBlur_344_16348"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect1_backgroundBlur_344_16348"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}

const MemoBnb = React.memo(Bnb);
export default MemoBnb;
