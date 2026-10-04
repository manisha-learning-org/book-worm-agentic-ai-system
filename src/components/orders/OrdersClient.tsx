"use client";

// ─────────────────────────────────────────────────────────────
//  My Orders Dashboard
//  – 48-hour cancellation with live countdown
//  – Cancel confirmation modal + gift-points refund
//  – "Buy It Again" per order item with toast feedback
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
  Calendar,
} from "lucide-react";
import { useOrdersStore } from "@/store/orders";
import { useUserStore } from "@/store/user";
import { useCartStore } from "@/store/cart";
import { bookById } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Toast } from "@/components/book-detail/Toast";
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
    color: "text-sky-400 bg-sky-950/70 border-sky-800/60",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  DELIVERED: {
    label: "Delivered",
    color: "text-emerald-400 bg-emerald-950/70 border-emerald-800/60",
    icon: <Truck className="w-3.5 h-3.5" />,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-rose-400 bg-rose-950/70 border-rose-800/60",
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
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
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
              <p className="text-sm text-emerald-400 mt-2">
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
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 transition-colors"
          >
            Yes, cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CancellationCountdown ─────────────────────────────────────────────────────

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
    }, 30_000);
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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/60 text-rose-400 border border-rose-700/60 hover:bg-rose-950/80 transition-colors"
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

interface BuyAgainButtonProps {
  item: OrderItem;
  onAdded: (title: string) => void;
}

function BuyAgainButton({ item, onAdded }: BuyAgainButtonProps) {
  const { addItem } = useCartStore();
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
    onAdded(item.title);
    // Reset after 3 s so the button can be clicked again
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <button
      onClick={handleBuyAgain}
      disabled={added}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors",
        added
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 cursor-default"
          : "border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
      )}
    >
      {added ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5" />
          Added to cart
        </>
      ) : (
        <>
          <ShoppingCart className="w-3 h-3" />
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
  onBuyAgain: (title: string) => void;
}

function OrderCard({ order, onCancelRequest, onBuyAgain }: OrderCardProps) {
  const meta = STATUS_META[order.status];
  const canStillCancel =
    order.status === "CONFIRMED" && msUntil(order.canCancelUntil) > 0;
  const cancelWindowClosed =
    order.status === "CONFIRMED" && msUntil(order.canCancelUntil) <= 0;

  return (
    <article className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg">
      {/* ── Card header ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-b border-zinc-800/70">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
            ORDER ID
          </span>
          <span className="font-mono text-sm font-semibold text-zinc-200">
            {order.id}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
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
        {order.items.map((item, idx) => {
          const book = bookById(item.bookId);
          const coverImage = item.coverImage || book?.coverImage || "";
          const author = book?.author ?? "";

          return (
            <li key={idx} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center space-x-4">
                {/* Cover */}
                <div className="w-14 h-20 flex-shrink-0">
                  <BookCover
                    src={coverImage}
                    title={item.title}
                    author={author}
                    className="w-full h-full object-cover rounded border border-zinc-800"
                    aspectRatio="aspect-[7/10]"
                  />
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-100 line-clamp-1">
                    {item.title}
                  </p>
                  {author && (
                    <p className="text-xs text-zinc-400 mt-0.5">by {author}</p>
                  )}
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {item.selectedFormat} · Qty {item.quantity} ·{" "}
                    {formatPrice(item.priceAtAdd * item.quantity)}
                  </p>
                  <div className="mt-2">
                    <BuyAgainButton item={item} onAdded={onBuyAgain} />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* ── Card footer ── */}
      <div className="px-5 py-3.5 border-t border-zinc-800/70 bg-zinc-800/30 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
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
        <span className="text-base font-bold text-zinc-100">
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
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  const dismissToast = useCallback(
    () => setToast((t) => ({ ...t, show: false })),
    []
  );

  const handleBuyAgain = useCallback((title: string) => {
    setToast({ show: true, message: `"${title}" added back to cart` });
  }, []);

  const targetOrder = cancelTarget
    ? orders.find((o) => o.id === cancelTarget)
    : null;

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
    <div className="min-h-screen bg-[#121212] text-zinc-100">
      <main className="px-4 md:px-6 lg:px-8 py-10 max-w-4xl mx-auto w-full">
        {/* ── Page heading ── */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <Package className="w-7 h-7 text-amber-400" />
            <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>
          </div>
          <span className="text-sm text-zinc-400 font-medium">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </span>
        </div>

        {/* ── Empty state ── */}
        {orders.length === 0 && (
          <div className="text-center py-16 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 mb-4">You haven&apos;t placed any orders yet.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-semibold hover:bg-amber-400 transition-colors"
            >
              Start Browsing
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
                onBuyAgain={handleBuyAgain}
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
              className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </main>

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

      {/* ── Toast notification ── */}
      <Toast message={toast.message} show={toast.show} onClose={dismissToast} />
    </div>
  );
}
