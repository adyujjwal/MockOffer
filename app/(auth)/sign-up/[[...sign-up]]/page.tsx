import { SignUp } from '@clerk/nextjs';
import { MockOfferLogo } from '../../../../components/MockOfferLogo';

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen luxury-noir-theme">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <MockOfferLogo size="md" />
          </div>
          <p className="text-muted">Create your account to start practicing</p>
        </div>
        <div className="card-luxury border border-border rounded-lg p-8">
          <SignUp 
            routing="hash"
            forceRedirectUrl="/dashboard"
            signInForceRedirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}