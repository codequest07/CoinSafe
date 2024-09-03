import * as React from "react";

function DropdownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 17 16" fill="none" {...props}>
      <path
        d="M8.5 11.2c-.467 0-.933-.18-1.287-.533L2.867 6.32a.503.503 0 010-.707.503.503 0 01.706 0L7.92 9.96c.32.32.84.32 1.16 0l4.347-4.347a.503.503 0 01.706 0 .503.503 0 010 .707l-4.346 4.347c-.354.353-.82.533-1.287.533z"
        fill="#fff"
      />
    </svg>
  );
}

const MemoDropdownIcon = React.memo(DropdownIcon);
export default MemoDropdownIcon;
