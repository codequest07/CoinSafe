import * as React from "react";

function Vault(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 16 12" fill="none" {...props}>
      <rect width={16} height={12} rx={1} fill="#E0E0E0" />
      <rect x={1} y={3} width={6} height={2} rx={1} fill="#09090B" />
    </svg>
  );
}

const MemoVault = React.memo(Vault);
export default MemoVault;
