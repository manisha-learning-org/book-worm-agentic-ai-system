"use client";

import { useMemo } from "react";
import Link from "next/link";
import { BookCover } from "@/components/BookCover";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Package,
  MapPin,
  Clock,
  CreditCard,
  ShoppingBag,
  ChevronRight,
  Info,
} from "lucide-react";
import { useOrdersStore } from "@/store/orders";
import { formatPrice } from "@/lib/utils";
import { bookById } from "@/lib/mock-data";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Format a Date to a friendly string, e.g. "Thu, 5 Jun" */
function fmtDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** Estimate delivery window from order creation date (4–7 business days) */
function estimatedDelivery(createdAt: Date): string {
  const low = new Date(createdAt);
  low.setDate(low.getDate() + 4);
  const high = new Date(createdAt);
  high.setDate(high.getDate() + 7);
  return `${fmtDate(low)} – ${fmtDate(high)}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function OrderConfirmationClient() {
  const params = useParams<{ orderId: string }>();
  const orderId = params?.orderId ?? "";
  const orders = useOrdersStore((s) => s.orders);

  const order = useMemo(
    () => orders.find((o) => o.id === orderId),
    [orders, orderId]
  );

  if (!order) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <Package className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-zinc-100 mb-2">
            Order not found
          </h2>
          <p className="text-zinc-400 mb-6">
            We couldn&apos;t locate order <code className="font-mono">{orderId}</code>.
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-400 text-zinc-900 font-semibold hover:bg-yellow-300 transition-colors"
          >
            View My Orders
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    );
  }

  const addr = order.address;

  return (
    <main className="flex-1 px-4 md:px-6 lg:px-8 py-8 max-w-2xl mx-auto w-full">
      {/* ── Success banner ── */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-9 h-9 text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">Order Confirmed!</h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Thank you for your purchase. Your books are on their way.
        </p>
      </div>

      {/* ── Order ID + date ── */}
      <section className="bg-[#1E1E1E] border border-zinc-800 rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">
              Order ID
            </p>
            <p className="font-mono font-semibold text-zinc-100 text-sm">
              {order.id}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">
              Placed on
            </p>
            <p className="text-sm text-zinc-300">
              {fmtDate(order.createdAt)}
            </p>
          </div>
        </div>
      </section>

      {/* ── Cancellation notice ── */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-yellow-400/10 border border-yellow-400/30 mb-4">
        <Info className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
        <p className="text-sm text-zinc-300">
          You can cancel this order within{" "}
          <span className="font-semibold text-yellow-300">48 hours</span> of
          purchase. Head to{" "}
          <Link
            href="/orders"
            className="underline underline-offset-2 text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            My Orders
          </Link>{" "}
          to manage this order.
        </p>
      </div>

      {/* ── Estimated delivery ── */}
      <section className="bg-[#1E1E1E] border border-zinc-800 rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-yellow-400" />
          <h2 className="font-semibold text-zinc-100">Estimated Delivery</h2>
        </div>
        <p className="text-zinc-300 text-sm">
          {estimatedDelivery(order.createdAt)}
        </p>
        <p className="text-xs text-zinc-500 mt-1">
          Delivery estimates are subject to courier availability and location.
        </p>
      </section>

      {/* ── Delivery address ── */}
      <section className="bg-[#1E1E1E] border border-zinc-800 rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-yellow-400" />
          <h2 className="font-semibold text-zinc-100">Delivery Address</h2>
        </div>
        <div className="text-sm text-zinc-300 space-y-0.5">
          <p className="font-semibold text-zinc-100">{addr.fullName}</p>
          <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
          <p>
            {addr.city}, {addr.state} – {addr.pincode}
          </p>
          <p>{addr.country}</p>
          <p className="text-zinc-400">📞 {addr.phone}</p>
        </div>
      </section>

      {/* ── Items ── */}
      <section className="bg-[#1E1E1E] border border-zinc-800 rounded-2xl overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-yellow-400" />
          <h2 className="font-semibold text-zinc-100">
            Items ({order.items.length})
          </h2>
        </div>
        <ul className="divide-y divide-zinc-800">
          {order.items.map((item, idx) => {
            const book = bookById(item.bookId);
            const coverImage = item.coverImage || book?.coverImage || "";
            const author = book?.author ?? "";

            return (
              <li key={idx} className="flex items-center gap-3 px-5 py-4">
                <div className="w-12 shrink-0">
                  <BookCover
                    src={coverImage}
                    title={item.title}
                    author={author}
                    className="w-full h-full object-cover"
                    aspectRatio="aspect-[3/4]"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-100 line-clamp-1">
                    {item.title}
                  </p>
                  {author && (
                    <p className="text-xs text-zinc-400 mt-0.5">
                      by {author}
                    </p>
                  )}
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {item.selectedFormat} · Qty {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-zinc-100 shrink-0">
                  {formatPrice(item.priceAtAdd * item.quantity)}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── Payment summary ── */}
      <section className="bg-[#1E1E1E] border border-zinc-800 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-4 h-4 text-yellow-400" />
          <h2 className="font-semibold text-zinc-100">Payment Summary</h2>
        </div>
        <div className="space-y-2 text-sm">
          <Row label="Subtotal" value={formatPrice(order.subtotal)} />
          <Row label="GST" value={formatPrice(order.tax)} />
          <Row
            label="Delivery"
            value={order.deliveryCharge === 0 ? "Free" : formatPrice(order.deliveryCharge)}
            valueClass={order.deliveryCharge === 0 ? "text-green-400" : undefined}
          />
          {order.discount > 0 && (
            <Row
              label="Discount"
              value={`-${formatPrice(order.discount)}`}
              valueClass="text-green-400"
            />
          )}
          <div className="border-t border-zinc-700 pt-2 flex items-baseline justify-between">
            <span className="font-semibold text-zinc-200">Total Paid</span>
            <span className="text-xl font-bold text-yellow-400">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
          <p className="text-xs text-zinc-500 pt-1">
            Paid via {order.paymentMethod}
          </p>
        </div>
      </section>

      {/* ── CTA row ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/orders"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 font-semibold transition-colors"
        >
          <Package className="w-4 h-4" />
          View My Orders
        </Link>
        <Link
          href="/"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-yellow-400 text-zinc-900 font-semibold hover:bg-yellow-300 transition-colors"
        >
          Continue Shopping
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}

// ── Mini helper ───────────────────────────────────────────────────────────────
function Row({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-400">{label}</span>
      <span className={valueClass ?? "text-zinc-200"}>{value}</span>
    </div>
  );
}
