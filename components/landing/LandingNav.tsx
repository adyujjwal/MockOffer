"use client";

import * as React from "react";
import Link from "next/link";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { MockOfferLogo } from "../MockOfferLogo";
import { ArrowRight, Menu, X } from "../ui/icons";

const LINKS = [
  { label: "Practice", href: "#practice" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
];

export const LandingNav: React.FC = () => {
  const { isSignedIn } = useAuth();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4">
      <nav
        className={`glass mt-3 flex w-full max-w-6xl items-center justify-between rounded-full px-4 transition-all duration-300 ${
          scrolled ? "py-1.5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.9)]" : "py-2.5"
        }`}
      >
        <Link href="/" aria-label="MockOffer home" className="shrink-0">
          <MockOfferLogo size={scrolled ? 24 : 27} showCursor={false} />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-sm text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-fg)]"
            >
              {l.label}
            </a>
          ))}
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

      {/* mobile sheet */}
      {open && (
        <div className="glass animate-scale-in fixed inset-x-4 top-[4.5rem] z-50 rounded-2xl p-3 md:hidden">
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
