"use client";

// ─────────────────────────────────────────────────────────────
//  My Orders Dashboard
//  – 48-hour cancellation with live countdown
//  – Cancel confirmation modal + gift-points refund
//  – "Buy It Again" per order item
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookCover } from "@/components/BookCover";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ChevronRight,
  AlertCircle,
  RefreshCcw,
  ShoppingCart,
  X,
  MapPin,
  CreditCard,
} from "lucide-react";
import { useOrdersStore } from "@/store/orders";
import { useUserStore } from "@/store/user";
import { useCartStore } from "@/store/cart";
import { bookById } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Order, OrderItem } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Returns remaining ms until `until`, clamped to 0 */
function msUntil(until: Date): number {
  return Math.max(0, new Date(until).getTime() - Date.now());
}

/** Format ms into "XXh YYm" */
function fmtCountdown(ms: number): string {
  if (ms <= 0) return "0h 0m";
  const totalMins = Math.floor(ms / 60_000);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h}h ${m}m`;
}

const STATUS_META: Record<
  Order["status"],
  { label: string; color: string; icon: React.ReactNode }
> = {
  CONFIRMED: {
    label: "Confirmed",
    color: "text-blue-400 bg-blue-400/10 border-blue-400/30",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  DELIVERED: {
    label: "Delivered",
    color: "text-green-400 bg-green-400/10 border-green-400/30",
    icon: <Truck className="w-3.5 h-3.5" />,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-400 bg-red-400/10 border-red-400/30",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

// ── Cancel confirmation modal ─────────────────────────────────────────────────

interface CancelModalProps {
  orderId: string;
  totalAmount: number;
  giftPointsToRefund: number;
  onConfirm: () => void;
  onCancel: () => void;
}

function CancelModal({
  orderId,
  totalAmount,
  giftPointsToRefund,
  onConfirm,
  onCancel,
}: CancelModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Cancel order confirmation"
    >
      <div className="bg-[#1E1E1E] border border-zinc-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-zinc-100 mb-1">Cancel this order?</h3>
            <p className="text-sm text-zinc-400">
              Order <span className="font-mono text-zinc-300">{orderId}</span>{" "}
              worth{" "}
              <span className="font-semibold text-zinc-200">
                {formatPrice(totalAmount)}
              </span>{" "}
              will be cancelled. This action cannot be undone.
            </p>
            {giftPointsToRefund > 0 && (
              <p className="text-sm text-green-400 mt-2">
                ✓ {giftPointsToRefund} gift point
                {giftPointsToRefund !== 1 ? "s" : ""} will be refunded to your
                balance.
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            Keep order
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors"
          >
            Yes, cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CancellationCountdown ─────────────────────────────────────────────────────

/** Live-updating countdown showing remaining cancellation window */
function CancellationCountdown({
  canCancelUntil,
  onCancel,
}: {
  canCancelUntil: Date;
  onCancel: () => void;
}) {
  const [remaining, setRemaining] = useState(() => msUntil(canCancelUntil));

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => {
      const ms = msUntil(canCancelUntil);
      setRemaining(ms);
      if (ms <= 0) clearInterval(id);
    }, 30_000); // update every 30 s (sufficient granularity for hours)
    return () => clearInterval(id);
  }, [canCancelUntil, remaining]);

  if (remaining <= 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
        <Clock className="w-3.5 h-3.5" />
        Cancellation window closed
      </span>
    );
  }

  return (
    <button
      onClick={onCancel}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors"
    >
      <X className="w-3 h-3" />
      Cancel Order
      <span className="text-zinc-400 font-normal">
        · {fmtCountdown(remaining)} left
      </span>
    </button>
  );
}

// ── BuyAgainButton ────────────────────────────────────────────────────────────

function BuyAgainButton({ item }: { item: OrderItem }) {
  const { addItem } = useCartStore();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const handleBuyAgain = () => {
    const book = bookById(item.bookId);
    addItem({
      bookId: item.bookId,
      quantity: 1,
      selectedFormat: item.selectedFormat,
      priceAtAdd: book?.price ?? item.priceAtAdd,
    });
    setAdded(true);
    setTimeout(() => {
      router.push("/checkout");
    }, 500);
  };

  return (
    <button
      onClick={handleBuyAgain}
      disabled={added}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
        added
          ? "bg-green-500/15 text-green-400 border border-green-500/30 cursor-default"
          : "bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 hover:bg-yellow-400/20"
      )}
    >
      {added ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5" />
          Added to cart
        </>
      ) : (
        <>
          <ShoppingCart className="w-3.5 h-3.5" />
          Buy It Again
        </>
      )}
    </button>
  );
}

// ── OrderCard ─────────────────────────────────────────────────────────────────

interface OrderCardProps {
  order: Order;
  onCancelRequest: (orderId: string) => void;
}

function OrderCard({ order, onCancelRequest }: OrderCardProps) {
  const meta = STATUS_META[order.status];
  const canStillCancel =
    order.status === "CONFIRMED" && msUntil(order.canCancelUntil) > 0;
  const cancelWindowClosed =
    order.status === "CONFIRMED" && msUntil(order.canCancelUntil) <= 0;

  return (
    <article className="bg-[#1E1E1E] border border-zinc-800 rounded-2xl overflow-hidden">
      {/* ── Card header ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-b border-zinc-800">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">
            Order ID
          </span>
          <span className="font-mono text-sm font-semibold text-zinc-100">
            {order.id}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
              meta.color
            )}
          >
            {meta.icon}
            {meta.label}
          </span>

          {/* Cancellation control */}
          {canStillCancel && (
            <CancellationCountdown
              canCancelUntil={order.canCancelUntil}
              onCancel={() => onCancelRequest(order.id)}
            />
          )}
          {cancelWindowClosed && (
            <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
              <Clock className="w-3.5 h-3.5" />
              Cancellation window closed
            </span>
          )}
        </div>
      </div>

      {/* ── Items list ── */}
      <ul className="divide-y divide-zinc-800/70">
        {order.items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-3 px-5 py-4">
            {/* Cover */}
            <div className="w-12 shrink-0">
              <BookCover
                src={item.coverImage}
                title={item.title}
                author=""
                className="w-full h-full object-cover"
                aspectRatio="aspect-[3/4]"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-100 line-clamp-1">
                {item.title}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {item.selectedFormat} · Qty {item.quantity} ·{" "}
                {formatPrice(item.priceAtAdd * item.quantity)}
              </p>
              {/* Buy It Again */}
              <div className="mt-2">
                <BuyAgainButton item={item} />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* ── Card footer ── */}
      <div className="px-5 py-3.5 border-t border-zinc-800 bg-zinc-800/30 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1">
            <Package className="w-3.5 h-3.5" />
            {fmtDate(order.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5" />
            {order.paymentMethod}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {order.address.city}, {order.address.state}
          </span>
        </div>
        <span className="font-semibold text-zinc-200 text-sm">
          {formatPrice(order.totalAmount)}
        </span>
      </div>
    </article>
  );
}

// ── Main page component ───────────────────────────────────────────────────────

export default function OrdersClient() {
  const { orders, updateOrderStatus } = useOrdersStore();
  const { updateGiftPoints } = useUserStore();

  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  const targetOrder = cancelTarget
    ? orders.find((o) => o.id === cancelTarget)
    : null;

  // Gift points to refund = discount amount if payment method is "Gift Points"
  const giftPointsToRefund = targetOrder
    ? targetOrder.paymentMethod === "Gift Points"
      ? targetOrder.discount
      : 0
    : 0;

  const handleCancelConfirm = useCallback(() => {
    if (!cancelTarget) return;
    updateOrderStatus(cancelTarget, "CANCELLED");
    if (giftPointsToRefund > 0) {
      updateGiftPoints(giftPointsToRefund);
    }
    setCancelTarget(null);
  }, [cancelTarget, giftPointsToRefund, updateOrderStatus, updateGiftPoints]);

  // Sort: most recent first
  const sorted = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 max-w-4xl mx-auto w-full">
      {/* ── Page heading ── */}
      <div className="flex items-center gap-2 mb-6">
        <Package className="w-5 h-5 text-yellow-400" />
        <h1 className="text-xl font-bold text-zinc-100">My Orders</h1>
        <span className="ml-auto text-sm text-zinc-400">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Empty state ── */}
      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <Package className="w-16 h-16 text-zinc-600 mb-4" />
          <h2 className="text-lg font-bold text-zinc-100 mb-1">
            No orders yet
          </h2>
          <p className="text-zinc-400 text-sm mb-6">
            Your order history will appear here once you make a purchase.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-400 text-zinc-900 font-semibold hover:bg-yellow-300 transition-colors"
          >
            Browse Books
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* ── Orders list ── */}
      {sorted.length > 0 && (
        <div className="space-y-4">
          {sorted.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onCancelRequest={setCancelTarget}
            />
          ))}
        </div>
      )}

      {/* ── Continue shopping prompt ── */}
      {sorted.length > 0 && (
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-zinc-400">
          <RefreshCcw className="w-4 h-4" />
          Looking for something new?{" "}
          <Link
            href="/"
            className="text-yellow-400 hover:text-yellow-300 underline underline-offset-2 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      )}

      {/* ── Cancel confirmation modal ── */}
      {cancelTarget && targetOrder && (
        <CancelModal
          orderId={cancelTarget}
          totalAmount={targetOrder.totalAmount}
          giftPointsToRefund={giftPointsToRefund}
          onConfirm={handleCancelConfirm}
          onCancel={() => setCancelTarget(null)}
        />
      )}
    </main>
  );
}
