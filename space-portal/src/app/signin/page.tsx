'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, FileText, FolderOpen, Mail, ShieldCheck } from 'lucide-react';
import { LandingPageShell } from '@/components/landing/LandingPageShell';

const AUTH_ERRORS: Record<string, string> = {
  Configuration:
    'Server auth is misconfigured. Ensure NEXTAUTH_SECRET, NEXTAUTH_URL, AZURE_AD_CLIENT_ID, and AZURE_AD_CLIENT_SECRET are set in Netlify.',
  AccessDenied:
    'Access was denied. If you use a work/school account, your IT admin may need to approve the SPLI app in Azure AD.',
  Verification:
    'The sign-in link expired or was already used. Please try again.',
  OAuthSignin: 'Could not start Microsoft sign-in. Check Azure AD app registration settings.',
  OAuthCallback:
    'Microsoft sign-in callback failed. Verify the redirect URI in Azure matches your site URL.',
  OAuthCreateAccount: 'Could not create your account after sign-in.',
  Callback: 'Sign-in callback failed. The site URL may not match NEXTAUTH_URL in Netlify.',
  Default: 'Sign-in failed. Please try again or contact support.',
};

function SignInPortalVisual() {
  const stats = [
    { icon: FileText, label: 'Applications' },
    { icon: FolderOpen, label: 'Documents' },
    { icon: Mail, label: 'Messages' },
  ];

  const connectionSteps = [
    { label: 'Microsoft SSO', detail: 'Identity provider ready', status: 'ready' as const },
    { label: 'Workspace', detail: 'Unlocks after sign-in', status: 'pending' as const },
    { label: 'Dashboard', detail: 'Redirect on success', status: 'pending' as const },
  ];

  return (
    <div className="hidden lg:block">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 shadow-xl shadow-black/20">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-500/[0.07] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 left-8 h-32 w-32 rounded-full bg-violet-500/[0.06] blur-3xl" />

        <div className="relative flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400/80" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
              Session gateway
            </span>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white/40">
            Awaiting auth
          </span>
        </div>

        <div className="relative mt-5 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {stats.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-3"
              >
                <Icon className="mb-2 h-3.5 w-3.5 text-blue-300/70" />
                <p className="text-[10px] font-medium uppercase tracking-wide text-white/35">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-4">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400/70" />
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/35">
                Connection status
              </p>
            </div>
            <div className="space-y-2.5">
              {connectionSteps.map(({ label, detail, status }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        status === 'ready' ? 'bg-emerald-400/80' : 'bg-white/20'
                      }`}
                    />
                    <div>
                      <p className="text-xs font-medium text-white/75">{label}</p>
                      <p className="text-[11px] text-white/35">{detail}</p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-medium uppercase tracking-wide ${
                      status === 'ready'
                        ? 'text-emerald-400/70'
                        : 'animate-pulse text-red-400'
                    }`}
                  >
                    {status === 'ready' ? 'Ready' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.14em] text-white/30">
        <span>Microsoft SSO</span>
        <span className="text-white/15">·</span>
        <span>Encrypted</span>
        <span className="text-white/15">·</span>
        <span>Work account</span>
      </div>
    </div>
  );
}

function SignInContent() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('error');
  const errorMessage = errorCode
    ? AUTH_ERRORS[errorCode] || AUTH_ERRORS.Default
    : null;

  useEffect(() => {
    if (errorCode) {
      setIsLoading(false);
    }
  }, [errorCode]);

  const handleMicrosoftSignIn = async () => {
    try {
      setIsLoading(true);
      const callbackUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/dashboard`
          : '/dashboard';

      await signIn('azure-ad', {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error('Error signing in with Microsoft:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <div className="text-center lg:text-left">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/40">
          SPLI portal
        </p>
        <h1 className="mt-4 text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.02em] text-white">
          Welcome to SPLI
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-white/55 md:text-lg lg:mx-0 mx-auto">
          Sign in to access your aerospace licensing portal
        </p>
      </div>

      <div className="mt-10 grid w-full items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-16">
        <SignInPortalVisual />

        <div className="w-full">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-black/40 backdrop-blur-md">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            aria-hidden
          />

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-xl font-semibold text-white">Sign In</h2>
            <p className="mt-2 text-sm text-white/50">Use your Microsoft account to continue</p>
          </div>

          {errorMessage && (
            <Alert className="mb-6 border-orange-500/50 bg-orange-950/30 text-orange-100">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              <AlertTitle className="text-orange-200">Sign-in failed</AlertTitle>
              <AlertDescription className="mt-1 text-sm text-orange-100/90">
                {errorMessage}
                {errorCode && (
                  <span className="mt-2 block text-xs text-orange-300/70">
                    Error code: {errorCode}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleMicrosoftSignIn}
            disabled={isLoading}
            className="group mb-6 h-14 w-full rounded-xl border-0 bg-white text-base font-semibold text-gray-900 shadow-lg transition-all duration-200 hover:bg-gray-100 hover:shadow-xl"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="mr-3 h-5 w-5 animate-spin rounded-full border-b-2 border-gray-900" />
                Signing in...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 0h11v11H0z" />
                  <path d="M12 0h11v11H12z" />
                  <path d="M0 12h11v11H0z" />
                  <path d="M12 12h11v11H12z" />
                </svg>
                Continue with Microsoft
              </div>
            )}
          </Button>

          <div className="rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3">
            <p className="text-center text-xs leading-relaxed text-white/45 lg:text-left">
              By signing in, you agree to our{' '}
              <a
                href="/terms-of-service"
                className="text-blue-400 transition-colors hover:text-blue-300"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="/privacy-policy"
                className="text-blue-400 transition-colors hover:text-blue-300"
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-white/40 lg:text-left">
          Need help?{' '}
          <a
            href="https://calendly.com/harikesh-tambareni/spli-ai-demo?month=2025-06"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-400 transition-colors hover:text-blue-300"
          >
            Schedule a demo
          </a>
        </p>
        </div>
      </div>
    </div>
  );
}

function SignInFallback() {
  return (
    <div className="mx-auto w-full max-w-md animate-pulse space-y-6">
      <div className="space-y-3 text-center">
        <div className="mx-auto h-3 w-24 rounded bg-white/10" />
        <div className="mx-auto h-10 w-64 rounded bg-white/10" />
        <div className="mx-auto h-4 w-72 rounded bg-white/10" />
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <div className="mb-8 space-y-2">
          <div className="h-6 w-24 rounded bg-white/10" />
          <div className="h-4 w-48 rounded bg-white/10" />
        </div>
        <div className="h-14 w-full rounded-xl bg-white/10" />
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <LandingPageShell variant="hero">
      <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 pb-16 pt-28 lg:px-12">
        <Suspense fallback={<SignInFallback />}>
          <SignInContent />
        </Suspense>
      </main>
    </LandingPageShell>
  );
}
