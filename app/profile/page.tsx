import { redirect } from 'next/navigation';
import { getCurrentProfile } from '../lib/auth';
import { prisma } from '../lib/prisma';
import ProfileForm from './ProfileForm';

export const metadata = {
  title: 'My Profile | All Pakistan Quiz Society',
  description: 'Manage your APQS quizzing profile and information.',
};

export default async function ProfilePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/login?redirectTo=/profile');
  }

  // Single query with aggregate counts to avoid N+1 queries
  const profileWithStats = await prisma.profile.findUnique({
    where: { id: profile.id },
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

  return (
    <div className="min-h-[85vh] pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-black text-foreground">
          My Member Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your public profile, affiliation, and contact details for the society.
        </p>
      </div>

      {profileWithStats && (
        <ProfileForm
          initialProfile={{
            id: profileWithStats.id,
            fullName: profileWithStats.fullName,
            email: profileWithStats.email,
            avatarUrl: profileWithStats.avatarUrl,
            phone: profileWithStats.phone,
            city: profileWithStats.city,
            university: profileWithStats.university,
            bio: profileWithStats.bio,
            role: profileWithStats.role,
            isCabinet: profileWithStats.isCabinet,
            cabinetPosition: profileWithStats.cabinetPosition,
            _count: profileWithStats._count,
          }}
        />
      )}
    </div>
  );
}
