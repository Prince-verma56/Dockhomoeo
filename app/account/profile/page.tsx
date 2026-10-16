"use client";

import { Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { KeyRound, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import { AccountPageHeader, panelClass } from "@/components/account/AccountStates";
import { FormNotice, SelectField, TextField } from "@/components/shared/FormField";
import { repositories } from "@/lib/repositories";
import { ApiError, describeError } from "@/lib/api";
import { MIN_PASSWORD, isEmail } from "@/lib/auth/navigation";
import { cn } from "@/lib/utils";
import type { ApiProfileInput } from "@/types/api/account";
import type { ApiUser } from "@/types/api/auth";

type ProfileErrors = Partial<Record<keyof ApiProfileInput | "form", string>>;

const toForm = (user: ApiUser): ApiProfileInput => ({
  firstName: user.firstName ?? "",
  lastName: user.lastName ?? "",
  email: user.email ?? "",
  gender: user.gender ?? "",
  dateOfBirth: user.dateOfBirth ?? "",
});

const today = () => new Date().toISOString().slice(0, 10);

function validateProfile(form: ApiProfileInput): ProfileErrors {
  const errors: ProfileErrors = {};
  if (!form.firstName.trim()) errors.firstName = "Enter your first name.";
  else if (form.firstName.trim().length > 80) errors.firstName = "Keep the name under 80 characters.";
  if (form.lastName.trim().length > 80) errors.lastName = "Keep the name under 80 characters.";
  if (form.email.trim() && !isEmail(form.email)) errors.email = "Enter a valid email address.";
  if (form.dateOfBirth && form.dateOfBirth > today()) errors.dateOfBirth = "The date of birth cannot be in the future.";
  return errors;
}

/**
 * The customer's details. Read from the session (GET /api/auth/session),
 * saved with PATCH /api/me/profile, then read back from the session so what
 * is shown is what the backend stored. The mobile number is the sign-in
 * identity and cannot be changed here.
 */
function ProfileContent() {
  const { user, updateUser } = useAuth();
  const incomplete = useSearchParams().get("incomplete") === "1";

  if (!user) return null; // the layout only renders this when signed in
  return (
    <div className="max-w-3xl space-y-8">
      <AccountPageHeader title="Profile" description="Your name and contact details, used on orders and prescriptions." />
      {incomplete ? (
        <FormNotice tone="info">Your account was created, but your name could not be saved. Please add it below.</FormNotice>
      ) : null}
      {/* Keyed by user id so the form starts again from the backend's values for a different account. */}
      <DetailsForm key={user.id} user={user} onSaved={updateUser} />
      <PasswordForm hasPassword={user.hasPassword} onSaved={() => updateUser({ ...user, hasPassword: true })} />
    </div>
  );
}

function DetailsForm({ user, onSaved }: { user: ApiUser; onSaved: (user: ApiUser) => void }) {
  const [form, setForm] = useState<ApiProfileInput>(() => toForm(user));
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const dirty = JSON.stringify(form) !== JSON.stringify(toForm(user));

  const update = <K extends keyof ApiProfileInput>(field: K, value: ApiProfileInput[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
    if (errors[field] || errors.form) setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (savingRef.current) return;
    const found = validateProfile(form);
    if (Object.keys(found).length) {
      setErrors(found);
      document.getElementById(`profile-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setErrors({});
    try {
      const fresh = await repositories.account.updateProfile(form);
      onSaved(fresh);
      setForm(toForm(fresh));
      setSaved(true);
    } catch (err) {
      const fields = err instanceof ApiError ? err.fieldErrors : {};
      setErrors({ ...fields, form: describeError(err, "We could not save your profile. Please try again.") });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <section aria-labelledby="details-heading" className={cn(panelClass, "p-6 sm:p-8")}>
      <div className="mb-6 flex items-center gap-4">
        <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-full bg-forest/10 font-display text-xl text-forest-deep">
          {(user.firstName?.[0] ?? user.phone.slice(-2, -1)).toUpperCase()}
        </span>
        <div>
          <h3 id="details-heading" className="font-display text-lg text-ink">Personal details</h3>
          <p className="text-sm text-muted-ink">Mobile +91 {user.phone}</p>
        </div>
      </div>

      <form onSubmit={submit} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField id="profile-firstName" label="First name" autoComplete="given-name" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} error={errors.firstName} disabled={saving} />
          <TextField id="profile-lastName" label="Last name" optional autoComplete="family-name" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} error={errors.lastName} disabled={saving} />
        </div>
        <TextField id="profile-email" label="Email" type="email" autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} error={errors.email} disabled={saving} hint="Order updates and receipts are sent here." />
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            id="profile-gender"
            label="Gender"
            optional
            value={form.gender}
            onChange={(e) => update("gender", e.target.value as ApiProfileInput["gender"])}
            disabled={saving}
            error={errors.gender}
          >
            <option value="">Prefer not to say</option>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="OTHER">Other</option>
          </SelectField>
          <TextField id="profile-dateOfBirth" label="Date of birth" optional type="date" max={today()} value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} error={errors.dateOfBirth} disabled={saving} />
        </div>
        <TextField id="profile-phone" label="Mobile number" prefix="+91" value={user.phone} disabled readOnly hint="Your mobile number is how you sign in, so it can’t be changed here." />

        {errors.form ? <FormNotice tone="error">{errors.form}</FormNotice> : null}
        {saved && !dirty ? <FormNotice tone="success">Your profile has been saved.</FormNotice> : null}

        <div className="flex justify-end pt-1">
          <Button type="submit" variant="brand" size="xl" disabled={saving || !dirty} aria-busy={saving}>
            {saving ? <Loader2 aria-hidden className="animate-spin" /> : <Save aria-hidden />}
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function PasswordForm({ hasPassword, onSaved }: { hasPassword: boolean; onSaved: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; form?: string }>({});
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (savingRef.current) return;
    const found: typeof errors = {};
    if (password.length < MIN_PASSWORD) found.password = `Use at least ${MIN_PASSWORD} characters.`;
    else if (password.length > 100) found.password = "Keep the password under 100 characters.";
    if (confirm !== password) found.confirm = "The two passwords do not match.";
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setErrors({});
    try {
      await repositories.auth.setPassword(password);
      setPassword("");
      setConfirm("");
      setDone(true);
      onSaved();
    } catch (err) {
      setErrors({ form: describeError(err, "We could not save the password. Please try again.") });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <section aria-labelledby="password-heading" className={cn(panelClass, "p-6 sm:p-8")}>
      <div className="mb-6 flex items-start gap-4">
        <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-sage-wash text-forest">
          <KeyRound className="size-4.5" strokeWidth={1.7} />
        </span>
        <div>
          <h3 id="password-heading" className="font-display text-lg text-ink">{hasPassword ? "Change password" : "Add a password"}</h3>
          <p className="text-sm text-muted-ink">
            {hasPassword
              ? "Sign in with your mobile number or email and this password. A mobile code always works too."
              : "Optional. With a password you can sign in without waiting for a code."}
          </p>
        </div>
      </div>

      <form onSubmit={submit} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="new-password"
            label="New password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setDone(false);
            }}
            error={errors.password}
            hint={`At least ${MIN_PASSWORD} characters.`}
            disabled={saving}
          />
          <TextField
            id="confirm-password"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setDone(false);
            }}
            error={errors.confirm}
            disabled={saving}
          />
        </div>
        {errors.form ? <FormNotice tone="error">{errors.form}</FormNotice> : null}
        {done ? <FormNotice tone="success">Your password has been saved.</FormNotice> : null}
        <div className="flex justify-end">
          <Button type="submit" variant="brandOutline" size="xl" disabled={saving || !password} aria-busy={saving}>
            {saving ? <Loader2 aria-hidden className="animate-spin" /> : null}
            {saving ? "Saving…" : hasPassword ? "Change password" : "Save password"}
          </Button>
        </div>
      </form>
    </section>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileContent />
    </Suspense>
  );
}
