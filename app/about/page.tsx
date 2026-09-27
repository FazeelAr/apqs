import Link from 'next/link';
import {
  Trophy,
  Users,
  Building2,
  Calendar,
  Sparkles,
  ArrowRight,
  Target,
  Globe,
  Award,
} from 'lucide-react';
import { prisma } from '../lib/prisma';
import ProfileCard from '../components/profile/ProfileCard';

export const metadata = {
  title: 'About Us & Cabinet | All Pakistan Quiz Society',
  description: 'Learn about the All Pakistan Quiz Society (APQS), our mission, national quizzing circuit, and current executive leadership cabinet.',
};

export const revalidate = 60;

export default async function AboutPage() {
  // Parallel batch queries avoiding N+1 queries
  const [totalEvents, totalMembers, cabinetMembers] = await Promise.all([
    prisma.event.count({ where: { status: 'concluded' } }),
    prisma.profile.count(),
    prisma.profile.findMany({
      where: { isCabinet: true },
      orderBy: [{ cabinetOrder: 'asc' }, { fullName: 'asc' }],
      include: {
        _count: {
          select: {
            eventsWon: true,
            eventsRunnerUp: true,
            eventsCreated: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="min-h-[85vh] pt-8 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-8 sm:p-14 shadow-lg text-center">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fostering Intellectual Excellence Since 2018</span>
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-5xl text-foreground tracking-tight leading-tight">
            The Pinnacle of Competitive Quizzing in Pakistan
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            The All Pakistan Quiz Society (APQS) is the premier national governing society connecting universities, schools, and independent quizzers across Karachi, Lahore, Islamabad, Peshawar, Quetta, and beyond. We organize standardized championships, foster trivia culture, and rank the nation’s brightest minds.
          </p>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="rounded-2xl border border-border bg-surface p-6 text-center shadow-sm">
          <div className="p-3 w-fit mx-auto rounded-xl bg-primary/10 text-primary mb-3">
            <Trophy className="h-6 w-6" />
          </div>
          <div className="font-heading font-black text-3xl text-foreground">
            {totalEvents || 50}+
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">
            Championships Hosted
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 text-center shadow-sm">
          <div className="p-3 w-fit mx-auto rounded-xl bg-accent/10 text-accent mb-3">
            <Users className="h-6 w-6" />
          </div>
          <div className="font-heading font-black text-3xl text-foreground">
            {totalMembers || 500}+
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">
            Active Quizzers
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 text-center shadow-sm">
          <div className="p-3 w-fit mx-auto rounded-xl bg-primary-light/10 text-primary-light mb-3">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="font-heading font-black text-3xl text-foreground">40+</div>
          <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">
            Collegiate Chapters
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 text-center shadow-sm">
          <div className="p-3 w-fit mx-auto rounded-xl bg-emerald-500/10 text-emerald-400 mb-3">
            <Globe className="h-6 w-6" />
          </div>
          <div className="font-heading font-black text-3xl text-foreground">8+</div>
          <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">
            Years of Circuit
          </p>
        </div>
      </section>

      {/* Mission & Vision Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary w-fit">
            <Target className="h-5 w-5" />
          </div>
          <h3 className="font-heading font-bold text-lg text-foreground">
            Standardized Quality
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We champion verifiable, fact-checked questions, eliminating ambiguities through standardized formats like the British Pounce/Bounce, buzzer rounds, and audio-visual modules.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 space-y-3">
          <div className="p-2.5 rounded-xl bg-accent/10 text-accent w-fit">
            <Globe className="h-5 w-5" />
          </div>
          <h3 className="font-heading font-bold text-lg text-foreground">
            Nationwide Reach
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            From premier engineering institutes to liberal arts universities and provincial colleges, APQS brings quizzers together without geographical boundaries.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 space-y-3">
          <div className="p-2.5 rounded-xl bg-primary-light/10 text-primary-light w-fit">
            <Award className="h-5 w-5" />
          </div>
          <h3 className="font-heading font-bold text-lg text-foreground">
            Merit-Based Rankings
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Our automated point matrix honors consistency and brilliance, maintaining the definitive all-time and annual leaderboard for the Pakistan quiz community.
          </p>
        </div>
      </section>

      {/* Official Cabinet Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-semibold text-accent">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Executive Board</span>
          </div>
          <h2 className="font-heading font-black text-3xl text-foreground">
            The Executive Cabinet
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Meet the leaders driving tournament standards, academic curation, and society outreach across Pakistan.
          </p>
        </div>

        {cabinetMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cabinetMembers.map((member) => (
              <ProfileCard key={member.id} profile={member} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-xs text-muted-foreground">
            Cabinet positions are currently being ratified by the President. Check back shortly!
          </div>
        )}
      </section>

      {/* CTA Join Section */}
      <section className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-surface-2 to-primary/5 p-8 sm:p-12 text-center relative overflow-hidden shadow-lg">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-foreground">
            Ready to Join the Circuit?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Sign in with your Google account to create your quizzing profile, submit tournament entries, and climb the national leaderboard.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-light active:scale-95 transition-all"
            >
              <span>Join Society Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
