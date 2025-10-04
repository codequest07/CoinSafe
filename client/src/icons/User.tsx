import * as React from "react";

function User(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 49 48" fill="none" {...props}>
      <rect
        x={0.606}
        width={48}
        height={48}
        rx={24}
        fill="#272727"
        fillOpacity={0.7}
      />
      <path
        opacity={0.4}
        d="M24.606 24a5 5 0 100-10 5 5 0 000 10z"
        fill="#fff"
      />
      <path
        d="M24.607 26.5c-5.01 0-9.09 3.36-9.09 7.5 0 .28.22.5.5.5h17.18c.28 0 .5-.22.5-.5 0-4.14-4.08-7.5-9.09-7.5z"
        fill="#fff"
      />
    </svg>
  );
}

const MemoUser = React.memo(User);
export default MemoUser;
