import * as React from "react";

function Ripple(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" {...props}>
      <rect width={16} height={16} rx={8} fill="#fff" />
      <path
        d="M15.76 9.935A7.998 7.998 0 11.24 6.065a7.997 7.997 0 1115.52 3.87z"
        fill="#23292F"
      />
      <path
        d="M11.935 3.333h1.614l-3.36 3.327a3.14 3.14 0 01-4.407 0l-3.36-3.327h1.615L6.59 5.86a1.988 1.988 0 002.79 0l2.555-2.527zM4.016 12.583H2.401l3.381-3.347a3.14 3.14 0 014.407 0l3.382 3.347h-1.615l-2.574-2.547a1.988 1.988 0 00-2.79 0l-2.576 2.547z"
        fill="#fff"
      />
    </svg>
  );
}

const MemoRipple = React.memo(Ripple);
export default MemoRipple;
