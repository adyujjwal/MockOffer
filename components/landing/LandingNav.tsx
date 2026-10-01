"use client";

import * as React from "react";
import Link from "next/link";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { MockOfferLogo } from "../MockOfferLogo";
import { ArrowRight, Menu, X } from "../ui/icons";

const LINKS = [
  { label: "Practice", href: "#practice", id: "practice" },
  { label: "How it works", href: "#how-it-works", id: "how-it-works" },
  { label: "Features", href: "#features", id: "features" },
];

export const LandingNav: React.FC = () => {
  const { isSignedIn } = useAuth();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<string>("practice");

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active-section tracking.
  React.useEffect(() => {
    const ids = LINKS.map((l) => l.id);
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`transition-all duration-300 ${
          scrolled ? "glass border-b" : "border-b border-transparent"
        }`}
        style={scrolled ? undefined : { background: "transparent" }}
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" aria-label="MockOffer home" className="shrink-0">
            <MockOfferLogo size={25} showCursor={false} />
          </Link>

          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
            {LINKS.map((l) => {
              const isActive = active === l.id;
              return (
                <a
                  key={l.href}
                  href={l.href}
                  className="group relative px-3.5 py-2 text-sm transition-colors"
                  style={{ color: isActive ? "var(--color-fg)" : "var(--color-fg-muted)" }}
                >
                  {l.label}
                  <span
                    className="absolute inset-x-3 -bottom-0.5 h-px origin-center transition-transform duration-300"
                    style={{
                      background: "var(--color-gold)",
                      transform: isActive ? "scaleX(1)" : "scaleX(0)",
                    }}
                  />
                </a>
              );
            })}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {isSignedIn ? (
              <Link href="/dashboard" className="btn btn-primary btn-sm">
                Dashboard
                <ArrowRight size={16} className="btn-arrow" />
              </Link>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="btn btn-ghost btn-sm">Sign in</button>
                </SignInButton>
                <SignInButton mode="modal">
                  <button className="btn btn-primary btn-sm">
                    Get started
                    <ArrowRight size={16} className="btn-arrow" />
                  </button>
                </SignInButton>
              </>
            )}
          </div>

          <button
            className="btn btn-ghost btn-sm md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>
      </div>

      {/* mobile sheet */}
      {open && (
        <div className="glass animate-scale-in mx-4 mt-2 rounded-2xl p-3 md:hidden">
          <div className="flex flex-col">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm text-[color:var(--color-fg-muted)] hover:bg-white/5 hover:text-[color:var(--color-fg)]"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t pt-3" style={{ borderColor: "var(--color-line)" }}>
              {isSignedIn ? (
                <Link href="/dashboard" className="btn btn-primary" onClick={() => setOpen(false)}>
                  Go to dashboard
                  <ArrowRight size={16} className="btn-arrow" />
                </Link>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <button className="btn btn-secondary">Sign in</button>
                  </SignInButton>
                  <SignInButton mode="modal">
                    <button className="btn btn-primary">Get started</button>
                  </SignInButton>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
