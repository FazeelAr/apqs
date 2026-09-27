import { prisma } from '../../lib/prisma';
import CabinetAdminClient from './CabinetAdminClient';

export default async function DashboardCabinetPage() {
  // Fetch profiles with select to avoid overhead and N+1 queries
  const users = await prisma.profile.findMany({
    orderBy: [{ isCabinet: 'desc' }, { cabinetOrder: 'asc' }, { fullName: 'asc' }],
    select: {
      id: true,
      fullName: true,
      email: true,
      avatarUrl: true,
      isCabinet: true,
      cabinetPosition: true,
      cabinetOrder: true,
      university: true,
    },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-heading font-black text-foreground">
          Cabinet & Executive Board
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Appoint executive society officers, assign leadership titles, and control the order displayed on the public About page.
        </p>
      </div>

      <CabinetAdminClient initialUsers={users} />
    </div>
  );
}
