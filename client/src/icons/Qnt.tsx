import * as React from "react";

function Qnt(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 20 20" fill="none" {...props}>
      <g filter="url(#prefix__filter0_b_344_16358)">
        <rect width={20} height={20} rx={10} fill="#1E1E1E" fillOpacity={0.6} />
        <rect
          x={0.5}
          y={0.5}
          width={19}
          height={19}
          rx={9.5}
          stroke="#fff"
          strokeOpacity={0.02}
        />
        <circle cx={10} cy={10} r={7} fill="#000" />
        <path
          d="M10.244 8.713L7.953 6.03s1.015-.35 1.479-.526c.493-.175 2.35 2.306 2.35 2.306l-1.538.904zM12.361 6.379c-.174.817-.522 1.43-.522 1.43l1.595 1.021.146 1.838-1.335 1.08.61 1.197s.144.466.58-.059c.102-.132.19-.237.263-.325.218-.26.31-.369.288-.609-.03-.32-.116-1.08-.407-1.284l.668-.087s.174-.058.145-.38c-.03-.35-.087-1.08-.087-1.08s.029-.174-.377-.233c-.46-.081-.491-.061-.493-.058.666-1.751-1.074-2.451-1.074-2.451zM12.216 11.748l-1.827-.817-1.595 3.24s-.116.233.29.262l.123.018c.407.063.983.153 1.298-.164.348-.321 1.711-2.539 1.711-2.539zM10.215 8.742l.174 2.16c-.058.117-3.22.117-3.741.087-.523-.029-.494-.291-.494-.291s-.058-.642-.087-1.226c-.029-.438.203-.467.203-.467l3.945-.263z"
          fill="#F1F1F1"
        />
      </g>
      <defs>
        <filter
          id="prefix__filter0_b_344_16358"
          x={-2.3}
          y={-2.3}
          width={24.6}
          height={24.6}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB">
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImageFix" stdDeviation={1.15} />
          <feComposite
            in2="SourceAlpha"
            operator="in"
            result="effect1_backgroundBlur_344_16358"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect1_backgroundBlur_344_16358"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}

const MemoQnt = React.memo(Qnt);
export default MemoQnt;
