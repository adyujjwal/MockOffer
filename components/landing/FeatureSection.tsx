"use client";

import * as React from "react";
import { Reveal } from "../ui/Reveal";
import { CountUp } from "../ui/CountUp";
import { AIOrb, AIStatusChip } from "../ui/AIOrb";
import { Code, Gauge, History, Check, Braces } from "../ui/icons";

const EVAL_DIMENSIONS = [
  "Problem understanding",
  "Approach & trade-offs",
  "Time & space complexity",
  "Edge cases",
  "Implementation quality",
  "Communication",
];

// Axis order maps to the radar geometry below (top, right, bottom, left).
const PERF = [
  { label: "Time complexity", value: 92, color: "#8aa2ff" },
  { label: "Space complexity", value: 78, color: "#c99bff" },
  { label: "Code quality", value: 86, color: "var(--color-gold-bright)" },
  { label: "Edge cases", value: 64, color: "#58c98b" },
];

const HISTORY = [
  { t: "Merge Intervals", d: "Medium", s: 86 },
  { t: "LRU Cache", d: "Hard", s: 72 },
  { t: "Group Anagrams", d: "Medium", s: 91 },
];

/* ── Radar visualization for Performance analysis ── */
const Radar: React.FC = () => {
  const size = 190;
  const c = size / 2;
  const r = size / 2 - 24;
  // angles: top, right, bottom, left
  const angles = [-90, 0, 90, 180].map((d) => (d * Math.PI) / 180);
  const pt = (i: number, scale: number) => {
    const a = angles[i];
    return [c + Math.cos(a) * r * scale, c + Math.sin(a) * r * scale];
  };
  const dataPoly = PERF.map((p, i) => pt(i, p.value / 100).join(",")).join(" ");
  const axisPts = angles.map((_, i) => pt(i, 1));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full">
      {/* concentric rings */}
      {[0.25, 0.5, 0.75, 1].map((s) => (
        <polygon
          key={s}
          points={[0, 1, 2, 3].map((i) => pt(i, s).join(",")).join(" ")}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={1}
        />
      ))}
      {/* axes */}
      {axisPts.map(([x, y], i) => (
        <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="var(--color-line)" strokeWidth={1} />
      ))}
      {/* data polygon (scales in on reveal) */}
      <g style={{ transformOrigin: "center", transformBox: "fill-box", transition: "transform 0.9s cubic-bezier(0.22,1,0.36,1)" }} className="radar-poly">
        <polygon
          points={dataPoly}
          fill="rgba(230,178,74,0.14)"
          stroke="var(--color-gold)"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        {PERF.map((p, i) => {
          const [x, y] = pt(i, p.value / 100);
          return <circle key={i} cx={x} cy={y} r={2.5} fill="var(--color-gold-bright)" />;
        })}
      </g>
    </svg>
  );
};

/* ── Sparkline timeline for Interview history ── */
const HistorySparkline: React.FC = () => {
  const w = 100;
  const h = 34;
  const pts = HISTORY.map((row, i) => {
    const x = (i / (HISTORY.length - 1)) * w;
    const y = h - (row.s / 100) * h;
    return [x, y];
  });
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const len = 160;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-9 w-full overflow-visible">
      <path
        d={d}
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        className="draw-path"
        style={{ ["--len" as string]: len }}
      />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2} fill="var(--color-gold-bright)" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
};

const SectionHead: React.FC<{ index: string; eyebrow: string; title: string; body?: string }> = ({
  index,
  eyebrow,
  title,
  body,
}) => (
  <Reveal className="mx-auto max-w-2xl text-center">
    <div className="mb-4 flex items-center justify-center gap-3">
      <span className="mono text-xs text-[color:var(--color-fg-faint)]">{index}</span>
      <span className="h-px w-8" style={{ background: "var(--color-line-strong)" }} />
      <span className="eyebrow">{eyebrow}</span>
    </div>
    <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
    {body && <p className="mt-4 text-lg text-[color:var(--color-fg-muted)]">{body}</p>}
  </Reveal>
);

export const FeatureSection: React.FC = () => {
  return (
    <section id="features" className="relative mx-auto w-full max-w-6xl px-5 py-24 sm:py-32">
      <SectionHead
        index="/ 01"
        eyebrow="The system"
        title="Everything you need to simulate the real interview."
        body="Not a compiler with a chatbot bolted on. A complete loop: an interviewer that probes your thinking, a real editor, and a debrief that shows where your solution breaks."
      />

      {/* Bento grid */}
      <div className="mt-16 grid grid-cols-1 gap-4 lg:grid-cols-6">

        {/* AI interviewer — 4 cols */}
        <Reveal className="lg:col-span-4">
          <article className="card card-glow flex h-full flex-col overflow-hidden p-7">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AIOrb size={40} status="evaluating" />
                <h3 className="text-xl font-semibold">AI interviewer</h3>
              </div>
              <AIStatusChip status="evaluating" />
            </div>
            <p className="max-w-md text-[color:var(--color-fg-muted)]">
              An interviewer that evaluates more than your final answer. It follows your
              reasoning, questions your choices, and scores the whole performance.
            </p>
            <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
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

        {/* Performance analysis — 2 cols, radar */}
        <Reveal className="lg:col-span-2" delay={80}>
          <article className="card card-glow flex h-full flex-col p-7">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(138,162,255,0.1)", color: "#8aa2ff" }}>
                <Gauge size={20} />
              </span>
              <h3 className="text-xl font-semibold">Performance analysis</h3>
            </div>
            <p className="text-sm text-[color:var(--color-fg-muted)]">
              Every submission is measured across the dimensions interviewers actually care about.
            </p>
            <div className="mx-auto my-4 h-44 w-44">
              <Radar />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {PERF.map((p) => (
                <div key={p.label} className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5 text-[color:var(--color-fg-subtle)]">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
                    {p.label}
                  </span>
                  <span className="mono tabular-nums text-[color:var(--color-fg)]">
                    <CountUp value={p.value} />
                  </span>
                </div>
              ))}
            </div>
          </article>
        </Reveal>

        {/* Real coding environment — 3 cols, authentic editor */}
        <Reveal className="lg:col-span-3" delay={40}>
          <article className="card card-glow flex h-full flex-col overflow-hidden p-7">
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
              className="mt-5 overflow-hidden rounded-lg border"
              style={{ borderColor: "var(--color-line)", background: "var(--color-inset)" }}
            >
              {/* tab + difficulty */}
              <div className="flex items-center gap-2 border-b px-3 py-2" style={{ borderColor: "var(--color-line)" }}>
                <Braces size={12} className="text-[color:var(--color-gold-bright)]" />
                <span className="mono text-[11px] text-[color:var(--color-fg-muted)]">solution.ts</span>
                <span className="badge diff-medium ml-auto">Medium</span>
              </div>

              {/* code with gutter + minimap */}
              <div className="flex">
                <pre className="flex-1 overflow-x-auto p-3 font-mono text-[12px] leading-relaxed">
                  <code>
                    <span className="flex gap-3">
                      <span className="select-none text-[color:var(--color-fg-faint)]">1</span>
                      <span>
                        <span style={{ color: "#c99bff" }}>const</span>
                        <span style={{ color: "#f5f5f6" }}> merge</span>
                        <span style={{ color: "#8b8f99" }}> = (a, b) =&gt; {"{"}</span>
                      </span>
                    </span>
                    <span className="flex gap-3">
                      <span className="select-none text-[color:var(--color-fg-faint)]">2</span>
                      <span>
                        {"  "}
                        <span style={{ color: "#c99bff" }}>return</span>
                        <span style={{ color: "#8b8f99" }}> [...a, ...b].</span>
                        <span style={{ color: "#8aa2ff" }}>sort</span>
                        <span style={{ color: "#8b8f99" }}>((x, y) =&gt; x - y);</span>
                      </span>
                    </span>
                    <span className="flex gap-3">
                      <span className="select-none text-[color:var(--color-fg-faint)]">3</span>
                      <span style={{ color: "#8b8f99" }}>{"}"}</span>
                    </span>
                  </code>
                </pre>
                {/* minimap sliver */}
                <div className="hidden w-10 shrink-0 flex-col gap-1 border-l p-2 sm:flex" style={{ borderColor: "var(--color-line)" }}>
                  {[0.9, 0.7, 0.3].map((w, i) => (
                    <span key={i} className="h-1 rounded-full" style={{ width: `${w * 100}%`, background: "var(--color-line-strong)" }} />
                  ))}
                </div>
              </div>

              {/* status bar */}
              <div
                className="mono flex items-center gap-3 border-t px-3 py-1.5 text-[10.5px] text-[color:var(--color-fg-subtle)]"
                style={{ borderColor: "var(--color-line)" }}
              >
                <span className="text-[color:var(--color-fg-muted)]">TypeScript</span>
                <span>UTF-8</span>
                <span className="ml-auto">Ln 2, Col 10</span>
              </div>
            </div>
          </article>
        </Reveal>

        {/* Interview history — 3 cols, timeline */}
        <Reveal className="lg:col-span-3" delay={120}>
          <article className="card card-glow flex h-full flex-col p-7">
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

            <div className="mt-5">
              <HistorySparkline />
            </div>

            <div className="mt-4 space-y-2">
              {HISTORY.map((row) => (
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
