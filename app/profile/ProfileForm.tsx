'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Camera, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import ProfileCard from '../components/profile/ProfileCard';

interface ProfileData {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
  city: string | null;
  university: string | null;
  bio: string | null;
  role: string;
  isCabinet: boolean;
  cabinetPosition: string | null;
  _count?: {
    eventsCreated?: number;
    eventsWon?: number;
    eventsRunnerUp?: number;
  };
}

export default function ProfileForm({ initialProfile }: { initialProfile: ProfileData }) {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [fullName, setFullName] = useState(initialProfile.fullName || '');
  const [phone, setPhone] = useState(initialProfile.phone || '');
  const [city, setCity] = useState(initialProfile.city || '');
  const [university, setUniversity] = useState(initialProfile.university || '');
  const [bio, setBio] = useState(initialProfile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl || '');

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Avatar file upload handler via Cloudinary API
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Image size must be under 5MB' });
      return;
    }

    try {
      setUploading(true);
      setStatusMessage(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'avatars');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload avatar');
      }

      setAvatarUrl(data.url);
      setProfile((prev) => ({ ...prev, avatarUrl: data.url }));
      setStatusMessage({ type: 'success', text: 'Avatar uploaded! Click "Save Changes" to commit.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error uploading image';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setStatusMessage(null);

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          city,
          university,
          bio,
          avatarUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setProfile((prev) => ({
        ...prev,
        fullName,
        phone,
        city,
        university,
        bio,
        avatarUrl,
      }));

      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving profile';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Live Preview Card */}
      <div className="lg:col-span-4 order-2 lg:order-1">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Live Card Preview
        </h2>
        <ProfileCard
          profile={{
            ...profile,
            fullName,
            university,
            city,
            bio,
            avatarUrl,
          }}
        />

        <div className="mt-4 rounded-xl border border-border bg-surface-2 p-4 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">Account Info</p>
          <p className="truncate">Email: {profile.email}</p>
          <p className="mt-1 capitalize">Role: {profile.role.replace('_', ' ')}</p>
          {profile.isCabinet && (
            <p className="mt-1 text-accent font-medium">Cabinet: {profile.cabinetPosition}</p>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <div className="lg:col-span-8 order-1 lg:order-2">
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-heading font-bold text-foreground mb-6">
            Edit Profile Details
          </h2>

          {statusMessage && (
            <div
              className={`mb-6 flex items-center gap-3 rounded-xl p-4 text-sm ${
                statusMessage.type === 'success'
                  ? 'border border-primary/30 bg-primary/10 text-primary-light'
                  : 'border border-red-500/30 bg-red-500/10 text-red-400'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar Upload Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Profile Photo
              </label>
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-primary/40 bg-surface-3">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={fullName}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-bold text-foreground">
                      {(fullName || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  )}
                </div>

                <label
                  htmlFor="avatar-upload"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-4 py-2 text-xs font-semibold text-foreground hover:border-primary/50 hover:bg-surface-3 cursor-pointer transition-all"
                >
                  <Camera className="h-4 w-4 text-primary" />
                  <span>{uploading ? 'Uploading...' : 'Change Photo'}</span>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Muhammad Ali"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* University / School */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  University / College
                </label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. LUMS, IBA, NUST"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. Lahore, Karachi, Islamabad"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Phone / WhatsApp (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="+92 300 1234567"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Short Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                placeholder="Tell us about your quizzing journey, favorite quiz topics, and achievements..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving || uploading}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary-light active:scale-95 disabled:opacity-50 cursor-pointer transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
