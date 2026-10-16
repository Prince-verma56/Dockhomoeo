"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, FileText, Loader2, Lock, Paperclip, Phone, Upload, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FieldShell, TextField, describedBy, fieldInputClass } from "@/components/shared/FormField";
import { displayName, useAuth } from "@/components/providers/AuthProvider";
import { repositories } from "@/lib/repositories";
import { ApiError, describeError } from "@/lib/api";
import { loginHref } from "@/lib/auth/navigation";
import { formatRupees } from "@/lib/formatters/price";
import { CANCEL_HOURS, CONSULTATION_FILES, HOLD_MINUTES, MODE_LABEL, feeFor, isBookableMode, offeredModes } from "@/lib/care/consultation";
import { cn } from "@/lib/utils";
import type { ApiBookableMode, ApiBookingInput, ApiConsultationFile, ApiDoctorDetail, ApiDoctorSlot } from "@/types/api/care";

type Gender = ApiBookingInput["patientGender"];
type Field = "mode" | "patientName" | "patientAge" | "patientGender" | "symptoms";
type Upload = { key: string; name: string; status: "uploading" | "done" | "error"; file?: ApiConsultationFile; error?: string };

const GENDERS: { value: Gender; label: string }[] = [
  { value: "FEMALE", label: "Female" },
  { value: "MALE", label: "Male" },
  { value: "OTHER", label: "Other" },
];

/**
 * Choosing a free slot and booking it (POST /api/me/appointments, then
 * POST /api/me/appointments/:id/pay). The backend re-checks the slot, the
 * mode and the fee; a slot taken meanwhile comes back as 409 and the times
 * are read again. With the payment gateway connected, `pay` returns its page
 * and the patient comes back to /patient/consultations; in test mode the
 * consultation is confirmed at once. Booking needs an account, so a signed-out
 * visitor is sent to sign in and returned to the same day and time.
 */
export function BookingPanel({
  doctor,
  date,
  slots,
  initialSlot,
}: {
  doctor: Pick<ApiDoctorDetail, "id" | "slug" | "displayName" | "videoFee" | "audioFee" | "slotMinutes">;
  date: string;
  slots: ApiDoctorSlot[];
  initialSlot: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();
  const formId = useId();
  const modes = offeredModes(doctor);
  const canBook = (slot: ApiDoctorSlot) => slot.available && isBookableMode(slot.mode) && modes.length > 0;
  const open = slots.filter(canBook);

  const [selected, setSelected] = useState<string | null>(() => (initialSlot && open.some((s) => s.startsAt === initialSlot) ? initialSlot : null));
  const slot = open.find((s) => s.startsAt === selected) ?? null;

  const [mode, setMode] = useState<ApiBookableMode | null>(modes.length === 1 ? modes[0] : null);
  const chosenMode = mode ?? (slot && isBookableMode(slot.mode) && modes.includes(slot.mode) ? slot.mode : null);
  const [patientName, setPatientName] = useState("");
  const [nameFor, setNameFor] = useState<number | null>(null);
  if (auth.user && nameFor !== auth.user.id) {
    setNameFor(auth.user.id);
    setPatientName((current) => current || [auth.user?.firstName, auth.user?.lastName].filter(Boolean).join(" "));
  }
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState<Gender | "">("");
  const [symptoms, setSymptoms] = useState("");
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [phase, setPhase] = useState<"idle" | "booking" | "paying">("idle");
  const [failure, setFailure] = useState<string | null>(null);
  const [held, setHeld] = useState<{ number: string; message: string } | null>(null);
  const submitting = useRef(false);
  const alertRef = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const fee = chosenMode ? feeFor(doctor, chosenMode) : null;
  const here = `${pathname}?date=${date}${selected ? `&slot=${encodeURIComponent(selected)}` : ""}`;

  const validate = () => {
    const next: Partial<Record<Field, string>> = {};
    if (!chosenMode) next.mode = "Choose video or audio.";
    if (patientName.trim().length < 2) next.patientName = "Enter the patient’s name.";
    const age = Number(patientAge);
    if (patientAge.trim() === "" || !Number.isInteger(age) || age < 0 || age > 120) next.patientAge = "Enter an age from 0 to 120.";
    if (!patientGender) next.patientGender = "Choose one.";
    if (symptoms.trim().length < 5) next.symptoms = "Describe the problem in a few words.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const addFiles = async (list: FileList | null) => {
    if (!list) return;
    const room = CONSULTATION_FILES.maxCount - uploads.filter((u) => u.status !== "error").length;
    const files = Array.from(list).slice(0, Math.max(room, 0));
    if (fileInput.current) fileInput.current.value = "";
    for (const file of files) {
      const key = `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`;
      const allowed = (CONSULTATION_FILES.accept as string).split(",").includes(file.type);
      if (!allowed || file.size > CONSULTATION_FILES.maxBytes) {
        setUploads((current) => [...current, { key, name: file.name, status: "error", error: !allowed ? "Not a PDF or photo" : "Larger than 5 MB" }]);
        continue;
      }
      setUploads((current) => [...current, { key, name: file.name, status: "uploading" }]);
      try {
        const saved = await repositories.consultation.uploadFile(file);
        setUploads((current) => current.map((u) => (u.key === key ? { ...u, status: "done", file: saved, name: saved.fileName } : u)));
      } catch (error) {
        setUploads((current) => current.map((u) => (u.key === key ? { ...u, status: "error", error: describeError(error, "Could not upload") } : u)));
      }
    }
  };

  const removeUpload = (upload: Upload) => {
    setUploads((current) => current.filter((u) => u.key !== upload.key));
    // An unattached upload is the patient's own; removing it frees the place for another.
    if (upload.file) repositories.consultation.removeFile(upload.file.id).catch(() => undefined);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting.current || !slot) return;
    setFailure(null);
    if (!validate()) return;
    if (uploads.some((u) => u.status === "uploading")) {
      setFailure("Wait for your files to finish uploading.");
      return;
    }

    submitting.current = true;
    setPhase("booking");
    let booked: { id: number; appointmentNumber: string };
    try {
      booked = await repositories.consultation.book({
        doctorId: doctor.id,
        startsAt: slot.startsAt,
        mode: chosenMode as ApiBookableMode,
        patientName: patientName.trim(),
        patientAge: Number(patientAge),
        patientGender: patientGender as Gender,
        symptoms: symptoms.trim(),
        fileIds: uploads.flatMap((u) => (u.file ? [u.file.id] : [])),
      });
    } catch (error) {
      submitting.current = false;
      setPhase("idle");
      if (error instanceof ApiError && error.status === 401) {
        setFailure("Your session has ended. Sign in again to book; your choice of time is kept.");
      } else if (error instanceof ApiError && error.status === 409) {
        // Taken meanwhile: read the day's times again.
        setSelected(null);
        setFailure(error.message);
        router.refresh();
      } else {
        setFailure(describeError(error, "We could not book this time. Please try again."));
      }
      alertRef.current?.focus();
      return;
    }

    setPhase("paying");
    try {
      const { payUrl } = await repositories.consultation.pay(booked.id);
      if (payUrl) {
        // The gateway's page takes over and sends the patient back to /patient/consultations.
        window.location.assign(payUrl);
        return;
      }
      router.push(`/account/consultations?booked=${encodeURIComponent(booked.appointmentNumber)}`);
    } catch (error) {
      // The slot is held but unpaid: say so, and do not book it twice.
      setPhase("idle");
      setHeld({ number: booked.appointmentNumber, message: describeError(error, "The payment could not be started.") });
    }
  };

  const busy = phase !== "idle";

  return (
    <div>
      {slots.length === 0 ? (
        <p className="mt-5 text-sm text-muted-ink">The doctor has no consulting hours on this day. Try another day.</p>
      ) : open.length === 0 ? (
        <p className="mt-5 text-sm text-muted-ink">No time on this day can be booked. Try another day.</p>
      ) : (
        <p className="mt-5 text-sm text-muted-ink">
          {open.length} free {open.length === 1 ? "time" : "times"}, {doctor.slotMinutes} minutes each (India time). Choose one to book.
        </p>
      )}

      {slots.length > 0 ? (
        <div role="radiogroup" aria-label="Free times" className="mt-3 flex flex-wrap gap-2">
          {slots.map((s) => {
            const bookable = canBook(s);
            const active = s.startsAt === selected;
            const reason = !s.available ? (s.reason ?? "Not available") : !isBookableMode(s.mode) ? `${MODE_LABEL[s.mode] ?? s.mode} only, not bookable online` : null;
            return (
              <button
                key={s.startsAt}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={!bookable || busy}
                title={reason ?? undefined}
                onClick={() => {
                  setSelected(s.startsAt);
                  setFailure(null);
                }}
                className={cn(
                  "inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm tabular-nums transition-colors focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:outline-none",
                  active
                    ? "border-forest bg-forest text-cream"
                    : bookable
                      ? "cursor-pointer border-forest/30 bg-forest/6 text-forest-deep hover:border-forest hover:bg-forest/10"
                      : "cursor-not-allowed border-line bg-cream-sunk text-muted-ink line-through",
                )}
              >
                {s.mode === "AUDIO" ? <Phone aria-hidden className="size-3.5" /> : <Video aria-hidden className="size-3.5" />}
                {s.time}
                {reason ? <span className="sr-only">, {reason}</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {slot ? (
        <div id="book" className="mt-7 scroll-mt-28 rounded-[1.25rem] border border-forest/20 bg-cream/60 p-5 sm:p-6">
          <p className="text-sm text-ink">
            <span className="font-semibold">{new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" }).format(new Date(slot.startsAt))}</span>{" "}
            with {doctor.displayName}
          </p>

          {auth.status === "loading" ? (
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-ink">
              <Loader2 aria-hidden className="size-4 animate-spin" />
              Checking your account…
            </p>
          ) : !auth.isAuthenticated ? (
            <div className="mt-4">
              <p className="text-sm text-muted-ink">Booking needs a DocHomoeo account, so the doctor knows who they are speaking to and your prescription reaches you.</p>
              <Button asChild variant="brand" size="xl" className="mt-4">
                <Link href={loginHref(here)}>
                  <Lock aria-hidden />
                  Sign in to book this time
                </Link>
              </Button>
            </div>
          ) : held ? (
            <div role="alert" className="mt-4 rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3.5 text-sm text-ink">
              <p className="font-semibold">Your time is held as {held.number}, but it is not paid yet.</p>
              <p className="mt-1 text-muted-ink">
                {held.message} The hold lasts {HOLD_MINUTES} minutes; you can pay or cancel it from your consultations.
              </p>
              <Button asChild variant="brand" size="xl" className="mt-3">
                <Link href="/account/consultations">Go to your consultations</Link>
              </Button>
            </div>
          ) : (
            <form id={formId} noValidate onSubmit={onSubmit} className="mt-5 space-y-5">
              {failure ? (
                <div ref={alertRef} tabIndex={-1} role="alert" className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-ink">
                  <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <span>{failure}</span>
                </div>
              ) : null}

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-ink">Consultation</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {modes.map((m) => (
                    <label
                      key={m}
                      className={cn(
                        "flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-sm transition-colors has-focus-visible:ring-2 has-focus-visible:ring-forest/40",
                        chosenMode === m ? "border-forest bg-forest/8 font-medium text-ink" : "border-line bg-paper text-muted-ink hover:border-forest/40",
                      )}
                    >
                      <input type="radio" name="mode" className="sr-only" checked={chosenMode === m} onChange={() => setMode(m)} disabled={busy} />
                      <span className="flex items-center gap-2">
                        {m === "VIDEO" ? <Video aria-hidden className="size-4 text-forest" /> : <Phone aria-hidden className="size-4 text-forest" />}
                        {MODE_LABEL[m]} call
                      </span>
                      <span className="font-semibold text-ink tabular-nums">{formatRupees(feeFor(doctor, m) as number)}</span>
                    </label>
                  ))}
                </div>
                {errors.mode ? <p className="mt-1.5 text-[0.8125rem] text-destructive">{errors.mode}</p> : null}
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_7rem_9rem]">
                <TextField
                  id={`${formId}-name`}
                  label="Patient’s name"
                  autoComplete="name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  error={errors.patientName}
                  maxLength={120}
                  disabled={busy}
                />
                <TextField
                  id={`${formId}-age`}
                  label="Age"
                  inputMode="numeric"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value.replace(/\D/g, "").slice(0, 3))}
                  error={errors.patientAge}
                  disabled={busy}
                />
                <FieldShell id={`${formId}-gender`} label="Gender" error={errors.patientGender}>
                  <select
                    id={`${formId}-gender`}
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as Gender)}
                    disabled={busy}
                    {...describedBy(`${formId}-gender`, errors.patientGender)}
                    className={cn(fieldInputClass, "w-full appearance-none border")}
                  >
                    <option value="" disabled>
                      Choose
                    </option>
                    {GENDERS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </FieldShell>
              </div>
              <p className="-mt-2 text-[0.8125rem] text-muted-ink">
                Booking for someone else? Enter their details; {displayName(auth.user)} stays the account holder.
              </p>

              <FieldShell id={`${formId}-symptoms`} label="What would you like help with?" error={errors.symptoms} hint="Only the doctor reads this.">
                <Textarea
                  id={`${formId}-symptoms`}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  maxLength={2000}
                  rows={4}
                  disabled={busy}
                  {...describedBy(`${formId}-symptoms`, errors.symptoms, "Only the doctor reads this.")}
                  className="min-h-28 rounded-xl border-line bg-paper text-base text-ink focus-visible:border-forest/50 focus-visible:ring-forest/20 md:text-[0.9375rem]"
                  placeholder="For example: a dry cough for two weeks, worse at night"
                />
              </FieldShell>

              <div>
                <p className="flex items-baseline justify-between gap-3 text-sm font-medium text-ink">
                  Reports or earlier prescriptions
                  <span className="text-xs font-normal text-muted-ink">Optional</span>
                </p>
                <p className="mt-0.5 text-[0.8125rem] text-muted-ink">{CONSULTATION_FILES.describe}. Kept private to you and the doctor.</p>
                {uploads.length ? (
                  <ul className="mt-3 space-y-2">
                    {uploads.map((upload) => (
                      <li key={upload.key} className="flex items-center gap-3 rounded-lg border border-line bg-paper px-3 py-2 text-sm">
                        {upload.status === "uploading" ? (
                          <Loader2 aria-hidden className="size-4 shrink-0 animate-spin text-muted-ink" />
                        ) : upload.status === "done" ? (
                          <CheckCircle2 aria-hidden className="size-4 shrink-0 text-forest" />
                        ) : (
                          <AlertCircle aria-hidden className="size-4 shrink-0 text-destructive" />
                        )}
                        <FileText aria-hidden className="size-4 shrink-0 text-muted-ink" />
                        <span className="min-w-0 flex-1 truncate text-ink">{upload.name}</span>
                        <span className={cn("text-xs", upload.status === "error" ? "text-destructive" : "text-muted-ink")}>
                          {upload.status === "uploading" ? "Uploading…" : upload.status === "error" ? upload.error : "Added"}
                        </span>
                        {upload.status !== "uploading" ? (
                          <button
                            type="button"
                            onClick={() => removeUpload(upload)}
                            disabled={busy}
                            aria-label={`Remove ${upload.name}`}
                            className="grid size-7 cursor-pointer place-items-center rounded-full text-muted-ink hover:bg-ink/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:outline-none"
                          >
                            <X aria-hidden className="size-3.5" />
                          </button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {uploads.filter((u) => u.status !== "error").length < CONSULTATION_FILES.maxCount ? (
                  <>
                    <input
                      ref={fileInput}
                      id={`${formId}-files`}
                      type="file"
                      multiple
                      accept={CONSULTATION_FILES.accept}
                      className="peer sr-only"
                      onChange={(e) => void addFiles(e.target.files)}
                      disabled={busy}
                    />
                    <label
                      htmlFor={`${formId}-files`}
                      className="mt-3 inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-line bg-paper px-4 text-sm font-medium text-ink transition-colors hover:border-forest/40 hover:text-forest peer-focus-visible:ring-2 peer-focus-visible:ring-forest/40"
                    >
                      {uploads.length ? <Paperclip aria-hidden className="size-4" /> : <Upload aria-hidden className="size-4" />}
                      {uploads.length ? "Add another file" : "Add files"}
                    </label>
                  </>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 border-t border-line/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[0.8125rem] leading-relaxed text-muted-ink sm:max-w-sm">
                  The fee is paid online now. You can cancel up to {CANCEL_HOURS} hours before the start; a paid fee is then due back to you.
                </p>
                <Button type="submit" variant="brand" size="xl" disabled={busy} className="w-full sm:w-auto">
                  {busy ? <Loader2 aria-hidden className="animate-spin" /> : <Lock aria-hidden />}
                  {phase === "booking" ? "Holding your time…" : phase === "paying" ? "Starting payment…" : fee !== null ? `Pay ${formatRupees(fee)} and book` : "Book this time"}
                </Button>
              </div>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}
