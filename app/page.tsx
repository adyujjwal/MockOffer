'use client';

import Link from "next/link";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { LandingNav } from "../components/landing/LandingNav";
import { CapabilityStrip } from "../components/landing/CapabilityStrip";
import { FeatureSection } from "../components/landing/FeatureSection";
import { DeveloperWorkspace } from "../components/landing/DeveloperWorkspace";
import { HowItWorks } from "../components/landing/HowItWorks";
import { LandingFooter } from "../components/landing/LandingFooter";
import { InterviewPreview } from "../components/InterviewPreview";
import { AppBackground } from "../components/ui/AppBackground";
import { Reveal } from "../components/ui/Reveal";
import { ArrowRight, ChevronDown } from "../components/ui/icons";

export default function Home() {
  const { isSignedIn } = useAuth();

  const PrimaryCTA = ({ full }: { full?: boolean }) =>
    isSignedIn ? (
      <Link href="/dashboard" className={`btn btn-primary btn-lg ${full ? "w-full sm:w-auto" : ""}`}>
        Go to dashboard
        <ArrowRight size={18} className="btn-arrow" />
      </Link>
    ) : (
      <SignInButton mode="modal">
        <button className={`btn btn-primary btn-lg ${full ? "w-full sm:w-auto" : ""}`}>
          Start a mock interview
          <ArrowRight size={18} className="btn-arrow" />
        </button>
      </SignInButton>
    );

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <AppBackground variant="landing" />
      <LandingNav />

      {/* ── Hero ── */}
      <section id="practice" className="relative mx-auto w-full max-w-6xl overflow-hidden px-5 pb-10 pt-32 sm:pt-40">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-12">
          {/* Left: editorial copy */}
          <div className="relative min-w-0">
            {/* technical corner tick */}
            <span
              className="absolute -left-5 top-1 hidden h-10 w-px lg:block"
              style={{ background: "linear-gradient(to bottom, var(--color-gold), transparent)" }}
            />
            <Reveal>
              <span className="badge badge-gold">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--color-gold)", animation: "breathe 2.4s ease-in-out infinite" }}
                />
                AI-powered coding interviews
              </span>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.03] tracking-tight sm:text-6xl xl:text-7xl">
                Practice coding interviews.
                <br />
                <span className="text-gradient-gold">Like they&rsquo;re real.</span>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[color:var(--color-fg-muted)]">
                AI-powered mock interviews that challenge your problem solving, analyze your code,
                and show you exactly where it breaks and how to improve.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <PrimaryCTA full />
                <a href="#how-it-works" className="btn btn-secondary btn-lg w-full justify-center sm:w-auto">
                  See how it works
                </a>
              </div>
            </Reveal>
          </div>

          {/* Right: live session */}
          <Reveal delay={160} className="relative min-w-0">
            {/* ambient bloom */}
            <div
              className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem]"
              style={{ background: "radial-gradient(ellipse at 60% 0%, rgba(230,178,74,0.12), transparent 70%)" }}
            />
            {/* framing ticks */}
            <div className="pointer-events-none absolute -inset-3 hidden sm:block" aria-hidden="true">
              {[
                "left-0 top-0 border-l border-t",
                "right-0 top-0 border-r border-t",
                "left-0 bottom-0 border-l border-b",
                "right-0 bottom-0 border-r border-b",
              ].map((pos) => (
                <span
                  key={pos}
                  className={`absolute h-4 w-4 ${pos}`}
                  style={{ borderColor: "var(--color-line-strong)" }}
                />
              ))}
            </div>
            <div className="overflow-hidden rounded-[18px]">
              <InterviewPreview />
            </div>
            <div className="mt-3 flex items-center justify-between px-1">
              <span className="tech">Live session preview</span>
              <span className="tech">twoSum · O(n)</span>
            </div>
          </Reveal>
        </div>

        {/* scroll cue */}
        <Reveal delay={260} className="mt-14 hidden justify-center lg:flex">
          <a
            href="#how-it-works"
            className="flex flex-col items-center gap-2 text-[color:var(--color-fg-faint)] transition-colors hover:text-[color:var(--color-fg-subtle)]"
            aria-label="Scroll to how it works"
          >
            <span className="tech">Scroll</span>
            <ChevronDown size={16} style={{ animation: "float 2.4s ease-in-out infinite" }} />
          </a>
        </Reveal>
      </section>

      {/* ── Capability ledger ── */}
      <CapabilityStrip />

      {/* ── The system ── */}
      <FeatureSection />

      {/* ── Built for developers ── */}
      <DeveloperWorkspace />

      {/* ── How it works ── */}
      <HowItWorks />

      {/* ── Closing CTA ── */}
      <section className="relative mx-auto w-full max-w-6xl px-5 pb-28">
        <Reveal>
          <div className="card relative overflow-hidden px-6 py-16 text-center sm:px-16 sm:py-20">
            <div className="bg-aurora" />
            <div className="noise absolute inset-0 opacity-[0.015]" aria-hidden="true" />
            {/* ambient status transition: INTERVIEW -> READY */}
            <div className="relative mx-auto mb-7 flex items-center justify-center gap-3 text-[color:var(--color-fg-faint)]">
              <span className="tech line-through decoration-[color:var(--color-fg-faint)]/60">Interview</span>
              <ArrowRight size={14} />
              <span className="tech" style={{ color: "var(--color-gold-bright)" }}>Ready</span>
            </div>
            <div className="relative">
              <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                Your next interview starts here.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-[color:var(--color-fg-muted)]">
                Think clearly. Code precisely. Know exactly what to improve before it counts.
              </p>
              <div className="mt-8 flex justify-center">
                <PrimaryCTA />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <LandingFooter />
    </div>
  );
}
