"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FormNotice, SelectField, TextField } from "@/components/shared/FormField";
import { INDIAN_STATES } from "@/lib/checkout/checkoutForm";
import { ApiError, describeError } from "@/lib/api";
import {
  ADDRESS_FIELD_ORDER,
  type AddressErrors,
  type AddressField,
  type AddressForm,
  toAddressInput,
  validateAddress,
} from "@/lib/account/addressForm";
import type { ApiAddressInput } from "@/types/api/account";

type AddressFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  initial: AddressForm;
  /** Saves to the backend; throws ApiError on refusal. */
  onSubmit: (input: ApiAddressInput) => Promise<void>;
  /** The default address cannot be un-defaulted directly: another one has to become the default. */
  lockDefault: boolean;
};

/** Adding or editing a saved address, in a side panel (a bottom sheet on phones). */
export function AddressFormSheet({ open, onOpenChange, mode, initial, onSubmit, lockDefault }: AddressFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto border-line bg-canvas p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg"
      >
        <SheetHeader className="border-b border-line/70 px-6 py-5 text-left">
          <SheetTitle className="font-display text-xl font-normal text-ink">{mode === "add" ? "Add an address" : "Edit address"}</SheetTitle>
          <SheetDescription className="text-sm text-muted-ink">Where should we deliver? All fields except the landmark are needed.</SheetDescription>
        </SheetHeader>
        {/* Remounted each time it opens, so it always starts from `initial`. */}
        {open ? <AddressFormBody mode={mode} initial={initial} onSubmit={onSubmit} onCancel={() => onOpenChange(false)} lockDefault={lockDefault} /> : null}
      </SheetContent>
    </Sheet>
  );
}

function AddressFormBody({
  mode,
  initial,
  onSubmit,
  onCancel,
  lockDefault,
}: {
  mode: "add" | "edit";
  initial: AddressForm;
  onSubmit: (input: ApiAddressInput) => Promise<void>;
  onCancel: () => void;
  lockDefault: boolean;
}) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<AddressErrors>({});
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const update = <K extends keyof AddressForm>(field: K, value: AddressForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    if ((field !== "isDefault" && errors[field as AddressField]) || errors.form) {
      setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (savingRef.current) return;
    const found = validateAddress(form);
    const first = ADDRESS_FIELD_ORDER.find((field) => found[field]);
    if (first) {
      setErrors(found);
      document.getElementById(`address-${first}`)?.focus();
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setErrors({});
    try {
      await onSubmit(toAddressInput(form));
    } catch (err) {
      const fields = err instanceof ApiError ? err.fieldErrors : {};
      setErrors({ ...fields, form: describeError(err, "We could not save this address. Please try again.") });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const text = (field: AddressField, label: string, props: Partial<React.ComponentProps<typeof TextField>> = {}) => (
    <TextField
      id={`address-${field}`}
      label={label}
      value={form[field]}
      onChange={(e) => update(field, e.target.value)}
      error={errors[field]}
      disabled={saving}
      {...props}
    />
  );

  return (
    <form onSubmit={submit} noValidate className="flex flex-1 flex-col">
      <div className="flex-1 space-y-5 px-6 py-6">
        {errors.form ? <FormNotice tone="error">{errors.form}</FormNotice> : null}
        {text("fullName", "Full name", { autoComplete: "name" })}
        <div className="grid gap-5 sm:grid-cols-2">
          {text("phone", "Mobile number", { type: "tel", inputMode: "tel", autoComplete: "tel-national", prefix: "+91" })}
          {text("pincode", "Pincode", {
            inputMode: "numeric",
            autoComplete: "postal-code",
            maxLength: 6,
            onChange: (e) => update("pincode", e.target.value.replace(/\D/g, "").slice(0, 6)),
          })}
        </div>
        {text("line1", "House number and street", { autoComplete: "address-line1" })}
        {text("landmark", "Landmark", { optional: true, autoComplete: "address-line2" })}
        <div className="grid gap-5 sm:grid-cols-2">
          {text("city", "City", { autoComplete: "address-level2" })}
          <SelectField
            id="address-state"
            label="State"
            autoComplete="address-level1"
            value={form.state}
            onChange={(e) => update("state", e.target.value)}
            error={errors.state}
            disabled={saving}
          >
            <option value="">Choose a state</option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </SelectField>
        </div>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-ink has-disabled:cursor-default has-disabled:opacity-70">
          <Checkbox
            checked={form.isDefault}
            disabled={saving || lockDefault}
            onCheckedChange={(checked) => update("isDefault", checked === true)}
            className="border-line bg-paper data-checked:border-forest data-checked:bg-forest"
          />
          {lockDefault ? "This is your default address" : "Use as my default delivery address"}
        </label>
      </div>
      <div className="sticky bottom-0 flex gap-3 border-t border-line/70 bg-canvas px-6 py-4">
        <Button type="button" variant="brandOutline" size="xl" className="flex-1" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" variant="brand" size="xl" className="flex-1" disabled={saving} aria-busy={saving}>
          {saving ? <Loader2 aria-hidden className="animate-spin" /> : null}
          {saving ? "Saving…" : mode === "add" ? "Save address" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
