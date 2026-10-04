"use client";

import { Check, ShoppingBag } from "lucide-react";
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

interface PurchaseSuccessModalProps {
  isOpen: boolean;
  items: PurchasedItem[];
}

export function PurchaseSuccessModal({ isOpen, items }: PurchaseSuccessModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const tentativeDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-[#1e1e22] border border-zinc-800 rounded-xl p-8 shadow-2xl text-center text-zinc-100">
        {/* Green Checkmark Circle */}
        <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
          <Check className="w-8 h-8 text-black stroke-[3]" />
        </div>

        <h2 className="text-sm sm:text-base font-medium text-zinc-200 mb-6">
          Your purchase of the following reads is successful
        </h2>

        {/* Books Preview Grid */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start space-x-3 bg-zinc-900/90 border border-zinc-800 p-3 rounded-lg text-left w-64"
            >
              <div className="w-12 h-18 flex-shrink-0">
                <BookCover
                  author={item.author}
                  className="w-12 h-18 object-cover rounded"
                  src={item.coverImage}
                  title={item.title}
                />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                <p className="text-[10px] text-zinc-400">by {item.author}</p>
                <div className="mt-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    {item.format}
                  </span>
                </div>
                <div className="mt-1.5 text-xs font-bold text-white">₹{item.price}</div>
                <p className="text-[9px] text-zinc-400 mt-0.5">Delivery by {tentativeDate}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Continue CTA */}
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-6 py-2.5 rounded-md transition shadow-md"
        >
          <span>Continue your Shopping</span>
          <ShoppingBag className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
