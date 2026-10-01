"use client";

import * as React from "react";
import { Reveal } from "../ui/Reveal";
import { Target, Clock, Sparkle } from "../ui/icons";

const STEPS = [
  {
    n: "01",
    title: "Choose your challenge",
    body: "Set the company, role and experience level. MockOffer generates a fresh, on-pattern problem tuned to that bar.",
    Icon: Target,
  },
  {
    n: "02",
    title: "Solve under pressure",
    body: "The clock runs while you work in a real editor. The interviewer nudges your thinking without giving away the answer.",
    Icon: Clock,
  },
  {
    n: "03",
    title: "Get an honest debrief",
    body: "Correctness, complexity, code quality and edge cases, plus exactly what to fix and what to practice next.",
    Icon: Sparkle,
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="relative mx-auto w-full max-w-6xl overflow-hidden px-5 py-24 sm:py-32">
      <Reveal className="max-w-2xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="mono text-xs text-[color:var(--color-fg-faint)]">/ 03</span>
          <span className="h-px w-8" style={{ background: "var(--color-line-strong)" }} />
          <span className="eyebrow">How it works</span>
        </div>
        <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Three steps from cold start to clear feedback.
        </h2>
      </Reveal>

      <div className="relative mt-16">
        {/* animated connecting line (desktop) */}
        <Reveal className="absolute inset-x-0 top-[3.4rem] hidden md:block">
          <svg className="h-2 w-full" viewBox="0 0 1000 2" preserveAspectRatio="none">
            <line x1="0" y1="1" x2="1000" y2="1" stroke="var(--color-line)" strokeWidth="2" />
            <line
              x1="0"
              y1="1"
              x2="1000"
              y2="1"
              stroke="var(--color-gold)"
              strokeWidth="2"
              className="draw-path"
              style={{ ["--len" as string]: 1000 }}
            />
          </svg>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 110}>
              <article className="card card-interactive relative h-full p-7">
                {/* node dot on the line */}
                <span
                  className="absolute -top-[0.3rem] left-7 hidden h-2.5 w-2.5 rounded-full md:block"
                  style={{ background: "var(--color-gold)", boxShadow: "0 0 0 4px var(--color-ink)" }}
                />
                <div className="mb-6 flex items-center justify-between">
                  <span className="index-numeral text-5xl font-semibold">{s.n}</span>
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ background: "rgba(230,178,74,0.1)", color: "var(--color-gold-bright)" }}
                  >
                    <s.Icon size={20} />
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">{s.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
