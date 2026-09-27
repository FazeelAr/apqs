import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET() {
  try {
    const cabinet = await prisma.profile.findMany({
      where: { isCabinet: true },
      orderBy: [{ cabinetOrder: 'asc' }, { fullName: 'asc' }],
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

    return NextResponse.json({ cabinet });
  } catch (error) {
    console.error('Error fetching cabinet members:', error);
    return NextResponse.json({ error: 'Failed to fetch cabinet' }, { status: 500 });
  }
}
