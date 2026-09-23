import * as React from "react";

/**
 * MockOffer brand mark.
 *
 * Concept: a geometric "M" split at its central valley, the left half in
 * off-white, the right half in gold, so the negative space reads as a code
 * chevron and the two-tone split mirrors the "Mock / Offer" wordmark. A small
 * blinking cursor after the wordmark supplies the terminal reference.
 *
 * Works in full colour, monochrome (currentColor), and at favicon scale.
 */

interface LogoMarkProps {
  size?: number;
  className?: string;
  /** Render the glyph in a single colour (for monochrome / favicon contexts). */
  mono?: boolean;
  title?: string;
}

export const LogoMark: React.FC<LogoMarkProps> = ({
  size = 32,
  className = "",
  mono = false,
  title = "MockOffer",
}) => {
  const uid = React.useId();
  const gold = mono ? "currentColor" : "url(#" + uid + "-g)";
  const light = mono ? "currentColor" : "#f5f5f6";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={`${uid}-g`} x1="20" y1="12" x2="32" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f5cd6b" />
          <stop offset="1" stopColor="#d99f37" />
        </linearGradient>
        <linearGradient id={`${uid}-tile`} x1="20" y1="1" x2="20" y2="39" gradientUnits="userSpaceOnUse">
          <stop stopColor="#191b20" />
          <stop offset="1" stopColor="#0c0d10" />
        </linearGradient>
      </defs>

      {/* Tile */}
      {!mono && (
        <>
          <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="11" fill={`url(#${uid}-tile)`} />
          <rect
            x="0.75"
            y="0.75"
            width="38.5"
            height="38.5"
            rx="11"
            stroke="rgba(230,178,74,0.22)"
            strokeWidth="1"
          />
          <rect x="1.75" y="1.75" width="36.5" height="18" rx="10" fill="rgba(255,255,255,0.02)" />
        </>
      )}

      {/* Left half of the M, off-white */}
      <path
        d="M9 28.5V13L20 21.5"
        stroke={light}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right half of the M, gold */}
      <path
        d="M20 21.5L31 13V28.5"
        stroke={gold}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

interface MockOfferLogoProps {
  variant?: "full" | "mark" | "wordmark";
  /** Height of the mark tile in px; wordmark scales relative to it. */
  size?: number;
  className?: string;
  showCursor?: boolean;
}

export const MockOfferLogo: React.FC<MockOfferLogoProps> = ({
  variant = "full",
  size = 30,
  className = "",
  showCursor = true,
}) => {
  const fontSize = Math.round(size * 0.62);

  const wordmark = (
    <span
      className="inline-flex items-baseline font-semibold tracking-tight leading-none"
      style={{ fontSize }}
    >
      <span style={{ color: "var(--color-fg)" }}>Mock</span>
      <span className="text-gradient-gold">Offer</span>
      {showCursor && (
        <span
          aria-hidden="true"
          className="ml-[0.12em] inline-block rounded-[1px]"
          style={{
            width: Math.max(2, Math.round(size * 0.07)),
            height: fontSize * 0.86,
            background: "var(--color-gold)",
            animation: "blink 1.1s step-end infinite",
            transform: "translateY(1px)",
          }}
        />
      )}
    </span>
  );

  if (variant === "mark") {
    return <LogoMark size={size} className={className} />;
  }
  if (variant === "wordmark") {
    return <span className={className}>{wordmark}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {wordmark}
    </span>
  );
};
