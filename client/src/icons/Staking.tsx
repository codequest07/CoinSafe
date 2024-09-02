import * as React from "react";

function Staking(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 16 12" fill="none" {...props}>
      <rect x={9} y={2} width={6} height={6} rx={1} fill="#7B7B7B" />
      <rect
        x={3.095}
        width={6}
        height={2}
        rx={1}
        transform="rotate(33.19 3.095 0)"
        fill="#7B7B7B"
      />
      <rect y={6} width={16} height={6} rx={1} fill="#E0E0E0" />
    </svg>
  );
}

const MemoStaking = React.memo(Staking);
export default MemoStaking;
