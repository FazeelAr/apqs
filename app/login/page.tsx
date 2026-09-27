'use client';

import { Suspense, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '../lib/supabase/client';
import { ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';

function LoginContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    searchParams.get('error') === 'auth_callback_failed'
      ? 'Authentication failed. Please try signing in again.'
      : null
  );

  const redirectTo = searchParams.get('redirectTo') || '/';

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const supabase = createClient();
      const origin = window.location.origin;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Top Decorative Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-light to-accent" />

          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-md animate-pulse-glow" />
              <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-primary/30 mx-auto shadow-lg bg-surface-2 p-1">
                <Image
                  src="/tab_icon.jpeg"
                  alt="APQS Emblem"
                  width={80}
                  height={80}
                  className="rounded-full object-cover w-full h-full"
                  priority
                />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)] text-foreground tracking-tight">
              Welcome to APQS
            </h1>
            <p className="mt-2 text-sm text-foreground-muted">
              All Pakistan Quiz Society — Gateway to National Quizzing
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Sign In Issue</p>
                <p className="text-xs text-red-400 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Sign In Button */}
          <button
            id="google-signin-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl
              bg-surface-2 hover:bg-surface-3 border border-border/80 hover:border-primary/50
              text-foreground font-medium text-sm transition-all duration-300
              hover:shadow-[0_4px_20px_rgba(27,94,32,0.15)] active:scale-[0.98]
              disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>Redirecting to Google...</span>
              </div>
            ) : (
              <>
                {/* Google SVG Icon */}
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Member Benefits */}
          <div className="mt-8 pt-6 border-t border-border/60">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-3">
              Why join APQS?
            </p>
            <ul className="space-y-2.5 text-xs text-foreground-muted">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Host and publish your own quiz events</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Compete for official national rankings</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Eligibility for the National Cabinet</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-center text-xs text-foreground-muted">
          By signing in, you agree to APQS competition rules and community guidelines.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
