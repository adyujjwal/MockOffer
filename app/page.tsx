'use client';

import Link from "next/link";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { LandingNav } from "../components/landing/LandingNav";
import { FeatureSection } from "../components/landing/FeatureSection";
import { HowItWorks } from "../components/landing/HowItWorks";
import { LandingFooter } from "../components/landing/LandingFooter";
import { InterviewPreview } from "../components/InterviewPreview";
import { AppBackground } from "../components/ui/AppBackground";
import { Reveal } from "../components/ui/Reveal";
import { ArrowRight, Sparkle, Code, Activity, Layers, Gauge } from "../components/ui/icons";

const CAPABILITIES = [
  { label: "AI interviewer", Icon: Sparkle },
  { label: "Real coding problems", Icon: Code },
  { label: "Real-time feedback", Icon: Activity },
  { label: "Monaco editor", Icon: Layers },
  { label: "Performance analysis", Icon: Gauge },
];

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

      {/* Hero */}
      <section id="practice" className="relative mx-auto w-full max-w-6xl overflow-hidden px-5 pb-20 pt-36 sm:pt-44">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="badge badge-gold mx-auto">
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-gold)", animation: "breathe 2.4s ease-in-out infinite" }} />
              AI-powered coding interviews
            </span>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.04] tracking-tight sm:text-7xl">
              Practice coding interviews.
              <br />
              <span className="text-gradient-gold">Like they&rsquo;re real.</span>
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto mt-6 max-w-xl text-lg text-[color:var(--color-fg-muted)]">
              AI-powered mock interviews that challenge your problem solving, analyze your code,
              and show you exactly where it breaks and how to improve.
            </p>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <PrimaryCTA />
              <a href="#how-it-works" className="btn btn-secondary btn-lg">
                See how it works
              </a>
            </div>
          </Reveal>
        </div>

        {/* Hero visual */}
        <Reveal delay={220} className="mt-16">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[18px]">
            <div
              className="absolute -inset-x-8 -top-8 bottom-0 -z-10 rounded-[2rem]"
              style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(230,178,74,0.12), transparent 70%)" }}
            />
            <InterviewPreview />
          </div>
        </Reveal>
      </section>

      {/* Trust / capability strip */}
      <section className="relative mx-auto max-w-6xl px-5 pb-8">
        <Reveal>
          <p className="text-center text-sm text-[color:var(--color-fg-subtle)]">
            Built for serious software engineers.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            {CAPABILITIES.map(({ label, Icon }) => (
              <span key={label} className="badge px-3.5 py-2">
                <Icon size={15} className="text-[color:var(--color-gold-bright)]" />
                {label}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      <FeatureSection />
      <HowItWorks />

      {/* Closing CTA */}
      <section className="relative mx-auto max-w-6xl px-5 pb-28">
        <Reveal>
          <div className="card card-glow relative overflow-hidden px-6 py-16 text-center sm:px-16">
            <div className="bg-aurora" />
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
