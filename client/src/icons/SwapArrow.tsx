import * as React from "react";

function SwapArrow(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M7.509 17.708a.618.618 0 01-.442-.183L2.892 13.35a.629.629 0 010-.884.629.629 0 01.884 0l4.175 4.175a.629.629 0 010 .884.655.655 0 01-.442.183z"
        fill="#fff"
      />
      <path
        d="M7.508 17.709a.63.63 0 01-.625-.625V2.917a.63.63 0 01.625-.625.63.63 0 01.625.625v14.167a.63.63 0 01-.625.625zM16.675 7.717a.618.618 0 01-.442-.183l-4.175-4.175a.629.629 0 010-.884.629.629 0 01.883 0l4.175 4.175a.629.629 0 010 .884.618.618 0 01-.441.183z"
        fill="#fff"
      />
      <path
        d="M12.492 17.709a.63.63 0 01-.625-.625V2.917a.63.63 0 01.625-.625.63.63 0 01.625.625v14.167a.624.624 0 01-.625.625z"
        fill="#fff"
      />
    </svg>
  );
}

const MemoSwapArrow = React.memo(SwapArrow);
export default MemoSwapArrow;
