'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('APQS App Error:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 shadow-lg mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-foreground">
            Something Went Wrong
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            An unexpected error occurred while loading this page. Our technical team has been notified.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-foreground-muted bg-surface-2 p-2 rounded-lg inline-block">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary-light active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-surface-2 active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
