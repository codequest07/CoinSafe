import * as React from "react";

function CopyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 12 13" fill="none" {...props}>
      <path
        d="M8 7.217v2.1c0 1.75-.7 2.45-2.45 2.45h-2.1c-1.75 0-2.45-.7-2.45-2.45v-2.1c0-1.75.7-2.45 2.45-2.45h2.1c1.75 0 2.45.7 2.45 2.45z"
        fill="#fff"
      />
      <path
        d="M8.55 1.767h-2.1c-1.542 0-2.265.547-2.415 1.87-.032.276.197.505.476.505H5.55c2.1 0 3.075.975 3.075 3.075v1.039c0 .278.229.507.505.476 1.323-.15 1.87-.874 1.87-2.415v-2.1c0-1.75-.7-2.45-2.45-2.45z"
        fill="#fff"
      />
    </svg>
  );
}

const MemoCopyIcon = React.memo(CopyIcon);
export default MemoCopyIcon;
