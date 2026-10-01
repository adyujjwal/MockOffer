"use client";

import * as React from "react";

/**
 * Scroll-reveal wrapper using IntersectionObserver. Adds `.is-visible` when the
 * element enters the viewport. Respects prefers-reduced-motion via CSS.
 */
export const Reveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: React.ElementType;
  style?: React.CSSProperties;
  /** Stagger direct children instead of fading the element as one block. */
  stagger?: boolean;
}> = ({ children, className = "", delay = 0, as: Tag = "div", style, stagger = false }) => {
  const ref = React.useRef<HTMLElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const base = stagger ? "reveal-stage" : "reveal";

  return (
    <Tag
      ref={ref}
      className={`${base} ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </Tag>
  );
};
