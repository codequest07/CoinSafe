import * as React from "react";

function ShieldSmall(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 14 14" fill="none" {...props}>
      <path
        d="M12.197 6.487V3.926c0-.479-.361-1.021-.81-1.202l-3.25-1.33a3.026 3.026 0 00-2.28 0l-3.25 1.33c-.443.181-.805.723-.805 1.202v2.56c0 2.853 2.071 5.525 4.9 6.307.193.052.403.052.595 0 2.83-.782 4.9-3.454 4.9-6.306zm-4.76 1.02v1.535A.44.44 0 017 9.479a.44.44 0 01-.438-.437V7.508a1.457 1.457 0 01-1.02-1.383 1.459 1.459 0 012.916 0c0 .653-.431 1.196-1.02 1.383z"
        fill="#fff"
      />
    </svg>
  );
}

const MemoShieldSmall = React.memo(ShieldSmall);
export default MemoShieldSmall;
