import { NextResponse, type NextRequest } from 'next/server';
import { isUserAdmin } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = await isUserAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { isCabinet, cabinetPosition, cabinetOrder } = body;

    const updated = await prisma.profile.update({
      where: { id },
      data: {
        isCabinet: Boolean(isCabinet),
        cabinetPosition: isCabinet ? cabinetPosition || 'Cabinet Member' : null,
        cabinetOrder: isCabinet && cabinetOrder !== undefined ? parseInt(cabinetOrder, 10) : 999,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error('Error updating cabinet status:', error);
    return NextResponse.json({ error: 'Failed to update cabinet status' }, { status: 500 });
  }
}
