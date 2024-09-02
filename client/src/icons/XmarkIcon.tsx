import * as React from "react";

function XmarkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 20 20" fill="none" {...props}>
      <path
        opacity={0.4}
        d="M10 18.333a8.333 8.333 0 100-16.666 8.333 8.333 0 000 16.666z"
        fill="#7B7B7B"
      />
      <path
        d="M10.883 10L12.8 8.083a.629.629 0 000-.883.629.629 0 00-.883 0L10 9.117 8.083 7.2a.629.629 0 00-.883 0 .629.629 0 000 .883L9.117 10 7.2 11.917a.629.629 0 000 .883.618.618 0 00.442.183.618.618 0 00.441-.183L10 10.883l1.917 1.917a.618.618 0 00.441.183.618.618 0 00.442-.183.629.629 0 000-.883L10.883 10z"
        fill="#7B7B7B"
      />
    </svg>
  );
}

const MemoXmarkIcon = React.memo(XmarkIcon);
export default MemoXmarkIcon;
