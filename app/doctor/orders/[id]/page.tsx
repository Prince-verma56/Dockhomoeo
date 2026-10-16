import { redirect } from "next/navigation";

/**
 * Where the backend sends a shopper back after the payment gateway
 * (`returnTo` in backend/src/modules/shop.routes.ts: "/doctor/orders/:id",
 * then "?payment=success|pending|failed"). This site's confirmation lives at
 * /thankyou, so the visit is forwarded there with the same two values and
 * nothing else. That page then reads the order's real payment status.
 */
export default async function DoctorOrderReturn({ params, searchParams }: PageProps<"/doctor/orders/[id]">) {
  const { id } = await params;
  const raw = (await searchParams).payment;
  const payment = Array.isArray(raw) ? raw[0] : raw;
  const orderId = Number.parseInt(id, 10);
  if (!Number.isInteger(orderId) || orderId < 1) redirect("/account/orders");
  const query = new URLSearchParams({ order: String(orderId) });
  if (payment === "success" || payment === "pending" || payment === "failed") query.set("payment", payment);
  redirect(`/thankyou?${query.toString()}`);
}
