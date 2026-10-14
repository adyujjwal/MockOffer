import * as React from "react";
import { MockOfferLogo } from "../MockOfferLogo";

export const LandingFooter: React.FC = () => {
  return (
    <footer className="relative border-t" style={{ borderColor: "var(--color-line)" }}>
      <div className="flex w-full flex-col items-start justify-between gap-6 px-6 py-12 sm:flex-row sm:items-center lg:px-12">
        <div>
          <MockOfferLogo size={26} />
          <p className="mt-3 max-w-xs text-sm text-[color:var(--color-fg-subtle)]">
            The AI interview simulator for engineers who practice like it&rsquo;s real.
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-[color:var(--color-fg-subtle)]">
          <a href="#practice" className="transition-colors hover:text-[color:var(--color-fg)]">Practice</a>
          <a href="#how-it-works" className="transition-colors hover:text-[color:var(--color-fg)]">How it works</a>
          <a href="#features" className="transition-colors hover:text-[color:var(--color-fg)]">Features</a>
        </div>
      </div>
      <div className="border-t px-6 py-5 lg:px-12" style={{ borderColor: "var(--color-line)" }}>
        <div className="flex w-full items-center justify-between text-xs text-[color:var(--color-fg-faint)]">
          <span>© {new Date().getFullYear()} MockOffer</span>
          <span className="mono">mockoffer.live</span>
        </div>
      </div>
    </footer>
  );
};
