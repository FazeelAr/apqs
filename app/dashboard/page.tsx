import Link from 'next/link';
import {
  Calendar,
  AlertCircle,
  Users,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { prisma } from '../lib/prisma';
import DashboardOverviewClient from './DashboardOverviewClient';

export default async function DashboardOverviewPage() {
  // Parallel batch fetch to completely avoid N+1 queries and guarantee sub-second speed
  const [totalEvents, pendingCount, totalUsers, cabinetCount, pendingEvents, recentUsers] =
    await Promise.all([
      prisma.event.count(),
      prisma.event.count({ where: { status: 'pending' } }),
      prisma.profile.count(),
      prisma.profile.count({ where: { isCabinet: true } }),
      prisma.event.findMany({
        where: { status: 'pending' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          creator: { select: { fullName: true } },
        },
      }),
      prisma.profile.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-black text-foreground">
          Society Management Overview
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Monitor tournament approvals, role management, and official cabinet rosters.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Events */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Events
            </span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">{totalEvents}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Nationwide tournaments</p>
        </div>

        {/* Pending Approvals */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pending Review
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-500">{pendingCount}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Submissions awaiting decision</p>
        </div>

        {/* Total Members */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Registered Quizzers
            </span>
            <div className="p-2 rounded-xl bg-accent/10 text-accent">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">{totalUsers}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Active community members</p>
        </div>

        {/* Cabinet Size */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cabinet Size
            </span>
            <div className="p-2 rounded-xl bg-primary-light/10 text-primary-light">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">{cabinetCount}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Official executive officers</p>
        </div>
      </div>

      {/* Pending Events Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
            <span>Pending Event Approvals</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-500 font-bold">
                {pendingCount}
              </span>
            )}
          </h2>
          <Link
            href="/dashboard/events"
            className="text-xs font-semibold text-primary hover:text-primary-light flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <DashboardOverviewClient pendingEvents={pendingEvents} />
      </div>

      {/* Recent Registrations Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg text-foreground">
            Recent Member Registrations
          </h2>
          <Link
            href="/dashboard/users"
            className="text-xs font-semibold text-primary hover:text-primary-light flex items-center gap-1"
          >
            <span>Manage Users</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
          <div className="divide-y divide-border/60">
            {recentUsers.map((user) => (
              <div key={user.id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-sm text-foreground">{user.fullName || 'Anonymous'}</p>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="capitalize px-2.5 py-1 rounded-full bg-surface-2 text-foreground-muted border border-border font-medium">
                    {user.role.replace('_', ' ')}
                  </span>
                  <span className="text-muted-foreground hidden sm:inline">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
