import * as React from "react";

function HandburggerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 58 19" fill="none" {...props}>
      <path
        d="M0 1.021h58M13 9.021h45M0 17.021h58"
        stroke="#fff"
        strokeWidth={2}
      />
    </svg>
  );
}

const MemoHandburggerIcon = React.memo(HandburggerIcon);
export default MemoHandburggerIcon;
