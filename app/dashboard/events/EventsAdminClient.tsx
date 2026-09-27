'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  X,
  Trash2,
  Trophy,
  ExternalLink,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Search,
} from 'lucide-react';

interface EventItem {
  id: string;
  slug?: string | null;
  title: string;
  description: string;
  eventDate: Date | string;
  eventTime: string;
  venue: string;
  status: string;
  rejectionReason?: string | null;
  creator?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

export default function EventsAdminClient({ initialEvents }: { initialEvents: EventItem[] }) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const filteredEvents = events.filter((ev) => {
    const matchesFilter = filter === 'all' ? true : ev.status === filter;
    const matchesSearch =
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.venue.toLowerCase().includes(search.toLowerCase()) ||
      (ev.creator?.fullName || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      setActionLoadingId(id);
      const res = await fetch(`/api/events/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setEvents((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status } : e))
        );
      }
    } catch (err) {
      console.error('Error changing status:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this event?')) return;
    try {
      setActionLoadingId(id);
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error('Error deleting event:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-2 border border-border w-full sm:w-auto overflow-x-auto">
          {['all', 'pending', 'approved', 'concluded', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize cursor-pointer transition-all ${
                filter === st
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, venue, host..."
            className="w-full rounded-xl border border-border bg-surface-2 pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Events Table / Card List */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
        <div className="divide-y divide-border/60">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((ev) => {
              const isActionLoading = actionLoadingId === ev.id;
              return (
                <div
                  key={ev.id}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-surface-2/30 transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          ev.status === 'approved'
                            ? 'bg-primary/10 text-primary border-primary/30'
                            : ev.status === 'concluded'
                            ? 'bg-neutral-800 text-accent border-accent/30'
                            : ev.status === 'rejected'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                        }`}
                      >
                        {ev.status}
                      </span>
                      <Link
                        href={`/events/${ev.slug || ev.id}`}
                        target="_blank"
                        className="font-heading font-bold text-base text-foreground hover:text-primary transition-colors truncate"
                      >
                        {ev.title}
                      </Link>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span>{new Date(ev.eventDate).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span>{ev.eventTime}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-accent" />
                        <span className="truncate max-w-[200px]">{ev.venue}</span>
                      </span>
                      {ev.creator && (
                        <span>By {ev.creator.fullName} ({ev.creator.email})</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {ev.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(ev.id, 'approved')}
                          disabled={isActionLoading}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-light transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(ev.id, 'rejected')}
                          disabled={isActionLoading}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {ev.status === 'approved' && (
                      <>
                        <Link
                          href={`/dashboard/results`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20 transition-all"
                        >
                          <Trophy className="h-3.5 w-3.5" />
                          <span>Declare Winner</span>
                        </Link>
                        <button
                          onClick={() => handleUpdateStatus(ev.id, 'concluded')}
                          disabled={isActionLoading}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                        >
                          <span>Mark Concluded</span>
                        </button>
                      </>
                    )}

                    <Link
                      href={`/events/${ev.slug || ev.id}`}
                      target="_blank"
                      className="p-2 rounded-xl border border-border bg-surface-2 text-muted-foreground hover:text-foreground transition-colors"
                      title="View public page"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>

                    <button
                      onClick={() => handleDelete(ev.id)}
                      disabled={isActionLoading}
                      className="p-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete event"
                    >
                      {isActionLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 text-xs text-muted-foreground">
              No events found matching this filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
