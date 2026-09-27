import Link from 'next/link';
import { Trophy, Sparkles, Filter } from 'lucide-react';
import { prisma } from '../lib/prisma';
import Podium from '../components/leaderboard/Podium';
import RankTable from '../components/leaderboard/RankTable';

export const metadata = {
  title: 'Official Standings & Leaderboard | All Pakistan Quiz Society',
  description: 'National quizzing rankings, points matrix, and champion standings for collegiate and open quizzers in Pakistan.',
};

export const revalidate = 60;

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year: yearParam } = await searchParams;
  const isAllTime = !yearParam || yearParam === 'all';
  const targetYear = isAllTime ? 0 : parseInt(yearParam, 10);

  // Parallel single queries to avoid N+1 queries
  const [rankings, availableYears] = await Promise.all([
    prisma.leaderboard.findMany({
      where: {
        year: targetYear,
        totalPoints: { gt: 0 },
      },
      orderBy: [{ totalPoints: 'desc' }, { wins: 'desc' }, { runnerUps: 'desc' }],
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            university: true,
            city: true,
          },
        },
      },
    }),
    prisma.leaderboard.findMany({
      where: { year: { gt: 0 } },
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'desc' },
    }),
  ]);

  const topThree = rankings.slice(0, 3);
  const remaining = rankings.slice(3);

  return (
    <div className="min-h-[85vh] pt-8 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-xs font-semibold text-accent mb-3">
            <Trophy className="w-3.5 h-3.5" />
            <span>National Circuit Rankings</span>
          </div>
          <h1 className="text-4xl font-heading font-black text-foreground tracking-tight">
            Pakistan Quizzing Leaderboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Points earned through official championship wins (10 pts) and runner-up finishes (5 pts) across sanctioned national tournaments.
          </p>
        </div>

        {/* Year Filter Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center rounded-xl bg-surface-2 border border-border p-1">
            <Link
              href="/leaderboard?year=all"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isAllTime
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All-Time
            </Link>

            {availableYears.map((y) => (
              <Link
                key={y.year}
                href={`/leaderboard?year=${y.year}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  yearParam === String(y.year)
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {y.year}
              </Link>
            ))}

            {availableYears.length === 0 && (
              <Link
                href={`/leaderboard?year=${new Date().getFullYear()}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  yearParam === String(new Date().getFullYear())
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {new Date().getFullYear()}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Podium for Top 3 */}
      {topThree.length > 0 ? (
        <Podium topThree={topThree} />
      ) : (
        <div className="rounded-3xl border border-dashed border-border bg-surface/50 p-12 text-center text-xs text-muted-foreground">
          <Trophy className="mx-auto h-12 w-12 text-accent/40 mb-3" />
          <h3 className="font-heading font-bold text-lg text-foreground mb-1">
            No Standings Recorded Yet
          </h3>
          <p className="max-w-md mx-auto">
            Once tournaments conclude and the President declares winners in the dashboard, player scores and rankings will populate here automatically.
          </p>
        </div>
      )}

      {/* Ranks 4+ Table */}
      {remaining.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-lg text-foreground">
            Circuit Standings (Rank #4+)
          </h3>
          <RankTable rankings={remaining} startIndex={4} />
        </div>
      )}
    </div>
  );
}
