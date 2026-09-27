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
    const search = searchParams.get('search');
    const role = searchParams.get('role');

    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { university: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Single query with aggregate counts, avoiding N+1 queries
    const users = await prisma.profile.findMany({
      where,
      orderBy: [{ isCabinet: 'desc' }, { createdAt: 'desc' }],
      include: {
        _count: {
          select: {
            eventsCreated: true,
            eventsWon: true,
            eventsRunnerUp: true,
          },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
