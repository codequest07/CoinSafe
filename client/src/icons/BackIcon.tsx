import * as React from "react";

function BackIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 25 24" fill="none" {...props}>
      <path
        d="M10.07 18.82c-.19 0-.38-.07-.53-.22l-6.07-6.07a.754.754 0 010-1.06L9.54 5.4c.29-.29.77-.29 1.06 0 .29.29.29.77 0 1.06L5.06 12l5.54 5.54c.29.29.29.77 0 1.06-.14.15-.34.22-.53.22z"
        fill="#fff"
      />
      <path
        d="M21 12.75H4.17c-.41 0-.75-.34-.75-.75s.34-.75.75-.75H21c.41 0 .75.34.75.75s-.34.75-.75.75z"
        fill="#fff"
      />
    </svg>
  );
}

const MemoBackIcon = React.memo(BackIcon);
export default MemoBackIcon;
