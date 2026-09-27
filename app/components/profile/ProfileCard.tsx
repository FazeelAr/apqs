import Image from 'next/image';
import { Award, Building2, MapPin, ShieldCheck, Trophy, Sparkles } from 'lucide-react';

interface ProfileCardProps {
  profile: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    email?: string;
    role: string;
    isCabinet?: boolean;
    cabinetPosition?: string | null;
    city?: string | null;
    university?: string | null;
    bio?: string | null;
    _count?: {
      eventsCreated?: number;
      eventsWon?: number;
      eventsRunnerUp?: number;
    };
  };
  compact?: boolean;
}

export default function ProfileCard({ profile, compact = false }: ProfileCardProps) {
  const initial = (profile.fullName || 'U').charAt(0).toUpperCase();

  const getRoleBadge = (role: string, isCabinet?: boolean, cabinetPosition?: string | null) => {
    if (isCabinet && cabinetPosition) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/15 text-accent border border-accent/30 shadow-sm">
          <Sparkles className="w-3 h-3" />
          {cabinetPosition}
        </span>
      );
    }
    if (role === 'super_admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-500 border border-red-500/30">
          <ShieldCheck className="w-3 h-3" />
          Super Admin
        </span>
      );
    }
    if (role === 'president') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
          <Award className="w-3 h-3" />
          President
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-3 text-muted-foreground border border-border">
        Member
      </span>
    );
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 ${
        compact ? 'p-4' : 'p-6'
      }`}
    >
      {/* Decorative gradient glow behind avatar */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-all duration-500 pointer-events-none" />

      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="relative mb-3">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.fullName}
              width={compact ? 64 : 88}
              height={compact ? 64 : 88}
              className={`rounded-full object-cover border-2 border-primary/40 shadow-md ${
                compact ? 'w-16 h-16' : 'w-22 h-22'
              }`}
            />
          ) : (
            <div
              className={`rounded-full bg-gradient-to-br from-primary to-primary-dark text-white font-bold flex items-center justify-center border-2 border-primary/40 shadow-md ${
                compact ? 'w-16 h-16 text-xl' : 'w-22 h-22 text-3xl'
              }`}
            >
              {initial}
            </div>
          )}

          {profile.isCabinet && (
            <div className="absolute -bottom-1 -right-1 bg-accent text-neutral-900 p-1 rounded-full shadow-lg border border-background">
              <Trophy className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Name & Badge */}
        <h3 className="font-heading font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
          {profile.fullName || 'Anonymous Quizzer'}
        </h3>

        <div className="mb-3">
          {getRoleBadge(profile.role, profile.isCabinet, profile.cabinetPosition)}
        </div>

        {/* Location & University */}
        {(profile.university || profile.city) && (
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground mb-3">
            {profile.university && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span className="truncate max-w-[180px]">{profile.university}</span>
              </span>
            )}
            {profile.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                <span>{profile.city}</span>
              </span>
            )}
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">
            {profile.bio}
          </p>
        )}

        {/* Stats Row (if counts available) */}
        {profile._count && (
          <div className="w-full pt-3 border-t border-border/60 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-sm font-bold text-primary">
                {profile._count.eventsWon || 0}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Wins</div>
            </div>
            <div>
              <div className="text-sm font-bold text-accent">
                {profile._count.eventsRunnerUp || 0}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">2nd Place</div>
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">
                {profile._count.eventsCreated || 0}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Events</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
