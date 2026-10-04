"use client";

// ─────────────────────────────────────────────────────────────
//  PaymentModal – UPI / Card / Net Banking / Wallet simulation
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  X,
  CreditCard,
  Smartphone,
  Building2,
  Gift,
  Loader2,
  CheckCircle2,
  LockKeyhole,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/types";

interface PaymentOption {
  method: PaymentMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    method: "UPI",
    label: "UPI",
    description: "Pay via GPay, PhonePe, Paytm, or any UPI app",
    icon: <Smartphone className="w-5 h-5" />,
  },
  {
    method: "Credit Card",
    label: "Credit Card",
    description: "Visa, Mastercard, Rupay, Amex",
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    method: "Debit Card",
    label: "Debit Card",
    description: "All major bank debit cards accepted",
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    method: "Net Banking",
    label: "Net Banking",
    description: "HDFC, SBI, ICICI, Axis and more",
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    method: "Gift Points",
    label: "Wallet / Gift Points",
    description: "Use your BookWorm wallet balance",
    icon: <Gift className="w-5 h-5" />,
  },
];

type ModalState = "select" | "processing" | "success";

interface PaymentModalProps {
  total: number;
  /** Gift points already applied at checkout; passed for display */
  giftPointsApplied: number;
  onClose: () => void;
  /** Called once payment succeeds; parent should finalise the order */
  onSuccess: (method: PaymentMethod) => void;
}

export default function PaymentModal({
  total,
  giftPointsApplied,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const [selected, setSelected] = useState<PaymentMethod | null>(
    giftPointsApplied > 0 ? "Gift Points" : null
  );
  const [modalState, setModalState] = useState<ModalState>("select");
  const [error, setError] = useState("");

  const handlePay = () => {
    if (!selected) {
      setError("Please select a payment method");
      return;
    }
    setError("");
    setModalState("processing");

    // Simulate a 1.5-second payment processing delay
    setTimeout(() => {
      setModalState("success");
      // Give 0.6 s to show the success tick before redirecting
      setTimeout(() => {
        onSuccess(selected);
      }, 600);
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Payment gateway"
    >
      <div className="bg-[#1E1E1E] border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <LockKeyhole className="w-4 h-4 text-green-400" />
            <h2 className="font-semibold text-zinc-100">Secure Payment</h2>
          </div>
          {modalState === "select" && (
            <button
              onClick={onClose}
              aria-label="Close payment modal"
              className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Amount banner ── */}
        <div className="px-6 py-3 bg-zinc-800/50 border-b border-zinc-800 flex items-baseline justify-between">
          <span className="text-sm text-zinc-400">Amount to pay</span>
          <span className="text-2xl font-bold text-yellow-400">
            {formatPrice(total)}
          </span>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5">
          {modalState === "select" && (
            <>
              <p className="text-xs text-zinc-400 mb-3 uppercase tracking-wider font-medium">
                Choose payment method
              </p>

              <div className="space-y-2">
                {PAYMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.method}
                    onClick={() => {
                      setSelected(opt.method);
                      setError("");
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all",
                      selected === opt.method
                        ? "border-yellow-400/60 bg-yellow-400/10 text-zinc-100"
                        : "border-zinc-700 bg-zinc-800/40 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-700/40"
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0",
                        selected === opt.method
                          ? "text-yellow-400"
                          : "text-zinc-500"
                      )}
                    >
                      {opt.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{opt.label}</p>
                      <p className="text-xs text-zinc-500">{opt.description}</p>
                    </div>
                    {/* Radio indicator */}
                    <span
                      className={cn(
                        "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                        selected === opt.method
                          ? "border-yellow-400 bg-yellow-400"
                          : "border-zinc-600"
                      )}
                    >
                      {selected === opt.method && (
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                      )}
                    </span>
                  </button>
                ))}
              </div>

              {error && (
                <p className="mt-3 text-xs text-red-400">{error}</p>
              )}

              <button
                onClick={handlePay}
                className="mt-5 w-full py-3.5 rounded-xl font-bold text-base bg-yellow-400 text-zinc-900 hover:bg-yellow-300 active:scale-[0.98] transition-all shadow-lg shadow-yellow-400/20"
              >
                Pay {formatPrice(total)}
              </button>

              <p className="mt-3 text-center text-[11px] text-zinc-500 flex items-center justify-center gap-1">
                <LockKeyhole className="w-3 h-3" />
                256-bit SSL encrypted · 100% secure
              </p>
            </>
          )}

          {modalState === "processing" && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <Loader2 className="w-12 h-12 text-yellow-400 animate-spin" />
              <div className="text-center">
                <p className="font-semibold text-zinc-100">Processing payment…</p>
                <p className="text-sm text-zinc-400 mt-1">
                  Please do not close this window
                </p>
              </div>
            </div>
          )}

          {modalState === "success" && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <CheckCircle2 className="w-14 h-14 text-green-400" />
              <div className="text-center">
                <p className="font-semibold text-zinc-100 text-lg">
                  Payment Successful!
                </p>
                <p className="text-sm text-zinc-400 mt-1">
                  Redirecting to your order…
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
