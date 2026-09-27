'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Medal, Award, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface EventOption {
  id: string;
  title: string;
  eventDate: Date | string;
  venue: string;
  status: string;
  result?: {
    winnerId: string;
    runnerUpId?: string | null;
    secondRunnerUpId?: string | null;
    notes?: string | null;
  } | null;
}

interface UserOption {
  id: string;
  fullName: string;
  email: string;
  university?: string | null;
}

export default function DeclareResultsClient({
  events,
  users,
}: {
  events: EventOption[];
  users: UserOption[];
}) {
  const router = useRouter();

  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [winnerId, setWinnerId] = useState<string>('');
  const [runnerUpId, setRunnerUpId] = useState<string>('');
  const [secondRunnerUpId, setSecondRunnerUpId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // Sync defaults when selecting an event
  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
    const ev = events.find((e) => e.id === eventId);
    if (ev) {
      setYear(new Date(ev.eventDate).getFullYear());
      if (ev.result) {
        setWinnerId(ev.result.winnerId || '');
        setRunnerUpId(ev.result.runnerUpId || '');
        setSecondRunnerUpId(ev.result.secondRunnerUpId || '');
        setNotes(ev.result.notes || '');
      } else {
        setWinnerId('');
        setRunnerUpId('');
        setSecondRunnerUpId('');
        setNotes('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !winnerId) {
      setFeedback({ type: 'error', text: 'Please select an event and a winner.' });
      return;
    }

    try {
      setSaving(true);
      setFeedback(null);

      const res = await fetch(`/api/admin/events/${selectedEventId}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winnerId,
          runnerUpId: runnerUpId || null,
          secondRunnerUpId: secondRunnerUpId || null,
          notes,
          year,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit results');

      setFeedback({
        type: 'success',
        text: '🏆 Winner declared and leaderboard updated successfully!',
      });
      router.refresh();
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error recording results',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
      {feedback && (
        <div
          className={`mb-6 flex items-center gap-3 rounded-xl p-4 text-xs ${
            feedback.type === 'success'
              ? 'border border-primary/30 bg-primary/10 text-primary-light'
              : 'border border-red-500/30 bg-red-500/10 text-red-400'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tournament Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Select Tournament / Event *
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => handleEventSelect(e.target.value)}
            required
            className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({new Date(ev.eventDate).toLocaleDateString()}) - [{ev.status.toUpperCase()}]
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Tournament Year *
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            required
            className="w-full sm:w-48 rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border/60">
          {/* Winner (10 Points) */}
          <div className="rounded-2xl border-2 border-accent/40 bg-accent/5 p-5 space-y-3">
            <div className="flex items-center gap-2 text-accent font-bold text-sm">
              <Trophy className="h-5 w-5" />
              <span>1st Place / Champion (+10 pts)</span>
            </div>
            <select
              value={winnerId}
              onChange={(e) => setWinnerId(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
            >
              <option value="">Select Quiz Champion</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName || 'Anonymous'} ({u.university || u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Runner-Up (5 Points) */}
          <div className="rounded-2xl border border-border bg-surface-2 p-5 space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm">
              <Medal className="h-5 w-5 text-slate-400" />
              <span>Runner-Up (+5 pts)</span>
            </div>
            <select
              value={runnerUpId}
              onChange={(e) => setRunnerUpId(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">Select Runner-Up (Optional)</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName || 'Anonymous'} ({u.university || u.email})
                </option>
              ))}
            </select>
          </div>

          {/* 2nd Runner-Up */}
          <div className="rounded-2xl border border-border bg-surface-2 p-5 space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm">
              <Award className="h-5 w-5 text-amber-700" />
              <span>2nd Runner-Up (Optional)</span>
            </div>
            <select
              value={secondRunnerUpId}
              onChange={(e) => setSecondRunnerUpId(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">Select 2nd Runner-Up (Optional)</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName || 'Anonymous'} ({u.university || u.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* President Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            President / Arbiter Remarks
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Won after sudden-death tiebreaker on the Pakistani Geography audio-visual round..."
            className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-border/60">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-accent text-neutral-900 px-6 py-3 text-sm font-bold shadow-lg shadow-accent/20 hover:bg-yellow-400 active:scale-95 disabled:opacity-50 cursor-pointer transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Recording Results...</span>
              </>
            ) : (
              <>
                <Trophy className="h-4 w-4" />
                <span>Declare Official Results</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
