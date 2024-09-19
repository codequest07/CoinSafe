import * as React from "react";

function Solana(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 20 20" fill="none" {...props}>
      <circle cx={10} cy={10} r={10} fill="#000" />
      <path
        d="M15.773 12.991l-1.926 2.053a.449.449 0 01-.327.14H4.39a.225.225 0 01-.204-.133.22.22 0 01.041-.24l1.927-2.053a.447.447 0 01.326-.14h9.129a.225.225 0 01.205.133.22.22 0 01-.041.24zm-1.926-4.133a.447.447 0 00-.327-.142H4.39a.225.225 0 00-.204.134.22.22 0 00.041.24l1.927 2.053a.448.448 0 00.326.141h9.129a.225.225 0 00.205-.134.22.22 0 00-.041-.24l-1.926-2.052zM4.39 7.383h9.129a.45.45 0 00.327-.141l1.926-2.053a.222.222 0 00-.164-.374H6.48a.45.45 0 00-.326.142L4.228 7.009a.222.222 0 00.163.374z"
        fill="url(#prefix__paint0_linear_344_16289)"
      />
      <defs>
        <linearGradient
          id="prefix__paint0_linear_344_16289"
          x1={5.152}
          y1={15.432}
          x2={14.659}
          y2={4.648}
          gradientUnits="userSpaceOnUse">
          <stop offset={0.08} stopColor="#9945FF" />
          <stop offset={0.3} stopColor="#8752F3" />
          <stop offset={0.5} stopColor="#5497D5" />
          <stop offset={0.6} stopColor="#43B4CA" />
          <stop offset={0.72} stopColor="#28E0B9" />
          <stop offset={0.97} stopColor="#19FB9B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const MemoSolana = React.memo(Solana);
export default MemoSolana;
