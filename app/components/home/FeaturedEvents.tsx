'use client';

import { ArrowRight, MapPin, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export interface FeaturedEventItem {
  id: string;
  slug?: string | null;
  title: string;
  description: string;
  imageUrl?: string | null;
  eventDate: Date | string;
  eventTime: string;
  venue: string;
  status: string;
}

interface FeaturedEventsProps {
  events?: FeaturedEventItem[];
}

export default function FeaturedEvents({ events = [] }: FeaturedEventsProps) {
  const displayEvents = events.length > 0 ? events : [];

  return (
    <section className="relative py-20" id="featured-events">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Upcoming{' '}
            <span className="bg-gradient-to-r from-primary to-primary-lighter bg-clip-text text-transparent">
              Events
            </span>
          </h2>
          <p className="mt-3 text-muted-foreground text-sm max-w-xl mx-auto">
            Explore and participate in national championships, collegiate quiz bowls, and monthly trivia events.
          </p>
        </div>

        {displayEvents.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayEvents.map((event, index) => {
              const dateObj = new Date(event.eventDate);
              const formattedDate = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <article
                  key={event.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border
                    border-border bg-card transition-all duration-500
                    hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5
                    hover:-translate-y-2"
                  style={{
                    animationDelay: `${index * 0.15}s`,
                  }}
                  id={`event-card-${event.id}`}
                >
                  {/* Event Image or Banner */}
                  {event.imageUrl ? (
                    <div className="relative h-44 w-full overflow-hidden bg-surface-3">
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 text-xs font-semibold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg">
                        {formattedDate}
                      </div>
                    </div>
                  ) : (
                    <div className="h-2 bg-gradient-to-r from-primary to-primary-light transition-all duration-300 group-hover:h-2.5" />
                  )}

                  <div className="flex flex-1 flex-col p-6">
                    {/* Status badge */}
                    <div className="mb-3 flex items-center justify-between">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full
                          bg-success/10 px-3 py-1 text-xs font-medium text-success"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                        Upcoming
                      </span>
                      {!event.imageUrl && (
                        <span className="text-xs text-muted-foreground font-medium">
                          {formattedDate}
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>

                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {event.description}
                    </p>

                    {/* Meta info */}
                    <div className="mt-4 flex flex-col gap-1.5 text-xs text-muted-foreground border-t border-border/50 pt-3">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{event.eventTime}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </span>
                    </div>

                    {/* Action */}
                    <div className="mt-5 border-t border-border pt-4">
                      <Link
                        href={`/events/${event.slug || event.id}`}
                        className="group/link inline-flex items-center gap-1.5 text-sm font-semibold
                          text-primary transition-colors duration-200 hover:text-primary-light"
                      >
                        View Details & Registration
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-12 border border-dashed border-border rounded-3xl bg-surface/50 max-w-xl mx-auto">
            <Calendar className="w-12 h-12 text-primary mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-foreground mb-1">
              New Tournaments Being Scheduled
            </h3>
            <p className="text-xs text-muted-foreground mb-6">
              Our national circuit calendar is currently preparing upcoming university quiz bowls.
            </p>
            <Link
              href="/events/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-light transition-all shadow-md"
            >
              Submit Your Society Event
            </Link>
          </div>
        )}

        {/* View all link */}
        <div className="mt-10 text-center">
          <Link
            href="/events"
            className="group inline-flex items-center gap-2 rounded-xl border border-border
              bg-card px-6 py-3 text-sm font-semibold text-foreground transition-all
              duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/5"
            id="view-all-events"
          >
            <span>View All Events</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
