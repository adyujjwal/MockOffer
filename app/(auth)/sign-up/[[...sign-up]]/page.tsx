import { SignUp } from '@clerk/nextjs';
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
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-1.5 text-sm text-[color:var(--color-fg-muted)]">
            Start practicing coding interviews like they&rsquo;re real.
          </p>
        </div>
        <div className="card p-6 sm:p-8">
          <SignUp
            routing="hash"
            forceRedirectUrl="/dashboard"
            signInForceRedirectUrl="/dashboard"
            appearance={clerkAppearance}
          />
        </div>
        <p className="mt-6 text-center text-sm text-[color:var(--color-fg-subtle)]">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-[color:var(--color-gold-bright)] hover:text-[color:var(--color-gold)]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
