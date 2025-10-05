import * as React from "react";

function Profile(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 16 17" fill="none" {...props}>
      <rect x={5} y={7} width={6} height={5} rx={1} fill="#7B7B7B" />
      <rect x={5} y={0.043} width={6} height={6} rx={3} fill="#7B7B7B" />
      <rect y={10.215} width={16} height={6} rx={1} fill="#E0E0E0" />
    </svg>
  );
}

const MemoProfile = React.memo(Profile);
export default MemoProfile;
