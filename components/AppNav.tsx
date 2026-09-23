"use client";

import * as React from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { MockOfferLogo } from "./MockOfferLogo";
import { ArrowLeft } from "./ui/icons";

/**
 * Sticky top bar for the authenticated app area. `center` accepts contextual
 * content (e.g. the interview timer / controls).
 */
export const AppNav: React.FC<{
  back?: { href: string; label?: string };
  center?: React.ReactNode;
  right?: React.ReactNode;
}> = ({ back, center, right }) => {
  return (
    <header className="sticky top-0 z-40">
      <div className="glass border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {back && (
              <Link
                href={back.href}
                className="btn btn-ghost btn-sm -ml-2"
                aria-label={back.label || "Back"}
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">{back.label || "Back"}</span>
              </Link>
            )}
            <Link href="/dashboard" aria-label="MockOffer home" className="shrink-0">
              <MockOfferLogo size={26} showCursor={false} />
            </Link>
          </div>

          {center && <div className="flex min-w-0 flex-1 items-center justify-center">{center}</div>}

          <div className="flex shrink-0 items-center gap-3">
            {right}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 rounded-full ring-1 ring-[color:var(--color-line-strong)]",
                },
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
