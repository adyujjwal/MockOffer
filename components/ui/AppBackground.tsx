"use client";

import * as React from "react";

/**
 * Ambient page backdrop: a very low-opacity grid, a soft gold aurora bloom,
 * and a faint vignette. Fixed and non-interactive. No purple SaaS clichés.
 */
export const AppBackground: React.FC<{ variant?: "landing" | "app" }> = ({
  variant = "app",
}) => {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base wash */}
      <div className="absolute inset-0" style={{ background: "var(--color-ink)" }} />

      {/* grid */}
      <div
        className="bg-grid absolute inset-0"
        style={{
          maskImage: "radial-gradient(ellipse 90% 60% at 50% 0%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 60% at 50% 0%, black 20%, transparent 75%)",
          opacity: variant === "landing" ? 0.8 : 0.5,
        }}
      />

      {/* gold aurora (slow drift) */}
      <div
        className="aurora-gold absolute left-1/2 h-[42rem] w-[62rem] -translate-x-1/2"
        style={{
          top: variant === "landing" ? "-14rem" : "-24rem",
          background:
            "radial-gradient(ellipse at center, rgba(230,178,74,0.12), transparent 60%)",
          filter: "blur(20px)",
        }}
      />

      {/* cool counter-bloom, very restrained (drifts opposite) */}
      <div
        className="aurora-iris absolute right-[-10rem] top-[18%] h-[34rem] w-[34rem]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(138,162,255,0.06), transparent 62%)",
          filter: "blur(30px)",
        }}
      />

      {/* low warm accent that rises from the lower-left on landing */}
      {variant === "landing" && (
        <div
          className="aurora-iris absolute bottom-[6%] left-[-8rem] h-[30rem] w-[30rem]"
          style={{
            background:
              "radial-gradient(circle at center, rgba(230,178,74,0.05), transparent 64%)",
            filter: "blur(34px)",
            animationDelay: "-8s",
          }}
        />
      )}

      {/* bottom vignette */}
      <div
        className="absolute inset-x-0 bottom-0 h-64"
        style={{ background: "linear-gradient(to top, var(--color-ink), transparent)" }}
      />
    </div>
  );
};
