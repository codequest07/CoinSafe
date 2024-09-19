import * as React from "react";

function RewardActive(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 16 12" fill="none" {...props}>
      <rect x={5} width={6} height={5} rx={1} fill="#fff" />
      <rect y={6} width={16} height={6} rx={1} fill="#79E7BA" />
    </svg>
  );
}

const MemoRewardActive = React.memo(RewardActive);
export default MemoRewardActive;
