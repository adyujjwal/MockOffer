import Link from 'next/link';
import { MockOfferLogo } from '../components/MockOfferLogo';
import { AppBackground } from '../components/ui/AppBackground';
import { ArrowRight } from '../components/ui/icons';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <AppBackground />
      <MockOfferLogo size={30} />
      <div className="mt-10">
        <div className="text-gradient-gold mono text-6xl font-semibold">404</div>
        <h1 className="mt-4 text-xl font-semibold">Page not found</h1>
        <p className="mt-2 max-w-sm text-sm text-[color:var(--color-fg-muted)]">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
        </p>
        <Link href="/" className="btn btn-primary mt-6">
          Back to home
          <ArrowRight size={16} className="btn-arrow" />
        </Link>
      </div>
    </div>
  );
}
