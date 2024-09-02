import * as React from "react";

function Reward(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 16 12" fill="none" {...props}>
      <rect x={5} width={6} height={5} rx={1} fill="#7B7B7B" />
      <rect y={6} width={16} height={6} rx={1} fill="#E0E0E0" />
    </svg>
  );
}

const MemoReward = React.memo(Reward);
export default MemoReward;
