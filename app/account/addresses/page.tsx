"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import { AccountEmpty, AccountError, AccountLoading, AccountPageHeader, panelClass } from "@/components/account/AccountStates";
import { AddressFormSheet } from "@/components/account/AddressFormSheet";
import { FormNotice } from "@/components/shared/FormField";
import { repositories } from "@/lib/repositories";
import { describeError } from "@/lib/api";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { MAX_ADDRESSES, addressToForm, emptyAddressForm, type AddressForm } from "@/lib/account/addressForm";
import { cn } from "@/lib/utils";
import type { ApiAddress, ApiAddressInput } from "@/types/api/account";

const loadAddresses = () => repositories.account.getAddresses();

type Editing = { mode: "add" } | { mode: "edit"; address: ApiAddress } | null;

/**
 * Saved delivery addresses: GET, POST, PATCH and DELETE /api/me/addresses.
 * After every change the list is read again, because the backend decides
 * which address becomes the default (the first one saved, or the most recent
 * one when the default is deleted).
 */
export default function AddressesPage() {
  const { user } = useAuth();
  const { state, reload, refresh } = useAsyncData(loadAddresses);
  const [editing, setEditing] = useState<Editing>(null);
  const [lastEditing, setLastEditing] = useState<Exclude<Editing, null>>({ mode: "add" });
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const addresses = state.status === "ready" ? state.data : [];
  const full = addresses.length >= MAX_ADDRESSES;

  const open = (next: Exclude<Editing, null>) => {
    setNotice(null);
    setLastEditing(next);
    setEditing(next);
  };

  // The sheet keeps its content while it animates closed, so it reads the last opened form.
  const current = editing ?? lastEditing;
  const initial: AddressForm =
    current.mode === "edit"
      ? addressToForm(current.address)
      : emptyAddressForm({
          fullName: [user?.firstName, user?.lastName].filter(Boolean).join(" "),
          phone: user?.phone ?? "",
          isDefault: addresses.length === 0,
        });

  const save = async (input: ApiAddressInput) => {
    if (current.mode === "edit") await repositories.account.updateAddress(current.address.id, input);
    else await repositories.account.addAddress(input);
    await refresh();
    setEditing(null);
    setNotice({ tone: "success", text: current.mode === "edit" ? "Address updated." : "Address saved." });
  };

  const act = async (id: number, action: () => Promise<void>, done: string) => {
    if (busyId !== null) return;
    setBusyId(id);
    setNotice(null);
    try {
      await action();
      await refresh();
      setConfirmDelete(null);
      setNotice({ tone: "success", text: done });
    } catch (err) {
      setNotice({ tone: "error", text: describeError(err, "That did not work. Please try again.") });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <AccountPageHeader
        title="Addresses"
        description={`Saved for faster checkout. You can keep up to ${MAX_ADDRESSES}.`}
        action={
          state.status === "ready" && addresses.length > 0 ? (
            <Button variant="brand" size="xl" onClick={() => open({ mode: "add" })} disabled={full} className="w-full sm:w-auto">
              <Plus aria-hidden />
              Add address
            </Button>
          ) : null
        }
      />

      {notice ? (
        <FormNotice tone={notice.tone} className="mb-5">
          {notice.text}
        </FormNotice>
      ) : null}
      {full ? (
        <FormNotice tone="info" className="mb-5">
          You have {MAX_ADDRESSES} saved addresses, the most we can keep. Delete one to add another.
        </FormNotice>
      ) : null}

      {state.status === "loading" ? <AccountLoading rows={2} label="Loading your addresses…" /> : null}
      {state.status === "error" ? <AccountError message={state.message} onRetry={reload} /> : null}

      {state.status === "ready" && addresses.length === 0 ? (
        <AccountEmpty
          icon={<MapPin aria-hidden className="size-6" strokeWidth={1.6} />}
          title="No saved addresses yet"
          action={
            <Button variant="brand" size="xl" onClick={() => open({ mode: "add" })}>
              <Plus aria-hidden />
              Add your first address
            </Button>
          }
        >
          Add one now, or tick &ldquo;save this address&rdquo; when you check out.
        </AccountEmpty>
      ) : null}

      {state.status === "ready" && addresses.length > 0 ? (
        <ul className="grid gap-4 lg:grid-cols-2">
          {addresses.map((address) => {
            const busy = busyId === address.id;
            const confirming = confirmDelete === address.id;
            return (
              <li
                key={address.id}
                className={cn(panelClass, "flex flex-col p-5 sm:p-6", address.isDefault && "border-forest/30 bg-sage-wash/50")}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-ink">{address.fullName}</p>
                  {address.isDefault ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-forest px-2.5 py-0.5 text-xs font-semibold text-cream">
                      <CheckCircle2 aria-hidden className="size-3.5" />
                      Default
                    </span>
                  ) : null}
                </div>
                <address className="mt-2 flex-1 space-y-0.5 text-sm text-muted-ink not-italic">
                  <p>{address.line1}</p>
                  {address.landmark ? <p>{address.landmark}</p> : null}
                  <p>
                    {address.city}, {address.state} {address.pincode}
                  </p>
                  <p className="pt-2 text-ink">+91 {address.phone}</p>
                </address>

                {confirming ? (
                  <div role="alertdialog" aria-labelledby={`delete-${address.id}`} className="mt-5 rounded-xl border border-destructive/25 bg-destructive/5 p-4">
                    <p id={`delete-${address.id}`} className="text-sm font-medium text-ink">
                      Delete this address?{address.isDefault ? " Another saved address will become your default." : ""}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="destructive"
                        size="lg"
                        className="rounded-lg"
                        disabled={busy}
                        onClick={() => act(address.id, () => repositories.account.deleteAddress(address.id), "Address deleted.")}
                        autoFocus
                      >
                        {busy ? <Loader2 aria-hidden className="animate-spin" /> : <Trash2 aria-hidden />}
                        Delete
                      </Button>
                      <Button variant="ghost" size="lg" className="rounded-lg" disabled={busy} onClick={() => setConfirmDelete(null)}>
                        Keep it
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 flex flex-wrap items-center gap-x-1 gap-y-2 border-t border-line/70 pt-4">
                    <Button variant="ghost" size="lg" className="rounded-lg text-ink" disabled={busyId !== null} onClick={() => open({ mode: "edit", address })}>
                      <Pencil aria-hidden />
                      Edit
                    </Button>
                    {!address.isDefault ? (
                      <Button
                        variant="ghost"
                        size="lg"
                        className="rounded-lg text-ink"
                        disabled={busyId !== null}
                        onClick={() => act(address.id, () => repositories.account.setDefaultAddress(address.id), "Default address updated.")}
                      >
                        {busy ? <Loader2 aria-hidden className="animate-spin" /> : <CheckCircle2 aria-hidden />}
                        Make default
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="lg"
                      className="ml-auto rounded-lg text-destructive hover:bg-destructive/6 hover:text-destructive"
                      disabled={busyId !== null}
                      onClick={() => {
                        setNotice(null);
                        setConfirmDelete(address.id);
                      }}
                      aria-label={`Delete address for ${address.fullName}, ${address.line1}`}
                    >
                      <Trash2 aria-hidden />
                      Delete
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}

      <AddressFormSheet
        open={editing !== null}
        onOpenChange={(next) => !next && setEditing(null)}
        mode={current.mode}
        initial={initial}
        onSubmit={save}
        lockDefault={current.mode === "edit" && current.address.isDefault}
      />
    </div>
  );
}
