import * as React from "react";
function DetailsIccon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 59 59" fill="none" {...props}>
      <path
        fill="url(#prefix__pattern0_390_23992)"
        d="M.234 0H59v58.766H.234z"
      />
      <defs>
        <pattern
          id="prefix__pattern0_390_23992"
          patternContentUnits="objectBoundingBox"
          width={1}
          height={1}>
          <use
            xlinkHref="#prefix__image0_390_23992"
            transform="scale(.00093)"
          />
        </pattern>
        <image
          id="prefix__image0_390_23992"
          width={1080}
          height={1080}
        />
      </defs>
    </svg>
  );
}
const MemoDetailsIccon = React.memo(DetailsIccon);
export default MemoDetailsIccon;