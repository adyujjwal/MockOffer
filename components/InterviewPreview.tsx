"use client";

import * as React from "react";
import { AIOrb } from "./ui/AIOrb";
import { CountUp } from "./ui/CountUp";
import { Clock, Play, Braces } from "./ui/icons";

/**
 * A stylised, self-contained preview of a MockOffer session for the hero.
 * Decorative only, no real editor, but conveys the product at a glance:
 * AI interviewer, a live-feeling code editor, and a complexity read-out.
 * All copy is fixed; only presentation animates.
 */

const CODE_LINES: { indent: number; tokens: [string, string][] }[] = [
  { indent: 0, tokens: [["kw", "function"], ["fn", " twoSum"], ["p", "(nums, target) {"]] },
  { indent: 1, tokens: [["kw", "const"], ["v", " seen"], ["p", " = "], ["kw", "new"], ["fn", " Map"], ["p", "();"]] },
  { indent: 1, tokens: [["kw", "for"], ["p", " ("], ["kw", "let"], ["v", " i"], ["p", " = "], ["n", "0"], ["p", "; i < nums.length; i++) {"]] },
  { indent: 2, tokens: [["kw", "const"], ["v", " need"], ["p", " = target - nums[i];"]] },
  { indent: 2, tokens: [["kw", "if"], ["p", " (seen."], ["fn", "has"], ["p", "(need)) "], ["kw", "return"], ["p", " [seen."], ["fn", "get"], ["p", "(need), i];"]] },
  { indent: 2, tokens: [["p", "seen."], ["fn", "set"], ["p", "(nums[i], i);"]] },
  { indent: 1, tokens: [["p", "}"]] },
  { indent: 0, tokens: [["p", "}"]] },
];

const TOKEN_COLOR: Record<string, string> = {
  kw: "#c99bff",
  fn: "#8aa2ff",
  v: "#f5f5f6",
  p: "#8b8f99",
  n: "#e6b24a",
};

function useReducedMotion() {
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(m.matches);
    const on = () => setReduce(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return reduce;
}

export const InterviewPreview: React.FC<{ className?: string }> = ({ className = "" }) => {
  const reduce = useReducedMotion();
  const [shownLines, setShownLines] = React.useState(0);
  const [seconds, setSeconds] = React.useState(29 * 60 + 42); // 29:42, counts down subtly

  // Progressive code reveal.
  React.useEffect(() => {
    if (reduce) {
      setShownLines(CODE_LINES.length);
      return;
    }
    const t = setInterval(() => {
      setShownLines((n) => {
        if (n >= CODE_LINES.length) {
          clearInterval(t);
          return n;
        }
        return n + 1;
      });
    }, 440);
    return () => clearInterval(t);
  }, [reduce]);

  // Live-feeling timer (purely cosmetic, starts from the fixed 29:42).
  React.useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : s)), 1000);
    return () => clearInterval(t);
  }, [reduce]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const activeLine = Math.min(shownLines, CODE_LINES.length);
  const done = shownLines >= CODE_LINES.length;

  return (
    <div className={`card relative overflow-hidden ${className}`} style={{ borderRadius: 18 }}>
      {/* window chrome */}
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "var(--color-line)", background: "var(--color-panel-2)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#2c2f36" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#2c2f36" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#2c2f36" }} />
          </div>
          <span className="text-xs text-[color:var(--color-fg-subtle)]">
            Session · Senior Software Engineer
          </span>
        </div>
        <div className="mono flex items-center gap-1.5 text-xs tabular-nums text-[color:var(--color-gold-bright)]">
          <Clock size={13} />
          {mm}:{ss}
        </div>
      </div>

      <div className="grid gap-px sm:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]" style={{ background: "var(--color-line)" }}>
        {/* AI interviewer */}
        <div className="min-w-0 p-4" style={{ background: "var(--color-panel-2)" }}>
          <div className="mb-3 flex items-center gap-2.5">
            <AIOrb size={30} status="thinking" />
            <div className="leading-tight">
              <div className="text-xs font-medium">Interviewer</div>
              <div className="flex items-center gap-1.5 text-[11px] text-[color:var(--color-iris-bright)]">
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "currentColor" }} />
                Thinking
              </div>
            </div>
          </div>
          <div
            className="rounded-lg border p-3 text-[13px] leading-relaxed text-[color:var(--color-fg-muted)]"
            style={{ borderColor: "var(--color-line)", background: "var(--color-panel)" }}
          >
            Let&rsquo;s start with your approach. How would you solve this before writing code?
          </div>
          <div className="mt-3 flex items-center gap-1 pl-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  background: "var(--color-iris)",
                  animation: `typing-dot 1.2s ease-in-out ${i * 0.16}s infinite`,
                }}
              />
            ))}
          </div>
        </div>

        {/* code editor */}
        <div className="flex min-w-0 flex-col" style={{ background: "var(--color-inset)" }}>
          {/* editor tab bar */}
          <div
            className="flex items-center gap-2 border-b px-3 py-1.5"
            style={{ borderColor: "var(--color-line)" }}
          >
            <Braces size={12} className="text-[color:var(--color-gold-bright)]" />
            <span className="mono text-[11px] text-[color:var(--color-fg-muted)]">solution.ts</span>
            <span className="caret ml-auto" style={{ opacity: done ? 0 : 1 }} />
          </div>

          <div className="relative overflow-hidden px-2 py-3 font-mono text-[12.5px]">
            {CODE_LINES.map((line, i) => {
              const visible = i < shownLines;
              const isActive = i === activeLine - 1 && !done;
              return (
                <div
                  key={i}
                  className="relative flex gap-3 overflow-hidden whitespace-pre rounded px-1"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "none" : "translateY(3px)",
                    transition: "opacity 0.35s ease, transform 0.35s ease",
                    background: isActive ? "rgba(230,178,74,0.06)" : "transparent",
                    boxShadow: isActive ? "inset 2px 0 0 var(--color-gold)" : "none",
                  }}
                >
                  <span className="select-none text-right text-[color:var(--color-fg-faint)]" style={{ width: 16 }}>
                    {i + 1}
                  </span>
                  <span>
                    {"  ".repeat(line.indent)}
                    {line.tokens.map(([t, txt], j) => (
                      <span key={j} style={{ color: TOKEN_COLOR[t] }}>
                        {txt}
                      </span>
                    ))}
                    {isActive && <span className="caret ml-0.5" />}
                  </span>
                </div>
              );
            })}
          </div>

          {/* editor status bar */}
          <div
            className="mono mt-auto flex items-center gap-3 border-t px-3 py-1.5 text-[10.5px] text-[color:var(--color-fg-subtle)]"
            style={{ borderColor: "var(--color-line)" }}
          >
            <span className="text-[color:var(--color-fg-muted)]">TypeScript</span>
            <span>Ln {activeLine || 1}, Col 1</span>
            <span className="ml-auto flex items-center gap-1 text-[color:var(--color-easy)]">
              <Play size={11} />
              {done ? "Ran · passed" : "Running"}
            </span>
          </div>
        </div>
      </div>

      {/* complexity read-out */}
      <div
        className="flex flex-wrap items-center gap-3 border-t px-4 py-3"
        style={{ borderColor: "var(--color-line)", background: "var(--color-panel-2)" }}
      >
        <span className="eyebrow" style={{ letterSpacing: "0.12em" }}>Analysis</span>
        <span className="badge mono" style={{ color: "#8aa2ff", borderColor: "rgba(138,162,255,0.28)", background: "rgba(138,162,255,0.08)" }}>
          Time O(n)
        </span>
        <span className="badge mono" style={{ color: "#c99bff", borderColor: "rgba(201,155,255,0.28)", background: "rgba(201,155,255,0.08)" }}>
          Space O(1)
        </span>
        <span className="badge diff-easy">Optimal</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] text-[color:var(--color-fg-subtle)]">Quality</span>
          <div className="h-1.5 w-20 overflow-hidden rounded-full" style={{ background: "var(--color-elevated)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: done ? "88%" : "0%",
                background: "linear-gradient(90deg, var(--color-gold), var(--color-gold-bright))",
                transition: "width 1s cubic-bezier(0.22,1,0.36,1)",
              }}
            />
          </div>
          <span className="mono text-xs text-[color:var(--color-gold-bright)]">
            <CountUp value={8.8} decimals={1} />
          </span>
        </div>
      </div>
    </div>
  );
};
