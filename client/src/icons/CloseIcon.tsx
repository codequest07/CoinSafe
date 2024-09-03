import * as React from "react";

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 32 33" fill="none" {...props}>
      <path
        opacity={0.4}
        d="M16 29.833c7.364 0 13.333-5.97 13.333-13.333 0-7.364-5.97-13.333-13.333-13.333-7.364 0-13.333 5.97-13.333 13.333 0 7.364 5.97 13.333 13.333 13.333z"
        fill="#fff"
      />
      <path
        d="M17.413 16.5l3.067-3.067a1.006 1.006 0 000-1.413 1.006 1.006 0 00-1.413 0L16 15.087l-3.067-3.067a1.006 1.006 0 00-1.413 0 1.006 1.006 0 000 1.413l3.067 3.067-3.067 3.067a1.006 1.006 0 000 1.413c.2.2.453.293.707.293a.989.989 0 00.706-.293L16 17.913l3.067 3.067c.2.2.453.293.706.293a.989.989 0 00.707-.293 1.006 1.006 0 000-1.413L17.413 16.5z"
        fill="#fff"
      />
    </svg>
  );
}

const MemoCloseIcon = React.memo(CloseIcon);
export default MemoCloseIcon;
