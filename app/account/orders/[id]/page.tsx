"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { repositories } from "@/lib/repositories";
import { ApiOrder } from "@/types/api/account";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Package, MapPin, CreditCard } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const data = await repositories.account.getOrderById(id as string);
        if (data) setOrder(data);
        else router.push("/account/orders");
      } catch (e) {
        console.error(e);
        router.push("/account/orders");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id, router]);

  if (loading || !order) {
    return (
      <div className="flex h-64 items-center justify-center rounded-[2rem] bg-white border border-forest-abyss/5">
        <Loader2 className="size-8 animate-spin text-forest-deep" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Link
          href="/account/orders"
          className="inline-flex items-center text-sm font-medium text-muted-ink hover:text-forest-deep transition-colors mb-4"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">Order {order.orderNumber}</h2>
            <p className="mt-1 text-sm text-muted-ink">Placed on {formatDate(order.placedAt)}</p>
          </div>
          <Badge variant={order.status === "DELIVERED" ? "default" : "secondary"} className="text-sm px-3 py-1">
            {order.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[2rem] bg-white p-6 sm:p-8 shadow-sm border border-forest-abyss/5">
            <h3 className="font-display text-lg font-bold text-ink mb-6 flex items-center">
              <Package className="mr-2 size-5 text-forest-deep" />
              Order Items
            </h3>
            
            <div className="space-y-6">
              {order.items.map((item, i) => (
                <div key={item.id}>
                  <div className="flex items-start gap-4">
                    <div className="size-20 shrink-0 rounded-2xl bg-black/5" />
                    <div className="flex flex-1 flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-ink">{item.productName}</h4>
                        <p className="text-sm text-muted-ink mt-1">{item.variantName}</p>
                        <p className="text-sm font-medium text-ink mt-2">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right font-bold text-ink">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                  {i < order.items.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Summary, Address, Payment */}
        <div className="space-y-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-forest-abyss/5">
            <h3 className="font-display text-lg font-bold text-ink mb-4">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-ink">
                <span>Subtotal</span>
                <span className="text-ink font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-ink">
                <span>Shipping</span>
                <span className="text-ink font-medium">{order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-muted-ink">
                <span>Tax</span>
                <span className="text-ink font-medium">{formatCurrency(order.tax)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg text-ink">
                <span>Total</span>
                <span>{formatCurrency(order.grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-forest-abyss/5">
            <h3 className="font-display text-lg font-bold text-ink mb-4 flex items-center">
              <MapPin className="mr-2 size-5 text-forest-deep" />
              Shipping Address
            </h3>
            <address className="not-italic text-sm text-muted-ink space-y-1">
              <p className="font-medium text-ink">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.landmark && <p>{order.shippingAddress.landmark}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
              <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
            </address>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-forest-abyss/5">
            <h3 className="font-display text-lg font-bold text-ink mb-4 flex items-center">
              <CreditCard className="mr-2 size-5 text-forest-deep" />
              Payment Information
            </h3>
            <div className="text-sm space-y-1">
              <p className="text-muted-ink">
                Method: <span className="font-medium text-ink">{order.paymentMethod}</span>
              </p>
              <p className="text-muted-ink">
                Status: <span className="font-medium text-ink">{order.paymentStatus}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
