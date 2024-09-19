import * as React from "react";

function PortfolioActive(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 16 14" fill="none" {...props}>
      <rect x={5} y={4} width={6} height={6} rx={1} fill="#fff" />
      <rect x={5} width={6} height={2} rx={1} fill="#fff" />
      <rect y={8} width={16} height={6} rx={1} fill="#79E7BA" />
    </svg>
  );
}

const MemoPortfolioActive = React.memo(PortfolioActive);
export default MemoPortfolioActive;
