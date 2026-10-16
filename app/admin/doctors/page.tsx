"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { Plus, Search, Stethoscope, RefreshCw, FileText, ChevronRight } from "lucide-react";
import { AdminShell, useAdmin } from "@/components/admin/AdminShell";
import { AdminEmpty, AdminError, AdminLoading, BRAND_BUTTON, Pager, StatusTabs, rupees, shortDate, useDebounced } from "@/components/admin/AdminUi";
import { LiveBadge, VerificationBadge } from "@/components/admin/doctors/VerificationBadge";
import { VERIFICATION_LABEL } from "@/components/admin/doctors/doctorLabels";
import { DoctorAvatar } from "@/components/doctors/DoctorAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listDoctors } from "@/lib/admin/care";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import type { VerificationStatus } from "@/types/api/admin-care";

const STATUS_ORDER: VerificationStatus[] = ["PENDING", "UNDER_REVIEW", "APPROVED", "SUSPENDED", "REJECTED", "DRAFT"];

export default function AdminDoctorsPage() {
  return (
    <AdminShell
      area="doctors"
      title="Doctors Desk"
      description="Register, verify and publish doctors; set their fees, specialties and working hours."
    >
      <DoctorsDesk />
    </AdminShell>
  );
}

function DoctorsDesk() {
  const { can } = useAdmin();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<VerificationStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const q = useDebounced(search.trim());

  const load = useCallback(
    () => listDoctors({ q: q || undefined, status: status === "ALL" ? undefined : status, page, pageSize: 20 }),
    [q, status, page],
  );
  const { state, reload } = useAsyncData(load);

  const counts = state.status === "ready" ? state.data.statusCounts : {};
  const total = Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0);
  const tabs = [
    { value: "ALL" as const, label: "All", count: state.status === "ready" ? total : undefined },
    ...STATUS_ORDER.filter((s) => s === "PENDING" || s === "APPROVED" || (counts[s] ?? 0) > 0).map((s) => ({
      value: s,
      label: VERIFICATION_LABEL[s],
      count: counts[s] ?? 0,
    })),
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            type="search"
            aria-label="Search doctors"
            placeholder="Search by name, specialty or registration number"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-10 bg-neutral-50/60 pl-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={reload} className="h-10 gap-1.5 text-xs">
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
          {can("doctors", "manage") ? (
            <Button asChild className={`h-10 gap-1.5 text-xs ${BRAND_BUTTON}`}>
              <Link href="/admin/doctors/new">
                <Plus className="size-4" />
                Register a doctor
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <StatusTabs
        label="Filter by verification"
        options={tabs}
        value={status}
        onChange={(next) => {
          setStatus(next);
          setPage(1);
        }}
      />

      <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-xs">
        {state.status === "loading" ? (
          <AdminLoading label="Loading doctors" />
        ) : state.status === "error" ? (
          <AdminError message={state.message} onRetry={reload} />
        ) : state.data.items.length === 0 ? (
          q || status !== "ALL" ? (
            <AdminEmpty icon={Search} title="No doctors match">
              Try another search, or choose a different status.
            </AdminEmpty>
          ) : (
            <AdminEmpty
              icon={Stethoscope}
              title="No doctors registered yet"
              action={
                can("doctors", "manage") ? (
                  <Button asChild className={`h-9 gap-1.5 text-xs ${BRAND_BUTTON}`}>
                    <Link href="/admin/doctors/new">
                      <Plus className="size-4" />
                      Register a doctor
                    </Link>
                  </Button>
                ) : null
              }
            >
              Doctors who register themselves arrive here for review. You can also register a doctor by hand, with
              their real registration details and documents.
            </AdminEmpty>
          )
        ) : (
          <>
            {/* Desktop and tablet: a table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-xs">
                <caption className="sr-only">Doctors</caption>
                <thead className="border-b border-neutral-200 bg-[#f9faf9] font-semibold tracking-wider text-neutral-500 uppercase">
                  <tr>
                    <th scope="col" className="px-5 py-3">Doctor</th>
                    <th scope="col" className="px-5 py-3">Specialty</th>
                    <th scope="col" className="px-5 py-3">Fees</th>
                    <th scope="col" className="px-5 py-3">Verification</th>
                    <th scope="col" className="px-5 py-3">On the website</th>
                    <th scope="col" className="px-5 py-3"><span className="sr-only">Open</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {state.data.items.map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-neutral-50/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <DoctorAvatar photoUrl={doctor.photoUrl} className="size-9" />
                          <div className="min-w-0">
                            <Link href={`/admin/doctors/${doctor.id}`} className="font-semibold text-neutral-900 hover:text-[#0d5a43] hover:underline">
                              {doctor.displayName}
                            </Link>
                            <div className="text-[11px] text-neutral-500">
                              {[doctor.qualification, doctor.registrationNumber ? `Reg. ${doctor.registrationNumber}` : null].filter(Boolean).join(" · ") || "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-neutral-700">
                        {doctor.specialization ?? "—"}
                        {doctor.experienceYears !== null ? <div className="text-[11px] text-neutral-500">{doctor.experienceYears} yrs experience</div> : null}
                      </td>
                      <td className="px-5 py-3 text-neutral-700 tabular-nums">
                        <div>Video {rupees(doctor.videoFee)}</div>
                        <div className="text-[11px] text-neutral-500">Audio {rupees(doctor.audioFee)}</div>
                      </td>
                      <td className="px-5 py-3">
                        <VerificationBadge status={doctor.verificationStatus} />
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-neutral-500">
                          <FileText className="size-3" aria-hidden />
                          {doctor.documentCount} {doctor.documentCount === 1 ? "document" : "documents"}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <LiveBadge live={doctor.acceptsConsultations && doctor.verificationStatus === "APPROVED"} />
                        <div className="mt-1 text-[11px] text-neutral-500">Since {shortDate(doctor.createdAt)}</div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                          <Link href={`/admin/doctors/${doctor.id}`} aria-label={`Open ${doctor.displayName}`}>
                            Open
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phones: cards */}
            <ul className="divide-y divide-neutral-100 md:hidden">
              {state.data.items.map((doctor) => (
                <li key={doctor.id}>
                  <Link href={`/admin/doctors/${doctor.id}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50">
                    <DoctorAvatar photoUrl={doctor.photoUrl} className="size-10" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-neutral-900">{doctor.displayName}</div>
                      <div className="truncate text-[11px] text-neutral-500">{doctor.specialization ?? doctor.qualification ?? "—"}</div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <VerificationBadge status={doctor.verificationStatus} />
                        <LiveBadge live={doctor.acceptsConsultations && doctor.verificationStatus === "APPROVED"} />
                      </div>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-neutral-400" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>

            <Pager page={state.data.page} pageCount={state.data.pageCount} total={state.data.total} onPage={setPage} noun="doctors" />
          </>
        )}
      </div>

      <p className="text-[11px] leading-relaxed text-neutral-500">
        Patients see a doctor on the website only when the doctor is verified, consultations are switched on and
        weekly working hours are set. Open a doctor to see which of these steps is still missing.
      </p>
    </div>
  );
}
