import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { MockOfferLogo } from '../../../../components/MockOfferLogo';
import { AppBackground } from '../../../../components/ui/AppBackground';
import { clerkAppearance } from '../../../../lib/clerkAppearance';

export default function Page() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <AppBackground />
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex" aria-label="MockOffer home">
            <MockOfferLogo size={30} />
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-[color:var(--color-fg-muted)]">
            Sign in to continue practicing.
          </p>
        </div>
        <div className="card p-6 sm:p-8">
          <SignIn
            routing="hash"
            forceRedirectUrl="/dashboard"
            signUpForceRedirectUrl="/dashboard"
            appearance={clerkAppearance}
          />
        </div>
        <p className="mt-6 text-center text-sm text-[color:var(--color-fg-subtle)]">
          New here?{' '}
          <Link href="/sign-up" className="text-[color:var(--color-gold-bright)] hover:text-[color:var(--color-gold)]">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
