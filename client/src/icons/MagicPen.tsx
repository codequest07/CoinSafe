import * as React from "react";

function MagicPen(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 40 40" fill="none" {...props}>
      <path
        d="M32.5 12.5l-2.483 2.483-5-5L27.5 7.5c.7-.7 1.6-1.033 2.5-1.033.9 0 1.8.333 2.5 1.033a3.53 3.53 0 010 5zM28.85 16.167l-18.017 18a3.53 3.53 0 01-5 0 3.53 3.53 0 010-5l18.017-18 5 5zM16.584 5.833l.683-2.317a.646.646 0 00-.15-.616c-.15-.167-.417-.234-.634-.167l-2.316.683-2.317-.683a.646.646 0 00-.617.15.608.608 0 00-.15.617l.667 2.333-.683 2.317c-.067.216 0 .45.15.616.166.167.4.217.617.15l2.333-.666 2.316.683c.067.017.117.033.184.033a.675.675 0 00.45-.183.608.608 0 00.15-.617l-.683-2.333zM9.917 15.833l.683-2.317a.646.646 0 00-.15-.617.608.608 0 00-.617-.15l-2.333.667-2.317-.683a.645.645 0 00-.616.15.607.607 0 00-.15.617l.666 2.333-.683 2.316c-.067.217 0 .45.15.617.167.167.4.217.617.15l2.316-.683 2.317.683c.05.017.117.017.183.017a.675.675 0 00.45-.183.607.607 0 00.15-.617l-.666-2.3zM34.916 24.167l.684-2.317a.645.645 0 00-.15-.617.607.607 0 00-.617-.15l-2.317.684-2.316-.684a.645.645 0 00-.617.15.607.607 0 00-.15.617l.683 2.317-.683 2.316c-.067.217 0 .45.15.617.167.167.4.217.617.15l2.316-.683 2.317.683c.05.017.117.017.183.017a.675.675 0 00.45-.184.607.607 0 00.15-.616l-.7-2.3z"
        fill="#79E7BA"
      />
    </svg>
  );
}

const MemoMagicPen = React.memo(MagicPen);
export default MemoMagicPen;