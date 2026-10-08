"use client";

import { useEffect, useState } from "react";
import { repositories } from "@/lib/repositories";
import { ApiAccountProfile } from "@/types/api/account";
import { useAuth } from "@/components/providers/AuthProvider";
import { Loader2, Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<ApiAccountProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await repositories.account.getProfile();
        setProfile(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setSaving(true);
    setMessage(null);
    try {
      const updated = await repositories.account.updateProfile(profile);
      setProfile(updated);
      if (user) {
        // Sync minimal user info back to AuthProvider session
        updateUser({
          ...user,
          firstName: updated.firstName,
          lastName: updated.lastName,
          email: updated.email,
        });
      }
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (e) {
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex h-64 items-center justify-center rounded-[2rem] bg-white border border-forest-abyss/5">
        <Loader2 className="size-8 animate-spin text-forest-deep" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-ink">Profile Settings</h2>
      </div>

      <div className="rounded-[2rem] bg-white p-6 sm:p-10 shadow-sm border border-forest-abyss/5">
        <div className="flex items-center gap-4 mb-8">
          <div className="size-16 rounded-full bg-forest-deep/10 text-forest-deep flex items-center justify-center text-2xl font-bold">
            {profile.firstName[0]}
          </div>
          <div>
            <h3 className="font-bold text-ink text-lg">{profile.firstName} {profile.lastName}</h3>
            <p className="text-sm text-muted-ink">{profile.phone}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium text-ink">First Name</label>
              <Input
                id="firstName"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                className="h-11 rounded-xl bg-white shadow-sm border-forest-abyss/10 focus-visible:ring-forest-deep"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium text-ink">Last Name</label>
              <Input
                id="lastName"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                className="h-11 rounded-xl bg-white shadow-sm border-forest-abyss/10 focus-visible:ring-forest-deep"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-ink">Email Address</label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="h-11 rounded-xl bg-white shadow-sm border-forest-abyss/10 focus-visible:ring-forest-deep"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-ink">Mobile Number</label>
            <Input
              id="phone"
              value={profile.phone}
              disabled
              className="h-11 rounded-xl bg-black/5 border-transparent text-muted-ink cursor-not-allowed"
            />
            <p className="text-xs text-muted-ink mt-1">Mobile number cannot be changed directly.</p>
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {message.text}
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="h-11 rounded-xl bg-forest-deep hover:bg-forest-abyss text-white px-8 shadow-sm"
            >
              {saving ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
