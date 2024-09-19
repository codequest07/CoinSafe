import * as React from "react";

function DashboardActive(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 16 14" fill="none" {...props}>
      <rect x={3} width={6} height={6} rx={1} fill="#fff" />
      <rect x={11} width={5} height={6} rx={1} fill="#79E7BA" />
      <rect y={8} width={16} height={6} rx={1} fill="#79E7BA" />
    </svg>
  );
}

const MemoDashboardActive = React.memo(DashboardActive);
export default MemoDashboardActive;
