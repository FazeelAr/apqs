import { getCurrentProfile } from '../../lib/auth';
import { prisma } from '../../lib/prisma';
import UsersAdminClient from './UsersAdminClient';

export default async function DashboardUsersPage() {
  const current = await getCurrentProfile();

  // Single query with aggregate counts, avoiding N+1 queries
  const users = await prisma.profile.findMany({
    orderBy: [{ isCabinet: 'desc' }, { createdAt: 'desc' }],
    include: {
      _count: {
        select: {
          eventsCreated: true,
          eventsWon: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-heading font-black text-foreground">
          Member Directory & Roles
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          View registered community members, assign governance roles, and manage permissions.
        </p>
      </div>

      <UsersAdminClient
        initialUsers={users}
        currentUserRole={current?.role || 'member'}
      />
    </div>
  );
}
