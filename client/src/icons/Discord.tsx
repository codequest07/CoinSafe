import * as React from "react";

function Discord(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 17 17" fill="none" {...props}>
      <path
        d="M13.494 4.436a11.323 11.323 0 00-2.847-.886.067.067 0 00-.046.02c-.12.22-.26.506-.354.726-1.06-.16-2.14-.16-3.2 0a6.682 6.682 0 00-.36-.726c-.006-.014-.026-.02-.046-.02-1 .173-1.954.473-2.847.886-.007 0-.013.007-.02.014C1.96 7.163 1.46 9.803 1.707 12.416c0 .014.007.027.02.034 1.2.88 2.354 1.413 3.494 1.767.02.006.04 0 .046-.014.267-.367.507-.753.714-1.16.013-.026 0-.053-.027-.06-.38-.147-.74-.32-1.093-.52-.027-.013-.027-.053-.007-.073.073-.054.147-.114.22-.167a.041.041 0 01.047-.007c2.293 1.047 4.766 1.047 7.033 0a.04.04 0 01.046.007c.074.06.147.113.22.173.027.02.027.06-.006.074a7.148 7.148 0 01-1.094.52c-.026.006-.033.04-.026.06.213.406.453.793.713 1.16.02.006.04.013.06.006 1.147-.353 2.3-.886 3.5-1.766a.037.037 0 00.02-.034c.293-3.02-.486-5.64-2.066-7.966-.007-.007-.014-.014-.027-.014zm-7.167 6.387c-.686 0-1.26-.633-1.26-1.413s.56-1.414 1.26-1.414c.707 0 1.267.64 1.26 1.414 0 .78-.56 1.413-1.26 1.413zm4.647 0c-.687 0-1.26-.633-1.26-1.413s.56-1.414 1.26-1.414c.707 0 1.267.64 1.26 1.414 0 .78-.553 1.413-1.26 1.413z"
        fill="#fff"
      />
    </svg>
  );
}

const MemoDiscord = React.memo(Discord);
export default MemoDiscord;