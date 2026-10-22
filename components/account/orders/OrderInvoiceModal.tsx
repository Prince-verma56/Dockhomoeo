"use client";

import { Printer, X, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatRupees } from "@/lib/formatters/price";
import { formatDate } from "@/lib/utils";
import type { ApiOrderDetail } from "@/types/api/cart";

interface OrderInvoiceModalProps {
  order: ApiOrderDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderInvoiceModal({ order, open, onOpenChange }: OrderInvoiceModalProps) {
  const invoiceNumber = order.invoiceNumber || `DH-INV-${order.orderNumber}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-white border-line-soft text-black">
        <DialogHeader className="sr-only">
          <DialogTitle>Tax Invoice #{invoiceNumber}</DialogTitle>
        </DialogHeader>
        {/* Action Header bar (Hidden in print) */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-forest-deep" />
            <span className="font-semibold text-sm text-gray-900">
              Tax Invoice Preview — {order.orderNumber}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-8 gap-1.5 rounded-lg border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100"
            >
              <Printer className="size-3.5" />
              Print / Save as PDF
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 size-8 p-0 rounded-lg text-gray-500 hover:text-gray-900"
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="invoice-printable" className="p-6 sm:p-10 text-xs text-gray-800 space-y-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-gray-200 pb-6">
            <div>
              <span className="font-display text-2xl font-black tracking-tight text-forest-deep block">
                DOCHOMOEO
              </span>
              <p className="text-[11px] text-gray-500 mt-1 max-w-xs leading-relaxed">
                DocHomoeo Wellness Pvt. Ltd.<br />
                Licensed Homoeopathic Pharmacy & Consultation Hub<br />
                GSTIN: 07AAECD9281M1Z4 · DL No: 20B/21B-DL-09823<br />
                Email: support@dochomoeo.com · dochomoeo.com
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block rounded bg-forest-deep/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-forest-deep mb-2">
                ORIGINAL TAX INVOICE
              </span>
              <p className="font-mono text-sm font-bold text-gray-900">
                Invoice: {invoiceNumber}
              </p>
              <p className="text-gray-600 mt-0.5">Date: {formatDate(order.placedAt)}</p>
              <p className="text-gray-600">Order Ref: #{order.orderNumber}</p>
              <p className="text-gray-600 capitalize">
                Payment: {order.paymentMethod.replace(/_/g, " ")} ({order.paymentStatus})
              </p>
            </div>
          </div>

          {/* Billed To / Shipped To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 rounded-xl bg-gray-50 p-4 border border-gray-200 text-xs">
            <div>
              <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px] block mb-1">
                Billed To
              </span>
              <p className="font-bold text-gray-900">
                {order.billingName || order.customerName}
              </p>
              {order.billingGstNumber && (
                <p className="text-gray-700 font-mono text-[11px]">
                  GSTIN: {order.billingGstNumber}
                </p>
              )}
              <p className="text-gray-600 mt-0.5">{order.shippingAddress}</p>
              <p className="text-gray-600">
                {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
              </p>
              <p className="text-gray-600">Tel: {order.customerPhone}</p>
            </div>

            <div>
              <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px] block mb-1">
                Shipping Destination
              </span>
              <p className="font-bold text-gray-900">{order.customerName}</p>
              <p className="text-gray-600 mt-0.5">{order.shippingAddress}</p>
              <p className="text-gray-600">
                {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
              </p>
              <p className="text-gray-600">State Code: India</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-gray-200 divide-y divide-gray-200">
              <thead className="bg-gray-100 font-semibold text-gray-700">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Remedy Description</th>
                  <th className="py-2.5 px-3">Potency / Pack</th>
                  <th className="py-2.5 px-3">HSN Code</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {order.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="py-2.5 px-3 text-gray-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-medium">
                      {item.productName}
                      {item.brandName && (
                        <span className="text-[10px] text-gray-500 block uppercase">
                          {item.brandName}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">{item.variantTitle}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-500">30049014</td>
                    <td className="py-2.5 px-3 text-center font-medium">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-gray-600">
                      {formatRupees(item.unitPrice)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium tabular-nums text-gray-900">
                      {formatRupees(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown & Tax Details */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-gray-200 pt-4">
            <div className="text-xs text-gray-500 max-w-sm space-y-1">
              <p className="font-semibold text-gray-700">Declaration & Terms:</p>
              <p className="leading-snug">
                1. Medicines once dispensed are genuine homoeopathic preparations conforming to HPI/GHP standards.
              </p>
              <p className="leading-snug">
                2. Damaged or tampered goods are eligible for replacement under the DocHomoeo 7-day guarantee policy.
              </p>
              <p className="leading-snug">
                3. This is a computer-generated tax invoice and requires no physical signature.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal (Taxable):</span>
                <span className="font-medium tabular-nums text-gray-900">
                  {formatRupees(order.subtotal)}
                </span>
              </div>

              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-forest-deep">
                  <span>Coupon ({order.couponCode}):</span>
                  <span className="font-medium tabular-nums">
                    - {formatRupees(order.couponDiscount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Shipping & Handling:</span>
                <span className="font-medium tabular-nums text-gray-900">
                  {order.shippingCharge === 0 ? "FREE" : formatRupees(order.shippingCharge)}
                </span>
              </div>

              {order.codCharge > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>COD Processing Fee:</span>
                  <span className="font-medium tabular-nums text-gray-900">
                    {formatRupees(order.codCharge)}
                  </span>
                </div>
              )}

              <div className="flex justify-between border-t border-gray-300 pt-2 text-sm font-bold text-gray-900">
                <span>Grand Total (INR):</span>
                <span className="tabular-nums text-forest-deep">
                  {formatRupees(order.grandTotal)}
                </span>
              </div>
              <p className="text-[10px] text-right text-gray-500 italic">
                (Inclusive of all applicable GST taxes)
              </p>
            </div>
          </div>

          {/* Footer note */}
          <div className="border-t border-gray-200 pt-4 text-center text-[10px] text-gray-500">
            DocHomoeo Wellness — Dedicated Homoeopathic Healthcare & Genuine Medicines
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
