'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search, Shield, Award, User, Loader2, CheckCircle2 } from 'lucide-react';

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  isCabinet: boolean;
  cabinetPosition: string | null;
  university: string | null;
  city: string | null;
  createdAt: Date | string;
  _count?: {
    eventsWon?: number;
    eventsCreated?: number;
  };
}

export default function UsersAdminClient({
  initialUsers,
  currentUserRole,
}: {
  initialUsers: UserProfile[];
  currentUserRole: string;
}) {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isSuperAdmin = currentUserRole === 'super_admin';

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.fullName || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.university || '').toLowerCase().includes(q) ||
      (u.city || '').toLowerCase().includes(q)
    );
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setUpdatingId(userId);
      setSuccessMsg(null);

      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update role');
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setSuccessMsg('Role updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Error changing role:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, university..."
            className="w-full rounded-xl border border-border bg-surface-2 pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {successMsg && (
          <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-surface-2 text-muted-foreground uppercase font-bold">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Affiliation</th>
                <th className="px-5 py-3.5">Cabinet</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-2/40 transition-colors">
                    {/* User info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {u.avatarUrl ? (
                          <Image
                            src={u.avatarUrl}
                            alt={u.fullName}
                            width={36}
                            height={36}
                            className="rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-surface-3 flex items-center justify-center font-bold text-foreground shrink-0">
                            {(u.fullName || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate">{u.fullName || 'Anonymous'}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Affiliation */}
                    <td className="px-5 py-4 text-muted-foreground">
                      <p className="text-foreground font-medium truncate max-w-[150px]">
                        {u.university || '—'}
                      </p>
                      <p className="text-[11px] truncate max-w-[150px]">{u.city || '—'}</p>
                    </td>

                    {/* Cabinet Status */}
                    <td className="px-5 py-4">
                      {u.isCabinet ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 border border-accent/30 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                          <Award className="h-3 w-3" />
                          {u.cabinetPosition || 'Member'}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">No</span>
                      )}
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border capitalize ${
                          u.role === 'super_admin'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : u.role === 'president'
                            ? 'bg-primary/10 text-primary border-primary/30'
                            : 'bg-surface-3 text-muted-foreground border-border'
                        }`}
                      >
                        {u.role === 'super_admin' ? (
                          <Shield className="h-3 w-3" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Role Change Action */}
                    <td className="px-5 py-4 text-right">
                      {updatingId === u.id ? (
                        <Loader2 className="h-4 w-4 animate-spin ml-auto text-primary" />
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={!isSuperAdmin && u.role === 'super_admin'}
                          className="rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer disabled:opacity-40"
                        >
                          <option value="member">Member</option>
                          {isSuperAdmin && <option value="president">President</option>}
                          {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                        </select>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground text-xs">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
