"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ProductThumb } from "@/components/commerce/ProductThumb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Lock,
  MapPin,
  RotateCw,
  ShoppingBag,
  Smartphone,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/Container";
import { OrderSummary } from "@/components/commerce/OrderSummary";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/components/providers/CartProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { repositories, usingMockData } from "@/lib/repositories";
import { buildCartView, type CartLineView } from "@/lib/cart/cartView";
import { formatRupees } from "@/lib/formatters/price";
import {
  CheckoutError,
  EMPTY_FORM,
  FIELD_ORDER,
  INDIAN_STATES,
  toApiAddress,
  validateCheckoutForm,
  type CheckoutField,
  type CheckoutForm,
} from "@/lib/checkout/checkoutForm";
import type { ApiPaymentMethod } from "@/types/api/cart";
import type { ApiAddress } from "@/types/api/account";
import type { ApiServiceabilityResult } from "@/types/api/serviceability";
import { CartBreadcrumb } from "@/sections/cart/CartView";
import { CheckoutPrescription } from "@/sections/checkout/CheckoutPrescription";

const FIELD_LABELS: Record<CheckoutField, string> = {
  fullName: "Full name",
  phone: "Mobile number",
  line1: "House number and street",
  landmark: "Landmark",
  city: "City",
  state: "State",
  pincode: "Pincode",
  note: "Delivery instructions",
};

type PaymentOption = { value: ApiPaymentMethod; title: string; detail: string };

/**
 * /checkout. One calm page: who is ordering, where it goes, how it is paid,
 * and — alongside — exactly what is being bought.
 *
 * Placing an order needs a signed-in account (the backend's POST
 * /api/me/checkout is account-only), so the form waits for sign-in rather
 * than collecting details that would be lost on the way to /login.
 * Totals come from the shared cart view; the order is submitted with the
 * quoted total so the shop can refuse it if prices moved.
 */
export function CheckoutView() {
  const router = useRouter();
  const cart = useCart();
  const auth = useAuth();
  const { lines, totals } = buildCartView(cart.items, cart.quote, cart.quoteIsCurrent);

  const [form, setForm] = useState<CheckoutForm>(EMPTY_FORM);
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);
  const submittingRef = useRef(false);
  const alertRef = useRef<HTMLDivElement>(null);

  // Start from what the account already knows, once per signed-in user.
  const [prefilledFor, setPrefilledFor] = useState<number | null>(null);
  if (auth.user && prefilledFor !== auth.user.id) {
    const user = auth.user;
    setPrefilledFor(user.id);
    setForm((current) => ({
      ...current,
      phone: current.phone || user.phone,
      fullName: current.fullName || [user.firstName, user.lastName].filter(Boolean).join(" "),
    }));
  }

  // Saved addresses (GET /api/me/addresses, default first). The default fills
  // the form once; choosing another fills it again; "a different address"
  // clears it. A saved address is not saved a second time.
  const [saved, setSaved] = useState<{ userId: number; items: ApiAddress[] } | null>(null);
  // A saved address id; "new" for a blank form; "edit" when a saved address
  // needs correcting (the fields open, prefilled); null until the list arrives.
  const [chosenAddress, setChosenAddress] = useState<number | "new" | "edit" | null>(null);
  const showAddressFields = typeof chosenAddress !== "number";
  const signedInUserId = auth.status === "authenticated" ? (auth.user?.id ?? null) : null;
  useEffect(() => {
    if (signedInUserId === null) return;
    let active = true;
    repositories.account.getAddresses().then(
      (items) => active && setSaved({ userId: signedInUserId, items }),
      // Saved addresses are a shortcut; without them the form still works.
      () => active && setSaved({ userId: signedInUserId, items: [] }),
    );
    return () => {
      active = false;
    };
  }, [signedInUserId]);
  const savedAddresses = saved && saved.userId === signedInUserId ? saved.items : [];

  const chooseSavedAddress = (address: ApiAddress) => {
    setChosenAddress(address.id);
    setForm((current) => ({
      ...current,
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      landmark: address.landmark ?? "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      saveAddress: false,
    }));
  };
  const chooseNewAddress = () => {
    setChosenAddress("new");
    setForm((current) => ({ ...EMPTY_FORM, fullName: current.fullName, phone: current.phone, note: current.note }));
  };
  if (chosenAddress === null && savedAddresses.length > 0) chooseSavedAddress(savedAddresses[0]);

  // Delivery check for a complete pincode (GET /api/shop/pincode/:pincode).
  const pincode = /^\d{6}$/.test(form.pincode.trim()) ? form.pincode.trim() : null;
  const [pinAnswer, setPinAnswer] = useState<{ pincode: string; result: ApiServiceabilityResult | null } | null>(null);
  const [pinAttempt, setPinAttempt] = useState(0);
  useEffect(() => {
    if (!pincode) return;
    let active = true;
    repositories.serviceability.checkPincode(pincode).then(
      (result) => active && setPinAnswer({ pincode, result }),
      () => active && setPinAnswer({ pincode, result: null }),
    );
    return () => {
      active = false;
    };
  }, [pincode, pinAttempt]);
  const retryPincode = () => {
    setPinAnswer(null);
    setPinAttempt((n) => n + 1);
  };
  const pin = pincode && pinAnswer?.pincode === pincode ? pinAnswer : null;
  const pinBlocked = pin?.result?.deliverable === false;

  const errors = validated ? validateCheckoutForm(form) : {};
  const errorFields = FIELD_ORDER.filter((field) => errors[field]);

  const quote = cart.quote;
  const codAllowed = (quote?.codAvailable ?? true) && pin?.result?.codAvailable !== false;
  const paymentOptions: PaymentOption[] = [
    ...(codAllowed
      ? [{ value: "COD" as const, title: "Pay on delivery", detail: "Pay the courier by cash or UPI when your order arrives." }]
      : []),
    ...(quote?.onlinePayment
      ? [
          {
            value: "ONLINE" as const,
            title: "Pay online",
            detail: quote.onlineTest
              ? "Test mode — no money is taken."
              : "UPI, cards or net banking on a secure payment page.",
          },
        ]
      : []),
    ...(quote?.wholesale
      ? [{ value: "CREDIT" as const, title: "Buy on credit", detail: `Billed to ${quote.wholesale.businessName}.` }]
      : []),
  ];
  const paymentChosen = paymentOptions.some((option) => option.value === cart.paymentMethod);
  // The current choice is no longer offered (a product is prepaid-only, the
  // pincode refuses COD…) and only one way remains: take it.
  if (!paymentChosen && paymentOptions.length === 1 && cart.quoteStatus === "ready") {
    cart.setPaymentMethod(paymentOptions[0].value);
  }
  const paymentNotes = quote?.paymentConflict
    ? [quote.paymentConflict]
    : [quote?.codNote, quote?.onlineNote].filter((note): note is string => Boolean(note));
  const blockedLine = lines.find((line) => line.problem);
  const signedIn = auth.status === "authenticated";
  const priceReady = cart.quoteStatus === "ready" && !totals.provisional;

  const update = (field: keyof CheckoutForm, value: string | boolean) =>
    setForm((current) => ({ ...current, [field]: value }));

  const focusField = (field: CheckoutField) => document.getElementById(`checkout-${field}`)?.focus();

  const fail = (message: string) => {
    setSubmitError(message);
    requestAnimationFrame(() => alertRef.current?.focus());
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submittingRef.current) return;
    setValidated(true);
    setSubmitError(null);

    const found = validateCheckoutForm(form);
    const first = FIELD_ORDER.find((field) => found[field]);
    if (first) {
      // A saved address that does not pass (older data): open it for correcting.
      if (typeof chosenAddress === "number") setChosenAddress("edit");
      requestAnimationFrame(() => focusField(first));
      return;
    }
    if (pinBlocked) return fail("We don't deliver to this pincode yet. Try another address.");
    if (quote?.paymentConflict) return fail(quote.paymentConflict);
    if (!paymentChosen) return fail("Choose how you'd like to pay.");
    if (blockedLine) return fail(`${blockedLine.name}: ${blockedLine.problem}. Update your cart to continue.`);
    if (!priceReady) return fail("Prices are still being checked with the shop. Try again in a moment.");

    submittingRef.current = true;
    setSubmitting(true);
    try {
      const result = await repositories.cart.checkout({
        lines: cart.items.map(({ variantId, quantity }) => ({ variantId, quantity })),
        couponCode: totals.coupon?.code,
        paymentMethod: cart.paymentMethod,
        address: toApiAddress(form),
        saveAddress: form.saveAddress,
        note: form.note.trim() || null,
        expectedTotal: totals.total,
        prescriptionId: cart.prescription?.id,
      });
      setPlaced(true);
      if (result.payUrl) {
        // Online payment: the gateway's page takes over; the order waits for its answer.
        cart.clearCart();
        window.location.assign(result.payUrl);
        return;
      }
      router.replace(`/thankyou?order=${result.id}`);
      cart.clearCart();
    } catch (error) {
      if (error instanceof CheckoutError && error.status === 409) cart.retryQuote();
      if (error instanceof CheckoutError && error.status === 401) {
        submittingRef.current = false;
        setSubmitting(false);
        return fail("Your session has ended. Sign in again to place your order — your cart is kept.");
      }
      submittingRef.current = false;
      setSubmitting(false);
      fail(
        error instanceof CheckoutError
          ? error.message
          : "We couldn't place your order just now. Nothing was charged — please try again.",
      );
    }
  };

  if (placed) {
    return (
      <section className="dh-page-top dh-section-b" role="status">
        <Container className="flex flex-col items-center text-center">
          <Loader2 aria-hidden className="size-8 text-forest motion-safe:animate-spin" />
          <p className="mt-4 text-base text-ink">Taking you to your order confirmation…</p>
        </Container>
      </section>
    );
  }

  if (!cart.hydrated) {
    return (
      <section className="dh-page-top dh-section-b" role="status">
        <span className="sr-only">Loading checkout…</span>
        <Container>
          <div aria-hidden className="h-12 w-56 rounded-md bg-cream-sunk motion-safe:animate-pulse" />
          <div aria-hidden className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px]">
            <div className="h-96 rounded-card bg-cream-sunk motion-safe:animate-pulse" />
            <div className="h-80 rounded-card bg-cream-sunk motion-safe:animate-pulse" />
          </div>
        </Container>
      </section>
    );
  }

  if (lines.length === 0) {
    return (
      <section aria-labelledby="checkout-heading" className="dh-page-top dh-section-b">
        <Container>
          <CartBreadcrumb current="Checkout" via={{ label: "Cart", href: "/cart" }} />
          <div className="mx-auto mt-6 max-w-lg text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-sage-tint text-forest">
              <ShoppingBag aria-hidden className="size-7" strokeWidth={1.6} />
            </span>
            <h1 id="checkout-heading" className="dh-title-section mt-5 text-ink">
              There&apos;s nothing to check out
            </h1>
            <p className="mt-3 text-muted-ink">Your cart is empty. Add something first and come back here.</p>
            <Button asChild variant="brand" size="xl" className="mt-7">
              <Link href="/products">
                Shop medicines
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        </Container>
      </section>
    );
  }

  const placeOrderLabel = submitting
    ? "Placing your order…"
    : cart.paymentMethod === "ONLINE"
      ? `Continue to payment · ${formatRupees(totals.total)}`
      : `Place order · ${formatRupees(totals.total)}`;

  return (
    <>
      <section aria-labelledby="checkout-heading" className="dh-page-top dh-section-b">
        <Container>
          <CartBreadcrumb current="Checkout" via={{ label: "Cart", href: "/cart" }} />
          <h1 id="checkout-heading" className="dh-title-page text-ink">
            Checkout
          </h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-ink">
            <Lock aria-hidden className="size-3.5" />
            We use these details to deliver your order, and save the address to your account only if you choose.
          </p>

          <MobileOrderPeek lines={lines} total={totals.total} />

          <CheckoutPrescription userId={signedInUserId} />

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14">
            <form id="checkout-form" noValidate onSubmit={onSubmit} className="min-w-0 space-y-8">
              {submitError ? (
                <div
                  ref={alertRef}
                  tabIndex={-1}
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3.5 text-sm text-ink"
                >
                  <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <span>{submitError}</span>
                </div>
              ) : null}

              {errorFields.length > 0 ? (
                <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3.5 text-sm text-ink">
                  <p className="font-semibold">
                    Check {errorFields.length === 1 ? "this field" : `these ${errorFields.length} fields`} to continue:
                  </p>
                  <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
                    {errorFields.map((field) => (
                      <li key={field}>
                        <a
                          href={`#checkout-${field}`}
                          onClick={(event) => {
                            event.preventDefault();
                            focusField(field);
                          }}
                          className="underline underline-offset-2"
                        >
                          {FIELD_LABELS[field]}
                        </a>
                        {" — "}
                        {errors[field]}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <CheckoutSection step={1} title="Contact" icon={<Smartphone aria-hidden className="size-4" />}>
                {auth.status === "loading" ? (
                  <div aria-hidden className="h-14 rounded-xl bg-cream-sunk motion-safe:animate-pulse" />
                ) : signedIn && auth.user ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line-soft bg-paper shadow-2xs px-4 py-3.5 text-sm">
                    <span className="flex items-center gap-2 text-ink">
                      <CheckCircle2 aria-hidden className="size-4 text-forest" />
                      Signed in as <strong className="font-semibold">+91 {auth.user.phone}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => auth.logout()}
                      className="font-semibold text-forest underline-offset-4 hover:underline"
                    >
                      Not you? Sign out
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-forest/25 bg-forest/6 px-5 py-4">
                    <p className="font-semibold text-ink">Sign in to place your order</p>
                    <p className="mt-1 text-sm text-muted-ink">
                      Orders are linked to your mobile number so you can track them. Your cart is saved while you sign in.
                    </p>
                    <Button asChild variant="brand" size="xl" className="mt-4">
                      <Link href="/login?callbackUrl=/checkout">
                        Sign in with your mobile
                        <ArrowRight aria-hidden />
                      </Link>
                    </Button>
                  </div>
                )}
              </CheckoutSection>

              {/* Disabled until signed in: nothing typed here would survive the trip to /login. */}
              <fieldset disabled={!signedIn || submitting} className="space-y-8 disabled:opacity-60">
                <CheckoutSection step={2} title="Delivery address" icon={<MapPin aria-hidden className="size-4" />}>
                  {savedAddresses.length > 0 ? (
                    <SavedAddressPicker
                      addresses={savedAddresses}
                      chosen={chosenAddress}
                      onChoose={chooseSavedAddress}
                      onNew={chooseNewAddress}
                    />
                  ) : null}
                  <div className={cn("grid gap-x-4 gap-y-5 sm:grid-cols-2", !showAddressFields && "hidden")}>
                    <TextField field="fullName" form={form} errors={errors} onChange={update} required autoComplete="name" className="sm:col-span-2" />
                    <TextField
                      field="phone"
                      form={form}
                      errors={errors}
                      onChange={update}
                      required
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      hint="10 digits, for delivery updates"
                      prefix="+91"
                    />
                    <TextField
                      field="pincode"
                      form={form}
                      errors={errors}
                      onChange={(f, v) => update(f, String(v).replace(/\D/g, "").slice(0, 6))}
                      required
                      inputMode="numeric"
                      autoComplete="postal-code"
                      hint={<PincodeStatus pincode={pincode} pin={pin} onRetry={retryPincode} />}
                    />
                    <TextField field="line1" form={form} errors={errors} onChange={update} required autoComplete="address-line1" className="sm:col-span-2" />
                    <TextField field="landmark" form={form} errors={errors} onChange={update} autoComplete="address-line2" hint="Optional" className="sm:col-span-2" />
                    <TextField field="city" form={form} errors={errors} onChange={update} required autoComplete="address-level2" />
                    <StateField form={form} errors={errors} onChange={update} />
                  </div>
                  <label className={cn("mt-5 flex cursor-pointer items-center gap-3 text-sm text-ink", !showAddressFields && "hidden")}>
                    <Checkbox
                      checked={form.saveAddress}
                      onCheckedChange={(checked) => update("saveAddress", checked === true)}
                      className="border-line bg-cream data-checked:border-forest data-checked:bg-forest"
                    />
                    Save this address to my account for next time
                  </label>
                </CheckoutSection>

                <CheckoutSection step={3} title="Delivery" icon={<Truck aria-hidden className="size-4" />}>
                  <p className="text-sm text-muted-ink">
                    {totals.shipping === null
                      ? "The delivery charge is confirmed once prices are checked."
                      : totals.shipping === 0
                        ? "Delivery is free on this order."
                        : `Delivery on this order costs ${formatRupees(totals.shipping)}.`}{" "}
                    {pin?.result?.deliveryDays
                      ? `Usually arrives in ${pin.result.deliveryDays} ${pin.result.deliveryDays === 1 ? "day" : "days"} at ${pin.pincode}.`
                      : "Delivery times are confirmed when your order is dispatched."}
                  </p>
                  <div className="mt-5">
                    <TextField
                      field="note"
                      form={form}
                      errors={errors}
                      onChange={update}
                      multiline
                      hint="Optional — e.g. a gate code or a good time to call"
                    />
                  </div>
                </CheckoutSection>

                <CheckoutSection step={4} title="Payment" icon={<Lock aria-hidden className="size-4" />}>
                  <PaymentChoice
                    options={paymentOptions}
                    value={cart.paymentMethod}
                    onChange={cart.setPaymentMethod}
                    onlineMissing={quote !== null && !quote.onlinePayment && !quote.onlineNote}
                    codBlockedByPincode={pin?.result?.codAvailable === false}
                    notes={paymentNotes}
                    conflict={Boolean(quote?.paymentConflict)}
                  />
                </CheckoutSection>
              </fieldset>
            </form>

            <aside aria-label="Your order" className="lg:sticky lg:top-28 lg:self-start">
              <OrderSummary
                totals={totals}
                heading="Your order"
                updating={cart.quoteStatus === "loading"}
                leading={<OrderLines lines={lines} />}
              >
                {cart.quoteStatus === "error" ? (
                  <div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-ink">
                    <span>{cart.quoteError}</span>
                    <button type="button" onClick={cart.retryQuote} className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-forest">
                      <RotateCw aria-hidden className="size-3.5" />
                      Retry
                    </button>
                  </div>
                ) : null}
                {signedIn ? (
                  <Button
                    type="submit"
                    form="checkout-form"
                    variant="brand"
                    size="xl"
                    className="w-full"
                    disabled={submitting || cart.quoteStatus === "error"}
                    aria-busy={submitting || undefined}
                  >
                    {submitting ? <Loader2 aria-hidden className="motion-safe:animate-spin" /> : null}
                    {placeOrderLabel}
                  </Button>
                ) : (
                  <Button asChild variant="brand" size="xl" className="w-full">
                    <Link href="/login?callbackUrl=/checkout">Sign in to place your order</Link>
                  </Button>
                )}
                <Link href="/cart" className="block text-center text-sm font-semibold text-forest underline-offset-4 hover:underline">
                  Edit cart
                </Link>
                {usingMockData ? (
                  <p className="rounded-lg bg-cream-sunk px-3 py-2 text-xs leading-relaxed text-muted-ink">
                    Development preview: placing an order here creates a preview reference only. Nothing is sent to the
                    shop and nothing is charged.
                  </p>
                ) : null}
              </OrderSummary>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}

function CheckoutSection({ step, title, icon, children }: { step: number; title: string; icon: ReactNode; children: ReactNode }) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className="border-t border-line-soft pt-6 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:fill-mode-both"
      style={{ animationDelay: `${(step - 1) * 60}ms`, animationDuration: "var(--duration-medium)" }}
    >
      <h2 id={id} className="mb-4 flex items-center gap-3 text-lg font-semibold text-ink">
        <span aria-hidden className="grid size-7 place-items-center rounded-full bg-forest/10 text-[0.8125rem] font-semibold text-forest">
          {step}
        </span>
        {title}
        <span className="sr-only">, step {step} of 4</span>
        <span aria-hidden className="ml-auto text-muted-ink">
          {icon}
        </span>
      </h2>
      {children}
    </section>
  );
}

type FieldProps = {
  field: CheckoutField;
  form: CheckoutForm;
  errors: Partial<Record<CheckoutField, string>>;
  onChange: (field: CheckoutField, value: string) => void;
  required?: boolean;
  hint?: ReactNode;
  className?: string;
  multiline?: boolean;
  prefix?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
};

function Label({ htmlFor, field, required }: { htmlFor: string; field: CheckoutField; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
      {FIELD_LABELS[field]}
      {required ? (
        <>
          <span aria-hidden className="ml-0.5 text-destructive">
            *
          </span>
          <span className="sr-only"> (required)</span>
        </>
      ) : null}
    </label>
  );
}

const inputClass =
  "h-12 rounded-xl border-line-soft bg-paper px-3.5 text-[0.9375rem] text-ink shadow-2xs placeholder:text-muted-ink/70 aria-invalid:border-destructive";

function TextField({ field, form, errors, onChange, required, hint, className, multiline, prefix, type = "text", inputMode, autoComplete }: FieldProps) {
  const id = `checkout-${field}`;
  const error = errors[field];
  // While a field is in error its message replaces the hint; showing both repeats the same rule.
  const showHint = Boolean(hint) && !error;
  const describedBy = [error ? `${id}-error` : null, showHint ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    name: field,
    value: String(form[field]),
    required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    autoComplete,
  };

  return (
    <div className={className}>
      <Label htmlFor={id} field={field} required={required} />
      {multiline ? (
        <Textarea
          {...common}
          maxLength={500}
          rows={3}
          onChange={(event) => onChange(field, event.target.value)}
          className="min-h-24 rounded-xl border-line bg-cream px-3.5 py-3 text-[0.9375rem] text-ink shadow-none aria-invalid:border-destructive"
        />
      ) : (
        <div className="relative">
          {prefix ? (
            <span aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[0.9375rem] text-muted-ink">
              {prefix}
            </span>
          ) : null}
          <Input
            {...common}
            type={type}
            inputMode={inputMode}
            onChange={(event) => onChange(field, event.target.value)}
            className={cn(inputClass, prefix && "pl-12")}
          />
        </div>
      )}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-[0.8125rem] font-medium text-destructive motion-safe:animate-in motion-safe:fade-in-0">
          <AlertCircle aria-hidden className="size-3.5" />
          {error}
        </p>
      ) : null}
      {showHint ? (
        <div id={`${id}-hint`} className="mt-1.5 text-[0.8125rem] text-muted-ink">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

function StateField({
  form,
  errors,
  onChange,
}: {
  form: CheckoutForm;
  errors: Partial<Record<CheckoutField, string>>;
  onChange: (field: CheckoutField, value: string) => void;
}) {
  const id = "checkout-state";
  const error = errors.state;
  return (
    <div>
      <Label htmlFor={id} field="state" required />
      <div className="relative">
        {/* Native select: the phone's own picker and address autofill both work. */}
        <select
          id={id}
          name="state"
          required
          value={form.state}
          autoComplete="address-level1"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange("state", event.target.value)}
          className="h-12 w-full appearance-none rounded-xl border border-line-soft bg-paper pr-10 pl-3.5 text-[0.9375rem] text-ink shadow-2xs aria-invalid:border-destructive"
        >
          <option value="">Choose a state</option>
          {INDIAN_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-ink" />
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-[0.8125rem] font-medium text-destructive">
          <AlertCircle aria-hidden className="size-3.5" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

function PincodeStatus({
  pincode,
  pin,
  onRetry,
}: {
  pincode: string | null;
  pin: { pincode: string; result: ApiServiceabilityResult | null } | null;
  onRetry: () => void;
}) {
  if (!pincode) return <>6 digits</>;
  if (!pin) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <Loader2 aria-hidden className="size-3.5 motion-safe:animate-spin" />
        Checking delivery to {pincode}…
      </span>
    );
  }
  if (!pin.result) {
    return (
      <>
        We couldn&apos;t check this pincode; the shop confirms delivery when you order.{" "}
        <button type="button" onClick={onRetry} className="font-semibold text-forest underline-offset-4 hover:underline">
          Check again
        </button>
      </>
    );
  }
  if (!pin.result.deliverable) {
    return <span className="font-medium text-destructive">We don&apos;t deliver to {pin.pincode} yet.</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-forest">
      <CheckCircle2 aria-hidden className="size-3.5" />
      We deliver to {pin.pincode}
      {pin.result.city ? `, ${pin.result.city}` : ""}
    </span>
  );
}

function PaymentChoice({
  options,
  value,
  onChange,
  onlineMissing,
  codBlockedByPincode,
  notes,
  conflict,
}: {
  options: PaymentOption[];
  value: ApiPaymentMethod;
  onChange: (method: ApiPaymentMethod) => void;
  onlineMissing: boolean;
  codBlockedByPincode: boolean;
  /** The shop's own words about products that limit how the cart can be paid. */
  notes: string[];
  /** The cart mixes prepaid-only and pay-on-delivery-only products. */
  conflict: boolean;
}) {
  return (
    <fieldset>
      <legend className="sr-only">How would you like to pay?</legend>
      {notes.length > 0 ? (
        <div
          role={conflict ? "alert" : "note"}
          className={cn(
            "mb-3 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm",
            conflict ? "border-destructive/30 bg-destructive/5 text-ink" : "border-line-soft bg-cream text-ink",
          )}
        >
          <AlertCircle aria-hidden className={cn("mt-0.5 size-4 shrink-0", conflict ? "text-destructive" : "text-forest")} />
          <span className="space-y-1">
            {notes.map((note) => (
              <span key={note} className="block">
                {note}
              </span>
            ))}
          </span>
        </div>
      ) : null}
      {options.length === 0 ? (
        <p className="text-sm text-muted-ink">Payment options appear once prices are checked.</p>
      ) : (
        <div className="grid gap-3">
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3.5 rounded-xl border px-4 py-3.5 transition-colors",
                  selected ? "border-forest bg-forest/8 shadow-2xs" : "border-line-soft bg-paper hover:border-forest/35",
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  value={option.value}
                  checked={selected}
                  onChange={() => onChange(option.value)}
                  className="mt-1 size-4 shrink-0 accent-forest"
                />
                <span>
                  <span className="block text-[0.9375rem] font-semibold text-ink">{option.title}</span>
                  <span className="block text-sm text-muted-ink">{option.detail}</span>
                </span>
              </label>
            );
          })}
        </div>
      )}
      <div className="mt-3 space-y-1 text-xs text-muted-ink">
        {onlineMissing ? <p>Online payment isn&apos;t connected yet, so orders are paid on delivery for now.</p> : null}
        {codBlockedByPincode ? <p>Pay on delivery isn&apos;t available at this pincode.</p> : null}
      </div>
    </fieldset>
  );
}

function OrderLines({ lines }: { lines: CartLineView[] }) {
  return (
    <ul className="space-y-3 border-b border-line/70 pb-4">
      {lines.map((line) => (
        <li key={line.variantId} className="flex items-center gap-3">
          <span className="relative shrink-0">
            <ProductThumb imageUrl={line.imageUrl} name={line.name} form={line.form} variant={line.variantTitle} brand={line.brand} sizes="48px" className="size-12" />
            <span className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-forest-deep px-1 text-[0.6875rem] leading-5 font-semibold text-cream">
              <span className="sr-only">Quantity </span>
              {line.quantity}
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ink">{line.name}</span>
            {line.variantTitle ? <span className="block truncate text-xs text-muted-ink">{line.variantTitle}</span> : null}
          </span>
          <span className="text-sm font-medium tabular-nums text-ink">{formatRupees(line.lineTotal)}</span>
        </li>
      ))}
    </ul>
  );
}

/** Phones see what they are buying before the form, collapsed so it never pushes the fields away. */
/** The customer's saved addresses as choices, plus "a different address". */
function SavedAddressPicker({
  addresses,
  chosen,
  onChoose,
  onNew,
}: {
  addresses: ApiAddress[];
  chosen: number | "new" | "edit" | null;
  onChoose: (address: ApiAddress) => void;
  onNew: () => void;
}) {
  return (
    <fieldset className="mb-6">
      <legend className="mb-3 text-sm font-medium text-ink">Deliver to a saved address</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {addresses.map((address) => {
          const selected = chosen === address.id;
          return (
            <label
              key={address.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 text-sm transition-colors",
                selected ? "border-forest bg-forest/8 shadow-2xs" : "border-line-soft bg-paper hover:border-forest/35",
              )}
            >
              <input
                type="radio"
                name="saved-address"
                checked={selected}
                onChange={() => onChoose(address)}
                className="mt-1 size-4 shrink-0 accent-forest"
              />
              <span className="min-w-0">
                <span className="flex items-center gap-2 font-semibold text-ink">
                  {address.fullName}
                  {address.isDefault ? (
                    <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[0.6875rem] font-semibold text-forest">Default</span>
                  ) : null}
                </span>
                <span className="mt-0.5 block text-muted-ink">
                  {address.line1}
                  {address.landmark ? `, ${address.landmark}` : ""}, {address.city}, {address.state} {address.pincode}
                </span>
                <span className="mt-0.5 block text-muted-ink">+91 {address.phone}</span>
              </span>
            </label>
          );
        })}
        <label
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-3.5 text-sm transition-colors",
            chosen === "new" || chosen === "edit" ? "border-forest bg-forest/8" : "border-line hover:border-forest/35",
          )}
        >
          <input
            type="radio"
            name="saved-address"
            checked={chosen === "new" || chosen === "edit"}
            onChange={onNew}
            className="size-4 shrink-0 accent-forest"
          />
          <span className="font-semibold text-ink">{chosen === "edit" ? "Correct this address below" : "Use a different address"}</span>
        </label>
      </div>
    </fieldset>
  );
}

function MobileOrderPeek({ lines, total }: { lines: CartLineView[]; total: number }) {
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  return (
    <details className="group mt-6 rounded-xl border border-line/70 bg-cream lg:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm [&::-webkit-details-marker]:hidden">
        <span className="font-medium text-ink">
          Order summary · {count} {count === 1 ? "item" : "items"}
        </span>
        <span className="flex items-center gap-2 font-semibold tabular-nums text-ink">
          {formatRupees(total)}
          <ChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" />
        </span>
      </summary>
      <div className="px-4 pb-4">
        <OrderLines lines={lines} />
      </div>
    </details>
  );
}
