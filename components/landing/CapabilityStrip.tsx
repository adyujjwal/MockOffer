"use client";

import * as React from "react";
import { Reveal } from "../ui/Reveal";
import { Sparkle, Code, Activity, Layers, Gauge } from "../ui/icons";

// Exact capability labels from the approved content. Order preserved.
const CAPABILITIES = [
  { n: "01", label: "AI interviewer", Icon: Sparkle },
  { n: "02", label: "Real coding problems", Icon: Code },
  { n: "03", label: "Real-time feedback", Icon: Activity },
  { n: "04", label: "Monaco editor", Icon: Layers },
  { n: "05", label: "Performance analysis", Icon: Gauge },
];

export const CapabilityStrip: React.FC = () => {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-5 pb-10 pt-4">
      <Reveal className="flex items-center gap-4">
        <span className="tech whitespace-nowrap">Built for serious software engineers.</span>
        <span className="h-px flex-1" style={{ background: "var(--color-line)" }} />
      </Reveal>

      <Reveal
        stagger
        className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border sm:grid-cols-3 lg:grid-cols-5"
        style={{ borderColor: "var(--color-line)", background: "var(--color-line)" }}
      >
        {CAPABILITIES.map(({ n, label, Icon }) => (
          <div
            key={label}
            className="group relative flex flex-col gap-4 p-5 transition-colors"
            style={{ background: "var(--color-panel)" }}
          >
            <div className="flex items-center justify-between">
              <span className="mono text-xs text-[color:var(--color-fg-faint)]">{n}</span>
              <Icon size={16} className="text-[color:var(--color-fg-subtle)] transition-colors group-hover:text-[color:var(--color-gold-bright)]" />
            </div>
            <span className="text-sm font-medium leading-snug text-[color:var(--color-fg)]">
              {label}
            </span>
            <span
              className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
              style={{ background: "var(--color-gold)" }}
            />
          </div>
        ))}
      </Reveal>
    </section>
  );
};
