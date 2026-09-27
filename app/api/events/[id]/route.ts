import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentProfile, isUserAdmin } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

// GET /api/events/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const event = await prisma.event.findFirst({
      where: UUID_RE.test(id) ? { OR: [{ id }, { slug: id }] } : { slug: id },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
            university: true,
          },
        },
        result: {
          include: {
            winner: {
              select: { id: true, fullName: true, avatarUrl: true, university: true, city: true },
            },
            runnerUp: {
              select: { id: true, fullName: true, avatarUrl: true, university: true, city: true },
            },
            secondRunnerUp: {
              select: { id: true, fullName: true, avatarUrl: true, university: true, city: true },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

// PUT /api/events/[id] - Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const isAdmin = profile.role === 'president' || profile.role === 'super_admin';
    const isCreator = event.createdBy === profile.id;

    if (!isAdmin && (!isCreator || event.status !== 'pending')) {
      return NextResponse.json(
        { error: 'Forbidden: You can only edit your own pending events.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      imageUrl,
      registrationLink,
      bookletPdfUrl,
      eventDate,
      eventTime,
      venue,
      status,
    } = body;

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(registrationLink !== undefined ? { registrationLink } : {}),
        ...(bookletPdfUrl !== undefined ? { bookletPdfUrl } : {}),
        ...(eventDate ? { eventDate: new Date(eventDate) } : {}),
        ...(eventTime ? { eventTime } : {}),
        ...(venue ? { venue } : {}),
        ...(isAdmin && status ? { status } : {}),
      },
    });

    return NextResponse.json({ event: updated });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// DELETE /api/events/[id] - Delete event
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const isAdmin = profile.role === 'president' || profile.role === 'super_admin';
    const isCreator = event.createdBy === profile.id;

    if (!isAdmin && (!isCreator || event.status !== 'pending')) {
      return NextResponse.json(
        { error: 'Forbidden: You cannot delete this event.' },
        { status: 403 }
      );
    }

    await prisma.event.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
