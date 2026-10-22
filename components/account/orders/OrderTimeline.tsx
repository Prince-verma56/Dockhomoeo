"use client";

import { CheckCircle2, Clock, PackageCheck, Truck, ShoppingBag, XCircle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { ApiOrderDetail } from "@/types/api/cart";

interface OrderTimelineProps {
  order: ApiOrderDetail;
}

type StepStatus = "complete" | "current" | "upcoming" | "failed";

export function OrderTimeline({ order }: OrderTimelineProps) {
  const isCancelled = order.status.toUpperCase() === "CANCELLED";
  const isDelivered = order.status.toUpperCase() === "DELIVERED";
  const isShipped = ["SHIPPED", "DISPATCHED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].includes(
    order.status.toUpperCase()
  );
  const isConfirmed = ["CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "DISPATCHED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].includes(
    order.status.toUpperCase()
  );

  const getStepStatus = (stepName: "ordered" | "confirmed" | "shipped" | "delivered"): StepStatus => {
    if (isCancelled) {
      if (stepName === "ordered") return "complete";
      return "failed";
    }
    switch (stepName) {
      case "ordered":
        return "complete";
      case "confirmed":
        if (isConfirmed) return isShipped ? "complete" : "current";
        return "upcoming";
      case "shipped":
        if (isShipped) return isDelivered ? "complete" : "current";
        return "upcoming";
      case "delivered":
        if (isDelivered) return "complete";
        return "upcoming";
    }
  };

  const steps = [
    {
      id: "ordered",
      label: "Order Placed",
      date: formatDate(order.placedAt),
      status: getStepStatus("ordered"),
      icon: ShoppingBag,
    },
    {
      id: "confirmed",
      label: "Verified & Packed",
      date: order.history?.find((h) => ["CONFIRMED", "PROCESSING", "PACKED"].includes(h.status.toUpperCase()))
        ? formatDate(order.history.find((h) => ["CONFIRMED", "PROCESSING", "PACKED"].includes(h.status.toUpperCase()))!.createdAt)
        : isConfirmed ? "In progress" : "Pending",
      status: getStepStatus("confirmed"),
      icon: CheckCircle2,
    },
    {
      id: "shipped",
      label: "Dispatched & In Transit",
      date: order.history?.find((h) => ["SHIPPED", "DISPATCHED", "IN_TRANSIT"].includes(h.status.toUpperCase()))
        ? formatDate(order.history.find((h) => ["SHIPPED", "DISPATCHED", "IN_TRANSIT"].includes(h.status.toUpperCase()))!.createdAt)
        : isShipped ? "Handed to courier" : "Awaiting dispatch",
      status: getStepStatus("shipped"),
      icon: Truck,
    },
    {
      id: "delivered",
      label: "Delivered",
      date: isDelivered
        ? order.history?.find((h) => h.status.toUpperCase() === "DELIVERED")
          ? formatDate(order.history.find((h) => h.status.toUpperCase() === "DELIVERED")!.createdAt)
          : "Delivered"
        : order.estimatedDelivery
        ? `Est. ${formatDate(order.estimatedDelivery)}`
        : "Standard transit (3-5 days)",
      status: getStepStatus("delivered"),
      icon: PackageCheck,
    },
  ];

  const primaryShipment = order.shipments?.[0];

  return (
    <div className="rounded-[1.75rem] border border-line-soft bg-paper p-6 sm:p-7 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft pb-5">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">
            Fulfillment & Delivery Status
          </h3>
          <p className="mt-0.5 text-xs text-muted-ink">
            Real-time milestone progression for parcel #{order.orderNumber}
          </p>
        </div>
        {isCancelled ? (
          <Badge variant="destructive" className="h-6 gap-1 px-2.5 text-xs">
            <XCircle className="size-3.5" />
            Cancelled
          </Badge>
        ) : isDelivered ? (
          <Badge className="h-6 gap-1 bg-forest-deep text-white px-2.5 text-xs">
            <CheckCircle2 className="size-3.5" />
            Completed
          </Badge>
        ) : (
          <Badge variant="secondary" className="h-6 gap-1 bg-sage-wash text-forest-deep px-2.5 text-xs font-semibold">
            <Clock className="size-3.5" />
            {order.status.replace(/_/g, " ")}
          </Badge>
        )}
      </div>

      {/* Progress timeline row */}
      <div className="relative mt-7">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = step.status === "complete";
            const isCurrent = step.status === "current";
            const isFailed = step.status === "failed";

            return (
              <div key={step.id} className="relative flex flex-col items-center text-center">
                {/* Connecting bar for desktop */}
                {idx < steps.length - 1 && (
                  <div
                    aria-hidden
                    className={`absolute top-5 left-1/2 -z-0 hidden h-0.5 w-full sm:block ${
                      isCompleted ? "bg-forest-deep" : "bg-line-soft"
                    }`}
                  />
                )}

                {/* Circle Icon */}
                <div
                  className={`relative z-10 flex size-10 items-center justify-center rounded-full border-2 transition-colors ${
                    isFailed
                      ? "border-red-200 bg-red-50 text-red-500"
                      : isCompleted
                      ? "border-forest-deep bg-forest-deep text-white shadow-xs"
                      : isCurrent
                      ? "border-forest-deep bg-sage-wash text-forest-deep ring-4 ring-forest-deep/15"
                      : "border-line-soft bg-canvas text-muted-ink"
                  }`}
                >
                  <Icon className="size-4.5" />
                </div>

                <span
                  className={`mt-3 text-xs font-semibold ${
                    isCurrent ? "text-forest-deep font-bold" : isCompleted ? "text-ink" : "text-muted-ink"
                  }`}
                >
                  {step.label}
                </span>
                <span className="mt-0.5 text-[11px] text-muted-ink/80">{step.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipment / Courier details block */}
      {primaryShipment && (
        <div className="mt-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-line-soft bg-canvas p-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-forest-deep/10 text-forest-deep">
              <Truck className="size-5" />
            </div>
            <div>
              <span className="font-semibold text-ink block">
                {primaryShipment.carrier ?? "Partner Express Logistics"}
              </span>
              <span className="font-mono text-muted-ink">
                AWB / Tracking: {primaryShipment.trackingNumber ?? "Assigned upon dispatch"}
              </span>
            </div>
          </div>

          {primaryShipment.trackingUrl ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 gap-1 rounded-lg border-line-soft text-forest-deep hover:bg-forest/5"
            >
              <a href={primaryShipment.trackingUrl} target="_blank" rel="noopener noreferrer">
                Track on Courier Site
                <ExternalLink className="size-3" />
              </a>
            </Button>
          ) : (
            <span className="rounded-md bg-sage-wash px-2.5 py-1 font-medium text-forest-deep">
              Status: {primaryShipment.status ?? "In Transit"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
