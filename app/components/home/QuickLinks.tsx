import Link from 'next/link';
import { Calendar, Trophy, Users, ArrowRight } from 'lucide-react';

const links = [
  {
    href: '/calendar',
    icon: Calendar,
    title: 'Event Schedule',
    description: 'View the full calendar of upcoming quiz competitions and never miss an event.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderHover: 'hover:border-primary/40',
    glowHover: 'hover:shadow-primary/10',
  },
  {
    href: '/leaderboard',
    icon: Trophy,
    title: 'Leaderboard',
    description: 'See who leads the rankings. Track wins, runner-ups, and the race for champion.',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderHover: 'hover:border-accent/40',
    glowHover: 'hover:shadow-accent/10',
  },
  {
    href: '/about',
    icon: Users,
    title: 'Our Cabinet',
    description: 'Meet the team driving APQS forward — the organizers, mentors, and leaders.',
    color: 'text-info',
    bgColor: 'bg-info/10',
    borderHover: 'hover:border-info/40',
    glowHover: 'hover:shadow-info/10',
  },
];

export default function QuickLinks() {
  return (
    <section className="relative bg-surface-1 py-20" id="quick-links">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Discover{' '}
            <span className="bg-gradient-to-r from-primary to-primary-lighter bg-clip-text text-transparent">
              More
            </span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Everything you need to stay connected with the quiz community
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {links.map((link) => {
            const IconComponent = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group flex flex-col gap-4 rounded-2xl border border-border bg-card
                  p-8 transition-all duration-500 hover:-translate-y-2
                  hover:shadow-xl ${link.borderHover} ${link.glowHover}`}
                id={`quick-link-${link.title.toLowerCase().replace(/\s/g, '-')}`}
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl ${link.bgColor}
                    transition-transform duration-300 group-hover:scale-110`}
                >
                  <IconComponent className={`h-7 w-7 ${link.color}`} />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    {link.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {link.description}
                  </p>
                </div>
                <div className="mt-auto flex items-center gap-1.5 text-sm font-medium text-primary">
                  Explore
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
