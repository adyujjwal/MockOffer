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
      <section
        id="practice"
        className="relative w-full overflow-hidden px-6 pb-12 pt-32 sm:pt-40 lg:px-12"
      >
        {/* centered editorial copy */}
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <Reveal>
            <h1
              className="font-display display-hero text-balance"
              style={{ fontWeight: 700 }}
            >
              <span style={{ color: "var(--color-fg)" }}>Practice coding interviews.</span>
              <br />
              <span className="font-display-italic text-gradient-gold-anim">Like they&rsquo;re real.</span>
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-7 max-w-2xl text-balance text-lg font-medium leading-relaxed text-[color:var(--color-fg-muted)]">
              AI-powered mock interviews that challenge your problem solving, analyze your code,
              and show you exactly where it breaks and how to improve.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <PrimaryCTA full />
              <a href="#how-it-works" className="btn btn-secondary btn-lg w-full justify-center sm:w-auto">
                See how it works
              </a>
            </div>
          </Reveal>
        </div>

        {/* live session workspace, centered below */}
        <Reveal delay={320} className="relative mx-auto mt-16 block min-w-0 max-w-4xl">
          {/* warm brand bloom */}
          <div
            className="glow-breathe pointer-events-none absolute -inset-10 -z-10 rounded-[3rem]"
            style={{ background: "radial-gradient(ellipse at 50% 4%, rgba(230,178,74,0.16), transparent 72%)" }}
          />
          {/* cool technical focus glow */}
          <div
            className="focus-glow pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem]"
            style={{ background: "radial-gradient(ellipse at 50% 70%, rgba(138,162,255,0.12), transparent 68%)" }}
          />

          <div className="hero-float relative">
            {/* framing ticks (iris technical chrome) */}
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
                  style={{ borderColor: "rgba(138,162,255,0.4)" }}
                />
              ))}
            </div>
            <div className="overflow-hidden rounded-[18px]" style={{ boxShadow: "var(--shadow-lift)" }}>
              <InterviewPreview />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between px-1">
            <span className="tech">Live session preview</span>
            <span className="tech text-iris">twoSum · O(n)</span>
          </div>
        </Reveal>

        {/* scroll cue */}
        <Reveal delay={420} className="mt-16 hidden justify-center lg:flex">
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
      <section className="relative w-full px-6 pb-28 lg:px-12">
        <Reveal>
          <div className="card relative overflow-hidden px-6 py-20 text-center sm:px-16 sm:py-28">
            {/* layered spotlight: warm brand bloom over a cool technical grid */}
            <div className="bg-grid-iris absolute inset-0 opacity-40" aria-hidden="true" style={{ maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent 75%)" }} />
            <div className="bg-aurora" />
            <div className="noise absolute inset-0 opacity-[0.015]" aria-hidden="true" />
            {/* ambient status transition: INTERVIEW -> READY */}
            <div className="relative mx-auto mb-8 flex items-center justify-center gap-3 text-[color:var(--color-fg-faint)]">
              <span className="tech line-through decoration-[color:var(--color-fg-faint)]/60">Interview</span>
              <ArrowRight size={14} className="text-iris" />
              <span className="tech" style={{ color: "var(--color-gold-bright)" }}>Ready</span>
            </div>
            <div className="relative">
              <h2 className="font-display display-cta text-balance">
                Your next interview
                <br className="hidden sm:block" />
                <span className="font-display-italic text-gradient-gold"> starts here.</span>
              </h2>
              <p className="mx-auto mt-6 max-w-lg text-lg text-[color:var(--color-fg-muted)]">
                Think clearly. Code precisely. Know exactly what to improve before it counts.
              </p>
              <div className="mt-10 flex justify-center">
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
