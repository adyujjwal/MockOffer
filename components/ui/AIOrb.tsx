import * as React from "react";

export type AIStatus = "ready" | "listening" | "thinking" | "evaluating";

const STATUS_LABEL: Record<AIStatus, string> = {
  ready: "Ready",
  listening: "Listening",
  thinking: "Thinking",
  evaluating: "Evaluating",
};

/**
 * Abstract AI presence indicator — a soft breathing core with orbiting
 * particles. Deliberately not a robot or a brain: it reads as an intelligent
 * signal. Colour shifts subtly by status.
 */
export const AIOrb: React.FC<{ size?: number; status?: AIStatus; className?: string }> = ({
  size = 44,
  status = "ready",
  className = "",
}) => {
  const active = status !== "ready";
  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* halo */}
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(138,162,255,0.25), transparent 68%)",
          animation: "breathe 4s ease-in-out infinite",
        }}
      />
      {/* orbit ring */}
      <span
        className="absolute rounded-full border"
        style={{
          inset: size * 0.12,
          borderColor: "rgba(138,162,255,0.28)",
          animation: active ? "orbit 6s linear infinite" : undefined,
        }}
      >
        <span
          className="absolute rounded-full"
          style={{
            width: size * 0.1,
            height: size * 0.1,
            top: -size * 0.05,
            left: "50%",
            marginLeft: -size * 0.05,
            background: "var(--color-iris-bright)",
            boxShadow: "0 0 8px rgba(138,162,255,0.9)",
          }}
        />
      </span>
      {/* core */}
      <span
        className="relative rounded-full"
        style={{
          width: size * 0.42,
          height: size * 0.42,
          background:
            "radial-gradient(circle at 35% 30%, #dfe6ff, #8aa2ff 55%, #5f7be6)",
          boxShadow: "0 0 14px rgba(138,162,255,0.6)",
          animation: "breathe 3s ease-in-out infinite",
        }}
      />
    </span>
  );
};

/** Small status chip with animated dots for the interviewer state. */
export const AIStatusChip: React.FC<{ status: AIStatus }> = ({ status }) => {
  const label = STATUS_LABEL[status];
  const busy = status === "thinking" || status === "evaluating";
  return (
    <span className="badge" style={{ color: "var(--color-iris-bright)", borderColor: "rgba(138,162,255,0.28)", background: "rgba(138,162,255,0.08)" }}>
      {busy ? (
        <span className="inline-flex items-center gap-0.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block rounded-full"
              style={{
                width: 4,
                height: 4,
                background: "currentColor",
                animation: `typing-dot 1.2s ease-in-out ${i * 0.16}s infinite`,
              }}
            />
          ))}
        </span>
      ) : (
        <span
          className="inline-block rounded-full"
          style={{ width: 6, height: 6, background: "currentColor", animation: "breathe 2.4s ease-in-out infinite" }}
        />
      )}
      {label}
    </span>
  );
};
