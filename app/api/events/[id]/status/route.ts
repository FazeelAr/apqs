import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentProfile } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

// PATCH /api/events/[id]/status - Approve / Reject / Conclude
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== 'president' && profile.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const { status, rejectionReason } = body;

    if (!['pending', 'approved', 'rejected', 'concluded'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status provided.' }, { status: 400 });
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason || 'Event submission rejected.' : null,
      },
    });

    return NextResponse.json({ event: updated });
  } catch (error) {
    console.error('Error updating event status:', error);
    return NextResponse.json({ error: 'Failed to update event status' }, { status: 500 });
  }
}
