"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CalendarClock, CheckCircle2, ClipboardList, Clock, ExternalLink, FileText, Loader2, Phone, Star, Stethoscope, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AccountEmpty, AccountError, AccountLoading, AccountPageHeader, StatusPill, panelClass } from "@/components/account/AccountStates";
import { DoctorAvatar } from "@/components/doctors/DoctorAvatar";
import { repositories } from "@/lib/repositories";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { describeError } from "@/lib/api";
import { formatRupees } from "@/lib/formatters/price";
import { CANCEL_HOURS, HOLD_MINUTES, MODE_LABEL, appointmentStatus, istWhen } from "@/lib/care/consultation";
import { cn } from "@/lib/utils";
import type { ApiAppointment } from "@/types/api/care";

const loadAppointments = () => repositories.consultation.list();

/** Still ahead of the patient: held, booked or under way, and not yet over. */
const isUpcoming = (a: ApiAppointment, now: number) =>
  ["PENDING_PAYMENT", "CONFIRMED", "IN_PROGRESS"].includes(a.status) && new Date(a.scheduledAt).getTime() + a.durationMinutes * 60_000 > now;

export default function ConsultationsPage() {
  return (
    <Suspense fallback={<AccountLoading rows={2} label="Loading your consultations…" />}>
      <Consultations />
    </Suspense>
  );
}

/**
 * The patient's consultations (GET /api/me/appointments), with what the
 * backend allows on each: pay a held slot, cancel, join the call once it is
 * confirmed, rate a finished one, and open the prescription it produced.
 * `?booked=` arrives from booking, `?payment=` from the payment gateway's
 * return (/patient/consultations).
 */
function Consultations() {
  const { state, reload, refresh } = useAsyncData(loadAppointments);
  const params = useSearchParams();
  const booked = params.get("booked");
  const payment = params.get("payment");
  // The moment the page opened splits upcoming from past; it need not tick.
  const [now] = useState(() => Date.now());

  const items = state.status === "ready" ? state.data : [];
  const upcoming = items.filter((a) => isUpcoming(a, now)).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  const past = items.filter((a) => !isUpcoming(a, now));
  const justBooked = booked ? items.find((a) => a.appointmentNumber === booked) : undefined;

  return (
    <div>
      <AccountPageHeader
        title="Consultations"
        description="Your appointments with DocHomoeo doctors, in India time."
        action={
          <Button asChild variant="brandOutline" size="xl" className="w-fit">
            <Link href="/doctors">
              <Stethoscope aria-hidden />
              Find a doctor
            </Link>
          </Button>
        }
      />

      {justBooked ? (
        <Notice tone={justBooked.status === "CONFIRMED" ? "success" : "warning"}>
          {justBooked.status === "CONFIRMED"
            ? `Booked: ${justBooked.appointmentNumber} with ${justBooked.doctor.displayName}, ${istWhen(justBooked.scheduledAt)}. The call link appears here when it is time.`
            : `${justBooked.appointmentNumber} is held but not paid yet. Pay within ${HOLD_MINUTES} minutes of booking to keep the time.`}
        </Notice>
      ) : null}
      {payment === "success" ? <Notice tone="success">Payment received. Your consultation is booked.</Notice> : null}
      {payment === "pending" ? <Notice tone="warning">Your payment is still being confirmed. The consultation shows as booked once it is.</Notice> : null}
      {payment === "failed" ? (
        <Notice tone="danger">The payment did not go through, so nothing was charged. If the time is still held you can pay again below, or choose another time.</Notice>
      ) : null}

      {state.status === "loading" ? <AccountLoading rows={2} label="Loading your consultations…" /> : null}
      {state.status === "error" ? <AccountError message={state.message} onRetry={reload} /> : null}

      {state.status === "ready" && items.length === 0 ? (
        <AccountEmpty
          icon={<Stethoscope aria-hidden className="size-6" strokeWidth={1.6} />}
          title="No consultations yet"
          action={
            <Button asChild variant="brand" size="xl">
              <Link href="/doctors">Find a doctor</Link>
            </Button>
          }
        >
          Book a video or audio consultation with a verified homoeopathic doctor; it will appear here with its call link.
        </AccountEmpty>
      ) : null}

      {upcoming.length > 0 ? (
        <section aria-labelledby="upcoming-heading" className="mb-8">
          <h3 id="upcoming-heading" className="dh-eyebrow mb-3 text-muted-ink">
            Upcoming
          </h3>
          <ul className="space-y-4">
            {upcoming.map((a) => (
              <li key={a.id}>
                <AppointmentCard appointment={a} onChanged={refresh} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {past.length > 0 ? (
        <section aria-labelledby="past-heading">
          <h3 id="past-heading" className="dh-eyebrow mb-3 text-muted-ink">
            Past and cancelled
          </h3>
          <ul className="space-y-4">
            {past.map((a) => (
              <li key={a.id}>
                <AppointmentCard appointment={a} onChanged={refresh} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Notice({ tone, children }: { tone: "success" | "warning" | "danger"; children: React.ReactNode }) {
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;
  return (
    <p
      role="status"
      className={cn(
        "mb-5 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm text-ink",
        tone === "success" ? "border-forest/25 bg-forest/6" : tone === "warning" ? "border-amber-300/70 bg-amber-50" : "border-destructive/30 bg-destructive/5",
      )}
    >
      <Icon aria-hidden className={cn("mt-0.5 size-4 shrink-0", tone === "success" ? "text-forest" : tone === "warning" ? "text-amber-700" : "text-destructive")} />
      <span>{children}</span>
    </p>
  );
}

function AppointmentCard({ appointment: a, onChanged }: { appointment: ApiAppointment; onChanged: () => Promise<void> }) {
  const status = appointmentStatus(a.status);
  const [busy, setBusy] = useState<"pay" | "cancel" | "rate" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [rateOpen, setRateOpen] = useState(false);

  const run = async (kind: "pay" | "cancel" | "rate", action: () => Promise<string | null | void>) => {
    if (busy) return;
    setBusy(kind);
    setError(null);
    try {
      const result = await action();
      if (typeof result === "string") setMessage(result);
      await onChanged();
    } catch (err) {
      setError(describeError(err, "That did not work. Please try again."));
    } finally {
      setBusy(null);
    }
  };

  const pay = () =>
    run("pay", async () => {
      const { payUrl } = await repositories.consultation.pay(a.id);
      if (payUrl) {
        window.location.assign(payUrl);
        return null;
      }
      return "Paid. Your consultation is booked.";
    });

  const cancel = () =>
    run("cancel", async () => {
      const { refundDue } = await repositories.consultation.cancel(a.id);
      setConfirmingCancel(false);
      return refundDue ? "Cancelled. The fee you paid is due back to you." : "Cancelled.";
    });

  const rate = () => {
    if (rating < 1) {
      setError("Choose from 1 to 5 stars.");
      return;
    }
    void run("rate", async () => {
      await repositories.consultation.rate(a.id, rating, comment.trim() || null);
      setRateOpen(false);
      return "Thank you for rating your consultation.";
    });
  };

  return (
    <article className={cn(panelClass, "p-5 sm:p-6")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <DoctorAvatar photoUrl={a.doctor.photoUrl} className="size-12" />
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wider text-muted-ink uppercase">{a.appointmentNumber}</p>
            <h4 className="mt-0.5 font-display text-lg text-ink">
              <Link href={`/doctors/${a.doctor.slug}`} className="hover:text-forest focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:outline-none">
                {a.doctor.displayName}
              </Link>
            </h4>
            {a.doctor.specialization ? <p className="text-sm text-forest">{a.doctor.specialization}</p> : null}
          </div>
        </div>
        <StatusPill label={status.label} tone={status.tone} />
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
        <div className="flex items-center gap-2 text-ink">
          <dt>
            <CalendarClock aria-hidden className="size-4 text-forest" />
            <span className="sr-only">When</span>
          </dt>
          <dd>{istWhen(a.scheduledAt)}</dd>
        </div>
        <div className="flex items-center gap-2 text-muted-ink">
          <dt>
            {a.mode === "AUDIO" ? <Phone aria-hidden className="size-4 text-forest" /> : <Video aria-hidden className="size-4 text-forest" />}
            <span className="sr-only">Mode</span>
          </dt>
          <dd>
            {MODE_LABEL[a.mode] ?? a.mode} · {a.durationMinutes} min
          </dd>
        </div>
        <div className="flex items-center gap-2 text-muted-ink">
          <dt>
            <Clock aria-hidden className="size-4 text-forest" />
            <span className="sr-only">Fee</span>
          </dt>
          <dd>
            {formatRupees(a.fee)} · {a.refunded > 0 ? `${formatRupees(a.refunded)} refunded` : a.paid ? "paid" : "not paid"}
          </dd>
        </div>
      </dl>

      <p className="mt-4 line-clamp-3 text-sm text-ink">
        <span className="font-medium">For {a.patientName}:</span> {a.symptoms}
      </p>

      {a.files.length ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {a.files.map((file) => (
            <li key={file.id}>
              <a
                href={`/api/me/consultation-files/${file.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex max-w-64 items-center gap-1.5 rounded-full border border-line bg-cream px-3 py-1 text-xs text-ink hover:border-forest/40 hover:text-forest"
              >
                <FileText aria-hidden className="size-3.5 shrink-0" />
                <span className="truncate">{file.fileName}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {a.status === "CANCELLED" && a.cancelReason ? <p className="mt-3 text-sm text-muted-ink">{a.cancelReason}.</p> : null}

      {message ? (
        <p role="status" className="mt-4 flex items-center gap-2 text-sm text-forest-deep">
          <CheckCircle2 aria-hidden className="size-4" />
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-4 flex items-start gap-2 text-sm text-destructive">
          <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}

      {rateOpen ? (
        <div className="mt-4 rounded-xl border border-line bg-cream/60 p-4">
          <fieldset>
            <legend className="text-sm font-medium text-ink">Your rating</legend>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className="cursor-pointer rounded-md p-1 has-focus-visible:ring-2 has-focus-visible:ring-forest/40">
                  <input type="radio" name={`rate-${a.id}`} value={n} className="sr-only" checked={rating === n} onChange={() => setRating(n)} />
                  <Star aria-hidden className={cn("size-6", n <= rating ? "fill-amber-500 text-amber-500" : "text-line")} />
                  <span className="sr-only">
                    {n} {n === 1 ? "star" : "stars"}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <label htmlFor={`rate-comment-${a.id}`} className="mt-3 block text-sm font-medium text-ink">
            Anything to add? <span className="font-normal text-muted-ink">(optional)</span>
          </label>
          <Textarea
            id={`rate-comment-${a.id}`}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            rows={3}
            className="mt-1.5 rounded-xl border-line bg-paper"
          />
          <div className="mt-3 flex gap-2">
            <Button variant="brand" size="xl" onClick={rate} disabled={busy !== null}>
              {busy === "rate" ? <Loader2 aria-hidden className="animate-spin" /> : null}
              Submit rating
            </Button>
            <Button variant="ghost" size="xl" onClick={() => setRateOpen(false)} disabled={busy !== null}>
              Not now
            </Button>
          </div>
        </div>
      ) : null}

      {confirmingCancel ? (
        <div role="alertdialog" aria-labelledby={`cancel-${a.id}`} className="mt-4 rounded-xl border border-destructive/25 bg-destructive/5 p-4">
          <p id={`cancel-${a.id}`} className="text-sm text-ink">
            Cancel {a.appointmentNumber}? {a.paid ? "The fee you paid will be due back to you." : "The held time is released."}
          </p>
          <div className="mt-3 flex gap-2">
            <Button variant="destructive" size="xl" onClick={cancel} disabled={busy !== null}>
              {busy === "cancel" ? <Loader2 aria-hidden className="animate-spin" /> : null}
              Yes, cancel it
            </Button>
            <Button variant="ghost" size="xl" onClick={() => setConfirmingCancel(false)} disabled={busy !== null}>
              Keep it
            </Button>
          </div>
        </div>
      ) : null}

      {(() => {
        const actions = [
          a.meetingUrl ? (
            <Button key="join" asChild variant="brand" size="xl">
              <a href={a.meetingUrl} target="_blank" rel="noopener noreferrer">
                <Video aria-hidden />
                Join the call
                <ExternalLink aria-hidden className="size-3.5" />
              </a>
            </Button>
          ) : null,
          a.canPay ? (
            <Button key="pay" variant="brand" size="xl" onClick={pay} disabled={busy !== null}>
              {busy === "pay" ? <Loader2 aria-hidden className="animate-spin" /> : null}
              Pay {formatRupees(a.fee)}
            </Button>
          ) : null,
          a.prescription ? (
            <Button key="rx" asChild variant="brandOutline" size="xl">
              <Link href={`/account/prescriptions#rx-${a.prescription.id}`}>
                <ClipboardList aria-hidden />
                Prescription {a.prescription.prescriptionNumber}
              </Link>
            </Button>
          ) : null,
          a.canRate && !rateOpen ? (
            <Button key="rate" variant="brandOutline" size="xl" onClick={() => setRateOpen(true)} disabled={busy !== null}>
              <Star aria-hidden />
              Rate this consultation
            </Button>
          ) : null,
          a.canCancel && !confirmingCancel ? (
            <Button key="cancel" variant="ghost" size="xl" onClick={() => setConfirmingCancel(true)} disabled={busy !== null}>
              Cancel
            </Button>
          ) : null,
        ].filter(Boolean);
        return actions.length ? <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line/70 pt-4">{actions}</div> : null;
      })()}

      {a.status === "CONFIRMED" && !a.canCancel ? (
        <p className="mt-3 text-xs text-muted-ink">It starts within {CANCEL_HOURS} hours, so it can no longer be cancelled here.</p>
      ) : null}
    </article>
  );
}
