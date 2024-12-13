import * as React from "react";

function Story(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 81 81" fill="none" {...props}>
      <path
        d="M55.234 27c8.133 8.133 8.133 21.333 0 29.467-8.134 8.133-21.334 8.133-29.467 0-8.133-8.134-8.133-21.334 0-29.467 4.567-4.567 10.767-6.567 16.733-6"
        stroke="url(#prefix__paint0_linear_1249_49227)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 72.633a32.966 32.966 0 01-16.367-14.2c-3.8-6.566-5.066-13.866-4.166-20.833"
        stroke="url(#prefix__paint1_linear_1249_49227)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 15.433a33.12 33.12 0 0120.5-7.066c7.567 0 14.533 2.566 20.133 6.833"
        stroke="url(#prefix__paint2_linear_1249_49227)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M53 72.633a32.966 32.966 0 0016.367-14.2c3.8-6.566 5.066-13.866 4.166-20.833"
        stroke="url(#prefix__paint3_linear_1249_49227)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="prefix__paint0_linear_1249_49227"
          x1={40.5}
          y1={20.906}
          x2={40.5}
          y2={62.567}
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#79E7BA" />
          <stop offset={1} stopColor="#2AB1E6" />
        </linearGradient>
        <linearGradient
          id="prefix__paint1_linear_1249_49227"
          x1={17.595}
          y1={37.6}
          x2={17.595}
          y2={72.633}
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#79E7BA" />
          <stop offset={1} stopColor="#2AB1E6" />
        </linearGradient>
        <linearGradient
          id="prefix__paint2_linear_1249_49227"
          x1={40.317}
          y1={8.367}
          x2={40.317}
          y2={15.433}
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#79E7BA" />
          <stop offset={1} stopColor="#2AB1E6" />
        </linearGradient>
        <linearGradient
          id="prefix__paint3_linear_1249_49227"
          x1={63.405}
          y1={37.6}
          x2={63.405}
          y2={72.633}
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#79E7BA" />
          <stop offset={1} stopColor="#2AB1E6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const MemoStory = React.memo(Story);
export default MemoStory;
