import Image from 'next/image';
import { Trophy, Medal, Award, Crown } from 'lucide-react';

interface RankedUser {
  id: string;
  totalPoints: number;
  wins: number;
  runnerUps: number;
  user: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    university?: string | null;
    city?: string | null;
  };
}

export default function Podium({ topThree }: { topThree: RankedUser[] }) {
  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  if (!first) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8 pb-4">
      {/* 2nd Place (Silver) */}
      <div className="order-2 md:order-1 flex flex-col items-center">
        {second ? (
          <div className="w-full rounded-2xl border border-border bg-surface p-5 text-center shadow-md relative hover:border-slate-400/50 transition-all hover:-translate-y-1">
            <div className="relative mx-auto mb-3 w-fit">
              {second.user.avatarUrl ? (
                <Image
                  src={second.user.avatarUrl}
                  alt={second.user.fullName}
                  width={64}
                  height={64}
                  className="rounded-full object-cover border-2 border-slate-400"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-slate-400/20 text-foreground font-bold flex items-center justify-center text-xl border-2 border-slate-400">
                  {second.user.fullName.charAt(0)}
                </div>
              )}
              <span className="absolute -top-2 -right-2 bg-slate-400 text-white rounded-full p-1.5 shadow-md">
                <Medal className="h-4 w-4" />
              </span>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Rank #2 • Runner-Up
            </span>
            <h4 className="font-heading font-bold text-base text-foreground truncate mt-0.5">
              {second.user.fullName}
            </h4>
            <p className="text-xs text-muted-foreground truncate mb-3">
              {second.user.university || second.user.city || 'Affiliated Quizzer'}
            </p>

            <div className="flex items-center justify-around border-t border-border pt-3 text-xs">
              <div>
                <span className="font-bold text-foreground">{second.wins}</span>
                <span className="text-[10px] text-muted-foreground block">Wins</span>
              </div>
              <div>
                <span className="font-bold text-accent">{second.totalPoints}</span>
                <span className="text-[10px] text-muted-foreground block">Points</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            Awaiting 2nd place contender
          </div>
        )}
      </div>

      {/* 1st Place (Gold Champion) */}
      <div className="order-1 md:order-2 flex flex-col items-center">
        <div className="w-full rounded-3xl border-2 border-accent/60 bg-gradient-to-b from-accent/10 via-surface to-surface p-6 text-center shadow-xl relative hover:border-accent transition-all hover:-translate-y-2">
          {/* Champion Crown Tag */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-neutral-900 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
            <Crown className="h-3.5 w-3.5 fill-current" />
            <span>National Champion</span>
          </div>

          <div className="relative mx-auto mt-2 mb-3 w-fit">
            {first.user.avatarUrl ? (
              <Image
                src={first.user.avatarUrl}
                alt={first.user.fullName}
                width={80}
                height={80}
                className="rounded-full object-cover border-4 border-accent shadow-lg"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-accent text-neutral-900 font-bold flex items-center justify-center text-2xl border-4 border-accent shadow-lg">
                {first.user.fullName.charAt(0)}
              </div>
            )}
            <span className="absolute -bottom-2 right-0 bg-accent text-neutral-900 rounded-full p-1.5 shadow-md">
              <Trophy className="h-4 w-4" />
            </span>
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
            Rank #1 • Best Quizzer
          </span>
          <h4 className="font-heading font-black text-lg text-foreground truncate mt-0.5">
            {first.user.fullName}
          </h4>
          <p className="text-xs text-muted-foreground truncate mb-4">
            {first.user.university || first.user.city || 'Affiliated Quizzer'}
          </p>

          <div className="flex items-center justify-around border-t border-accent/30 pt-3 text-xs bg-accent/5 rounded-xl p-2">
            <div>
              <span className="font-bold text-foreground text-sm">{first.wins}</span>
              <span className="text-[10px] text-muted-foreground block">Wins</span>
            </div>
            <div>
              <span className="font-bold text-foreground text-sm">{first.runnerUps}</span>
              <span className="text-[10px] text-muted-foreground block">2nd</span>
            </div>
            <div>
              <span className="font-black text-accent text-sm">{first.totalPoints}</span>
              <span className="text-[10px] text-muted-foreground block">Points</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3rd Place (Bronze) */}
      <div className="order-3 flex flex-col items-center">
        {third ? (
          <div className="w-full rounded-2xl border border-border bg-surface p-5 text-center shadow-md relative hover:border-amber-700/50 transition-all hover:-translate-y-1">
            <div className="relative mx-auto mb-3 w-fit">
              {third.user.avatarUrl ? (
                <Image
                  src={third.user.avatarUrl}
                  alt={third.user.fullName}
                  width={64}
                  height={64}
                  className="rounded-full object-cover border-2 border-amber-700"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-amber-700/20 text-foreground font-bold flex items-center justify-center text-xl border-2 border-amber-700">
                  {third.user.fullName.charAt(0)}
                </div>
              )}
              <span className="absolute -top-2 -right-2 bg-amber-700 text-white rounded-full p-1.5 shadow-md">
                <Award className="h-4 w-4" />
              </span>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
              Rank #3 • 2nd Runner-Up
            </span>
            <h4 className="font-heading font-bold text-base text-foreground truncate mt-0.5">
              {third.user.fullName}
            </h4>
            <p className="text-xs text-muted-foreground truncate mb-3">
              {third.user.university || third.user.city || 'Affiliated Quizzer'}
            </p>

            <div className="flex items-center justify-around border-t border-border pt-3 text-xs">
              <div>
                <span className="font-bold text-foreground">{third.wins}</span>
                <span className="text-[10px] text-muted-foreground block">Wins</span>
              </div>
              <div>
                <span className="font-bold text-accent">{third.totalPoints}</span>
                <span className="text-[10px] text-muted-foreground block">Points</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            Awaiting 3rd place contender
          </div>
        )}
      </div>
    </div>
  );
}
