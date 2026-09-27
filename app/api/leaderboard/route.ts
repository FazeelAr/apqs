import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year') || 'all';

    const targetYear = yearParam === 'all' ? 0 : parseInt(yearParam, 10);

    // Single query eager-loading user profiles avoiding N+1 queries
    const rankings = await prisma.leaderboard.findMany({
      where: {
        year: targetYear,
        totalPoints: { gt: 0 },
      },
      orderBy: [{ totalPoints: 'desc' }, { wins: 'desc' }, { runnerUps: 'desc' }],
      take: 50,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            university: true,
            city: true,
            role: true,
          },
        },
      },
    });

    // Also get list of available distinct years with results for the dropdown filter
    const availableYears = await prisma.leaderboard.findMany({
      where: { year: { gt: 0 } },
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'desc' },
    });

    return NextResponse.json({
      rankings,
      years: availableYears.map((y) => y.year),
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
