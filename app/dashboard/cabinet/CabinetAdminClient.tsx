'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Award, Check, Loader2, Sparkles, UserPlus, X } from 'lucide-react';

interface MemberItem {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  isCabinet: boolean;
  cabinetPosition: string | null;
  cabinetOrder: number | null;
  university: string | null;
}

export default function CabinetAdminClient({ initialUsers }: { initialUsers: MemberItem[] }) {
  const [users, setUsers] = useState<MemberItem[]>(initialUsers);
  const [savingId, setSavingId] = useState<string | null>(null);

  const cabinetMembers = users
    .filter((u) => u.isCabinet)
    .sort((a, b) => (a.cabinetOrder || 999) - (b.cabinetOrder || 999));

  const nonCabinetMembers = users.filter((u) => !u.isCabinet);

  const handleUpdateCabinet = async (
    userId: string,
    isCabinet: boolean,
    cabinetPosition: string | null,
    cabinetOrder: number
  ) => {
    try {
      setSavingId(userId);
      const res = await fetch(`/api/admin/users/${userId}/cabinet`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCabinet, cabinetPosition, cabinetOrder }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, isCabinet, cabinetPosition, cabinetOrder }
              : u
          )
        );
      }
    } catch (err) {
      console.error('Error updating cabinet:', err);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Active Cabinet Showcase */}
      <div>
        <h2 className="font-heading font-bold text-lg text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <span>Active Society Cabinet ({cabinetMembers.length})</span>
        </h2>

        {cabinetMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cabinetMembers.map((member) => (
              <div
                key={member.id}
                className="rounded-2xl border border-primary/30 bg-surface p-5 shadow-sm space-y-4"
              >
                <div className="flex items-center gap-3">
                  {member.avatarUrl ? (
                    <Image
                      src={member.avatarUrl}
                      alt={member.fullName}
                      width={44}
                      height={44}
                      className="rounded-full object-cover border border-primary/40 shrink-0"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">
                      {(member.fullName || 'U').charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{member.fullName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{member.university || member.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold uppercase text-muted-foreground block mb-1">
                      Cabinet Role
                    </label>
                    <input
                      type="text"
                      defaultValue={member.cabinetPosition || 'Executive Member'}
                      onBlur={(e) =>
                        handleUpdateCabinet(
                          member.id,
                          true,
                          e.target.value,
                          member.cabinetOrder || 999
                        )
                      }
                      className="w-full rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase text-muted-foreground block mb-1">
                      Order #
                    </label>
                    <input
                      type="number"
                      defaultValue={member.cabinetOrder || 999}
                      onBlur={(e) =>
                        handleUpdateCabinet(
                          member.id,
                          true,
                          member.cabinetPosition,
                          parseInt(e.target.value, 10) || 999
                        )
                      }
                      className="w-full rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none text-center"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-border/50">
                  <button
                    onClick={() => handleUpdateCabinet(member.id, false, null, 999)}
                    disabled={savingId === member.id}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Remove from Cabinet</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-xs text-muted-foreground">
            No cabinet members selected. Add members from the directory below to showcase them on the public About page.
          </div>
        )}
      </div>

      {/* Add Members to Cabinet */}
      <div>
        <h2 className="font-heading font-bold text-lg text-foreground mb-4 flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-primary" />
          <span>Add Registered Members to Cabinet</span>
        </h2>

        <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
          <div className="divide-y divide-border/60 max-h-96 overflow-y-auto">
            {nonCabinetMembers.map((user) => (
              <div
                key={user.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-surface-2/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.fullName}
                      width={32}
                      height={32}
                      className="rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-surface-3 font-bold flex items-center justify-center text-xs shrink-0">
                      {(user.fullName || 'U').charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-foreground truncate">{user.fullName || 'Anonymous'}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    handleUpdateCabinet(
                      user.id,
                      true,
                      'Cabinet Member',
                      cabinetMembers.length + 1
                    )
                  }
                  disabled={savingId === user.id}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {savingId === user.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Award className="h-3.5 w-3.5" />
                  )}
                  <span>Appoint to Cabinet</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
