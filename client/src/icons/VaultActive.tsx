import * as React from "react";

function VaultActive(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 16 12" fill="none" {...props}>
      <rect width={16} height={12} rx={1} fill="#79E7BA" />
      <rect x={1} y={3} width={6} height={2} rx={1} fill="#09090B" />
    </svg>
  );
}

const MemoVaultActive = React.memo(VaultActive);
export default MemoVaultActive;
