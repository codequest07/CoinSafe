import * as React from "react";

function SwapActive(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M5 5h9.2l-1.65-1.65L13.8 2l3.7 3.7L13.8 9.4l-1.25-1.35L14.2 6H5V5Zm10 10H5l1.65 1.65L6.2 18 2.5 14.3 6.2 10.6l1.25 1.35L5.8 13H15v2Z"
        fill="#FFFFFF"
      />
      <path d="M5.8 13H15v2H5l1.65 1.65L6.2 18 2.5 14.3 6.2 10.6l1.25 1.35Z" fill="#79E7BA" />
    </svg>
  );
}

const MemoSwapActive = React.memo(SwapActive);
export default MemoSwapActive;

