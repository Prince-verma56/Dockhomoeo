"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FileText, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { AdminNotice, AdminPanel, BRAND_BUTTON, FIELD_INPUT, FIELD_SELECT, Field } from "@/components/admin/AdminUi";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, describeError } from "@/lib/api";
import { getStream, listStreams } from "@/lib/admin/care";
import { uploadAdminFile } from "@/lib/admin/content";
import type {
  AdminDoctorCreateInput,
  AdminDoctorDetail,
  AdminDoctorInput,
  AdminSpecialization,
  AdminStream,
  DocumentType,
} from "@/types/api/admin-care";
import { DOCUMENT_LABEL } from "./doctorLabels";

/** The form's own state: text as typed, turned into the API's types on save. */
interface Draft {
  displayName: string;
  phone: string;
  email: string;
  photoUrl: string | null;
  stream: string;
  specializationId: string;
  specialization: string;
  qualification: string;
  experienceYears: string;
  languages: string;
  bio: string;
  registrationNumber: string;
  registrationCouncil: string;
  registrationYear: string;
  clinicName: string;
  clinicAddress: string;
  clinicCity: string;
  clinicState: string;
  clinicPincode: string;
  videoFee: string;
  audioFee: string;
  slotMinutes: string;
  commissionPercent: string;
}

const text = (value: string | number | null | undefined) => (value === null || value === undefined ? "" : String(value));

const draftOf = (doctor: AdminDoctorDetail | null): Draft => ({
  displayName: text(doctor?.displayName),
  phone: text(doctor?.phone),
  email: text(doctor?.email),
  photoUrl: doctor?.photoUrl ?? null,
  stream: text(doctor?.stream),
  specializationId: text(doctor?.specializationId),
  // the doctor's own wording, shown when it differs from the chosen specialty
  specialization: text(doctor?.specialization),
  qualification: text(doctor?.qualification),
  experienceYears: text(doctor?.experienceYears),
  languages: (doctor?.languages ?? []).join(", "),
  bio: text(doctor?.bio),
  registrationNumber: text(doctor?.registrationNumber),
  registrationCouncil: text(doctor?.registrationCouncil),
  registrationYear: text(doctor?.registrationYear),
  clinicName: text(doctor?.clinicName),
  clinicAddress: text(doctor?.clinicAddress),
  clinicCity: text(doctor?.clinicCity),
  clinicState: text(doctor?.clinicState),
  clinicPincode: text(doctor?.clinicPincode),
  videoFee: text(doctor?.videoFee),
  audioFee: text(doctor?.audioFee),
  slotMinutes: text(doctor?.slotMinutes ?? 15),
  commissionPercent: text(doctor?.commissionPercent ?? 20),
});

type Errors = Partial<Record<keyof Draft | "form", string>>;

const orNull = (value: string) => (value.trim() === "" ? null : value.trim());
const numberOrNull = (value: string) => (value.trim() === "" ? null : Number(value));

/** The same rules the backend applies (doctorInput, doctor-admin.routes.ts), checked before sending. */
function check(draft: Draft, mode: "create" | "edit"): Errors {
  const errors: Errors = {};
  const n = (value: string) => Number(value);
  if (draft.displayName.trim().length < 2) errors.displayName = "Enter the doctor's name";
  if (mode === "create" && !draft.phone.trim()) errors.phone = "Enter the doctor's mobile number; they sign in with it";
  if (draft.phone.trim() && !/^[6-9]\d{9}$/.test(draft.phone.trim())) errors.phone = "Enter a 10-digit mobile number";
  if (draft.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) errors.email = "Enter a valid email address";
  if (mode === "create" && !draft.registrationNumber.trim()) errors.registrationNumber = "Enter the medical registration number";
  if (draft.registrationYear.trim() && !(Number.isInteger(n(draft.registrationYear)) && n(draft.registrationYear) >= 1950 && n(draft.registrationYear) <= 2100)) {
    errors.registrationYear = "Enter a year between 1950 and 2100";
  }
  if (draft.experienceYears.trim() && !(n(draft.experienceYears) >= 0 && n(draft.experienceYears) <= 80)) errors.experienceYears = "Enter 0 to 80 years";
  if (draft.clinicPincode.trim() && !/^\d{6}$/.test(draft.clinicPincode.trim())) errors.clinicPincode = "A pincode has 6 digits";
  for (const fee of ["videoFee", "audioFee"] as const) {
    if (draft[fee].trim() && !(n(draft[fee]) >= 0 && n(draft[fee]) <= 100_000)) errors[fee] = "Enter a fee from ₹0 to ₹1,00,000";
  }
  if (!(Number.isInteger(n(draft.slotMinutes)) && n(draft.slotMinutes) >= 5 && n(draft.slotMinutes) <= 120)) errors.slotMinutes = "Enter 5 to 120 minutes";
  if (!(n(draft.commissionPercent) >= 0 && n(draft.commissionPercent) <= 90)) errors.commissionPercent = "Enter 0 to 90 per cent";
  const languages = draft.languages.split(",").map((l) => l.trim()).filter(Boolean);
  if (languages.length > 12) errors.languages = "List at most 12 languages";
  if (languages.some((l) => l.length > 40)) errors.languages = "Keep each language under 40 characters";
  if (draft.bio.length > 5000) errors.bio = "Keep the profile under 5,000 characters";
  return errors;
}

const toInput = (draft: Draft): Omit<AdminDoctorInput, "consulting" | "wholesale"> => ({
  displayName: draft.displayName.trim(),
  phone: orNull(draft.phone),
  email: orNull(draft.email),
  photoUrl: draft.photoUrl,
  stream: orNull(draft.stream),
  qualification: orNull(draft.qualification),
  specialization: orNull(draft.specialization),
  specializationId: draft.specializationId ? Number(draft.specializationId) : null,
  experienceYears: numberOrNull(draft.experienceYears),
  languages: draft.languages.split(",").map((l) => l.trim()).filter(Boolean),
  bio: orNull(draft.bio),
  registrationNumber: orNull(draft.registrationNumber),
  registrationCouncil: orNull(draft.registrationCouncil),
  registrationYear: numberOrNull(draft.registrationYear),
  clinicName: orNull(draft.clinicName),
  clinicAddress: orNull(draft.clinicAddress),
  clinicCity: orNull(draft.clinicCity),
  clinicState: orNull(draft.clinicState),
  clinicPincode: orNull(draft.clinicPincode),
  videoFee: numberOrNull(draft.videoFee),
  audioFee: numberOrNull(draft.audioFee),
  slotMinutes: Number(draft.slotMinutes),
  commissionPercent: Number(draft.commissionPercent),
});

type NewDocument = { type: DocumentType; fileUrl: string; fileName: string | null };

interface DoctorFormProps {
  mode: "create" | "edit";
  doctor: AdminDoctorDetail | null;
  readOnly?: boolean;
  /** Edit: the switches are kept as they are (changed only from the switches panel). */
  onSubmit: (input: AdminDoctorInput | AdminDoctorCreateInput) => Promise<void>;
}

export function DoctorForm({ mode, doctor, readOnly, onSubmit }: DoctorFormProps) {
  const [draft, setDraft] = useState<Draft>(() => draftOf(doctor));
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [streams, setStreams] = useState<AdminStream[] | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [specialties, setSpecialties] = useState<AdminSpecialization[]>([]);
  // create only
  const [approveNow, setApproveNow] = useState(false);
  const [consulting, setConsulting] = useState(true);
  const [wholesale, setWholesale] = useState(false);
  const [documents, setDocuments] = useState<NewDocument[]>([]);
  const [docType, setDocType] = useState<DocumentType>("REGISTRATION_CERTIFICATE");
  const [docBusy, setDocBusy] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  useEffect(() => {
    listStreams().then(
      (res) => setStreams(res.items),
      (err) => setStreamError(describeError(err, "The consulting streams could not be loaded.")),
    );
  }, []);

  const streamId = useMemo(() => streams?.find((s) => s.name === draft.stream)?.id ?? null, [streams, draft.stream]);

  useEffect(() => {
    if (streamId === null) {
      setSpecialties([]);
      return;
    }
    let active = true;
    getStream(streamId).then(
      (res) => active && setSpecialties(res.specializations),
      () => active && setSpecialties([]),
    );
    return () => {
      active = false;
    };
  }, [streamId]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
    if (errors[key] || errors.form) setErrors((e) => ({ ...e, [key]: undefined, form: undefined }));
  };

  /**
   * The backend stores the chosen specialty's name as the patient-facing text
   * when staff typed none. When that text is just the old specialty's name,
   * it is cleared on a change, so the new specialty's name is shown instead.
   */
  const changeSpecialty = (nextStream: string, nextId: string) => {
    const previous = specialties.find((s) => String(s.id) === draft.specializationId);
    setDraft((d) => ({
      ...d,
      stream: nextStream,
      specializationId: nextId,
      specialization: previous && d.specialization.trim() === previous.name ? "" : d.specialization,
    }));
    setSaved(false);
  };

  const addDocument = async (file: File | undefined) => {
    if (!file) return;
    setDocError(null);
    if (file.size > 5 * 1024 * 1024) return setDocError("The file is larger than 5 MB.");
    setDocBusy(true);
    try {
      const { url } = await uploadAdminFile(file, "documents");
      setDocuments((list) => [...list, { type: docType, fileUrl: url, fileName: file.name.slice(0, 200) }]);
    } catch (err) {
      setDocError(describeError(err, "The document could not be uploaded."));
    } finally {
      setDocBusy(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving || readOnly) return;
    const found = check(draft, mode);
    if (Object.keys(found).length > 0) {
      setErrors({ ...found, form: "Some details need attention. They are marked below." });
      return;
    }
    setSaving(true);
    setErrors({});
    try {
      const base = toInput(draft);
      if (mode === "create") {
        await onSubmit({ ...base, consulting, wholesale, approveNow, documents });
      } else {
        // Keep the switches exactly as they are now; they have their own controls.
        await onSubmit({
          ...base,
          consulting: doctor?.acceptsConsultations ?? false,
          wholesale: doctor?.wholesale ? doctor.wholesale.status !== "SUSPENDED" && doctor.wholesale.status !== "REJECTED" : false,
        });
        setSaved(true);
      }
    } catch (err) {
      const fieldErrors = err instanceof ApiError ? err.fieldErrors : {};
      setErrors({ ...(fieldErrors as Errors), form: describeError(err, "The doctor could not be saved.") });
    } finally {
      setSaving(false);
    }
  };

  const input = (key: keyof Draft, props: React.ComponentProps<typeof Input> = {}) => (fieldProps: object) => (
    <Input
      {...fieldProps}
      {...props}
      value={draft[key] as string}
      onChange={(e) => set(key, e.target.value as Draft[typeof key])}
      disabled={readOnly || saving}
      className={FIELD_INPUT}
    />
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-5" aria-busy={saving}>
      {errors.form ? <AdminNotice tone="error">{errors.form}</AdminNotice> : null}
      {saved ? <AdminNotice tone="success">The doctor&apos;s profile was saved.</AdminNotice> : null}

      <AdminPanel title="Identity and contact" description="The doctor signs in with this mobile number, using a one-time code.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name shown to patients" required error={errors.displayName}>
            {input("displayName", { autoComplete: "off", placeholder: "Dr. …" })}
          </Field>
          <Field label="Mobile number" required={mode === "create"} error={errors.phone} hint="10 digits, without +91.">
            {input("phone", { inputMode: "numeric", autoComplete: "off", maxLength: 10 })}
          </Field>
          <Field label="Email" error={errors.email}>
            {input("email", { type: "email", autoComplete: "off" })}
          </Field>
          <ImageUpload
            label="Photo"
            folder="doctors"
            shape="round"
            value={draft.photoUrl}
            onChange={(url) => set("photoUrl", url)}
            disabled={readOnly || saving}
            hint="A real photo of the doctor. Without one, patients see a neutral placeholder."
          />
        </div>
      </AdminPanel>

      <AdminPanel title="Practice" description="Patients search by specialty and language.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Consulting stream" error={streamError ?? undefined} hint={streams && streams.length === 0 ? "No streams exist yet. Add them under Streams & Specialties." : undefined}>
            {(props) => (
              <select
                {...props}
                className={FIELD_SELECT}
                value={draft.stream}
                disabled={readOnly || saving || streams === null}
                onChange={(e) => changeSpecialty(e.target.value, "")}
              >
                <option value="">{streams === null && !streamError ? "Loading streams…" : "Not chosen"}</option>
                {/* a stream that was renamed or removed still shows, so it is not lost on save */}
                {draft.stream && streams && !streams.some((s) => s.name === draft.stream) ? <option value={draft.stream}>{draft.stream}</option> : null}
                {streams?.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                    {s.status !== "OPEN" ? ` (${s.status === "COMING_SOON" ? "coming soon" : "closed"})` : ""}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field
            label="Specialty"
            error={errors.specializationId}
            hint={draft.stream && specialties.length === 0 ? "This stream has no specialties yet." : "Patients are matched to doctors by it."}
          >
            {(props) => (
              <select
                {...props}
                className={FIELD_SELECT}
                value={draft.specializationId}
                disabled={readOnly || saving || !draft.stream}
                onChange={(e) => changeSpecialty(draft.stream, e.target.value)}
              >
                <option value="">Not chosen</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                    {!s.isActive ? " (switched off)" : ""}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Specialty as patients read it" hint="Optional. Left empty, the chosen specialty's name is shown." error={errors.specialization}>
            {input("specialization", { placeholder: "e.g. Skin and hair care" })}
          </Field>
          <Field label="Qualification" error={errors.qualification}>
            {input("qualification", { placeholder: "e.g. BHMS, MD (Hom)" })}
          </Field>
          <Field label="Years of experience" error={errors.experienceYears}>
            {input("experienceYears", { type: "number", min: 0, max: 80, step: 0.5, inputMode: "decimal" })}
          </Field>
          <Field label="Languages" hint="Separate with commas, e.g. English, Hindi." error={errors.languages}>
            {input("languages")}
          </Field>
          <Field label="About the doctor" className="sm:col-span-2" error={errors.bio} hint="Plain text, shown on the doctor's public profile.">
            {(props) => (
              <Textarea
                {...props}
                rows={5}
                value={draft.bio}
                onChange={(e) => set("bio", e.target.value)}
                disabled={readOnly || saving}
                className="bg-white text-sm"
              />
            )}
          </Field>
        </div>
      </AdminPanel>

      <AdminPanel title="Medical registration" description="Checked during verification.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Registration number" required={mode === "create"} error={errors.registrationNumber}>
            {input("registrationNumber")}
          </Field>
          <Field label="Council" error={errors.registrationCouncil} hint="State council, CCH or NCH.">
            {input("registrationCouncil")}
          </Field>
          <Field label="Year of registration" error={errors.registrationYear}>
            {input("registrationYear", { type: "number", min: 1950, max: 2100, inputMode: "numeric" })}
          </Field>
        </div>
      </AdminPanel>

      <AdminPanel title="Clinic" description="Only the city is shown to patients.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Clinic name" error={errors.clinicName}>
            {input("clinicName")}
          </Field>
          <Field label="Address" error={errors.clinicAddress}>
            {input("clinicAddress")}
          </Field>
          <Field label="City" error={errors.clinicCity}>
            {input("clinicCity")}
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="State" error={errors.clinicState}>
              {input("clinicState")}
            </Field>
            <Field label="Pincode" error={errors.clinicPincode}>
              {input("clinicPincode", { inputMode: "numeric", maxLength: 6 })}
            </Field>
          </div>
        </div>
      </AdminPanel>

      <AdminPanel title="Consultations" description="Patients can book the modes that have a fee. Leave a fee empty to not offer that mode.">
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Video fee (₹)" error={errors.videoFee}>
            {input("videoFee", { type: "number", min: 0, step: 1, inputMode: "decimal" })}
          </Field>
          <Field label="Audio fee (₹)" error={errors.audioFee}>
            {input("audioFee", { type: "number", min: 0, step: 1, inputMode: "decimal" })}
          </Field>
          <Field label="Slot length (minutes)" required error={errors.slotMinutes}>
            {input("slotMinutes", { type: "number", min: 5, max: 120, step: 1, inputMode: "numeric" })}
          </Field>
          <Field label="Platform share (%)" required error={errors.commissionPercent} hint="Kept from each fee. Choosing a doctor level replaces it.">
            {input("commissionPercent", { type: "number", min: 0, max: 90, step: 0.5, inputMode: "decimal" })}
          </Field>
        </div>
      </AdminPanel>

      {mode === "create" ? (
        <>
          <AdminPanel title="Documents" description="Degree and registration certificates, ID. PDF, JPG, PNG or WebP, up to 5 MB each. Only staff can open them.">
            <div className="space-y-3">
              {documents.length > 0 ? (
                <ul className="divide-y divide-neutral-100 rounded-lg border border-neutral-200">
                  {documents.map((doc, index) => (
                    <li key={doc.fileUrl} className="flex items-center gap-3 px-3 py-2 text-xs">
                      <FileText className="size-4 shrink-0 text-neutral-400" aria-hidden />
                      <span className="min-w-0 flex-1 truncate">
                        <span className="font-medium text-neutral-800">{DOCUMENT_LABEL[doc.type]}</span>
                        <span className="text-neutral-500"> · {doc.fileName}</span>
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${doc.fileName ?? DOCUMENT_LABEL[doc.type]}`}
                        onClick={() => setDocuments((list) => list.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="text-rose-600" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-neutral-500">No documents added.</p>
              )}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <Field label="Document type" className="sm:w-64">
                  {(props) => (
                    <select {...props} className={FIELD_SELECT} value={docType} onChange={(e) => setDocType(e.target.value as DocumentType)} disabled={docBusy || saving}>
                      {(Object.keys(DOCUMENT_LABEL) as DocumentType[]).map((type) => (
                        <option key={type} value={type}>
                          {DOCUMENT_LABEL[type]}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
                <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border bg-white px-3 text-xs font-medium hover:bg-muted focus-within:ring-3 focus-within:ring-ring/50">
                  {docBusy ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                  {docBusy ? "Uploading…" : "Add a file"}
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={docBusy || saving}
                    onChange={(e) => {
                      addDocument(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              {docError ? (
                <p role="alert" className="text-[11px] font-medium text-rose-700">
                  {docError}
                </p>
              ) : null}
            </div>
          </AdminPanel>

          <AdminPanel title="On registering">
            <div className="space-y-4">
              <label className="flex items-start gap-3 text-xs">
                <Checkbox checked={consulting} onCheckedChange={(v) => setConsulting(v === true)} className="mt-0.5" />
                <span>
                  <span className="font-semibold text-neutral-800">Offers consultations on DocHomoeo</span>
                  <span className="block text-neutral-500">Consultations start once the doctor is verified, has working hours, and has passed the stream&apos;s test if it has one.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 text-xs">
                <Checkbox checked={wholesale} onCheckedChange={(v) => setWholesale(v === true)} className="mt-0.5" />
                <span>
                  <span className="font-semibold text-neutral-800">Can buy medicines at wholesale prices</span>
                  <span className="block text-neutral-500">Opens a trade account, approved when the doctor is verified.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-xs">
                <Checkbox checked={approveNow} onCheckedChange={(v) => setApproveNow(v === true)} className="mt-0.5" />
                <span>
                  <span className="font-semibold text-neutral-800">I have checked the registration and documents: verify now</span>
                  <span className="block text-neutral-600">
                    Marks the doctor and every document above as verified, recorded under your name. Leave it off to
                    review later from the doctor&apos;s page.
                  </span>
                </span>
              </label>
            </div>
          </AdminPanel>
        </>
      ) : null}

      {!readOnly ? (
        <div className="sticky bottom-0 z-10 -mx-4 flex justify-end border-t border-neutral-200 bg-[#f3f4f6]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <Button type="submit" disabled={saving} className={`h-10 gap-1.5 px-4 text-sm ${BRAND_BUTTON}`}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? "Saving…" : mode === "create" ? "Register doctor" : "Save profile"}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
