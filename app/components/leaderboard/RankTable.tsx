import Image from 'next/image';

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

export default function RankTable({
  rankings,
  startIndex = 4,
}: {
  rankings: RankedUser[];
  startIndex?: number;
}) {
  if (rankings.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-surface-2 text-muted-foreground uppercase font-bold">
            <tr>
              <th className="px-5 py-3.5 w-16 text-center">Rank</th>
              <th className="px-5 py-3.5">Quizzer</th>
              <th className="px-5 py-3.5">Affiliation</th>
              <th className="px-5 py-3.5 text-center">Wins</th>
              <th className="px-5 py-3.5 text-center">2nd Place</th>
              <th className="px-5 py-3.5 text-right">Total Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rankings.map((entry, idx) => {
              const rank = startIndex + idx;
              return (
                <tr key={entry.id} className="hover:bg-surface-2/40 transition-colors">
                  {/* Rank # */}
                  <td className="px-5 py-4 text-center font-bold text-foreground">
                    #{rank}
                  </td>

                  {/* Quizzer info */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {entry.user.avatarUrl ? (
                        <Image
                          src={entry.user.avatarUrl}
                          alt={entry.user.fullName}
                          width={36}
                          height={36}
                          className="rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-surface-3 flex items-center justify-center font-bold text-foreground shrink-0">
                          {(entry.user.fullName || 'U').charAt(0)}
                        </div>
                      )}
                      <span className="font-bold text-foreground truncate max-w-[200px]">
                        {entry.user.fullName}
                      </span>
                    </div>
                  </td>

                  {/* Affiliation */}
                  <td className="px-5 py-4 text-muted-foreground truncate max-w-[180px]">
                    {entry.user.university || entry.user.city || 'Independent'}
                  </td>

                  {/* Wins */}
                  <td className="px-5 py-4 text-center font-semibold text-primary">
                    {entry.wins}
                  </td>

                  {/* 2nd place */}
                  <td className="px-5 py-4 text-center font-semibold text-foreground">
                    {entry.runnerUps}
                  </td>

                  {/* Total Points */}
                  <td className="px-5 py-4 text-right">
                    <span className="inline-block px-3 py-1 rounded-xl bg-accent/10 border border-accent/20 font-black text-accent">
                      {entry.totalPoints} pts
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
