'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Trophy,
  ArrowRight,
  ListFilter,
  Grid,
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  slug?: string | null;
  title: string;
  eventDate: string | Date;
  eventTime: string;
  venue: string;
  status: string;
}

export default function EventCalendar({ initialEvents }: { initialEvents: CalendarEvent[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[] | null>(null);
  const [selectedDateLabel, setSelectedDateLabel] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');
  const [isPending, startTransition] = useTransition();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Month navigation
  const navigateMonth = (delta: number) => {
    const nextDate = new Date(currentYear, currentMonth + delta, 1);
    setCurrentDate(nextDate);
    fetchEventsForDate(nextDate);
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    fetchEventsForDate(now);
  };

  const fetchEventsForDate = (date: Date) => {
    startTransition(async () => {
      try {
        const m = date.getMonth() + 1;
        const y = date.getFullYear();
        const res = await fetch(`/api/events/calendar?month=${m}&year=${y}`);
        const data = await res.json();
        if (data.events) {
          setEvents(data.events);
        }
      } catch (err) {
        console.error('Failed to load events for month:', err);
      }
    });
  };

  // Days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Map events by day number
  const eventsByDay: { [day: number]: CalendarEvent[] } = {};
  events.forEach((ev) => {
    const d = new Date(ev.eventDate);
    if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
      const dayNum = d.getDate();
      if (!eventsByDay[dayNum]) eventsByDay[dayNum] = [];
      eventsByDay[dayNum].push(ev);
    }
  });

  const today = new Date();
  const isThisMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;

  const handleDayClick = (dayNum: number, dayEvents: CalendarEvent[]) => {
    const d = new Date(currentYear, currentMonth, dayNum);
    setSelectedDateLabel(
      d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    );
    setSelectedDayEvents(dayEvents);
  };

  return (
    <div className="space-y-6">
      {/* Calendar Top Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <h2 className="font-heading font-black text-xl sm:text-2xl text-foreground">
            {monthName} <span className="text-primary">{currentYear}</span>
          </h2>
          {isPending && <span className="text-xs text-muted-foreground animate-pulse">Loading...</span>}
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-xl bg-surface-2 border border-border p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Month Grid"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                viewMode === 'agenda' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Agenda List"
            >
              <ListFilter className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={goToToday}
            className="rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-3 transition-colors cursor-pointer"
          >
            Today
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1.5 rounded-xl border border-border bg-surface-2 text-foreground hover:bg-surface-3 transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-1.5 rounded-xl border border-border bg-surface-2 text-foreground hover:bg-surface-3 transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or Agenda View */}
      {viewMode === 'grid' ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-border bg-surface-2 text-center text-xs font-bold text-muted-foreground py-3">
            {daysOfWeek.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border/60 bg-surface">
            {/* Blank leading days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[90px] sm:min-h-[120px] bg-surface-2/20 p-2" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isToday = isThisMonth && today.getDate() === dayNum;
              const dayEvents = eventsByDay[dayNum] || [];

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => handleDayClick(dayNum, dayEvents)}
                  className={`min-h-[90px] sm:min-h-[120px] p-2 transition-colors cursor-pointer hover:bg-primary/5 ${
                    isToday ? 'bg-primary/5 font-bold' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        isToday
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-foreground hover:text-primary'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="hidden sm:inline-block text-[10px] font-bold text-primary px-1.5 py-0.5 rounded-full bg-primary/10">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Event pills inside day cell */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((ev) => {
                      const isConcluded = ev.status === 'concluded';
                      return (
                        <div
                          key={ev.id}
                          className={`truncate rounded px-1.5 py-0.5 text-[10px] font-medium border ${
                            isConcluded
                              ? 'bg-surface-3 text-muted-foreground border-border'
                              : isToday
                              ? 'bg-accent/20 text-accent border-accent/40 font-bold'
                              : 'bg-primary/15 text-primary border-primary/30'
                          }`}
                        >
                          <span className="hidden sm:inline mr-1">{ev.eventTime}</span>
                          <span>{ev.title}</span>
                        </div>
                      );
                    })}

                    {dayEvents.length > 2 && (
                      <p className="text-[10px] text-muted-foreground font-semibold px-1">
                        +{dayEvents.length - 2} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda View */
        <div className="space-y-3">
          {events.length > 0 ? (
            events.map((ev) => {
              const d = new Date(ev.eventDate);
              const isConcluded = ev.status === 'concluded';
              return (
                <div
                  key={ev.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 text-center shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        {d.toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-xl font-heading font-black text-foreground">
                        {d.getDate()}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-heading font-bold text-base text-foreground mb-1">
                        {ev.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          <span>{ev.eventTime}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-accent" />
                          <span className="truncate max-w-[200px]">{ev.venue}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {isConcluded ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface-3 px-3 py-1 text-xs font-semibold text-muted-foreground">
                        <Trophy className="h-3 w-3" />
                        Concluded
                      </span>
                    ) : (
                      <span className="rounded-full bg-primary/20 text-primary px-3 py-1 text-xs font-semibold">
                        Upcoming
                      </span>
                    )}

                    <Link
                      href={`/events/${ev.slug || ev.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-light transition-colors"
                    >
                      <span>Details</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 rounded-2xl border border-border bg-surface text-muted-foreground text-xs">
              No events scheduled for this month.
            </div>
          )}
        </div>
      )}

      {/* Selected Day Modal / Details Drawer */}
      {selectedDayEvents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-foreground">
                  Events on {selectedDateLabel}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedDayEvents.length} event(s) scheduled
                </p>
              </div>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-2xl border border-border bg-surface-2 p-4 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-foreground mb-1">{ev.title}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          <span>{ev.eventTime}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-accent" />
                          <span className="truncate max-w-[240px]">{ev.venue}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="text-[11px] font-semibold capitalize text-primary">
                        {ev.status}
                      </span>
                      <Link
                        href={`/events/${ev.slug || ev.id}`}
                        onClick={() => setSelectedDayEvents(null)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-light"
                      >
                        <span>Full Details</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No tournaments or society meets on this day.
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="rounded-xl border border-border bg-surface-2 px-5 py-2 text-xs font-semibold text-foreground hover:bg-surface-3 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
