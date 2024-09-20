import * as React from "react";

function NavX(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 58 43" fill="none" {...props}>
      <path
        d="M8 42L49.012.988M8 1l41.012 41.012"
        stroke="#fff"
        strokeWidth={2}
      />
    </svg>
  );
}

const MemoNavX = React.memo(NavX);
export default MemoNavX;
