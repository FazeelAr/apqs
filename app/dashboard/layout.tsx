import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentProfile } from '../lib/auth';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Award,
  Trophy,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export const metadata = {
  title: 'Admin Dashboard | All Pakistan Quiz Society',
};

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/events', label: 'Events Approval', icon: CalendarCheck },
  { href: '/dashboard/users', label: 'Users & Roles', icon: Users },
  { href: '/dashboard/cabinet', label: 'Cabinet Members', icon: Award },
  { href: '/dashboard/results', label: 'Declare Winners', icon: Trophy },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile || (profile.role !== 'president' && profile.role !== 'super_admin')) {
    redirect('/login?redirectTo=/dashboard');
  }

  return (
    <div className="min-h-screen pt-16 flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-border bg-surface shrink-0 p-4 md:p-6 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="p-2 rounded-xl bg-primary/20 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading font-black text-sm text-foreground">APQS Admin</h2>
              <p className="text-[11px] text-muted-foreground capitalize">
                {profile.role.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-all"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Back Button */}
        <div className="pt-6 border-t border-border mt-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
