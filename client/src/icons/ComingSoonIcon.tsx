import * as React from "react";
function ComingSoonIcon(props: React.ImgHTMLAttributes<Element>) {
  return <img src="/assets/coming-soon.png" alt="" {...props} />;
}
const MemoComingSoonIcon = React.memo(ComingSoonIcon);
export default MemoComingSoonIcon;
