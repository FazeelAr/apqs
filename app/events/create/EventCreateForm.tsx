'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  MapPin,
  Link as LinkIcon,
  FileText,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function EventCreateForm({ userRole }: { userRole: string }) {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('10:00 AM');
  const [venue, setVenue] = useState('');
  const [registrationLink, setRegistrationLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [bookletPdfUrl, setBookletPdfUrl] = useState('');

  const [imageUploading, setImageUploading] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = userRole === 'president' || userRole === 'super_admin';

  // Handle image upload to Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImageUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'events');

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload event poster');

      setImageUrl(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error uploading image');
    } finally {
      setImageUploading(false);
    }
  };

  // Handle PDF upload to Cloudinary
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setPdfUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'booklets');

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload booklet');

      setBookletPdfUrl(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error uploading booklet');
    } finally {
      setPdfUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !eventDate) {
      setError('Please fill in all required fields (title, description, date).');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          eventDate,
          eventTime,
          venue: venue || 'Online / To be announced',
          imageUrl,
          registrationLink,
          bookletPdfUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit event');
      }

      // Redirect to events page
      router.push('/events');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit event');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isAdmin && (
        <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs text-primary">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>As an admin, your submitted event will be published immediately.</span>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Event Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 14th National Inter-University Quiz Championship"
            className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Tournament Description *
          </label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide tournament format, rounds (e.g. Pounce/Bounce), eligibility criteria, prize pool, and guidelines..."
            className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Event Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-2 pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Start Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                placeholder="10:00 AM PKT"
                className="w-full rounded-xl border border-border bg-surface-2 pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Venue */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Venue / Platform
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Main Auditorium, FAST NUCES Lahore or Zoom Online"
              className="w-full rounded-xl border border-border bg-surface-2 pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Registration Link */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Registration Form Link (Google Form / External URL)
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="url"
              value={registrationLink}
              onChange={(e) => setRegistrationLink(e.target.value)}
              placeholder="https://forms.gle/..."
              className="w-full rounded-xl border border-border bg-surface-2 pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Uploads Section: Image Poster & Booklet PDF */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border/60">
          {/* Poster Upload */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Tournament Poster / Banner
            </label>
            <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface-2 p-6 text-center hover:border-primary/50 transition-colors">
              {imageUrl ? (
                <div className="relative h-36 w-full overflow-hidden rounded-xl">
                  <Image src={imageUrl} alt="Poster preview" fill className="object-cover" />
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">Upload JPG or PNG poster</p>
                </div>
              )}

              <label className="mt-3 inline-flex items-center gap-2 rounded-xl bg-surface-3 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-2 border border-border cursor-pointer transition-all">
                {imageUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>{imageUrl ? 'Change Poster' : 'Choose File'}</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={imageUploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Booklet PDF Upload */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Rulebook / Question Booklet (PDF)
            </label>
            <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface-2 p-6 text-center hover:border-primary/50 transition-colors">
              {bookletPdfUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-10 w-10 text-primary" />
                  <p className="text-xs font-semibold text-foreground">Booklet Uploaded</p>
                  <a
                    href={bookletPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-primary underline"
                  >
                    Preview PDF
                  </a>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">Upload tournament booklet PDF</p>
                </div>
              )}

              <label className="mt-3 inline-flex items-center gap-2 rounded-xl bg-surface-3 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-2 border border-border cursor-pointer transition-all">
                {pdfUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>{bookletPdfUrl ? 'Change PDF' : 'Choose File'}</span>
                )}
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  disabled={pdfUploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={submitting || imageUploading || pdfUploading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary-light active:scale-95 disabled:opacity-50 cursor-pointer transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Submitting Event...</span>
              </>
            ) : (
              <span>Submit Event</span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
