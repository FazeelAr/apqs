import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const month = parseInt(searchParams.get('month') || String(now.getMonth() + 1), 10);
    const year = parseInt(searchParams.get('year') || String(now.getFullYear()), 10);

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    // Single batch query with index on [status, eventDate] avoiding N+1
    const events = await prisma.event.findMany({
      where: {
        status: { in: ['approved', 'concluded'] },
        eventDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { eventDate: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        eventDate: true,
        eventTime: true,
        venue: true,
        status: true,
        imageUrl: true,
      },
    });

    return NextResponse.json({ events, month, year });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
  }
}
