import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { prisma } from '../../lib/prisma';
import EventsAdminClient from './EventsAdminClient';

export default async function DashboardEventsPage() {
  // Single eager-loaded query to avoid N+1 queries
  const events = await prisma.event.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      creator: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black text-foreground">
            Tournament Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review pending submissions, publish approved bowls, and manage concluded tournaments.
          </p>
        </div>

        <Link
          href="/events/create"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary-light active:scale-95 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Create New Event</span>
        </Link>
      </div>

      <EventsAdminClient initialEvents={events} />
    </div>
  );
}
