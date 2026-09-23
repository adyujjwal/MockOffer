"use client";

import * as React from "react";
import { parseFeedback } from "../lib/feedbackParser";
import { CheckCircle, XCircle, Bulb, Trend, Alert, Braces, Gauge, Layers } from "./ui/icons";

function ScoreRing({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score * 10));
  const r = 26;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div className="relative inline-flex h-[68px] w-[68px] items-center justify-center">
      <svg width="68" height="68" viewBox="0 0 68 68" className="-rotate-90">
        <circle cx="34" cy="34" r={r} fill="none" stroke="var(--color-elevated)" strokeWidth="5" />
        <circle
          cx="34"
          cy="34"
          r={r}
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute flex items-baseline">
        <span className="mono text-xl font-semibold text-[color:var(--color-gold-bright)]">{score}</span>
        <span className="mono text-[10px] text-[color:var(--color-fg-subtle)]">/10</span>
      </div>
    </div>
  );
}

function SectionList({
  title,
  items,
  Icon,
  tint,
}: {
  title: string;
  items: string[];
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  tint: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center gap-2 border-b px-4 py-2.5" style={{ borderColor: "var(--color-line)" }}>
        <Icon size={15} className="shrink-0" />
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: tint, letterSpacing: "0.08em" }}>
          {title}
        </span>
      </div>
      <ul className="space-y-2.5 p-4">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-[color:var(--color-fg-muted)]">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: tint }} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const FeedbackView: React.FC<{ feedback: string; compact?: boolean }> = ({
  feedback,
  compact = false,
}) => {
  const f = React.useMemo(() => parseFeedback(feedback), [feedback]);

  return (
    <div className="space-y-4">
      {/* Overview: score + correctness */}
      <div className={`grid gap-3 ${compact ? "" : "sm:grid-cols-[auto_1fr]"}`}>
        {f.qualityScore !== null && (
          <div className="panel flex items-center gap-4 p-4">
            <ScoreRing score={f.qualityScore} />
            <div>
              <div className="text-xs uppercase tracking-wide text-[color:var(--color-fg-subtle)]" style={{ letterSpacing: "0.08em" }}>
                Code quality
              </div>
              <div className="mt-0.5 text-sm text-[color:var(--color-fg-muted)]">
                {f.qualityScore >= 8 ? "Strong, interview-ready" : f.qualityScore >= 6 ? "Solid, with room to sharpen" : "Needs work before the real thing"}
              </div>
            </div>
          </div>
        )}
        <div
          className="panel flex items-center gap-3 p-4"
          style={{
            borderColor: f.isCorrect ? "rgba(88,201,139,0.3)" : "rgba(240,119,107,0.3)",
            background: f.isCorrect ? "rgba(88,201,139,0.06)" : "rgba(240,119,107,0.06)",
          }}
        >
          {f.isCorrect ? (
            <CheckCircle size={22} className="text-[color:var(--color-success)]" />
          ) : (
            <XCircle size={22} className="text-[color:var(--color-danger)]" />
          )}
          <div>
            <div className="font-medium" style={{ color: f.isCorrect ? "var(--color-success)" : "var(--color-danger)" }}>
              {f.isCorrect ? "Solution is correct" : "Issues found"}
            </div>
            <div className="text-xs text-[color:var(--color-fg-subtle)]">
              {f.isCorrect ? "Passes the interviewer's correctness check" : "Review the notes below before resubmitting"}
            </div>
          </div>
        </div>
      </div>

      {/* Complexity */}
      <div className="grid grid-cols-2 gap-3">
        <div className="panel p-4">
          <div className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide text-[color:var(--color-fg-subtle)]" style={{ letterSpacing: "0.08em" }}>
            <Gauge size={13} style={{ color: "#8aa2ff" }} /> Time
          </div>
          <div className="mono text-lg" style={{ color: "#a9bcff" }}>{f.timeComplexity}</div>
        </div>
        <div className="panel p-4">
          <div className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide text-[color:var(--color-fg-subtle)]" style={{ letterSpacing: "0.08em" }}>
            <Layers size={13} style={{ color: "#c99bff" }} /> Space
          </div>
          <div className="mono text-lg" style={{ color: "#d4b3ff" }}>{f.spaceComplexity}</div>
        </div>
      </div>

      {!f.isCorrect && f.correctnessIssues.length > 0 && (
        <SectionList title="Issues to fix" items={f.correctnessIssues} Icon={Alert} tint="var(--color-danger)" />
      )}

      <SectionList title="What to improve" items={f.improvements} Icon={Trend} tint="var(--color-gold-bright)" />
      <SectionList title="Optimization suggestions" items={f.suggestions} Icon={Bulb} tint="#8aa2ff" />
      <SectionList title="Edge cases to consider" items={f.edgeCases} Icon={Alert} tint="#e6b24a" />

      {f.optimizedCode && (
        <details className="panel overflow-hidden group" open={!compact}>
          <summary className="flex cursor-pointer list-none items-center gap-2 border-b px-4 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ borderColor: "var(--color-line)", color: "var(--color-gold-bright)", letterSpacing: "0.08em" }}>
            <Braces size={15} />
            Optimized solution
            <span className="ml-auto text-[color:var(--color-fg-subtle)] transition-transform group-open:rotate-180">▾</span>
          </summary>
          <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed" style={{ background: "var(--color-inset)", color: "#a9e6c0" }}>
            <code>{f.optimizedCode}</code>
          </pre>
        </details>
      )}
    </div>
  );
};
