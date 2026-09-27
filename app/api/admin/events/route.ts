import { NextResponse, type NextRequest } from 'next/server';
import { isUserAdmin } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const admin = await isUserAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Single query eager-loading creator relation to prevent N+1 queries
    const events = await prisma.event.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
        result: {
          include: {
            winner: { select: { fullName: true } },
            runnerUp: { select: { fullName: true } },
          },
        },
      },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching admin events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
