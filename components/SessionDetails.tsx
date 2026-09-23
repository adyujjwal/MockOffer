"use client";

import * as React from "react";
import { FeedbackView } from "./FeedbackView";
import { X, Clock, Calendar, Building, Code } from "./ui/icons";

export interface StoredInterview {
  id: string;
  timestamp: number;
  problemTitle: string;
  code: string;
  feedback: string;
  timeSpent: number;
  completed: boolean;
  company?: string;
  role?: string;
  experience?: number;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export const SessionDetails: React.FC<{
  interview: StoredInterview | null;
  onClose: () => void;
}> = ({ interview, onClose }) => {
  React.useEffect(() => {
    if (!interview) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [interview, onClose]);

  if (!interview) return null;

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="animate-fade-up flex h-full w-full max-w-2xl flex-col border-l"
        style={{ background: "var(--color-panel)", borderColor: "var(--color-line)" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Debrief: ${interview.problemTitle}`}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4 border-b p-5" style={{ borderColor: "var(--color-line)" }}>
          <div className="min-w-0">
            <div className="eyebrow">Interview debrief</div>
            <h2 className="mt-1.5 truncate text-xl font-semibold">{interview.problemTitle}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[color:var(--color-fg-subtle)]">
              <span className="flex items-center gap-1.5"><Calendar size={13} />{formatDate(interview.timestamp)}</span>
              <span className="flex items-center gap-1.5"><Clock size={13} />{formatTime(interview.timeSpent)}</span>
              {interview.company && interview.company !== "General" && (
                <span className="flex items-center gap-1.5"><Building size={13} />{interview.company}</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost p-2" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* code */}
          <div className="panel mb-4 overflow-hidden">
            <div className="flex items-center gap-2 border-b px-4 py-2.5" style={{ borderColor: "var(--color-line)" }}>
              <Code size={15} className="text-[color:var(--color-gold-bright)]" />
              <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-fg-muted)]" style={{ letterSpacing: "0.08em" }}>
                Your submission
              </span>
            </div>
            <pre className="max-h-72 overflow-auto p-4 font-mono text-[13px] leading-relaxed" style={{ background: "var(--color-inset)", color: "#e3e6ec" }}>
              <code>{interview.code || "// No code submitted"}</code>
            </pre>
          </div>

          {interview.feedback ? (
            <FeedbackView feedback={interview.feedback} />
          ) : (
            <div className="panel p-8 text-center text-sm text-[color:var(--color-fg-subtle)]">
              No feedback was recorded for this session.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
