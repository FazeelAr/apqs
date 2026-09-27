import { NextResponse, type NextRequest } from 'next/server';
import { getAuthUser, getCurrentProfile } from '../../lib/auth';
import { prisma } from '../../lib/prisma';

// GET current profile with event counts
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Single query eager-loading relations/aggregates to avoid N+1 queries
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
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

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PUT update profile
export async function PUT(request: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, phone, city, university, bio, avatarUrl } = body;

    // Strict sanitization: ensure regular users cannot update role or isCabinet
    const updated = await prisma.profile.update({
      where: { id: profile.id },
      data: {
        ...(fullName !== undefined ? { fullName: String(fullName).trim() } : {}),
        ...(phone !== undefined ? { phone: String(phone).trim() } : {}),
        ...(city !== undefined ? { city: String(city).trim() } : {}),
        ...(university !== undefined ? { university: String(university).trim() } : {}),
        ...(bio !== undefined ? { bio: String(bio).trim() } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl: String(avatarUrl).trim() } : {}),
      },
    });

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
