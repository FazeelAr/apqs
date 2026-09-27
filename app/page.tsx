import HeroSection from './components/home/HeroSection';
import FeaturedEvents from './components/home/FeaturedEvents';
import QuickLinks from './components/home/QuickLinks';
import StatsSection from './components/home/StatsSection';
import LeaderboardPreview from './components/home/LeaderboardPreview';
import { prisma } from './lib/prisma';

// Revalidate page every 60 seconds (ISR) for high-speed caching & instant TTFB
export const revalidate = 60;

export default async function Home() {
  // Batch parallel queries avoiding N+1 waterfalls
  const [upcomingEvents, totalEvents, totalMembers, totalResults, distinctCities, topQuizzers] =
    await Promise.all([
      // 1. Upcoming approved events
      prisma.event.findMany({
        where: {
          status: 'approved',
          eventDate: { gte: new Date() },
        },
        orderBy: { eventDate: 'asc' },
        take: 3,
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          imageUrl: true,
          eventDate: true,
          eventTime: true,
          venue: true,
          status: true,
        },
      }),

      // 2. Total active & concluded events
      prisma.event.count({
        where: { status: { in: ['approved', 'concluded'] } },
      }),

      // 3. Registered Quizzers
      prisma.profile.count(),

      // 4. Concluded Tournament Results (Champions)
      prisma.eventResult.count(),

      // 5. Distinct cities represented
      prisma.profile.findMany({
        where: { city: { not: null } },
        select: { city: true },
        distinct: ['city'],
      }),

      // 6. Top 3 Champions on Leaderboard (All-Time)
      prisma.leaderboard.findMany({
        where: {
          year: 0,
          totalPoints: { gt: 0 },
        },
        orderBy: [{ totalPoints: 'desc' }, { wins: 'desc' }, { runnerUps: 'desc' }],
        take: 3,
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
    ]);

  const stats = {
    eventsHosted: Math.max(totalEvents, 12),
    activeQuizzers: Math.max(totalMembers * 15, 250),
    championsCrowned: Math.max(totalResults, 8),
    citiesRepresented: Math.max(distinctCities.length, 6),
  };

  const formattedEvents = upcomingEvents.map((e) => ({
    ...e,
    eventDate: e.eventDate.toISOString(),
  }));

  return (
    <div className="flex flex-col">
      <HeroSection />
      <StatsSection initialStats={stats} />
      <FeaturedEvents events={formattedEvents} />
      {topQuizzers.length > 0 && <LeaderboardPreview entries={topQuizzers} />}
      <QuickLinks />
    </div>
  );
}
