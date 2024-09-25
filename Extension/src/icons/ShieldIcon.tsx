import * as React from "react";

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 100 100" fill="none" {...props}>
      <path
        d="M87.125 46.333V28.042c0-3.417-2.583-7.292-5.792-8.584l-23.208-9.5a21.614 21.614 0 00-16.292 0l-23.208 9.5c-3.167 1.292-5.75 5.167-5.75 8.584v18.291c0 20.375 14.792 39.459 35 45.042a8.168 8.168 0 004.25 0c20.208-5.583 35-24.667 35-45.042zm-34 7.292v10.958c0 1.709-1.417 3.125-3.125 3.125s-3.125-1.416-3.125-3.125V53.625c-4.208-1.333-7.292-5.25-7.292-9.875C39.583 38 44.25 33.333 50 33.333S60.417 38 60.417 43.75c0 4.667-3.084 8.542-7.292 9.875z"
        fill="#79E7BA"
      />
    </svg>
  );
}

const MemoShieldIcon = React.memo(ShieldIcon);
export default MemoShieldIcon;
