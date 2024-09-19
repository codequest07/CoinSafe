import * as React from "react";

function Angry2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 40 40" fill="none" {...props}>
      <rect width={40} height={40} rx={20} fill="#131313" />
      <rect
        x={0.5}
        y={0.5}
        width={39}
        height={39}
        rx={19.5}
        stroke="url(#prefix__paint0_linear_888_26945)"
        strokeOpacity={0.3}
      />
      <rect x={7} y={15} width={4.642} height={4} rx={2} fill="#FF484B" />
      <rect x={21.358} y={15} width={4.642} height={4} rx={2} fill="#FF484B" />
      <path
        d="M7 26.778c0 .123.1.222.222.222h18.556c.123 0 .222-.1.222-.222 0-.982-.796-1.778-1.778-1.778H8.778C7.796 25 7 25.796 7 26.778z"
        fill="#FF484B"
      />
      <defs>
        <linearGradient
          id="prefix__paint0_linear_888_26945"
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

const MemoAngry2 = React.memo(Angry2);
export default MemoAngry2;
