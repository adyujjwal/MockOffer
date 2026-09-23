'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { MockOfferLogo } from '../components/MockOfferLogo';
import { AppBackground } from '../components/ui/AppBackground';
import { Alert, Reset, ArrowLeft } from '../components/ui/icons';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, forward this to your error-tracking service (e.g. Sentry).
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <AppBackground />
      <MockOfferLogo size={30} />
      <div className="card mt-8 max-w-md p-8">
        <span
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: 'rgba(240,119,107,0.12)', color: 'var(--color-danger)' }}
        >
          <Alert size={26} />
        </span>
        <h1 className="mt-5 text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-[color:var(--color-fg-muted)]">
          An unexpected error interrupted this page. You can try again, or head back to your
          dashboard.
        </p>
        {error.digest && (
          <p className="mono mt-3 text-xs text-[color:var(--color-fg-faint)]">
            Ref: {error.digest}
          </p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={reset} className="btn btn-primary">
            <Reset size={16} />
            Try again
          </button>
          <Link href="/dashboard" className="btn btn-secondary">
            <ArrowLeft size={16} />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
