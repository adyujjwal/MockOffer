import * as React from "react";

/**
 * MockOffer icon set: a single, consistent stroke system.
 * 24×24 grid, 1.75 stroke, round caps/joins. No external dependency.
 */

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

function make(
  path: React.ReactNode,
  displayName: string,
) {
  const Comp = ({ size = 20, strokeWidth = 1.75, ...props }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth as number}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {path}
    </svg>
  );
  Comp.displayName = displayName;
  return Comp;
}

export const ArrowRight = make(
  <>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </>,
  "ArrowRight",
);

export const ArrowLeft = make(
  <>
    <path d="M19 12H5" />
    <path d="m11 18-6-6 6-6" />
  </>,
  "ArrowLeft",
);

export const ChevronRight = make(<path d="m9 6 6 6-6 6" />, "ChevronRight");
export const ChevronDown = make(<path d="m6 9 6 6 6-6" />, "ChevronDown");

export const Play = make(<path d="M6 4.5v15l13-7.5-13-7.5Z" />, "Play");

export const Pause = make(
  <>
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </>,
  "Pause",
);

export const Reset = make(
  <>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </>,
  "Reset",
);

export const Stop = make(<rect x="5" y="5" width="14" height="14" rx="2.5" />, "Stop");

export const Check = make(<path d="m4 12 5 5L20 6" />, "Check");

export const CheckCircle = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12 2.5 2.5 4.5-5" />
  </>,
  "CheckCircle",
);

export const X = make(
  <>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </>,
  "X",
);

export const XCircle = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </>,
  "XCircle",
);

export const Alert = make(
  <>
    <path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </>,
  "Alert",
);

export const Clock = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </>,
  "Clock",
);

export const Code = make(
  <>
    <path d="m8 6-6 6 6 6" />
    <path d="m16 6 6 6-6 6" />
  </>,
  "Code",
);

export const Braces = make(
  <>
    <path d="M8 3c-1.5 0-2.5 1-2.5 2.5V8c0 1-.5 2-2 2 1.5 0 2 1 2 2v2.5C5.5 18 6.5 19 8 19" />
    <path d="M16 3c1.5 0 2.5 1 2.5 2.5V8c0 1 .5 2 2 2-1.5 0-2 1-2 2v2.5C18.5 18 17.5 19 16 19" />
  </>,
  "Braces",
);

export const Terminal = make(
  <>
    <path d="m5 8 3.5 3.5L5 15" />
    <path d="M12 15h6" />
  </>,
  "Terminal",
);

export const Sparkle = make(
  <path d="M12 3c.3 3.6 1.4 4.7 5 5-3.6.3-4.7 1.4-5 5-.3-3.6-1.4-4.7-5-5 3.6-.3 4.7-1.4 5-5Z" />,
  "Sparkle",
);

export const Activity = make(
  <path d="M3 12h3.5l2.5-7 4 14 2.5-7H21" />,
  "Activity",
);

export const Gauge = make(
  <>
    <path d="M12 15l4-4" />
    <path d="M4 18a9 9 0 1 1 16 0" />
    <circle cx="12" cy="15" r="1" />
  </>,
  "Gauge",
);

export const Trend = make(
  <>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </>,
  "Trend",
);

export const History = make(
  <>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 8v4l3 2" />
  </>,
  "History",
);

export const Layers = make(
  <>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </>,
  "Layers",
);

export const Target = make(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="0.6" />
  </>,
  "Target",
);

export const Trash = make(
  <>
    <path d="M4 7h16" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
    <path d="M10 11v6M14 11v6" />
  </>,
  "Trash",
);

export const Calendar = make(
  <>
    <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
    <path d="M3.5 9.5h17" />
    <path d="M8 3v4M16 3v4" />
  </>,
  "Calendar",
);

export const Building = make(
  <>
    <rect x="5" y="3" width="14" height="18" rx="1.5" />
    <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
  </>,
  "Building",
);

export const Send = make(
  <>
    <path d="M4.5 12 20 4l-6 16-3.5-6.5L4.5 12Z" />
  </>,
  "Send",
);

export const Plus = make(
  <>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>,
  "Plus",
);

export const Menu = make(
  <>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </>,
  "Menu",
);

export const Bulb = make(
  <>
    <path d="M9 18h6" />
    <path d="M10 21h4" />
    <path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.4 1 2.5h6c0-1.1.3-1.8 1-2.5A6 6 0 0 0 12 3Z" />
  </>,
  "Bulb",
);

export const Message = make(
  <path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1Z" />,
  "Message",
);

export const Cpu = make(
  <>
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
    <path d="M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2" />
  </>,
  "Cpu",
);

export const Grid = make(
  <>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </>,
  "Grid",
);

export const Doc = make(
  <>
    <path d="M7 3h7l5 5v13a0 0 0 0 1 0 0H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6M9 17h6" />
  </>,
  "Doc",
);

export const Minus = make(<path d="M5 12h14" />, "Minus");

export const Copy = make(
  <>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a1 1 0 0 1 1-1h9" />
  </>,
  "Copy",
);

export const Download = make(
  <>
    <path d="M12 4v11" />
    <path d="m7 11 5 5 5-5" />
    <path d="M5 20h14" />
  </>,
  "Download",
);

export const Maximize = make(
  <>
    <path d="M4 9V5a1 1 0 0 1 1-1h4" />
    <path d="M20 9V5a1 1 0 0 0-1-1h-4" />
    <path d="M4 15v4a1 1 0 0 0 1 1h4" />
    <path d="M20 15v4a1 1 0 0 1-1 1h-4" />
  </>,
  "Maximize",
);

export const Minimize = make(
  <>
    <path d="M9 4v4a1 1 0 0 1-1 1H4" />
    <path d="M15 4v4a1 1 0 0 0 1 1h4" />
    <path d="M9 20v-4a1 1 0 0 0-1-1H4" />
    <path d="M15 20v-4a1 1 0 0 1 1-1h4" />
  </>,
  "Minimize",
);

export const Cog = make(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1l2.1-2.1M17 7l2.1-2.1" />
  </>,
  "Cog",
);

export const WrapText = make(
  <>
    <path d="M4 6h16" />
    <path d="M4 12h13a3 3 0 0 1 0 6h-3" />
    <path d="m16 15-2 3 2 3" transform="translate(0 -3)" />
    <path d="M4 18h5" />
  </>,
  "WrapText",
);
