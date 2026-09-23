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
    <section id="how-it-works" className="relative mx-auto max-w-6xl px-5 py-24 sm:py-32">
      <Reveal className="max-w-2xl">
        <span className="eyebrow">How it works</span>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Three steps from cold start to clear feedback.
        </h2>
      </Reveal>

      <div className="relative mt-16 grid gap-4 md:grid-cols-3">
        {/* connecting line */}
        <div
          className="absolute left-0 right-0 top-[4.5rem] hidden h-px md:block"
          style={{ background: "linear-gradient(90deg, transparent, var(--color-line-strong), transparent)" }}
        />
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 90}>
            <article className="card card-interactive relative h-full p-7">
              <div className="mb-6 flex items-center justify-between">
                <span
                  className="mono text-5xl font-semibold leading-none"
                  style={{ color: "transparent", WebkitTextStroke: "1px var(--color-line-strong)" }}
                >
                  {s.n}
                </span>
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
    </section>
  );
};
