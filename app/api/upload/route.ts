import { NextResponse, type NextRequest } from 'next/server';
import { getAuthUser } from '../../lib/auth';
import { uploadToCloudinary } from '../../lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as 'avatars' | 'events' | 'booklets') || 'events';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'application/octet-stream';
    const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

    const isPdf = mimeType.includes('pdf');
    const result = await uploadToCloudinary(
      base64Data,
      folder,
      isPdf ? 'raw' : 'auto'
    );

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error: unknown) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
