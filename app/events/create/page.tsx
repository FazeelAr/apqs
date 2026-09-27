import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { getCurrentProfile } from '../../lib/auth';
import EventCreateForm from './EventCreateForm';

export const metadata = {
  title: 'Submit Quiz Event | All Pakistan Quiz Society',
  description: 'Submit an inter-university or national quiz tournament to the APQS directory.',
};

export default async function CreateEventPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/login?redirectTo=/events/create');
  }

  return (
    <div className="min-h-[85vh] pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Events</span>
        </Link>
      </div>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Community Submissions</span>
        </div>
        <h1 className="text-3xl font-heading font-black text-foreground">
          Host / Submit a Quiz Event
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit your institution’s tournament details to be featured in the official society schedule and calendar.
        </p>
      </div>

      <EventCreateForm userRole={profile.role} />
    </div>
  );
}
