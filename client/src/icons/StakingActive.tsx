import * as React from "react";

function StakingActive(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 16 12" fill="none" {...props}>
      <rect x={9} y={2} width={6} height={6} rx={1} fill="#fff" />
      <rect
        x={3.095}
        width={6}
        height={2}
        rx={1}
        transform="rotate(33.19 3.095 0)"
        fill="#fff"
      />
      <rect y={6} width={16} height={6} rx={1} fill="#79E7BA" />
    </svg>
  );
}

const MemoStakingActive = React.memo(StakingActive);
export default MemoStakingActive;
