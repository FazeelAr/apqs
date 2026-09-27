import Link from 'next/link';
import { Calendar, PlusCircle, Search, Trophy, Sparkles } from 'lucide-react';
import { prisma } from '../lib/prisma';
import EventCard from '../components/events/EventCard';

export const metadata = {
  title: 'Quiz Events & Tournaments | All Pakistan Quiz Society',
  description: 'Explore upcoming and past quizzing tournaments, championships, and intra-university quiz bowls across Pakistan.',
};

export const revalidate = 60;

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const { status, search } = await searchParams;

  const where: any = {};

  if (status === 'upcoming') {
    where.status = 'approved';
    where.eventDate = { gte: new Date() };
  } else if (status === 'concluded') {
    where.status = 'concluded';
  } else {
    where.status = { in: ['approved', 'concluded'] };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { venue: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Single optimized query with eager loading to prevent N+1 queries
  const events = await prisma.event.findMany({
    where,
    orderBy: { eventDate: 'desc' },
    include: {
      creator: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          role: true,
        },
      },
      result: {
        include: {
          winner: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
          runnerUp: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
      },
    },
  });

  return (
    <div className="min-h-[85vh] pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>National Quiz Circuit</span>
          </div>
          <h1 className="text-4xl font-heading font-black text-foreground tracking-tight">
            Quizzing Events & Bowls
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Compete, spectate, and discover university championships, inter-city quiz bowls, and society meets across Pakistan.
          </p>
        </div>

        <Link
          href="/events/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary-light active:scale-95 transition-all self-start md:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Submit Event</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-2 border border-border w-full sm:w-auto">
          <Link
            href="/events"
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              !status
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Events
          </Link>
          <Link
            href="/events?status=upcoming"
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              status === 'upcoming'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Upcoming
          </Link>
          <Link
            href="/events?status=concluded"
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              status === 'concluded'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Concluded
          </Link>
        </div>

        {/* Search Input */}
        <form method="GET" action="/events" className="relative w-full sm:w-72">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            name="search"
            defaultValue={search || ''}
            placeholder="Search tournaments, venues..."
            className="w-full rounded-xl border border-border bg-surface-2 pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </form>
      </div>

      {/* Events Grid */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-2xl border border-dashed border-border bg-surface/50">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <h3 className="font-heading font-bold text-lg text-foreground mb-1">
            No Events Found
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">
            There are no events matching your selected criteria. Be the first to host or submit a quiz tournament!
          </p>
          <Link
            href="/events/create"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-light transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Submit a Quiz Event</span>
          </Link>
        </div>
      )}
    </div>
  );
}
