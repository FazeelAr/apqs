import { prisma } from '../../lib/prisma';
import DeclareResultsClient from './DeclareResultsClient';

export default async function DashboardResultsPage() {
  // Batch query to prevent N+1 queries
  const [events, users] = await Promise.all([
    prisma.event.findMany({
      orderBy: { eventDate: 'desc' },
      select: {
        id: true,
        title: true,
        eventDate: true,
        venue: true,
        status: true,
        result: {
          select: {
            winnerId: true,
            runnerUpId: true,
            secondRunnerUpId: true,
            notes: true,
          },
        },
      },
    }),
    prisma.profile.findMany({
      orderBy: { fullName: 'asc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        university: true,
      },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-heading font-black text-foreground">
          Declare Tournament Winners
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Select a completed tournament, designate the champions, and automatically update player standings on the nationwide leaderboard.
        </p>
      </div>

      <DeclareResultsClient events={events} users={users} />
    </div>
  );
}
