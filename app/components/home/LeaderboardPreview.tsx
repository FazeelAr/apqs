import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Medal, ArrowRight, Sparkles, Award } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  university?: string | null;
  city?: string | null;
}

interface LeaderboardEntry {
  id: string;
  wins: number;
  runnerUps: number;
  totalPoints: number;
  user: LeaderboardUser;
}

interface LeaderboardPreviewProps {
  entries: LeaderboardEntry[];
}

export default function LeaderboardPreview({ entries }: LeaderboardPreviewProps) {
  if (!entries || entries.length === 0) {
    return null;
  }

  const medals = [
    {
      rank: 1,
      label: 'Champion',
      border: 'border-amber-400/40 hover:border-amber-400',
      bg: 'bg-gradient-to-b from-amber-500/10 via-surface to-surface',
      glow: 'shadow-[0_0_30px_rgba(251,191,36,0.12)]',
      badgeBg: 'bg-amber-400 text-black font-extrabold',
      iconColor: 'text-amber-400',
    },
    {
      rank: 2,
      label: '2nd Place',
      border: 'border-slate-300/40 hover:border-slate-300',
      bg: 'bg-gradient-to-b from-slate-400/10 via-surface to-surface',
      glow: 'shadow-[0_0_20px_rgba(148,163,184,0.1)]',
      badgeBg: 'bg-slate-300 text-black font-bold',
      iconColor: 'text-slate-300',
    },
    {
      rank: 3,
      label: '3rd Place',
      border: 'border-amber-700/40 hover:border-amber-700',
      bg: 'bg-gradient-to-b from-amber-700/10 via-surface to-surface',
      glow: 'shadow-[0_0_20px_rgba(180,83,9,0.1)]',
      badgeBg: 'bg-amber-700 text-white font-bold',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <section className="relative py-20 bg-surface-1 border-t border-border overflow-hidden" id="leaderboard-preview">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-xs font-semibold text-accent mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>National Circuit Standings</span>
          </div>
          <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Reigning{' '}
            <span className="bg-gradient-to-r from-accent via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Champions
            </span>
          </h2>
          <p className="mt-3 text-muted-foreground text-sm max-w-xl mx-auto">
            Pakistan’s highest ranked quizzers based on official national circuit championships, tournament victories, and points.
          </p>
        </div>

        {/* Podium Grid */}
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {entries.map((entry, index) => {
            const medal = medals[index] || medals[2];
            const user = entry.user;
            const initial = (user.fullName || 'Q').charAt(0).toUpperCase();

            return (
              <div
                key={entry.id}
                className={`relative flex flex-col items-center rounded-2xl border ${medal.border} ${medal.bg} p-6 text-center transition-all duration-300 hover:-translate-y-2 ${medal.glow}`}
              >
                {/* Rank Badge */}
                <div
                  className={`absolute -top-3.5 px-3 py-0.5 rounded-full text-xs shadow-md ${medal.badgeBg}`}
                >
                  #{medal.rank} {medal.label}
                </div>

                {/* Avatar */}
                <div className="mt-2 mb-4 relative">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.fullName}
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-full object-cover border-2 border-border/80 shadow-lg"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary border-2 border-primary/30">
                      {initial}
                    </div>
                  )}
                  <div
                    className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 border border-border shadow`}
                  >
                    <Trophy className={`h-4 w-4 ${medal.iconColor}`} />
                  </div>
                </div>

                {/* User Info */}
                <h3 className="font-heading font-bold text-lg text-foreground line-clamp-1">
                  {user.fullName}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {user.university || 'Independent Quizzer'}
                </p>
                {user.city && (
                  <span className="text-[11px] text-foreground-muted mt-0.5">
                    {user.city}
                  </span>
                )}

                {/* Points Matrix */}
                <div className="mt-5 w-full pt-4 border-t border-border/60 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-surface-2/60">
                    <span className="block text-xs text-muted-foreground">Points</span>
                    <span className="font-heading font-bold text-base text-accent">
                      {entry.totalPoints}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-2/60">
                    <span className="block text-xs text-muted-foreground">Wins</span>
                    <span className="font-heading font-bold text-base text-primary">
                      {entry.wins}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-2/60">
                    <span className="block text-xs text-muted-foreground">Finals</span>
                    <span className="font-heading font-bold text-base text-foreground">
                      {entry.wins + entry.runnerUps}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View Full Leaderboard Link */}
        <div className="mt-12 text-center">
          <Link
            href="/leaderboard"
            className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent hover:shadow-lg hover:shadow-accent/5"
            id="view-full-leaderboard"
          >
            <Trophy className="h-4 w-4 text-accent" />
            <span>View Full Leaderboard & Points Matrix</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
