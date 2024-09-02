import * as React from "react";

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 20 20" fill="none" {...props}>
      <path
        opacity={0.4}
        d="M10 18.333a8.333 8.333 0 100-16.666 8.333 8.333 0 000 16.666z"
        fill="#48FF91"
      />
      <path
        d="M8.817 12.983a.625.625 0 01-.442-.183l-2.358-2.358a.629.629 0 010-.884.629.629 0 01.883 0l1.917 1.917L13.1 7.192a.629.629 0 01.883 0 .629.629 0 010 .883L9.258 12.8a.625.625 0 01-.441.183z"
        fill="#48FF91"
      />
    </svg>
  );
}

const MemoCheckIcon = React.memo(CheckIcon);
export default MemoCheckIcon;
