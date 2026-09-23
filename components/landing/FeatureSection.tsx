"use client";

import * as React from "react";
import { Reveal } from "../ui/Reveal";
import { AIOrb } from "../ui/AIOrb";
import { Code, Gauge, History, Check, ArrowRight } from "../ui/icons";

const EVAL_DIMENSIONS = [
  "Problem understanding",
  "Approach & trade-offs",
  "Time & space complexity",
  "Edge cases",
  "Implementation quality",
  "Communication",
];

const PERF_BARS = [
  { label: "Time complexity", value: 92, color: "#8aa2ff" },
  { label: "Space complexity", value: 78, color: "#c99bff" },
  { label: "Code quality", value: 86, color: "var(--color-gold)" },
  { label: "Edge cases", value: 64, color: "#58c98b" },
];

export const FeatureSection: React.FC = () => {
  return (
    <section id="features" className="relative mx-auto max-w-6xl px-5 py-24 sm:py-32">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">The system</span>
        <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Everything you need to simulate the real interview.
        </h2>
        <p className="mt-4 text-lg text-[color:var(--color-fg-muted)]">
          Not a compiler with a chatbot bolted on. A complete loop: an interviewer that
          probes your thinking, a real editor, and a debrief that shows where your
          solution breaks.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-4 lg:grid-cols-6">
        {/* AI Interviewer — wide */}
        <Reveal className="lg:col-span-4">
          <article className="card card-interactive card-glow h-full overflow-hidden p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <AIOrb size={40} status="evaluating" />
                  <h3 className="text-xl font-semibold">AI interviewer</h3>
                </div>
                <p className="max-w-md text-[color:var(--color-fg-muted)]">
                  An interviewer that evaluates more than your final answer. It follows your
                  reasoning, questions your choices, and scores the whole performance.
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {EVAL_DIMENSIONS.map((d) => (
                <div
                  key={d}
                  className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm"
                  style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "rgba(230,178,74,0.12)", color: "var(--color-gold-bright)" }}
                  >
                    <Check size={13} strokeWidth={2.4} />
                  </span>
                  <span className="text-[color:var(--color-fg-muted)]">{d}</span>
                </div>
              ))}
            </div>
          </article>
        </Reveal>

        {/* Performance analysis — tall */}
        <Reveal className="lg:col-span-2" delay={80}>
          <article className="card card-interactive card-glow h-full p-7">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(138,162,255,0.1)", color: "#8aa2ff" }}>
                <Gauge size={20} />
              </span>
              <h3 className="text-xl font-semibold">Performance analysis</h3>
            </div>
            <p className="text-sm text-[color:var(--color-fg-muted)]">
              Every submission is measured across the dimensions interviewers actually care about.
            </p>
            <div className="mt-6 space-y-4">
              {PERF_BARS.map((b) => (
                <div key={b.label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-[color:var(--color-fg-muted)]">{b.label}</span>
                    <span className="mono text-[color:var(--color-fg-subtle)]">{b.value}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--color-elevated)" }}>
                    <div className="h-full rounded-full" style={{ width: `${b.value}%`, background: b.color }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </Reveal>

        {/* Real coding environment */}
        <Reveal className="lg:col-span-3" delay={40}>
          <article className="card card-interactive card-glow h-full overflow-hidden p-7">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(230,178,74,0.1)", color: "var(--color-gold-bright)" }}>
                <Code size={20} />
              </span>
              <h3 className="text-xl font-semibold">Real coding environment</h3>
            </div>
            <p className="text-sm text-[color:var(--color-fg-muted)]">
              The same Monaco editor that powers VS Code, with eight languages and syntax
              intelligence. No toy sandbox.
            </p>
            <div
              className="mt-5 overflow-hidden rounded-lg border font-mono text-[12px]"
              style={{ borderColor: "var(--color-line)", background: "var(--color-inset)" }}
            >
              <div className="flex items-center gap-2 border-b px-3 py-2" style={{ borderColor: "var(--color-line)" }}>
                <span className="badge diff-medium">Medium</span>
                <span className="text-[11px] text-[color:var(--color-fg-subtle)]">solution.ts</span>
              </div>
              <pre className="overflow-x-auto p-3 leading-relaxed">
                <code>
                  <span style={{ color: "#c99bff" }}>const</span>
                  <span style={{ color: "#f5f5f6" }}> merge</span>
                  <span style={{ color: "#8b8f99" }}> = (a, b) =&gt; {"{"}</span>
                  {"\n  "}
                  <span style={{ color: "#c99bff" }}>return</span>
                  <span style={{ color: "#8b8f99" }}> [...a, ...b].</span>
                  <span style={{ color: "#8aa2ff" }}>sort</span>
                  <span style={{ color: "#8b8f99" }}>((x, y) =&gt; x - y);</span>
                  {"\n"}
                  <span style={{ color: "#8b8f99" }}>{"}"}</span>
                </code>
              </pre>
            </div>
          </article>
        </Reveal>

        {/* Interview history */}
        <Reveal className="lg:col-span-3" delay={120}>
          <article className="card card-interactive card-glow h-full p-7">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(88,201,139,0.1)", color: "#58c98b" }}>
                <History size={20} />
              </span>
              <h3 className="text-xl font-semibold">Interview history</h3>
            </div>
            <p className="text-sm text-[color:var(--color-fg-muted)]">
              Every session is saved with its code, feedback and timing, so you can watch your
              trend line move.
            </p>
            <div className="mt-5 space-y-2">
              {[
                { t: "Merge Intervals", d: "Medium", s: 86 },
                { t: "LRU Cache", d: "Hard", s: 72 },
                { t: "Group Anagrams", d: "Medium", s: 91 },
              ].map((row) => (
                <div
                  key={row.t}
                  className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                  style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`badge ${row.d === "Hard" ? "diff-hard" : "diff-medium"}`}>{row.d}</span>
                    <span className="text-sm">{row.t}</span>
                  </div>
                  <span className="mono text-xs text-[color:var(--color-gold-bright)]">{row.s}</span>
                </div>
              ))}
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
};
