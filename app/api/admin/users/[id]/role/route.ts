import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentProfile } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const current = await getCurrentProfile();
    if (!current || (current.role !== 'president' && current.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { role } = body;

    if (!['member', 'president', 'super_admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role specified.' }, { status: 400 });
    }

    // Only super_admin can grant president or super_admin roles
    if (role === 'president' || role === 'super_admin') {
      if (current.role !== 'super_admin') {
        return NextResponse.json(
          { error: 'Forbidden: Only Super Admin can assign President or Super Admin roles.' },
          { status: 403 }
        );
      }
    }

    const updated = await prisma.profile.update({
      where: { id },
      data: { role },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}
