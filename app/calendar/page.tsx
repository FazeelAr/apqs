import { prisma } from '../lib/prisma';
import EventCalendar from '../components/events/EventCalendar';
import { Calendar as CalendarIcon, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Tournament Calendar | All Pakistan Quiz Society',
  description: 'Monthly schedule and interactive calendar of national quizzing tournaments, intra-city meets, and collegiate quiz bowls.',
};

export const revalidate = 60;

export default async function CalendarPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const startDate = new Date(Date.UTC(year, month, 1));
  const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  // Single fast query for initial month
  const events = await prisma.event.findMany({
    where: {
      status: { in: ['approved', 'concluded'] },
      eventDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { eventDate: 'asc' },
    select: {
      id: true,
      slug: true,
      title: true,
      eventDate: true,
      eventTime: true,
      venue: true,
      status: true,
    },
  });

  return (
    <div className="min-h-[85vh] pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Calendar</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-foreground">
          Society Schedule & Calendar
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track upcoming quiz competitions, dates, venues, and registration deadlines across the nationwide circuit.
        </p>
      </div>

      <EventCalendar
        initialEvents={events.map((e) => ({
          ...e,
          eventDate: e.eventDate.toISOString(),
        }))}
      />
    </div>
  );
}
