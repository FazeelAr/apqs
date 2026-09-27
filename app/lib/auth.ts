import { cache } from 'react';
import { createClient } from './supabase/server';
import { prisma } from './prisma';

/**
 * Get the currently authenticated Supabase user.
 * Wrapped with React cache() to prevent redundant lookups within the same request.
 */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Get the profile of the currently authenticated user from Prisma.
 * Uses eager fetching and React cache() for zero duplicate queries.
 */
export const getCurrentProfile = cache(async () => {
  const user = await getAuthUser();
  if (!user) return null;

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
    });

    if (!profile) {
      // Auto-heal / create if not existing
      const total = await prisma.profile.count();
      return await prisma.profile.create({
        data: {
          id: user.id,
          email: user.email || '',
          fullName:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'Member',
          avatarUrl:
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            '',
          role: total === 0 ? 'super_admin' : 'member',
        },
      });
    }

    return profile;
  } catch (error) {
    console.error('Error fetching current profile:', error);
    return null;
  }
});

/**
 * Check if the current user has admin rights (president or super_admin).
 */
export const isUserAdmin = cache(async () => {
  const profile = await getCurrentProfile();
  return profile?.role === 'president' || profile?.role === 'super_admin';
});
