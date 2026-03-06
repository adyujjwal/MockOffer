import { SignIn } from '@clerk/nextjs';
import { MockOfferLogo } from '../../../../components/MockOfferLogo';

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen luxury-noir-theme">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <MockOfferLogo size="md" />
          </div>
          <p className="text-muted">Sign in to start practicing coding interviews</p>
        </div>
        <div className="card-luxury border border-border rounded-lg p-8">
          <SignIn 
            routing="hash"
            forceRedirectUrl="/dashboard"
            signUpForceRedirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}