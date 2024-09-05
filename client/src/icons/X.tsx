import * as React from "react";

function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 14 15" fill="none" {...props}>
      <g clipPath="url(#prefix__clip0_390_23987)">
        <path
          d="M8.132 6.945l4.43-5.187h-1.05L7.667 6.26 4.594 1.758H1.05l4.646 6.81-4.646 5.44H2.1L6.162 9.25l3.245 4.757h3.544L8.132 6.945zM6.694 8.628l-.47-.678-3.746-5.396H4.09L7.113 6.91l.47.678 3.93 5.661H9.9l-3.206-4.62z"
          fill="#fff"
        />
      </g>
      <defs>
        <clipPath id="prefix__clip0_390_23987">
          <path fill="#fff" transform="translate(0 .883)" d="M0 0h14v14H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}

const MemoX = React.memo(X);
export default MemoX;
