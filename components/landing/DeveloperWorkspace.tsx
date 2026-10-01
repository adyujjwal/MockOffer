"use client";

import * as React from "react";
import { Reveal } from "../ui/Reveal";
import {
  Terminal, Bulb, Doc, Cog, Braces, Play, Check,
  WrapText, Maximize, Copy, Download, Minus, Plus,
} from "../ui/icons";

type Key = "run" | "hints" | "drafts" | "tools";

const TOOLS: {
  key: Key;
  n: string;
  title: string;
  body: string;
  Icon: React.FC<{ size?: number; className?: string }>;
}[] = [
  {
    key: "run",
    n: "01",
    title: "Run against examples",
    body: "Write only the function. We build the test driver, run it on every example across eight languages, and show real pass / fail: genuine execution, not a simulation.",
    Icon: Terminal,
  },
  {
    key: "hints",
    n: "02",
    title: "On-demand hints",
    body: "Stuck without giving up? Ask for progressive hints that nudge instead of spoiling: three levels, from a gentle push to a step-by-step approach.",
    Icon: Bulb,
  },
  {
    key: "drafts",
    n: "03",
    title: "Autosaved drafts",
    body: "Your code is saved as you type, per problem and per language. Refresh the page or switch languages and your work is exactly where you left it.",
    Icon: Doc,
  },
  {
    key: "tools",
    n: "04",
    title: "Editor power tools",
    body: "Font size, word wrap, minimap, distraction-free fullscreen, copy and download, plus a live status bar with cursor position and language.",
    Icon: Cog,
  },
];

/* The editor's lower panel changes with the active capability. */
const ContextPanel: React.FC<{ active: Key }> = ({ active }) => {
  if (active === "run") {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5">
        <span className="flex items-center gap-1.5 text-[11px] text-[color:var(--color-easy)]">
          <Play size={12} /> Run
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-[color:var(--color-fg-subtle)]">
          <span className="h-2 w-2 rounded-full" style={{ background: "var(--color-easy)" }} /> pass
          <span className="ml-2 h-2 w-2 rounded-full" style={{ background: "var(--color-hard)" }} /> fail
        </span>
        <span className="mono ml-auto text-[11px] text-[color:var(--color-fg-faint)]">8 languages</span>
      </div>
    );
  }
  if (active === "hints") {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5">
        <Bulb size={13} className="text-[color:var(--color-gold-bright)]" />
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((lvl) => (
            <span
              key={lvl}
              className="mono flex h-5 w-5 items-center justify-center rounded-full text-[10px]"
              style={
                lvl === 1
                  ? { background: "rgba(230,178,74,0.14)", color: "var(--color-gold-bright)", border: "1px solid rgba(230,178,74,0.35)" }
                  : { color: "var(--color-fg-faint)", border: "1px solid var(--color-line)" }
              }
            >
              {lvl}
            </span>
          ))}
        </div>
        <span className="mono ml-auto text-[11px] text-[color:var(--color-fg-faint)]">3 levels</span>
      </div>
    );
  }
  if (active === "drafts") {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="flex items-center gap-1.5 text-[11px] text-[color:var(--color-easy)]">
          <Check size={12} /> Draft saved
        </span>
        <span className="mono ml-auto text-[11px] text-[color:var(--color-fg-faint)]">per problem · per language</span>
      </div>
    );
  }
  // tools
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[Minus, Plus, WrapText, Maximize, Copy, Download].map((Ico, i) => (
        <span key={i} className="flex h-6 w-6 items-center justify-center rounded text-[color:var(--color-fg-subtle)]" style={{ border: "1px solid var(--color-line)" }}>
          <Ico size={12} />
        </span>
      ))}
      <span className="mono ml-auto text-[11px] text-[color:var(--color-fg-faint)]">Ln 2, Col 10</span>
    </div>
  );
};

export const DeveloperWorkspace: React.FC = () => {
  const [active, setActive] = React.useState<Key>("run");
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || paused) return;
    const t = setInterval(() => {
      setActive((cur) => {
        const i = TOOLS.findIndex((x) => x.key === cur);
        return TOOLS[(i + 1) % TOOLS.length].key;
      });
    }, 3800);
    return () => clearInterval(t);
  }, [paused]);

  const activeTool = TOOLS.find((t) => t.key === active)!;

  return (
    <section className="relative mx-auto w-full max-w-6xl px-5 py-24 sm:py-32">
      <Reveal className="mx-auto max-w-2xl text-center">
        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="mono text-xs text-[color:var(--color-fg-faint)]">/ 02</span>
          <span className="h-px w-8" style={{ background: "var(--color-line-strong)" }} />
          <span className="eyebrow">Built for developers</span>
        </div>
        <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          A workspace that works the way you do.
        </h2>
        <p className="mt-4 text-lg text-[color:var(--color-fg-muted)]">
          The little things that make practice feel like real work, not a quiz box.
        </p>
      </Reveal>

      <div
        className="mt-16 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* capability selectors */}
        <Reveal className="flex min-w-0 flex-col gap-2">
          {TOOLS.map((t) => {
            const on = t.key === active;
            return (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                aria-pressed={on}
                className="group relative overflow-hidden rounded-xl border p-5 text-left transition-all"
                style={{
                  borderColor: on ? "var(--color-line-strong)" : "var(--color-line)",
                  background: on ? "var(--color-elevated)" : "var(--color-panel)",
                }}
              >
                {on && (
                  <span className="absolute inset-y-0 left-0 w-0.5" style={{ background: "var(--color-gold)" }} />
                )}
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors"
                    style={{
                      background: on ? "rgba(230,178,74,0.12)" : "var(--color-inset)",
                      color: on ? "var(--color-gold-bright)" : "var(--color-fg-subtle)",
                    }}
                  >
                    <t.Icon size={18} />
                  </span>
                  <span className="mono text-xs text-[color:var(--color-fg-faint)]">{t.n}</span>
                  <h3 className="text-base font-semibold">{t.title}</h3>
                </div>
                <div
                  className="grid transition-all duration-300"
                  style={{
                    gridTemplateRows: on ? "1fr" : "0fr",
                    opacity: on ? 1 : 0,
                    marginTop: on ? 12 : 0,
                  }}
                >
                  <p className="overflow-hidden text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                    {t.body}
                  </p>
                </div>
              </button>
            );
          })}
        </Reveal>

        {/* central editor whose panel reflects the active capability */}
        <Reveal delay={80} className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 border-b px-3 py-2.5" style={{ borderColor: "var(--color-line)" }}>
              <Braces size={13} className="text-[color:var(--color-gold-bright)]" />
              <span className="mono text-[11px] text-[color:var(--color-fg-muted)]">solution.ts</span>
              <span className="mono ml-auto flex items-center gap-1.5 text-[11px] text-[color:var(--color-fg-faint)]">
                <activeTool.Icon size={12} />
                {activeTool.title}
              </span>
            </div>

            <div className="overflow-x-auto px-3 py-4 font-mono text-[12.5px]" style={{ background: "var(--color-inset)" }}>
              {[
                [["#c99bff", "function"], ["#8aa2ff", " twoSum"], ["#8b8f99", "(nums, target) {"]],
                [["#8b8f99", "  "], ["#c99bff", "const"], ["#f5f5f6", " seen"], ["#8b8f99", " = "], ["#c99bff", "new"], ["#8aa2ff", " Map"], ["#8b8f99", "();"]],
                [["#8b8f99", "  // ...your solution"]],
                [["#8b8f99", "}"]],
              ].map((line, i) => (
                <div key={i} className="flex gap-3 whitespace-pre">
                  <span className="select-none text-right text-[color:var(--color-fg-faint)]" style={{ width: 14 }}>{i + 1}</span>
                  <span>
                    {line.map(([c, txt], j) => (
                      <span key={j} style={{ color: c }}>{txt}</span>
                    ))}
                    {i === 2 && <span className="caret ml-0.5" />}
                  </span>
                </div>
              ))}
            </div>

            {/* contextual panel */}
            <div className="border-t" style={{ borderColor: "var(--color-line)", background: "var(--color-panel-2)" }}>
              <ContextPanel active={active} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
