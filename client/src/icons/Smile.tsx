import * as React from "react";

function Smile(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 40 40" fill="none" {...props}>
      <rect width={40} height={40} rx={20} fill="#131313" />
      <rect
        x={0.5}
        y={0.5}
        width={39}
        height={39}
        rx={19.5}
        stroke="#fff"
        strokeOpacity={0.02}
      />
      <rect
        x={16}
        y={15}
        width={4.642}
        height={3.095}
        rx={1}
        fill="#48FF91"
        fillOpacity={0.54}
      />
      <rect
        x={30.358}
        y={15}
        width={4.642}
        height={3.095}
        rx={1}
        fill="#48FF91"
        fillOpacity={0.54}
      />
      <rect
        x={16}
        y={22.095}
        width={19}
        height={3}
        rx={1}
        fill="#48FF91"
        fillOpacity={0.54}
      />
    </svg>
  );
}

const MemoSmile = React.memo(Smile);
export default MemoSmile;
