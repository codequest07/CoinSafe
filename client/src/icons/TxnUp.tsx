import * as React from "react";

function TxnUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" {...props}>
      <path
        d="M2.333 15.167h11.334c.273 0 .5-.227.5-.5 0-.274-.227-.5-.5-.5H2.332c-.273 0-.5.226-.5.5 0 .273.227.5.5.5zM3.333 12.167a.494.494 0 00.354-.147l9.333-9.333a.503.503 0 000-.707.503.503 0 00-.707 0L2.98 11.313a.503.503 0 000 .707c.1.1.227.147.353.147z"
        fill="#79E7BA"
      />
      <path
        d="M12.666 9.68c.274 0 .5-.227.5-.5V2.333c0-.273-.226-.5-.5-.5H5.82c-.274 0-.5.227-.5.5 0 .274.226.5.5.5h6.346V9.18c0 .273.227.5.5.5z"
        fill="#79E7BA"
      />
    </svg>
  );
}

const MemoTxnUp = React.memo(TxnUp);
export default MemoTxnUp;
