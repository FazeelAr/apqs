import { NextResponse, type NextRequest } from 'next/server';
import { getAuthUser, getCurrentProfile, isUserAdmin } from '../../lib/auth';
import { prisma } from '../../lib/prisma';

// Helper to generate slug
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /api/events: Public list of approved/concluded events (or all for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    const isAdmin = await isUserAdmin();

    // If not admin, only show approved or concluded events
    const statusFilter = !isAdmin
      ? { in: ['approved', 'concluded'] }
      : status
      ? { equals: status }
      : undefined;

    const where: any = {};
    if (statusFilter) {
      where.status = statusFilter;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Single batch query with eager loading to prevent N+1 query problem
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { eventDate: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              role: true,
            },
          },
          result: {
            include: {
              winner: {
                select: { id: true, fullName: true, avatarUrl: true },
              },
              runnerUp: {
                select: { id: true, fullName: true, avatarUrl: true },
              },
            },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    return NextResponse.json({
      events,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST /api/events: Create new event (authenticated)
export async function POST(request: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    } = body;

    if (!title || !description || !eventDate) {
      return NextResponse.json(
        { error: 'Title, description, and event date are required.' },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug = slugify(title);
    const existingSlug = await prisma.event.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // Super Admin or President events can be auto-approved; member events are pending
    const isAdmin = profile.role === 'president' || profile.role === 'super_admin';
    const status = isAdmin ? 'approved' : 'pending';

    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        imageUrl: imageUrl || '',
        registrationLink: registrationLink || '',
        bookletPdfUrl: bookletPdfUrl || '',
        eventDate: new Date(eventDate),
        eventTime: eventTime || '10:00 AM',
        venue: venue || 'Online / To be announced',
        status,
        createdBy: profile.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
