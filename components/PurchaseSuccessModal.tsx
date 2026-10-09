"use client";

import { Check, ShoppingBag, MapPin, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { BookCover } from "@/components/BookCover";

interface PurchasedItem {
  id: string;
  title: string;
  author: string;
  price: number;
  format: string;
  category?: string;
  coverImage: string;
}

interface DeliveryAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface PurchaseSuccessModalProps {
  isOpen: boolean;
  items: PurchasedItem[];
  deliveryAddress?: DeliveryAddress;
  orderId?: string;
  paymentMethod?: string;
  totalAmount?: number;
}

export function PurchaseSuccessModal({
  isOpen,
  items,
  deliveryAddress,
  orderId,
  paymentMethod,
  totalAmount,
}: PurchaseSuccessModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#1e1e22] border border-zinc-800 rounded-xl shadow-2xl text-zinc-100 my-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center px-8 pt-8 pb-5 border-b border-zinc-800">
          <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
            <Check className="w-8 h-8 text-black stroke-[3]" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Order Placed Successfully!</h2>
          <p className="text-sm text-zinc-400">
            Your purchase is confirmed and your books are on their way.
          </p>
          {orderId && (
            <p className="text-xs text-zinc-500 mt-1.5 font-mono">
              Order ID: <span className="text-zinc-300">{orderId}</span>
            </p>
          )}
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Delivery Address */}
          {deliveryAddress && (
            <div className="bg-zinc-900/60 border border-zinc-700/60 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2.5">
                <MapPin className="w-4 h-4 text-yellow-400 shrink-0" />
                <span className="text-sm font-semibold text-zinc-200">Delivering To</span>
              </div>
              <p className="text-sm font-semibold text-zinc-100">{deliveryAddress.fullName}</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {deliveryAddress.line1}
                {deliveryAddress.line2 ? `, ${deliveryAddress.line2}` : ""},{" "}
                {deliveryAddress.city}, {deliveryAddress.state} – {deliveryAddress.pincode}
              </p>
              <p className="text-xs text-zinc-400">{deliveryAddress.country}</p>
              <p className="text-xs text-zinc-500 mt-0.5">📞 {deliveryAddress.phone}</p>
              <div className="mt-2.5 flex items-center gap-2 text-xs text-emerald-400">
                <Package className="w-3.5 h-3.5" />
                <span>Estimated delivery by <strong>{estimatedDelivery}</strong></span>
              </div>
            </div>
          )}

          {/* Payment info */}
          {(paymentMethod || totalAmount !== undefined) && (
            <div className="flex items-center justify-between text-xs bg-zinc-900/40 border border-zinc-800 rounded-lg px-4 py-2.5">
              {paymentMethod && (
                <span className="text-zinc-400">Paid via <span className="text-zinc-200 font-medium">{paymentMethod}</span></span>
              )}
              {totalAmount !== undefined && (
                <span className="text-yellow-400 font-bold text-sm">₹{totalAmount}</span>
              )}
            </div>
          )}

          {/* Books Preview */}
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2.5">
              Items Ordered ({items.length})
            </p>
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-lg"
                >
                  <div className="w-10 shrink-0">
                    <BookCover
                      author={item.author}
                      className="w-10 h-full object-cover rounded"
                      src={item.coverImage}
                      title={item.title}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                    <p className="text-[10px] text-zinc-400">by {item.author}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {item.format}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white shrink-0">₹{item.price}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 pt-1">
            {orderId && (
              <button
                onClick={() => router.push(`/order-confirmation/${orderId}`)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 text-xs font-medium px-4 py-2.5 rounded-md transition"
              >
                <Package className="w-3.5 h-3.5" />
                View Order Details
              </button>
            )}
            <button
              onClick={() => router.push("/")}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2.5 rounded-md transition shadow-md"
            >
              <span>Continue Shopping</span>
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
