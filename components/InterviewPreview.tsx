"use client";

import * as React from "react";
import { AIOrb } from "./ui/AIOrb";
import { Clock } from "./ui/icons";

/**
 * A stylised, self-contained preview of a MockOffer session for the hero.
 * Decorative only, no real editor, but conveys the product at a glance:
 * AI interviewer on the left, code on the right, complexity read-out below.
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

export const InterviewPreview: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [shownLines, setShownLines] = React.useState(0);

  React.useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    }, 420);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={`card card-glow relative ${className}`} style={{ borderRadius: 18 }}>
      {/* window chrome */}
      <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--color-line)" }}>
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
        <div className="flex items-center gap-1.5 mono text-xs text-[color:var(--color-gold-bright)]">
          <Clock size={13} />
          29:42
        </div>
      </div>

      <div className="grid gap-px sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" style={{ background: "var(--color-line)" }}>
        {/* AI interviewer */}
        <div className="p-4" style={{ background: "var(--color-panel-2)" }}>
          <div className="mb-3 flex items-center gap-2.5">
            <AIOrb size={30} status="thinking" />
            <div className="leading-tight">
              <div className="text-xs font-medium">Interviewer</div>
              <div className="text-[11px] text-[color:var(--color-iris-bright)]">Thinking</div>
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
        <div className="p-4 font-mono text-[12.5px]" style={{ background: "var(--color-inset)" }}>
          {CODE_LINES.map((line, i) => (
            <div
              key={i}
              className="flex gap-3 whitespace-pre"
              style={{
                opacity: i < shownLines ? 1 : 0,
                transform: i < shownLines ? "none" : "translateY(3px)",
                transition: "opacity 0.35s ease, transform 0.35s ease",
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
                {i === shownLines - 1 && (
                  <span
                    className="ml-0.5 inline-block"
                    style={{
                      width: 6,
                      height: 14,
                      background: "var(--color-gold)",
                      transform: "translateY(2px)",
                      animation: "blink 1.1s step-end infinite",
                    }}
                  />
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* complexity read-out */}
      <div className="flex flex-wrap items-center gap-3 border-t px-4 py-3" style={{ borderColor: "var(--color-line)" }}>
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
              style={{ width: "88%", background: "linear-gradient(90deg, var(--color-gold), var(--color-gold-bright))" }}
            />
          </div>
          <span className="mono text-xs text-[color:var(--color-gold-bright)]">8.8</span>
        </div>
      </div>
    </div>
  );
};
