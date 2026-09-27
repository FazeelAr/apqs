import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentProfile } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== 'president' && profile.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { winnerId, runnerUpId, secondRunnerUpId, notes, year } = body;

    if (!winnerId) {
      return NextResponse.json({ error: 'Winner is required.' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    }

    const resultYear = year ? parseInt(year, 10) : new Date(event.eventDate).getFullYear();

    // Run transaction: update event to concluded, upsert event_results, and sync leaderboard
    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark event as concluded
      await tx.event.update({
        where: { id: eventId },
        data: { status: 'concluded' },
      });

      // 2. Upsert event_result
      const eventResult = await tx.eventResult.upsert({
        where: { eventId },
        create: {
          eventId,
          winnerId,
          runnerUpId: runnerUpId || null,
          secondRunnerUpId: secondRunnerUpId || null,
          notes: notes || '',
          year: resultYear,
          declaredBy: profile.id,
        },
        update: {
          winnerId,
          runnerUpId: runnerUpId || null,
          secondRunnerUpId: secondRunnerUpId || null,
          notes: notes || '',
          year: resultYear,
          declaredBy: profile.id,
        },
      });

      // 3. Sync Leaderboard for both this year and all-time (year: 0)
      const usersToUpdate = [winnerId, runnerUpId, secondRunnerUpId].filter(Boolean) as string[];

      for (const userId of usersToUpdate) {
        // Calculate for resultYear
        const yearWins = await tx.eventResult.count({
          where: { winnerId: userId, year: resultYear },
        });
        const yearRunnerUps = await tx.eventResult.count({
          where: { runnerUpId: userId, year: resultYear },
        });
        const yearPoints = yearWins * 10 + yearRunnerUps * 5;

        await tx.leaderboard.upsert({
          where: {
            userId_year: {
              userId,
              year: resultYear,
            },
          },
          create: {
            userId,
            year: resultYear,
            wins: yearWins,
            runnerUps: yearRunnerUps,
            totalPoints: yearPoints,
          },
          update: {
            wins: yearWins,
            runnerUps: yearRunnerUps,
            totalPoints: yearPoints,
          },
        });

        // Calculate for All-Time (year: 0)
        const allWins = await tx.eventResult.count({
          where: { winnerId: userId },
        });
        const allRunnerUps = await tx.eventResult.count({
          where: { runnerUpId: userId },
        });
        const allPoints = allWins * 10 + allRunnerUps * 5;

        await tx.leaderboard.upsert({
          where: {
            userId_year: {
              userId,
              year: 0,
            },
          },
          create: {
            userId,
            year: 0,
            wins: allWins,
            runnerUps: allRunnerUps,
            totalPoints: allPoints,
          },
          update: {
            wins: allWins,
            runnerUps: allRunnerUps,
            totalPoints: allPoints,
          },
        });
      }

      return eventResult;
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error declaring event results:', error);
    return NextResponse.json({ error: 'Failed to record event results' }, { status: 500 });
  }
}
