"use client";

import * as React from "react";

/**
 * Animates a number from 0 to `value` once the element scrolls into view.
 * Respects prefers-reduced-motion (jumps straight to the final value).
 */
export const CountUp: React.FC<{
  value: number;
  duration?: number;
  decimals?: number;
  className?: string;
  suffix?: string;
}> = ({ value, duration = 1100, decimals = 0, className = "", suffix = "" }) => {
  const ref = React.useRef<HTMLSpanElement | null>(null);
  // Start at the final value so the exact number is always in the DOM
  // (SSR, no-JS, SEO). Animation resets to 0 only once it scrolls into view.
  const [display, setDisplay] = React.useState(value);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(value);
      return;
    }

    let raf = 0;
    let start = 0;
    const run = () => {
      setDisplay(0);
      const step = (t: number) => {
        if (!start) start = t;
        const p = Math.min((t - start) / duration, 1);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(value * eased);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            run();
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
};
