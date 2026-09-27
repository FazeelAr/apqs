import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  ExternalLink,
  FileText,
  User as UserIcon,
  Medal,
  Award,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { prisma } from '../../lib/prisma';
import type { Metadata } from 'next';

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await prisma.event.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });

  if (!event) {
    return { title: 'Event Not Found | APQS' };
  }

  return {
    title: `${event.title} | All Pakistan Quiz Society`,
    description: event.description.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.description.slice(0, 160),
      images: event.imageUrl ? [event.imageUrl] : [],
    },
  };
}

export const revalidate = 60;

export default async function EventDetailPage({ params }: EventPageProps) {
  const { id } = await params;

  // Single query with eager loading for all relations to avoid N+1 queries
  // Guard: only include id in the OR if it looks like a valid UUID
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const event = await prisma.event.findFirst({
    where: UUID_RE.test(id) ? { OR: [{ id }, { slug: id }] } : { slug: id },
    include: {
      creator: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          role: true,
          university: true,
        },
      },
      result: {
        include: {
          winner: {
            select: { id: true, fullName: true, avatarUrl: true, university: true, city: true },
          },
          runnerUp: {
            select: { id: true, fullName: true, avatarUrl: true, university: true, city: true },
          },
          secondRunnerUp: {
            select: { id: true, fullName: true, avatarUrl: true, university: true, city: true },
          },
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const eventDateObj = new Date(event.eventDate);
  const formattedDate = eventDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const isConcluded = event.status === 'concluded';
  const isPending = event.status === 'pending';

  return (
    <div className="min-h-[85vh] pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Events</span>
        </Link>
      </div>

      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-lg mb-8">
        {/* Banner Image */}
        <div className="relative h-72 sm:h-96 w-full bg-surface-3">
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/30 via-surface-2 to-surface-3">
              <Calendar className="h-20 w-20 text-primary opacity-40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Badges in Hero */}
          <div className="absolute top-4 left-4 flex gap-2">
            {isConcluded ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900/90 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-accent border border-accent/40 shadow-lg">
                <Trophy className="h-3.5 w-3.5" />
                Concluded
              </span>
            ) : isPending ? (
              <span className="inline-flex items-center rounded-full bg-amber-500/90 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-black shadow-lg">
                Pending Approval
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-primary/95 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-white shadow-lg">
                Upcoming Tournament
              </span>
            )}
          </div>

          {/* Hero Title & Date */}
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <p className="text-xs sm:text-sm font-semibold text-primary-light uppercase tracking-wider mb-1">
              {formattedDate}
            </p>
            <h1 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight leading-tight">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Action & Info Bar */}
        <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border bg-surface-2/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Time</p>
                <p className="text-muted-foreground">{event.eventTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Venue</p>
                <p className="text-muted-foreground truncate max-w-[200px]">{event.venue}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {event.bookletPdfUrl && (
              <a
                href={event.bookletPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-foreground hover:border-primary/50 hover:bg-surface-2 transition-all"
              >
                <FileText className="h-4 w-4 text-primary" />
                <span>Download Booklet</span>
              </a>
            )}

            {!isConcluded && event.registrationLink && (
              <a
                href={event.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary-light active:scale-95 transition-all"
              >
                <span>Register to Compete</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Winner Podium if Concluded */}
          {isConcluded && event.result && (
            <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/5 via-surface-2 to-primary/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-accent" />
                <h3 className="font-heading font-bold text-lg text-foreground">
                  Official Tournament Results
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* 1st Place Winner */}
                <div className="rounded-xl border-2 border-accent/50 bg-surface p-4 flex items-center gap-3 shadow-md">
                  <div className="relative">
                    {event.result.winner.avatarUrl ? (
                      <Image
                        src={event.result.winner.avatarUrl}
                        alt={event.result.winner.fullName}
                        width={48}
                        height={48}
                        className="rounded-full object-cover border border-accent"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-accent text-neutral-900 font-bold flex items-center justify-center text-lg">
                        {event.result.winner.fullName.charAt(0)}
                      </div>
                    )}
                    <span className="absolute -top-1 -right-1 bg-accent text-neutral-900 rounded-full p-1 shadow">
                      <Trophy className="h-3 w-3" />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent">Champion</span>
                    <p className="font-bold text-sm text-foreground truncate">{event.result.winner.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{event.result.winner.university || 'Affiliated Quizzer'}</p>
                  </div>
                </div>

                {/* 2nd Place Runner-Up */}
                {event.result.runnerUp && (
                  <div className="rounded-xl border border-border bg-surface p-4 flex items-center gap-3">
                    <div className="relative">
                      {event.result.runnerUp.avatarUrl ? (
                        <Image
                          src={event.result.runnerUp.avatarUrl}
                          alt={event.result.runnerUp.fullName}
                          width={48}
                          height={48}
                          className="rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-surface-3 text-foreground font-bold flex items-center justify-center text-lg">
                          {event.result.runnerUp.fullName.charAt(0)}
                        </div>
                      )}
                      <span className="absolute -top-1 -right-1 bg-slate-400 text-white rounded-full p-1 shadow">
                        <Medal className="h-3 w-3" />
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Runner-Up</span>
                      <p className="font-bold text-sm text-foreground truncate">{event.result.runnerUp.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{event.result.runnerUp.university || 'Affiliated Quizzer'}</p>
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {event.result.secondRunnerUp && (
                  <div className="rounded-xl border border-border bg-surface p-4 flex items-center gap-3">
                    <div className="relative">
                      {event.result.secondRunnerUp.avatarUrl ? (
                        <Image
                          src={event.result.secondRunnerUp.avatarUrl}
                          alt={event.result.secondRunnerUp.fullName}
                          width={48}
                          height={48}
                          className="rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-surface-3 text-foreground font-bold flex items-center justify-center text-lg">
                          {event.result.secondRunnerUp.fullName.charAt(0)}
                        </div>
                      )}
                      <span className="absolute -top-1 -right-1 bg-amber-700 text-white rounded-full p-1 shadow">
                        <Award className="h-3 w-3" />
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">2nd Runner-Up</span>
                      <p className="font-bold text-sm text-foreground truncate">{event.result.secondRunnerUp.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{event.result.secondRunnerUp.university || 'Affiliated Quizzer'}</p>
                    </div>
                  </div>
                )}
              </div>

              {event.result.notes && (
                <p className="mt-4 text-xs text-muted-foreground italic border-t border-accent/20 pt-3">
                  Note from President: {event.result.notes}
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <h2 className="font-heading font-bold text-xl text-foreground mb-3">
              About This Tournament
            </h2>
            <div className="prose prose-invert max-w-none text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
          </div>

          {/* Organizer / Creator Info */}
          {event.creator && (
            <div className="border-t border-border/60 pt-6 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                {event.creator.avatarUrl ? (
                  <Image
                    src={event.creator.avatarUrl}
                    alt={event.creator.fullName}
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-surface-3 flex items-center justify-center font-bold text-foreground">
                    {event.creator.fullName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">
                    Submitted by {event.creator.fullName}
                  </p>
                  <p className="text-[11px] capitalize">{event.creator.role.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
