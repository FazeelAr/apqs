import Link from 'next/link';
import { Compass, Trophy, Calendar, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg text-center space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-xs font-semibold text-accent">
          <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
          <span>Question Unanswered · Error 404</span>
        </div>

        <h1 className="font-heading font-black text-6xl sm:text-7xl text-foreground tracking-tight">
          Lost in the{' '}
          <span className="bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent">
            Circuit?
          </span>
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Looks like this round got away from us. The page or tournament you are searching for might have been concluded, rescheduled, or doesn’t exist.
        </p>

        {/* Quick Nav Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary-light active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            href="/events"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:border-primary hover:bg-surface-2 active:scale-95 transition-all"
          >
            <Calendar className="w-4 h-4 text-primary" />
            <span>Browse Events</span>
          </Link>

          <Link
            href="/leaderboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:border-accent hover:bg-surface-2 active:scale-95 transition-all"
          >
            <Trophy className="w-4 h-4 text-accent" />
            <span>Leaderboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
