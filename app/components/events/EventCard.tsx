import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, MapPin, Trophy, ArrowRight, FileText } from 'lucide-react';

interface EventCardProps {
  event: {
    id: string;
    slug?: string | null;
    title: string;
    description: string;
    imageUrl?: string | null;
    eventDate: Date | string;
    eventTime: string;
    venue: string;
    status: string;
    registrationLink?: string | null;
    bookletPdfUrl?: string | null;
    result?: {
      winner?: { fullName: string; avatarUrl?: string | null } | null;
    } | null;
  };
}

export default function EventCard({ event }: EventCardProps) {
  const eventDateObj = new Date(event.eventDate);
  const formattedDate = eventDateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isConcluded = event.status === 'concluded';
  const isPending = event.status === 'pending';

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1">
      {/* Event Image */}
      <div className="relative h-48 w-full overflow-hidden bg-surface-3">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-surface-2 to-surface-3 text-primary">
            <Calendar className="h-12 w-12 opacity-40" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          {isConcluded ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900/80 backdrop-blur-md px-3 py-1 text-xs font-semibold text-accent border border-accent/30 shadow-md">
              <Trophy className="h-3 w-3" />
              Concluded
            </span>
          ) : isPending ? (
            <span className="inline-flex items-center rounded-full bg-amber-500/20 backdrop-blur-md px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/30">
              Pending Review
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-primary/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white shadow-md">
              Upcoming
            </span>
          )}
        </div>

        {/* Date Tag */}
        <div className="absolute bottom-3 right-3 rounded-xl bg-black/70 backdrop-blur-md px-3 py-1 text-xs font-medium text-white">
          {formattedDate}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/events/${event.slug || event.id}`} className="group-hover:text-primary transition-colors">
          <h3 className="font-heading font-bold text-lg text-foreground line-clamp-1 mb-2">
            {event.title}
          </h3>
        </Link>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4 flex-1">
          {event.description}
        </p>

        {/* Winner Banner if concluded */}
        {isConcluded && event.result?.winner && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/20 p-2.5 text-xs text-accent">
            <Trophy className="h-4 w-4 shrink-0 text-accent" />
            <span className="truncate">
              Winner: <strong className="font-semibold text-foreground">{event.result.winner.fullName}</strong>
            </span>
          </div>
        )}

        {/* Meta Info */}
        <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/60 pt-3 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{event.eventTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between gap-2 pt-2">
          <Link
            href={`/events/${event.slug || event.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-light transition-colors"
          >
            <span>View Details</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="flex items-center gap-2">
            {event.bookletPdfUrl && (
              <a
                href={event.bookletPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Download Booklet"
                className="p-1.5 rounded-lg border border-border bg-surface-2 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
              </a>
            )}

            {!isConcluded && event.registrationLink && (
              <a
                href={event.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-all"
              >
                Register
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
