import * as React from "react";

function Smile2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 40 40" fill="none" {...props}>
      <rect width={40} height={40} rx={20} fill="#131313" />
      <rect
        x={0.5}
        y={0.5}
        width={39}
        height={39}
        rx={19.5}
        stroke="url(#prefix__paint0_linear_23_1591)"
        strokeOpacity={0.3}
      />
      <rect x={6} y={15} width={4.642} height={4} rx={2} fill="#48FF91" />
      <rect x={20.358} y={15} width={4.642} height={4} rx={2} fill="#48FF91" />
      <path
        d="M6 23.889c0-.491.398-.889.889-.889H24.11c.491 0 .889.398.889.889A7.111 7.111 0 0117.889 31H13.11A7.111 7.111 0 016 23.889z"
        fill="#48FF91"
      />
      <defs>
        <linearGradient
          id="prefix__paint0_linear_23_1591"
          x1={20}
          y1={0}
          x2={20}
          y2={40}
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" />
          <stop offset={1} stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

const MemoSmile2 = React.memo(Smile2);
export default MemoSmile2;
