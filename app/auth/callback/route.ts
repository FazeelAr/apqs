import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '../../lib/supabase/server';
import { prisma } from '../../lib/prisma';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      try {
        const user = data.user;
        const totalProfiles = await prisma.profile.count();
        const isFirstUser = totalProfiles === 0;

        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'Member';
        const avatarUrl =
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          '';

        await prisma.profile.upsert({
          where: { id: user.id },
          create: {
            id: user.id,
            email: user.email || '',
            fullName,
            avatarUrl,
            role: isFirstUser ? 'super_admin' : 'member',
          },
          update: {
            email: user.email || '',
            fullName: fullName || undefined,
            avatarUrl: avatarUrl || undefined,
          },
        });
      } catch (err) {
        console.error('Failed to sync user profile with Prisma:', err);
      }

      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Return the user to an error page or login with an error message
  return NextResponse.redirect(new URL('/login?error=auth_callback_failed', request.url));
}
