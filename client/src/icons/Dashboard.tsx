import * as React from "react";

function Dashboard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 16 14" fill="none" {...props}>
      <rect x={3} width={6} height={6} rx={1} fill="#7B7B7B" />
      <rect x={11} width={5} height={6} rx={1} fill="#E0E0E0" />
      <rect y={8} width={16} height={6} rx={1} fill="#E0E0E0" />
    </svg>
  );
}

const MemoDashboard = React.memo(Dashboard);
export default MemoDashboard;
