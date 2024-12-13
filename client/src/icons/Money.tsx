import * as React from "react";

function Money(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 81 80" fill="none" {...props}>
      <path
        d="M32.167 45.833c0 3.233 2.5 5.834 5.567 5.834H44c2.667 0 4.834-2.267 4.834-5.1 0-3.034-1.334-4.134-3.3-4.834l-10.034-3.5c-1.966-.7-3.3-1.766-3.3-4.833 0-2.8 2.167-5.1 4.834-5.1H43.3c3.067 0 5.567 2.6 5.567 5.833"
        stroke="url(#prefix__paint0_linear_1249_48949)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M40.5 25v30"
        stroke="url(#prefix__paint1_linear_1249_48949)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M57.167 10v13.333H70.5"
        stroke="url(#prefix__paint2_linear_1249_48949)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M73.834 6.667L57.167 23.332"
        stroke="url(#prefix__paint3_linear_1249_48949)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M40.5 6.667C22.1 6.667 7.167 21.6 7.167 40c0 13.133 7.6 24.5 18.667 29.933"
        stroke="url(#prefix__paint4_linear_1249_48949)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M73.833 40c0 18.4-14.933 33.333-33.333 33.333"
        stroke="url(#prefix__paint5_linear_1249_48949)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="prefix__paint0_linear_1249_48949"
          x1={40.517}
          y1={28.3}
          x2={40.517}
          y2={51.666}
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#79E7BA" />
          <stop offset={1} stopColor="#2AB1E6" />
        </linearGradient>
        <linearGradient
          id="prefix__paint1_linear_1249_48949"
          x1={41}
          y1={25}
          x2={41}
          y2={55}
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#79E7BA" />
          <stop offset={1} stopColor="#2AB1E6" />
        </linearGradient>
        <linearGradient
          id="prefix__paint2_linear_1249_48949"
          x1={63.834}
          y1={10}
          x2={63.834}
          y2={23.333}
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#79E7BA" />
          <stop offset={1} stopColor="#2AB1E6" />
        </linearGradient>
        <linearGradient
          id="prefix__paint3_linear_1249_48949"
          x1={65.5}
          y1={6.667}
          x2={65.5}
          y2={23.333}
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#79E7BA" />
          <stop offset={1} stopColor="#2AB1E6" />
        </linearGradient>
        <linearGradient
          id="prefix__paint4_linear_1249_48949"
          x1={23.834}
          y1={6.667}
          x2={23.834}
          y2={69.933}
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#79E7BA" />
          <stop offset={1} stopColor="#2AB1E6" />
        </linearGradient>
        <linearGradient
          id="prefix__paint5_linear_1249_48949"
          x1={57.167}
          y1={40}
          x2={57.167}
          y2={73.333}
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#79E7BA" />
          <stop offset={1} stopColor="#2AB1E6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const MemoMoney = React.memo(Money);
export default MemoMoney;
