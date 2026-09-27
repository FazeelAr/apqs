'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, Loader2, ArrowRight } from 'lucide-react';

interface PendingEvent {
  id: string;
  title: string;
  eventDate: Date | string;
  venue: string;
  creator?: { fullName: string } | null;
}

export default function DashboardOverviewClient({
  pendingEvents: initialPending,
}: {
  pendingEvents: PendingEvent[];
}) {
  const [pending, setPending] = useState(initialPending);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      setLoadingId(id);
      const res = await fetch(`/api/events/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setPending((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setLoadingId(null);
    }
  };

  if (pending.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-xs text-muted-foreground">
        🎉 No pending event submissions! All tournaments are up to date.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pending.map((ev) => (
        <div
          key={ev.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 hover:border-primary/40 transition-colors"
        >
          <div>
            <h4 className="font-bold text-sm text-foreground mb-1">{ev.title}</h4>
            <p className="text-xs text-muted-foreground">
              By {ev.creator?.fullName || 'Anonymous'} • {new Date(ev.eventDate).toLocaleDateString()} • {ev.venue}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => handleStatusUpdate(ev.id, 'approved')}
              disabled={loadingId === ev.id}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-light transition-all cursor-pointer disabled:opacity-50"
            >
              {loadingId === ev.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              <span>Approve</span>
            </button>

            <button
              onClick={() => handleStatusUpdate(ev.id, 'rejected')}
              disabled={loadingId === ev.id}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reject</span>
            </button>

            <Link
              href={`/events/${ev.id}`}
              className="p-1.5 rounded-xl border border-border bg-surface-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
